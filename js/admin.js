// Admin Dashboard Module
class AdminDashboard {
    constructor() {
        this.currentView = 'overview';
        this.charts = {};
        this.init();
    }

    async init() {
        await this.checkAdminAccess();
        this.initDarkMode();
        this.setupEventListeners();
        this.loadView('overview');
    }

    initDarkMode() {
        // Check for saved theme preference or default to light mode
        const savedTheme = this.getFromLocalStorage('theme');
        const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
            this.enableDarkMode();
        } else {
            this.disableDarkMode();
        }
    }

    enableDarkMode() {
        document.documentElement.setAttribute('data-theme', 'dark');
        this.darkMode = true;
        this.saveToLocalStorage('theme', 'dark');
        this.updateThemeIcon();
    }

    disableDarkMode() {
        document.documentElement.setAttribute('data-theme', 'light');
        this.darkMode = false;
        this.saveToLocalStorage('theme', 'light');
        this.updateThemeIcon();
    }

    toggleDarkMode() {
        if (this.darkMode) {
            this.disableDarkMode();
        } else {
            this.enableDarkMode();
        }
    }

    updateThemeIcon() {
        const themeIcon = document.getElementById('themeIcon');
        if (themeIcon) {
            themeIcon.textContent = this.darkMode ? '🌙' : '☀️';
        }
    }

    saveToLocalStorage(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.error('Error saving to localStorage:', error);
        }
    }

    getFromLocalStorage(key) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        } catch (error) {
            console.error('Error reading from localStorage:', error);
            return null;
        }
    }

    async checkAdminAccess() {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
            window.location.href = 'index.html';
            return;
        }

        try {
            const { data, error } = await supabase
                .from('users')
                .select('is_admin')
                .eq('id', session.user.id)
                .maybeSingle();

            if (error || !data || !data.is_admin) {
                window.location.href = 'index.html';
                return;
            }
        } catch (error) {
            window.location.href = 'index.html';
        }
    }

    setupEventListeners() {
        // Dark mode toggle
        const darkModeToggle = document.getElementById('darkModeToggle');
        if (darkModeToggle) {
            darkModeToggle.addEventListener('click', () => {
                this.toggleDarkMode();
            });
        }

        // Sidebar navigation
        document.querySelectorAll('.sidebar-item').forEach(item => {
            item.addEventListener('click', () => {
                const view = item.dataset.view;
                this.loadView(view);
                
                // Update active state
                document.querySelectorAll('.sidebar-item').forEach(i => i.classList.remove('active'));
                item.classList.add('active');
            });
        });

        // Logout button
        const logoutBtn = document.getElementById('adminAuthBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', async () => {
                try {
                    await supabase.auth.signOut({ scope: 'local' });
                } catch (error) {
                    // Silently handle sign out errors
                }
                
                // Clear Supabase-related storage
                this.clearSupabaseStorage();
                
                // Redirect to home page
                window.location.replace('index.html');
            });
        }

        // Keyboard shortcut for dark mode (Ctrl/Cmd + D)
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
                e.preventDefault();
                this.toggleDarkMode();
            }
        });
    }

    async loadView(view) {
        this.currentView = view;
        const content = document.getElementById('adminContent');
        
        content.innerHTML = '<div class="loading-container"><div class="loading-spinner-large"></div><p class="loading-text">Loading...</p></div>';

        switch (view) {
            case 'overview':
                await this.renderOverview();
                break;
            case 'users':
                await this.renderUsers();
                break;
            case 'quizzes':
                await this.renderQuizzes();
                break;
            case 'analytics':
                await this.renderAnalytics();
                break;
        }
    }

    async renderOverview() {
        const content = document.getElementById('adminContent');
        
        // Fetch overview data
        const stats = await this.fetchOverviewStats();
        
        content.innerHTML = `
            <div class="dashboard-header">
                <h1 class="dashboard-title">Dashboard Overview</h1>
                <p class="dashboard-subtitle">Welcome to the MindSurf Admin Dashboard</p>
            </div>

            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-card-header">
                        <div>
                            <div class="stat-card-title">Total Users</div>
                        </div>
                        <div class="stat-card-icon">
                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" stroke-width="2"/>
                                <circle cx="9" cy="7" r="4" stroke="currentColor" stroke-width="2"/>
                            </svg>
                        </div>
                    </div>
                    <div class="stat-card-value">${stats.totalUsers}</div>
                    <div class="stat-card-change positive">+${stats.newUsersThisWeek} this week</div>
                </div>

                <div class="stat-card">
                    <div class="stat-card-header">
                        <div>
                            <div class="stat-card-title">Quiz Completions</div>
                        </div>
                        <div class="stat-card-icon">
                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M9 11L12 14L22 4" stroke="currentColor" stroke-width="2"/>
                                <path d="M21 12V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H16" stroke="currentColor" stroke-width="2"/>
                            </svg>
                        </div>
                    </div>
                    <div class="stat-card-value">${stats.totalQuizzes}</div>
                    <div class="stat-card-change positive">+${stats.quizzesThisWeek} this week</div>
                </div>

                <div class="stat-card">
                    <div class="stat-card-header">
                        <div>
                            <div class="stat-card-title">Avg Stress Level</div>
                        </div>
                        <div class="stat-card-icon">
                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M18 20V10" stroke="currentColor" stroke-width="2"/>
                                <path d="M12 20V4" stroke="currentColor" stroke-width="2"/>
                                <path d="M6 20V14" stroke="currentColor" stroke-width="2"/>
                            </svg>
                        </div>
                    </div>
                    <div class="stat-card-value">${stats.avgStressLevel}%</div>
                    <div class="stat-card-change ${stats.stressChange >= 0 ? 'negative' : 'positive'}">
                        ${stats.stressChange >= 0 ? '+' : ''}${stats.stressChange}% from last week
                    </div>
                </div>

                <div class="stat-card">
                    <div class="stat-card-header">
                        <div>
                            <div class="stat-card-title">High Stress Users</div>
                        </div>
                        <div class="stat-card-icon">
                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                                <path d="M12 8V12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                                <circle cx="12" cy="16" r="1" fill="currentColor"/>
                            </svg>
                        </div>
                    </div>
                    <div class="stat-card-value">${stats.highStressUsers}</div>
                    <div class="stat-card-change negative">${stats.highStressPercentage}% of total</div>
                </div>
            </div>

            <div class="charts-grid">
                <div class="chart-card">
                    <div class="chart-card-header">
                        <h3 class="chart-card-title">Stress Level Distribution</h3>
                        <p class="chart-card-description">Breakdown of user stress levels</p>
                    </div>
                    <div class="chart-container">
                        <canvas id="stressDistributionChart"></canvas>
                    </div>
                </div>

                <div class="chart-card">
                    <div class="chart-card-header">
                        <h3 class="chart-card-title">Top Stress Categories</h3>
                        <p class="chart-card-description">Most common stress sources</p>
                    </div>
                    <div class="chart-container">
                        <canvas id="categoriesChart"></canvas>
                    </div>
                </div>

                <div class="chart-card">
                    <div class="chart-card-header">
                        <h3 class="chart-card-title">User Registration Status</h3>
                        <p class="chart-card-description">New vs existing users</p>
                    </div>
                    <div class="chart-container">
                        <canvas id="userGrowthChart"></canvas>
                    </div>
                </div>

                <div class="chart-card">
                    <div class="chart-card-header">
                        <h3 class="chart-card-title">Quiz Completion Status</h3>
                        <p class="chart-card-description">Completed vs pending</p>
                    </div>
                    <div class="chart-container">
                        <canvas id="quizTrendChart"></canvas>
                    </div>
                </div>
            </div>
        `;

        // Render charts
        await this.renderOverviewCharts(stats);
    }

    async fetchOverviewStats() {
        try {
            // Fetch users with age data
            const { data: users, error: usersError } = await supabase
                .from('users')
                .select('created_at, age');

            // Fetch quiz results
            const { data: quizzes, error: quizzesError } = await supabase
                .from('quiz_results')
                .select('*');

            if (usersError || quizzesError) {
                throw new Error('Error fetching data');
            }

            const now = new Date();
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

            const newUsersThisWeek = users.filter(u => new Date(u.created_at) > weekAgo).length;
            const quizzesThisWeek = quizzes.filter(q => new Date(q.created_at) > weekAgo).length;

            const avgStressLevel = quizzes.length > 0
                ? Math.round(quizzes.reduce((sum, q) => sum + q.stress_percentage, 0) / quizzes.length)
                : 0;

            const lastWeekQuizzes = quizzes.filter(q => new Date(q.created_at) <= weekAgo && new Date(q.created_at) > new Date(weekAgo.getTime() - 7 * 24 * 60 * 60 * 1000));
            const lastWeekAvg = lastWeekQuizzes.length > 0
                ? Math.round(lastWeekQuizzes.reduce((sum, q) => sum + q.stress_percentage, 0) / lastWeekQuizzes.length)
                : 0;
            const stressChange = avgStressLevel - lastWeekAvg;

            const highStressUsers = quizzes.filter(q => q.stress_level === 'High' || q.stress_level === 'Severe').length;
            const highStressPercentage = quizzes.length > 0 ? Math.round((highStressUsers / quizzes.length) * 100) : 0;

            return {
                totalUsers: users.length,
                newUsersThisWeek,
                totalQuizzes: quizzes.length,
                quizzesThisWeek,
                avgStressLevel,
                stressChange,
                highStressUsers,
                highStressPercentage,
                allQuizzes: quizzes,
                allUsers: users
            };
        } catch (error) {
            return {
                totalUsers: 0,
                newUsersThisWeek: 0,
                totalQuizzes: 0,
                quizzesThisWeek: 0,
                avgStressLevel: 0,
                stressChange: 0,
                highStressUsers: 0,
                highStressPercentage: 0,
                allQuizzes: [],
                allUsers: []
            };
        }
    }

    async renderOverviewCharts(stats) {
        // Get current theme
        const isDarkMode = document.documentElement.getAttribute('data-theme') === 'dark';
        const textColor = isDarkMode ? '#FFFFFF' : '#000000';
        
        // Stress Distribution Pie Chart
        const stressLevels = { Low: 0, Mild: 0, Moderate: 0, High: 0, Severe: 0 };
        stats.allQuizzes.forEach(q => {
            if (stressLevels.hasOwnProperty(q.stress_level)) {
                stressLevels[q.stress_level]++;
            }
        });

        const hasStressData = Object.values(stressLevels).some(v => v > 0);
        const stressData = hasStressData ? Object.values(stressLevels) : [1, 1, 1, 1, 1];
        const stressLabels = hasStressData ? Object.keys(stressLevels) : ['No Data', 'No Data', 'No Data', 'No Data', 'No Data'];

        this.charts.stressDistribution = new Chart(
            document.getElementById('stressDistributionChart'),
            {
                type: 'doughnut',
                data: {
                    labels: stressLabels,
                    datasets: [{
                        data: stressData,
                        backgroundColor: hasStressData ? [
                            '#10B981', // Emerald green for Low
                            '#3B82F6', // Blue for Mild
                            '#F59E0B', // Amber for Moderate
                            '#EF4444', // Red for High
                            '#DC2626'  // Dark red for Severe
                        ] : ['#E5E5E5', '#D4D4D4', '#C3C3C3', '#B2B2B2', '#A1A1A1'],
                        borderColor: isDarkMode ? '#1A1A1A' : '#FFFFFF',
                        borderWidth: 4,
                        hoverOffset: 20,
                        hoverBorderWidth: 5
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    cutout: '65%',
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                color: textColor,
                                padding: 20,
                                font: {
                                    size: 14,
                                    weight: '600',
                                    family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                                },
                                usePointStyle: true,
                                pointStyle: 'circle',
                                boxWidth: 10,
                                boxHeight: 10
                            }
                        },
                        tooltip: {
                            enabled: hasStressData,
                            backgroundColor: isDarkMode ? 'rgba(26, 26, 26, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                            titleColor: textColor,
                            bodyColor: textColor,
                            borderColor: isDarkMode ? '#333333' : '#E5E5E5',
                            borderWidth: 2,
                            padding: 16,
                            cornerRadius: 12,
                            titleFont: {
                                size: 15,
                                weight: 'bold'
                            },
                            bodyFont: {
                                size: 14
                            },
                            callbacks: {
                                label: function(context) {
                                    const label = context.label || '';
                                    const value = context.parsed || 0;
                                    const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                    const percentage = ((value / total) * 100).toFixed(1);
                                    return `${label}: ${value} (${percentage}%)`;
                                }
                            }
                        }
                    },
                    animation: {
                        animateRotate: true,
                        animateScale: true,
                        duration: 1200,
                        easing: 'easeInOutQuart'
                    }
                }
            }
        );

        // Quiz Completion Status Pie Chart
        const totalQuizzes = stats.allQuizzes.length;
        const completedQuizzes = totalQuizzes;
        const pendingQuizzes = Math.max(0, stats.totalUsers - totalQuizzes);

        const hasQuizData = totalQuizzes > 0 || pendingQuizzes > 0;
        const quizStatusData = hasQuizData ? [completedQuizzes, pendingQuizzes] : [1, 1];
        const quizStatusLabels = hasQuizData ? ['Completed', 'Pending'] : ['No Data', 'No Data'];

        this.charts.quizTrend = new Chart(
            document.getElementById('quizTrendChart'),
            {
                type: 'doughnut',
                data: {
                    labels: quizStatusLabels,
                    datasets: [{
                        data: quizStatusData,
                        backgroundColor: hasQuizData ? [
                            '#8B5CF6', // Purple for Completed
                            '#EC4899'  // Pink for Pending
                        ] : ['#E5E5E5', '#D4D4D4'],
                        borderColor: isDarkMode ? '#1A1A1A' : '#FFFFFF',
                        borderWidth: 4,
                        hoverOffset: 20,
                        hoverBorderWidth: 5
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    cutout: '65%',
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                color: textColor,
                                padding: 20,
                                font: {
                                    size: 14,
                                    weight: '600',
                                    family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                                },
                                usePointStyle: true,
                                pointStyle: 'circle',
                                boxWidth: 10,
                                boxHeight: 10
                            }
                        },
                        tooltip: {
                            enabled: hasQuizData,
                            backgroundColor: isDarkMode ? 'rgba(26, 26, 26, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                            titleColor: textColor,
                            bodyColor: textColor,
                            borderColor: isDarkMode ? '#333333' : '#E5E5E5',
                            borderWidth: 2,
                            padding: 16,
                            cornerRadius: 12,
                            titleFont: {
                                size: 15,
                                weight: 'bold'
                            },
                            bodyFont: {
                                size: 14
                            },
                            callbacks: {
                                label: function(context) {
                                    const label = context.label || '';
                                    const value = context.parsed || 0;
                                    const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                    const percentage = ((value / total) * 100).toFixed(1);
                                    return `${label}: ${value} (${percentage}%)`;
                                }
                            }
                        }
                    },
                    animation: {
                        animateRotate: true,
                        animateScale: true,
                        duration: 1200,
                        easing: 'easeInOutQuart'
                    }
                }
            }
        );

        // Categories Pie Chart
        const categories = { academic: 0, social: 0, family: 0, personal: 0, physical: 0, lifestyle: 0 };
        stats.allQuizzes.forEach(q => {
            if (q.category_scores) {
                Object.keys(q.category_scores).forEach(cat => {
                    if (categories.hasOwnProperty(cat)) {
                        categories[cat] += q.category_scores[cat].percentage;
                    }
                });
            }
        });

        const categoryLabels = {
            academic: 'Academic',
            social: 'Social',
            family: 'Family',
            personal: 'Personal',
            physical: 'Physical',
            lifestyle: 'Lifestyle'
        };

        const categoryAverages = Object.keys(categories).map(cat => 
            stats.allQuizzes.length > 0 ? Math.round(categories[cat] / stats.allQuizzes.length) : 0
        );

        const hasCategoryData = categoryAverages.some(v => v > 0);
        const categoryData = hasCategoryData ? categoryAverages : [1, 1, 1, 1, 1, 1];
        const categoryChartLabels = hasCategoryData ? Object.keys(categories).map(cat => categoryLabels[cat]) : ['No Data', 'No Data', 'No Data', 'No Data', 'No Data', 'No Data'];

        this.charts.categories = new Chart(
            document.getElementById('categoriesChart'),
            {
                type: 'doughnut',
                data: {
                    labels: categoryChartLabels,
                    datasets: [{
                        data: categoryData,
                        backgroundColor: hasCategoryData ? [
                            '#3B82F6',   // Bright Blue - Academic
                            '#8B5CF6',   // Vibrant Purple - Social
                            '#EC4899',   // Hot Pink - Family
                            '#F59E0B',   // Amber Orange - Personal
                            '#10B981',   // Emerald Green - Physical
                            '#EAB308'    // Yellow - Lifestyle
                        ] : ['#E5E5E5', '#D4D4D4', '#C3C3C3', '#B2B2B2', '#A1A1A1', '#909090'],
                        borderColor: isDarkMode ? '#1A1A1A' : '#FFFFFF',
                        borderWidth: 4,
                        hoverOffset: 20,
                        hoverBorderWidth: 5
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    cutout: '65%',
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                color: textColor,
                                padding: 20,
                                font: {
                                    size: 14,
                                    weight: '600',
                                    family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                                },
                                usePointStyle: true,
                                pointStyle: 'circle',
                                boxWidth: 10,
                                boxHeight: 10
                            }
                        },
                        tooltip: {
                            enabled: hasCategoryData,
                            backgroundColor: isDarkMode ? 'rgba(26, 26, 26, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                            titleColor: textColor,
                            bodyColor: textColor,
                            borderColor: isDarkMode ? '#333333' : '#E5E5E5',
                            borderWidth: 2,
                            padding: 16,
                            cornerRadius: 12,
                            titleFont: {
                                size: 15,
                                weight: 'bold'
                            },
                            bodyFont: {
                                size: 14
                            },
                            callbacks: {
                                label: function(context) {
                                    const label = context.label || '';
                                    const value = context.parsed || 0;
                                    return `${label}: ${value}%`;
                                }
                            }
                        }
                    },
                    animation: {
                        animateRotate: true,
                        animateScale: true,
                        duration: 1200,
                        easing: 'easeInOutQuart'
                    }
                }
            }
        );

        // User Registration Status Pie Chart
        const last7Days = Array.from({ length: 7 }, (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - (6 - i));
            return date.toISOString().split('T')[0];
        });

        const newUsers = stats.allUsers.filter(u => {
            const userDate = u.created_at.split('T')[0];
            return last7Days.includes(userDate);
        }).length;
        const existingUsers = Math.max(0, stats.totalUsers - newUsers);

        const hasUserData = stats.totalUsers > 0;
        const userGrowthData = hasUserData ? [newUsers, existingUsers] : [1, 1];
        const userGrowthLabels = hasUserData ? ['New Users (7 days)', 'Existing Users'] : ['No Data', 'No Data'];

        this.charts.userGrowth = new Chart(
            document.getElementById('userGrowthChart'),
            {
                type: 'doughnut',
                data: {
                    labels: userGrowthLabels,
                    datasets: [{
                        data: userGrowthData,
                        backgroundColor: hasUserData ? [
                            '#06B6D4', // Cyan for New Users
                            '#14B8A6'  // Teal for Existing Users
                        ] : ['#E5E5E5', '#D4D4D4'],
                        borderColor: isDarkMode ? '#1A1A1A' : '#FFFFFF',
                        borderWidth: 4,
                        hoverOffset: 20,
                        hoverBorderWidth: 5
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    cutout: '65%',
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                color: textColor,
                                padding: 20,
                                font: {
                                    size: 14,
                                    weight: '600',
                                    family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                                },
                                usePointStyle: true,
                                pointStyle: 'circle',
                                boxWidth: 10,
                                boxHeight: 10
                            }
                        },
                        tooltip: {
                            enabled: hasUserData,
                            backgroundColor: isDarkMode ? 'rgba(26, 26, 26, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                            titleColor: textColor,
                            bodyColor: textColor,
                            borderColor: isDarkMode ? '#333333' : '#E5E5E5',
                            borderWidth: 2,
                            padding: 16,
                            cornerRadius: 12,
                            titleFont: {
                                size: 15,
                                weight: 'bold'
                            },
                            bodyFont: {
                                size: 14
                            },
                            callbacks: {
                                label: function(context) {
                                    const label = context.label || '';
                                    const value = context.parsed || 0;
                                    const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                    const percentage = ((value / total) * 100).toFixed(1);
                                    return `${label}: ${value} (${percentage}%)`;
                                }
                            }
                        }
                    },
                    animation: {
                        animateRotate: true,
                        animateScale: true,
                        duration: 1200,
                        easing: 'easeInOutQuart'
                    }
                }
            }
        );
    }

    async renderUsers() {
        const content = document.getElementById('adminContent');
        
        try {
            const { data: users, error } = await supabase
                .from('users')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            content.innerHTML = `
                <div class="dashboard-header">
                    <h1 class="dashboard-title">Users Management</h1>
                    <p class="dashboard-subtitle">Manage registered users</p>
                </div>

                <div class="data-table-container">
                    <div class="data-table-header">
                        <h3 class="data-table-title">All Users (${users.length})</h3>
                        <div class="data-table-actions">
                            <input type="text" class="search-input" placeholder="Search users..." id="userSearch">
                        </div>
                    </div>
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Age</th>
                                <th>Role</th>
                                <th>Joined</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody id="usersTableBody">
                            ${users.map(user => `
                                <tr>
                                    <td>${user.full_name || 'N/A'}</td>
                                    <td>${user.email}</td>
                                    <td>${user.age || 'N/A'}</td>
                                    <td><span class="badge ${user.is_admin ? 'badge-admin' : 'badge-user'}">${user.is_admin ? 'Admin' : 'User'}</span></td>
                                    <td>${new Date(user.created_at).toLocaleDateString()}</td>
                                    <td>
                                        <button class="action-button" onclick="adminDashboard.viewUserDetails('${user.id}')">View</button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `;

            // Setup search
            document.getElementById('userSearch').addEventListener('input', (e) => {
                this.filterTable(e.target.value, 'usersTableBody');
            });

        } catch (error) {
            content.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">⚠️</div>
                    <h3 class="empty-state-title">Error Loading Users</h3>
                    <p class="empty-state-description">${error.message}</p>
                </div>
            `;
        }
    }

    async renderQuizzes() {
        const content = document.getElementById('adminContent');
        
        try {
            const { data: quizzes, error } = await supabase
                .from('quiz_results')
                .select(`
                    *,
                    users (full_name, email)
                `)
                .order('created_at', { ascending: false });

            if (error) throw error;

            content.innerHTML = `
                <div class="dashboard-header">
                    <h1 class="dashboard-title">Quiz Results</h1>
                    <p class="dashboard-subtitle">View all quiz completions</p>
                </div>

                <div class="data-table-container">
                    <div class="data-table-header">
                        <h3 class="data-table-title">All Quiz Results (${quizzes.length})</h3>
                        <div class="data-table-actions">
                            <select class="filter-select" id="stressFilter">
                                <option value="">All Stress Levels</option>
                                <option value="Low">Low</option>
                                <option value="Mild">Mild</option>
                                <option value="Moderate">Moderate</option>
                                <option value="High">High</option>
                                <option value="Severe">Severe</option>
                            </select>
                            <input type="text" class="search-input" placeholder="Search..." id="quizSearch">
                        </div>
                    </div>
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>User</th>
                                <th>Stress Level</th>
                                <th>Score</th>
                                <th>Time Spent</th>
                                <th>Completed</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody id="quizzesTableBody">
                            ${quizzes.map(quiz => `
                                <tr data-stress="${quiz.stress_level}">
                                    <td>${quiz.users?.full_name || 'Unknown'}</td>
                                    <td><span class="badge badge-${quiz.stress_level.toLowerCase()}">${quiz.stress_level}</span></td>
                                    <td>${quiz.stress_percentage}%</td>
                                    <td>${Math.floor(quiz.time_spent_seconds / 60)}m ${quiz.time_spent_seconds % 60}s</td>
                                    <td>${new Date(quiz.created_at).toLocaleDateString()}</td>
                                    <td>
                                        <button class="action-button" onclick="adminDashboard.viewQuizDetails('${quiz.id}')">View</button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `;

            // Setup filters
            document.getElementById('stressFilter').addEventListener('change', (e) => {
                this.filterQuizzesByStress(e.target.value);
            });

            document.getElementById('quizSearch').addEventListener('input', (e) => {
                this.filterTable(e.target.value, 'quizzesTableBody');
            });

        } catch (error) {
            content.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">⚠️</div>
                    <h3 class="empty-state-title">Error Loading Quiz Results</h3>
                    <p class="empty-state-description">${error.message}</p>
                </div>
            `;
        }
    }

    async renderAnalytics() {
        const content = document.getElementById('adminContent');
        
        const stats = await this.fetchOverviewStats();
        
        content.innerHTML = `
            <div class="dashboard-header">
                <h1 class="dashboard-title">Advanced Analytics</h1>
                <p class="dashboard-subtitle">Detailed insights and trends</p>
            </div>

            <div class="charts-grid">
                <div class="chart-card" style="grid-column: span 2;">
                    <div class="chart-card-header">
                        <h3 class="chart-card-title">Stress Trends by Category</h3>
                        <p class="chart-card-description">Average stress levels across all categories over time</p>
                    </div>
                    <div class="chart-container" style="height: 400px;">
                        <canvas id="categoryTrendsChart"></canvas>
                    </div>
                </div>

                <div class="chart-card">
                    <div class="chart-card-header">
                        <h3 class="chart-card-title">Age Distribution</h3>
                        <p class="chart-card-description">User age breakdown</p>
                    </div>
                    <div class="chart-container">
                        <canvas id="ageDistributionChart"></canvas>
                    </div>
                </div>

                <div class="chart-card">
                    <div class="chart-card-header">
                        <h3 class="chart-card-title">Completion Rate</h3>
                        <p class="chart-card-description">Quiz completion vs registration</p>
                    </div>
                    <div class="chart-container">
                        <canvas id="completionRateChart"></canvas>
                    </div>
                </div>
            </div>
        `;

        await this.renderAnalyticsCharts(stats);
    }

    async renderAnalyticsCharts(stats) {
        // Get current theme colors
        const isDarkMode = document.documentElement.getAttribute('data-theme') === 'dark';
        const textColor = isDarkMode ? '#FFFFFF' : '#000000';
        const borderColor = isDarkMode ? '#333333' : '#FFFFFF';
        
        // Category Trends Pie Chart
        const categories = ['academic', 'social', 'family', 'personal', 'physical', 'lifestyle'];
        const categoryLabels = {
            academic: 'Academic',
            social: 'Social',
            family: 'Family',
            personal: 'Personal',
            physical: 'Physical',
            lifestyle: 'Lifestyle'
        };

        // Calculate average stress for each category across all quizzes
        const categoryTotals = { academic: 0, social: 0, family: 0, personal: 0, physical: 0, lifestyle: 0 };
        stats.allQuizzes.forEach(q => {
            if (q.category_scores) {
                Object.keys(q.category_scores).forEach(cat => {
                    if (categoryTotals.hasOwnProperty(cat)) {
                        categoryTotals[cat] += q.category_scores[cat].percentage;
                    }
                });
            }
        });

        const categoryAverages = categories.map(cat => 
            stats.allQuizzes.length > 0 ? Math.round(categoryTotals[cat] / stats.allQuizzes.length) : 0
        );

        const hasCategoryTrendData = categoryAverages.some(v => v > 0);
        const categoryTrendData = hasCategoryTrendData ? categoryAverages : [1, 1, 1, 1, 1, 1];
        const categoryTrendLabels = hasCategoryTrendData ? categories.map(cat => categoryLabels[cat]) : ['No Data', 'No Data', 'No Data', 'No Data', 'No Data', 'No Data'];

        new Chart(document.getElementById('categoryTrendsChart'), {
            type: 'doughnut',
            data: {
                labels: categoryTrendLabels,
                datasets: [{
                    data: categoryTrendData,
                    backgroundColor: hasCategoryTrendData ? [
                        '#3B82F6',   // Bright Blue - Academic
                        '#8B5CF6',   // Vibrant Purple - Social
                        '#EC4899',   // Hot Pink - Family
                        '#F59E0B',   // Amber Orange - Personal
                        '#10B981',   // Emerald Green - Physical
                        '#EAB308'    // Yellow - Lifestyle
                    ] : ['#E5E5E5', '#D4D4D4', '#C3C3C3', '#B2B2B2', '#A1A1A1', '#909090'],
                    borderColor: isDarkMode ? '#1A1A1A' : '#FFFFFF',
                    borderWidth: 4,
                    hoverOffset: 20,
                    hoverBorderWidth: 5
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '65%',
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: textColor,
                            padding: 20,
                            font: {
                                size: 14,
                                weight: '600',
                                family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                            },
                            usePointStyle: true,
                            pointStyle: 'circle',
                            boxWidth: 10,
                            boxHeight: 10
                        }
                    },
                    tooltip: {
                        enabled: hasCategoryTrendData,
                        backgroundColor: isDarkMode ? 'rgba(26, 26, 26, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                        titleColor: textColor,
                        bodyColor: textColor,
                        borderColor: isDarkMode ? '#333333' : '#E5E5E5',
                        borderWidth: 2,
                        padding: 16,
                        cornerRadius: 12,
                        titleFont: {
                            size: 15,
                            weight: 'bold'
                        },
                        bodyFont: {
                            size: 14
                        },
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.parsed || 0;
                                return `${label}: ${value}%`;
                            }
                        }
                    }
                },
                animation: {
                    animateRotate: true,
                    animateScale: true,
                    duration: 1200,
                    easing: 'easeInOutQuart'
                }
            }
        });

        // Age Distribution
        const ageGroups = { '13-14': 0, '15-16': 0, '17-18': 0, '19+': 0 };
        stats.allUsers.forEach(user => {
            const age = user.age;
            if (age >= 13 && age <= 14) ageGroups['13-14']++;
            else if (age >= 15 && age <= 16) ageGroups['15-16']++;
            else if (age >= 17 && age <= 18) ageGroups['17-18']++;
            else if (age >= 19) ageGroups['19+']++;
        });

        const hasAgeData = Object.values(ageGroups).some(v => v > 0);
        const ageData = hasAgeData ? Object.values(ageGroups) : [1, 1, 1, 1];
        const ageLabels = hasAgeData ? Object.keys(ageGroups) : ['No Data', 'No Data', 'No Data', 'No Data'];

        new Chart(document.getElementById('ageDistributionChart'), {
            type: 'doughnut',
            data: {
                labels: ageLabels,
                datasets: [{
                    data: ageData,
                    backgroundColor: hasAgeData ? [
                        '#6366F1', // Indigo for 13-14
                        '#8B5CF6', // Purple for 15-16
                        '#EC4899', // Pink for 17-18
                        '#F43F5E'  // Rose for 19+
                    ] : ['#E5E5E5', '#D4D4D4', '#C3C3C3', '#B2B2B2'],
                    borderColor: isDarkMode ? '#1A1A1A' : '#FFFFFF',
                    borderWidth: 4,
                    hoverOffset: 20,
                    hoverBorderWidth: 5
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '65%',
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: textColor,
                            padding: 20,
                            font: {
                                size: 14,
                                weight: '600',
                                family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                            },
                            usePointStyle: true,
                            pointStyle: 'circle',
                            boxWidth: 10,
                            boxHeight: 10
                        }
                    },
                    tooltip: {
                        enabled: hasAgeData,
                        backgroundColor: isDarkMode ? 'rgba(26, 26, 26, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                        titleColor: textColor,
                        bodyColor: textColor,
                        borderColor: isDarkMode ? '#333333' : '#E5E5E5',
                        borderWidth: 2,
                        padding: 16,
                        cornerRadius: 12,
                        titleFont: {
                            size: 15,
                            weight: 'bold'
                        },
                        bodyFont: {
                            size: 14
                        },
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.parsed || 0;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((value / total) * 100).toFixed(1);
                                return `${label}: ${value} users (${percentage}%)`;
                            }
                        }
                    }
                },
                animation: {
                    animateRotate: true,
                    animateScale: true,
                    duration: 1200,
                    easing: 'easeInOutQuart'
                }
            }
        });

        // Completion Rate
        const usersWithQuizzes = new Set(stats.allQuizzes.map(q => q.user_id)).size;
        const usersWithoutQuizzes = stats.totalUsers - usersWithQuizzes;

        new Chart(document.getElementById('completionRateChart'), {
            type: 'doughnut',
            data: {
                labels: ['Completed Quiz', 'Not Completed'],
                datasets: [{
                    data: [usersWithQuizzes, usersWithoutQuizzes],
                    backgroundColor: [
                        '#10B981', // Emerald green for Completed
                        '#F59E0B'  // Amber for Not Completed
                    ],
                    borderColor: isDarkMode ? '#1A1A1A' : '#FFFFFF',
                    borderWidth: 4,
                    hoverOffset: 20,
                    hoverBorderWidth: 5
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '65%',
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: textColor,
                            padding: 20,
                            font: {
                                size: 14,
                                weight: '600',
                                family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                            },
                            usePointStyle: true,
                            pointStyle: 'circle',
                            boxWidth: 10,
                            boxHeight: 10
                        }
                    },
                    tooltip: {
                        backgroundColor: isDarkMode ? 'rgba(26, 26, 26, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                        titleColor: textColor,
                        bodyColor: textColor,
                        borderColor: isDarkMode ? '#333333' : '#E5E5E5',
                        borderWidth: 2,
                        padding: 16,
                        cornerRadius: 12,
                        titleFont: {
                            size: 15,
                            weight: 'bold'
                        },
                        bodyFont: {
                            size: 14
                        },
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.parsed || 0;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((value / total) * 100).toFixed(1);
                                return `${label}: ${value} users (${percentage}%)`;
                            }
                        }
                    }
                },
                animation: {
                    animateRotate: true,
                    animateScale: true,
                    duration: 1200,
                    easing: 'easeInOutQuart'
                }
            }
        });
    }

    filterTable(searchTerm, tableBodyId) {
        const tbody = document.getElementById(tableBodyId);
        const rows = tbody.getElementsByTagName('tr');
        
        Array.from(rows).forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(searchTerm.toLowerCase()) ? '' : 'none';
        });
    }

    filterQuizzesByStress(level) {
        const tbody = document.getElementById('quizzesTableBody');
        const rows = tbody.getElementsByTagName('tr');
        
        Array.from(rows).forEach(row => {
            if (!level || row.dataset.stress === level) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    }

    async viewUserDetails(userId) {
        try {
            // Fetch user details
            const { data: user, error: userError } = await supabase
                .from('users')
                .select('*')
                .eq('id', userId)
                .single();

            if (userError) throw userError;

            // Fetch user's quiz results
            const { data: quizzes, error: quizzesError } = await supabase
                .from('quiz_results')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            if (quizzesError) throw quizzesError;

            // Calculate user statistics
            const avgStress = quizzes.length > 0
                ? Math.round(quizzes.reduce((sum, q) => sum + q.stress_percentage, 0) / quizzes.length)
                : 0;

            const latestQuiz = quizzes[0];
            const stressLevels = { Low: 0, Mild: 0, Moderate: 0, High: 0, Severe: 0 };
            quizzes.forEach(q => {
                if (stressLevels.hasOwnProperty(q.stress_level)) {
                    stressLevels[q.stress_level]++;
                }
            });

            // Create modal
            this.showModal(`
                <div class="detail-view">
                    <div class="detail-header">
                        <div>
                            <h2 class="detail-title">${user.full_name || 'User'}</h2>
                            <p class="detail-meta">${user.email}</p>
                        </div>
                        <span class="badge ${user.is_admin ? 'badge-admin' : 'badge-user'}">
                            ${user.is_admin ? 'Admin' : 'User'}
                        </span>
                    </div>

                    <div class="detail-grid">
                        <div class="detail-section">
                            <h3 class="detail-section-title">User Information</h3>
                            <div class="detail-field">
                                <div class="detail-field-label">Age</div>
                                <div class="detail-field-value">${user.age || 'N/A'}</div>
                            </div>
                            <div class="detail-field">
                                <div class="detail-field-label">Joined</div>
                                <div class="detail-field-value">${new Date(user.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                            </div>
                            <div class="detail-field">
                                <div class="detail-field-label">Last Updated</div>
                                <div class="detail-field-value">${new Date(user.updated_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                            </div>
                        </div>

                        <div class="detail-section">
                            <h3 class="detail-section-title">Stress Statistics</h3>
                            <div class="detail-field">
                                <div class="detail-field-label">Total Assessments</div>
                                <div class="detail-field-value">${quizzes.length}</div>
                            </div>
                            <div class="detail-field">
                                <div class="detail-field-label">Average Stress Level</div>
                                <div class="detail-field-value">${avgStress}%</div>
                            </div>
                            ${latestQuiz ? `
                                <div class="detail-field">
                                    <div class="detail-field-label">Latest Assessment</div>
                                    <div class="detail-field-value">
                                        <span class="badge badge-${latestQuiz.stress_level.toLowerCase()}">${latestQuiz.stress_level}</span>
                                        ${new Date(latestQuiz.created_at).toLocaleDateString()}
                                    </div>
                                </div>
                            ` : ''}
                        </div>
                    </div>

                    ${quizzes.length > 0 ? `
                        <div class="detail-section" style="margin-top: 2rem;">
                            <h3 class="detail-section-title">Assessment History</h3>
                            <table class="data-table" style="margin-top: 1rem;">
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Stress Level</th>
                                        <th>Score</th>
                                        <th>Time Spent</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${quizzes.map(quiz => `
                                        <tr>
                                            <td>${new Date(quiz.created_at).toLocaleDateString()}</td>
                                            <td><span class="badge badge-${quiz.stress_level.toLowerCase()}">${quiz.stress_level}</span></td>
                                            <td>${quiz.stress_percentage}%</td>
                                            <td>${Math.floor(quiz.time_spent_seconds / 60)}m ${quiz.time_spent_seconds % 60}s</td>
                                            <td>
                                                <button class="action-button" onclick="adminDashboard.viewQuizDetails('${quiz.id}')">View</button>
                                            </td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    ` : `
                        <div class="empty-state" style="margin-top: 2rem;">
                            <p>No quiz assessments completed yet.</p>
                        </div>
                    `}
                </div>
            `);

        } catch (error) {
            if (window.animationManager) {
                window.animationManager.showError('Failed to load user details');
            }
        }
    }

    async viewQuizDetails(quizId) {
        try {
            // Fetch quiz details with user info
            const { data: quiz, error: quizError } = await supabase
                .from('quiz_results')
                .select(`
                    *,
                    users (full_name, email)
                `)
                .eq('id', quizId)
                .single();

            if (quizError) throw quizError;

            // Get category names
            const categoryLabels = {
                academic: 'Academic Stress',
                social: 'Social Stress',
                family: 'Family Stress',
                personal: 'Personal Identity',
                physical: 'Physical Health',
                lifestyle: 'Life Balance'
            };

            // Sort categories by percentage
            const sortedCategories = Object.entries(quiz.category_scores || {})
                .sort((a, b) => b[1].percentage - a[1].percentage);

            // Create modal
            this.showModal(`
                <div class="detail-view">
                    <div class="detail-header">
                        <div>
                            <h2 class="detail-title">Quiz Assessment Details</h2>
                            <p class="detail-meta">Completed by ${quiz.users?.full_name || 'Unknown'} on ${new Date(quiz.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                        <span class="badge badge-${quiz.stress_level.toLowerCase()}" style="font-size: 1.1rem; padding: 0.5rem 1rem;">
                            ${quiz.stress_level}
                        </span>
                    </div>

                    <div class="detail-grid">
                        <div class="detail-section">
                            <h3 class="detail-section-title">Overall Results</h3>
                            <div class="detail-field">
                                <div class="detail-field-label">Stress Percentage</div>
                                <div class="detail-field-value" style="font-size: 2rem; font-weight: 700; color: ${this.getStressLevelColor(quiz.stress_level)};">
                                    ${quiz.stress_percentage}%
                                </div>
                            </div>
                            <div class="detail-field">
                                <div class="detail-field-label">Total Score</div>
                                <div class="detail-field-value">${quiz.total_score.toFixed(2)} / 5.0</div>
                            </div>
                            <div class="detail-field">
                                <div class="detail-field-label">Time Spent</div>
                                <div class="detail-field-value">${Math.floor(quiz.time_spent_seconds / 60)} minutes ${quiz.time_spent_seconds % 60} seconds</div>
                            </div>
                        </div>

                        <div class="detail-section">
                            <h3 class="detail-section-title">User Information</h3>
                            <div class="detail-field">
                                <div class="detail-field-label">Name</div>
                                <div class="detail-field-value">${quiz.users?.full_name || 'N/A'}</div>
                            </div>
                            <div class="detail-field">
                                <div class="detail-field-label">Email</div>
                                <div class="detail-field-value">${quiz.users?.email || 'N/A'}</div>
                            </div>
                            <div class="detail-field">
                                <div class="detail-field-label">Assessment Date</div>
                                <div class="detail-field-value">${new Date(quiz.created_at).toLocaleDateString()}</div>
                            </div>
                        </div>
                    </div>

                    <div class="detail-section" style="margin-top: 2rem;">
                        <h3 class="detail-section-title">Category Breakdown</h3>
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem; margin-top: 1rem;">
                            ${sortedCategories.map(([category, data]) => `
                                <div style="padding: 1.5rem; background-color: var(--color-gray-50); border-radius: 8px; border-left: 4px solid ${this.getStressLevelColor(data.level)};">
                                    <div style="font-weight: 600; margin-bottom: 0.5rem; color: var(--color-gray-700);">
                                        ${categoryLabels[category] || category}
                                    </div>
                                    <div style="font-size: 1.75rem; font-weight: 700; margin-bottom: 0.5rem;">
                                        ${Math.round(data.percentage)}%
                                    </div>
                                    <div>
                                        <span class="badge badge-${data.level.toLowerCase()}">${data.level}</span>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    <div class="detail-section" style="margin-top: 2rem;">
                        <h3 class="detail-section-title">Recommendations</h3>
                        <div style="padding: 1.5rem; background-color: var(--color-gray-50); border-radius: 8px; margin-top: 1rem;">
                            <ul style="list-style: none; display: flex; flex-direction: column; gap: 0.75rem;">
                                ${this.getQuizRecommendations(quiz).map(rec => `
                                    <li style="display: flex; gap: 0.75rem; align-items: flex-start;">
                                        <span style="font-size: 1.25rem; color: var(--color-black);">→</span>
                                        <span>${rec}</span>
                                    </li>
                                `).join('')}
                            </ul>
                        </div>
                    </div>
                </div>
            `);

        } catch (error) {
            if (window.animationManager) {
                window.animationManager.showError('Failed to load quiz details');
            }
        }
    }

    getStressLevelColor(level) {
        const colors = {
            'Low': '#2D5016',
            'Mild': '#4A7C2C',
            'Moderate': '#8B7500',
            'High': '#B54708',
            'Severe': '#C41E3A'
        };
        return colors[level] || '#000000';
    }

    getQuizRecommendations(quiz) {
        const recommendations = [];
        
        if (quiz.stress_level === 'Severe' || quiz.stress_level === 'High') {
            recommendations.push('Consider speaking with a school counselor or mental health professional');
            recommendations.push('Practice daily stress-reduction techniques like deep breathing or meditation');
        }
        
        if (quiz.category_scores?.academic?.percentage > 60) {
            recommendations.push('Implement time management strategies and break large tasks into smaller steps');
        }
        
        if (quiz.category_scores?.social?.percentage > 60) {
            recommendations.push('Set healthy boundaries with social media and focus on quality relationships');
        }
        
        if (quiz.category_scores?.physical?.percentage > 60) {
            recommendations.push('Prioritize sleep hygiene and aim for 8-10 hours of sleep per night');
            recommendations.push('Incorporate regular physical activity into your routine');
        }
        
        if (quiz.category_scores?.lifestyle?.percentage > 60) {
            recommendations.push('Schedule regular breaks and time for activities you enjoy');
        }

        if (recommendations.length === 0) {
            recommendations.push('Continue maintaining healthy stress management practices');
            recommendations.push('Stay consistent with activities that promote wellbeing');
        }
        
        return recommendations;
    }

    clearSupabaseStorage() {
        // Clear localStorage
        const localStorageKeys = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && (key.includes('supabase') || key.includes('sb-'))) {
                localStorageKeys.push(key);
            }
        }
        localStorageKeys.forEach(key => localStorage.removeItem(key));
        
        // Clear sessionStorage
        const sessionStorageKeys = [];
        for (let i = 0; i < sessionStorage.length; i++) {
            const key = sessionStorage.key(i);
            if (key && (key.includes('supabase') || key.includes('sb-'))) {
                sessionStorageKeys.push(key);
            }
        }
        sessionStorageKeys.forEach(key => sessionStorage.removeItem(key));
    }

    showModal(content) {
        // Remove existing modal if any
        const existingModal = document.querySelector('.admin-modal');
        if (existingModal) {
            existingModal.remove();
        }

        // Create modal
        const modal = document.createElement('div');
        modal.className = 'admin-modal';
        modal.innerHTML = `
            <div class="admin-modal-overlay"></div>
            <div class="admin-modal-content">
                <button class="admin-modal-close">&times;</button>
                <div class="admin-modal-body">
                    ${content}
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Add event listeners
        const overlay = modal.querySelector('.admin-modal-overlay');
        const closeBtn = modal.querySelector('.admin-modal-close');

        const closeModal = () => {
            modal.classList.add('closing');
            setTimeout(() => modal.remove(), 300);
        };

        overlay.addEventListener('click', closeModal);
        closeBtn.addEventListener('click', closeModal);

        // Close on escape key
        const escapeHandler = (e) => {
            if (e.key === 'Escape') {
                closeModal();
                document.removeEventListener('keydown', escapeHandler);
            }
        };
        document.addEventListener('keydown', escapeHandler);

        // Animate in
        setTimeout(() => modal.classList.add('active'), 10);
    }
}

// Initialize admin dashboard
const adminDashboard = new AdminDashboard();
window.adminDashboard = adminDashboard;
