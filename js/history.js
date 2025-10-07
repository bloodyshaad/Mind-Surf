// Quiz History Module
class HistoryManager {
    constructor() {
        this.historyData = [];
    }

    async loadHistory() {
        if (!window.authManager.isAuthenticated()) {
            this.showAuthRequired();
            return;
        }

        const user = window.authManager.getCurrentUser();
        if (!user) return;

        const historyContent = document.getElementById('historyContent');
        if (!historyContent) return;

        try {
            // Show loading state
            historyContent.innerHTML = `
                <div class="loading-container">
                    <div class="loading-spinner-large"></div>
                    <p class="loading-text">Loading your history...</p>
                </div>
            `;

            // Fetch quiz history from database
            const { data, error } = await supabase
                .from('quiz_results')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;

            this.historyData = data || [];
            this.renderHistory();

        } catch (error) {
            console.error('Error loading history:', error);
            historyContent.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">⚠️</div>
                    <h3 class="empty-state-title">Error Loading History</h3>
                    <p class="empty-state-description">Failed to load your quiz history. Please try again later.</p>
                </div>
            `;
        }
    }

    renderHistory() {
        const historyContent = document.getElementById('historyContent');
        if (!historyContent) return;

        if (this.historyData.length === 0) {
            historyContent.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📊</div>
                    <h3 class="empty-state-title">No Quiz History Yet</h3>
                    <p class="empty-state-description">You haven't taken any stress assessments yet. Take your first quiz to start tracking your progress!</p>
                    <a href="#quiz" class="btn-primary btn-large">Take Quiz Now</a>
                </div>
            `;
            return;
        }

        // Calculate statistics
        const avgStress = Math.round(
            this.historyData.reduce((sum, item) => sum + item.stress_percentage, 0) / this.historyData.length
        );
        const latestResult = this.historyData[0];
        const oldestResult = this.historyData[this.historyData.length - 1];
        const stressTrend = latestResult.stress_percentage - oldestResult.stress_percentage;

        historyContent.innerHTML = `
            <div class="history-container">
                <!-- Summary Stats -->
                <div class="history-stats-grid">
                    <div class="history-stat-card">
                        <div class="history-stat-icon">📈</div>
                        <div class="history-stat-value">${this.historyData.length}</div>
                        <div class="history-stat-label">Total Assessments</div>
                    </div>
                    <div class="history-stat-card">
                        <div class="history-stat-icon">📊</div>
                        <div class="history-stat-value">${avgStress}%</div>
                        <div class="history-stat-label">Average Stress Level</div>
                    </div>
                    <div class="history-stat-card">
                        <div class="history-stat-icon">${stressTrend < 0 ? '📉' : stressTrend > 0 ? '📈' : '➡️'}</div>
                        <div class="history-stat-value" style="color: ${stressTrend < 0 ? '#10B981' : stressTrend > 0 ? '#EF4444' : '#6B7280'}">
                            ${stressTrend > 0 ? '+' : ''}${stressTrend}%
                        </div>
                        <div class="history-stat-label">Stress Trend</div>
                    </div>
                    <div class="history-stat-card">
                        <div class="history-stat-icon">🎯</div>
                        <div class="history-stat-value">${latestResult.stress_level}</div>
                        <div class="history-stat-label">Current Level</div>
                    </div>
                </div>

                <!-- Progress Chart -->
                <div class="history-chart-card">
                    <h3 class="history-chart-title">Stress Level Over Time</h3>
                    <p class="history-chart-description">Track how your stress levels have changed across assessments</p>
                    <div class="history-chart-container">
                        <canvas id="historyLineChart"></canvas>
                    </div>
                </div>

                <!-- History List -->
                <div class="history-list-card">
                    <h3 class="history-list-title">Assessment History</h3>
                    <div class="history-list">
                        ${this.historyData.map((result, index) => this.renderHistoryItem(result, index)).join('')}
                    </div>
                </div>
            </div>
        `;

        // Render chart after DOM is updated
        setTimeout(() => this.renderHistoryChart(), 100);
    }

    renderHistoryItem(result, index) {
        const date = new Date(result.created_at);
        const formattedDate = date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        const topCategories = Object.entries(result.category_scores || {})
            .sort((a, b) => b[1].percentage - a[1].percentage)
            .slice(0, 3);

        return `
            <div class="history-item">
                <div class="history-item-header">
                    <div class="history-item-date">
                        <span class="history-item-number">#${this.historyData.length - index}</span>
                        <span class="history-item-time">${formattedDate}</span>
                    </div>
                    <div class="history-item-level">
                        <span class="history-level-badge" style="background-color: ${this.getStressLevelColor(result.stress_level)}15; color: ${this.getStressLevelColor(result.stress_level)};">
                            ${result.stress_level}
                        </span>
                    </div>
                </div>
                <div class="history-item-body">
                    <div class="history-item-score">
                        <div class="history-score-circle" style="background: conic-gradient(${this.getStressLevelColor(result.stress_level)} ${result.stress_percentage * 3.6}deg, var(--color-gray-200) 0deg);">
                            <div class="history-score-inner">
                                <span class="history-score-value">${result.stress_percentage}%</span>
                            </div>
                        </div>
                    </div>
                    <div class="history-item-categories">
                        <div class="history-categories-label">Top Stress Areas:</div>
                        <div class="history-categories-list">
                            ${topCategories.map(([category, data]) => `
                                <div class="history-category-tag">
                                    ${this.getCategoryName(category)}: ${Math.round(data.percentage)}%
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
                <div class="history-item-footer">
                    <button class="history-view-btn" onclick="window.historyManager.viewDetails('${result.id}')">
                        View Details
                    </button>
                    <div class="history-time-spent">
                        ⏱️ ${Math.floor(result.time_spent_seconds / 60)}m ${result.time_spent_seconds % 60}s
                    </div>
                </div>
            </div>
        `;
    }

    renderHistoryChart() {
        const canvas = document.getElementById('historyLineChart');
        if (!canvas) return;

        const isDarkMode = document.documentElement.getAttribute('data-theme') === 'dark';
        const textColor = isDarkMode ? '#FFFFFF' : '#000000';
        const gridColor = isDarkMode ? '#333333' : '#E5E5E5';

        // Reverse data to show oldest to newest
        const chartData = [...this.historyData].reverse();
        
        const labels = chartData.map((result, index) => `#${index + 1}`);
        const stressData = chartData.map(result => result.stress_percentage);
        const colors = chartData.map(result => this.getStressLevelColor(result.stress_level));

        new Chart(canvas, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Stress Level (%)',
                    data: stressData,
                    borderColor: '#3B82F6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: colors,
                    pointBorderColor: '#FFFFFF',
                    pointBorderWidth: 2,
                    pointRadius: 6,
                    pointHoverRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: isDarkMode ? 'rgba(26, 26, 26, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                        titleColor: textColor,
                        bodyColor: textColor,
                        borderColor: gridColor,
                        borderWidth: 1,
                        padding: 12,
                        cornerRadius: 8,
                        callbacks: {
                            label: function(context) {
                                return `Stress Level: ${context.parsed.y}%`;
                            },
                            afterLabel: function(context) {
                                const result = chartData[context.dataIndex];
                                return `Level: ${result.stress_level}`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            color: textColor,
                            callback: function(value) {
                                return value + '%';
                            }
                        },
                        grid: {
                            color: gridColor
                        }
                    },
                    x: {
                        ticks: {
                            color: textColor
                        },
                        grid: {
                            color: gridColor
                        }
                    }
                }
            }
        });
    }

    async viewDetails(resultId) {
        const result = this.historyData.find(r => r.id === resultId);
        if (!result) return;

        // Use the quiz manager's display results method
        if (window.quizManager) {
            const formattedResults = {
                totalScore: result.total_score,
                stressPercentage: result.stress_percentage,
                level: result.stress_level,
                categories: result.category_scores,
                completedAt: new Date(result.created_at),
                timeSpent: result.time_spent_seconds
            };

            // Scroll to quiz section and display results
            document.getElementById('quiz').scrollIntoView({ behavior: 'smooth' });
            setTimeout(() => {
                window.quizManager.displayResults(formattedResults);
            }, 500);
        }
    }

    getCategoryName(category) {
        const names = {
            academic: 'Academic',
            social: 'Social',
            family: 'Family',
            personal: 'Personal',
            physical: 'Physical',
            lifestyle: 'Lifestyle'
        };
        return names[category] || category;
    }

    getStressLevelColor(level) {
        const colors = {
            'Low': '#10B981',
            'Mild': '#3B82F6',
            'Moderate': '#F59E0B',
            'High': '#EF4444',
            'Severe': '#DC2626'
        };
        return colors[level] || '#6B7280';
    }

    showAuthRequired() {
        const historyContent = document.getElementById('historyContent');
        if (!historyContent) return;

        historyContent.innerHTML = `
            <div class="auth-required">
                <div class="lock-icon">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M19 11H5C3.89543 11 3 11.8954 3 13V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V13C21 11.8954 20.1046 11 19 11Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M7 11V7C7 5.67392 7.52678 4.40215 8.46447 3.46447C9.40215 2.52678 10.6739 2 12 2C13.3261 2 14.5979 2.52678 15.5355 3.46447C16.4732 4.40215 17 5.67392 17 7V11" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </div>
                <h3>Authentication Required</h3>
                <p>Please login to view your quiz history and track your progress over time.</p>
                <a href="login.html" class="btn-primary">Login to Continue</a>
            </div>
        `;
    }
}

// Initialize history manager
const historyManager = new HistoryManager();
window.historyManager = historyManager;

// Load history when navigating to history section
document.addEventListener('DOMContentLoaded', () => {
    // Check if we're on the history section
    if (window.location.hash === '#history') {
        setTimeout(() => {
            if (window.authManager && window.authManager.isAuthenticated()) {
                historyManager.loadHistory();
            }
        }, 500);
    }
});
