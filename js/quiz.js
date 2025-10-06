// Quiz Module
class QuizManager {
    constructor() {
        this.questions = [
            {
                id: 1,
                text: "How often do you feel overwhelmed by schoolwork or assignments?",
                category: "academic",
                options: [
                    { text: "Rarely or never", score: 1 },
                    { text: "Sometimes (1-2 times per week)", score: 2 },
                    { text: "Often (3-4 times per week)", score: 3 },
                    { text: "Very often (almost daily)", score: 4 },
                    { text: "Constantly (multiple times daily)", score: 5 }
                ]
            },
            {
                id: 2,
                text: "How much pressure do you feel from academic expectations (grades, college, etc.)?",
                category: "academic",
                options: [
                    { text: "Very little pressure", score: 1 },
                    { text: "Some pressure, but manageable", score: 2 },
                    { text: "Moderate pressure that affects me", score: 3 },
                    { text: "High pressure that causes stress", score: 4 },
                    { text: "Extreme pressure that's overwhelming", score: 5 }
                ]
            },
            {
                id: 3,
                text: "How often do you worry about fitting in or being accepted by peers?",
                category: "social",
                options: [
                    { text: "Rarely or never", score: 1 },
                    { text: "Occasionally", score: 2 },
                    { text: "Sometimes", score: 3 },
                    { text: "Frequently", score: 4 },
                    { text: "Almost always", score: 5 }
                ]
            },
            {
                id: 4,
                text: "How much stress do social media and online interactions cause you?",
                category: "social",
                options: [
                    { text: "No stress at all", score: 1 },
                    { text: "Minimal stress", score: 2 },
                    { text: "Moderate stress", score: 3 },
                    { text: "Significant stress", score: 4 },
                    { text: "Severe stress", score: 5 }
                ]
            },
            {
                id: 5,
                text: "How often do you experience conflicts or tension with family members?",
                category: "family",
                options: [
                    { text: "Rarely or never", score: 1 },
                    { text: "Once in a while", score: 2 },
                    { text: "Sometimes", score: 3 },
                    { text: "Often", score: 4 },
                    { text: "Very frequently", score: 5 }
                ]
            },
            {
                id: 6,
                text: "How much pressure do you feel from family expectations?",
                category: "family",
                options: [
                    { text: "No pressure", score: 1 },
                    { text: "Light pressure", score: 2 },
                    { text: "Moderate pressure", score: 3 },
                    { text: "Heavy pressure", score: 4 },
                    { text: "Overwhelming pressure", score: 5 }
                ]
            },
            {
                id: 7,
                text: "How often do you worry about your appearance or body image?",
                category: "personal",
                options: [
                    { text: "Rarely or never", score: 1 },
                    { text: "Occasionally", score: 2 },
                    { text: "Sometimes", score: 3 },
                    { text: "Frequently", score: 4 },
                    { text: "Constantly", score: 5 }
                ]
            },
            {
                id: 8,
                text: "How often do you feel uncertain about your future or life direction?",
                category: "personal",
                options: [
                    { text: "Rarely or never", score: 1 },
                    { text: "Occasionally", score: 2 },
                    { text: "Sometimes", score: 3 },
                    { text: "Often", score: 4 },
                    { text: "Almost always", score: 5 }
                ]
            },
            {
                id: 9,
                text: "How well do you sleep at night?",
                category: "physical",
                options: [
                    { text: "Very well, consistently", score: 1 },
                    { text: "Generally well", score: 2 },
                    { text: "Okay, with occasional issues", score: 3 },
                    { text: "Poorly, often disrupted", score: 4 },
                    { text: "Very poorly, chronic issues", score: 5 }
                ]
            },
            {
                id: 10,
                text: "How often do you experience physical symptoms of stress (headaches, stomach issues, tension)?",
                category: "physical",
                options: [
                    { text: "Rarely or never", score: 1 },
                    { text: "Once in a while", score: 2 },
                    { text: "Sometimes", score: 3 },
                    { text: "Frequently", score: 4 },
                    { text: "Very often or constantly", score: 5 }
                ]
            },
            {
                id: 11,
                text: "How much time do you have for activities you enjoy?",
                category: "lifestyle",
                options: [
                    { text: "Plenty of time", score: 1 },
                    { text: "Adequate time", score: 2 },
                    { text: "Some time, but limited", score: 3 },
                    { text: "Very little time", score: 4 },
                    { text: "Almost no time at all", score: 5 }
                ]
            },
            {
                id: 12,
                text: "How balanced do you feel your life is between responsibilities and personal time?",
                category: "lifestyle",
                options: [
                    { text: "Very balanced", score: 1 },
                    { text: "Mostly balanced", score: 2 },
                    { text: "Somewhat unbalanced", score: 3 },
                    { text: "Quite unbalanced", score: 4 },
                    { text: "Extremely unbalanced", score: 5 }
                ]
            }
        ];

        this.currentQuestion = 0;
        this.answers = {};
        this.quizStartTime = null;
    }

    loadQuiz() {
        if (!window.authManager.isAuthenticated()) {
            return;
        }

        const quizContent = document.getElementById('quizContent');
        if (!quizContent) return;

        this.quizStartTime = new Date();
        
        quizContent.innerHTML = `
            <div class="quiz-container">
                <div class="quiz-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" id="progressFill"></div>
                    </div>
                    <div class="progress-text" id="progressText">Question 1 of ${this.questions.length}</div>
                </div>
                <div id="quizQuestionContainer"></div>
            </div>
        `;

        this.renderQuestion();
    }

    renderQuestion() {
        const container = document.getElementById('quizQuestionContainer');
        if (!container) return;

        const question = this.questions[this.currentQuestion];
        const isLastQuestion = this.currentQuestion === this.questions.length - 1;

        container.innerHTML = `
            <div class="quiz-question animate-fade-in">
                <h3 class="question-text">${question.text}</h3>
                <div class="quiz-options">
                    ${question.options.map((option, index) => `
                        <div class="quiz-option" data-score="${option.score}">
                            ${option.text}
                        </div>
                    `).join('')}
                </div>
                <div class="quiz-navigation">
                    ${this.currentQuestion > 0 ? '<button class="btn-secondary" id="prevBtn">Previous</button>' : '<div></div>'}
                    <button class="btn-primary" id="nextBtn" disabled>${isLastQuestion ? 'Finish' : 'Next'}</button>
                </div>
            </div>
        `;

        this.updateProgress();
        this.setupQuestionListeners();
    }

    setupQuestionListeners() {
        const options = document.querySelectorAll('.quiz-option');
        const nextBtn = document.getElementById('nextBtn');
        const prevBtn = document.getElementById('prevBtn');

        options.forEach(option => {
            option.addEventListener('click', () => {
                options.forEach(opt => opt.classList.remove('selected'));
                option.classList.add('selected');
                
                const questionId = this.questions[this.currentQuestion].id;
                this.answers[questionId] = {
                    score: parseInt(option.dataset.score),
                    category: this.questions[this.currentQuestion].category
                };

                if (nextBtn) nextBtn.disabled = false;
            });
        });

        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                if (this.currentQuestion < this.questions.length - 1) {
                    this.currentQuestion++;
                    this.renderQuestion();
                } else {
                    this.finishQuiz();
                }
            });
        }

        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                if (this.currentQuestion > 0) {
                    this.currentQuestion--;
                    this.renderQuestion();
                }
            });
        }

        // Pre-select if already answered
        const questionId = this.questions[this.currentQuestion].id;
        if (this.answers[questionId]) {
            const selectedScore = this.answers[questionId].score;
            options.forEach(option => {
                if (parseInt(option.dataset.score) === selectedScore) {
                    option.classList.add('selected');
                    if (nextBtn) nextBtn.disabled = false;
                }
            });
        }
    }

    updateProgress() {
        const progressFill = document.getElementById('progressFill');
        const progressText = document.getElementById('progressText');

        if (progressFill) {
            const percentage = ((this.currentQuestion + 1) / this.questions.length) * 100;
            progressFill.style.width = `${percentage}%`;
        }

        if (progressText) {
            progressText.textContent = `Question ${this.currentQuestion + 1} of ${this.questions.length}`;
        }
    }

    async finishQuiz() {
        const results = this.calculateResults();
        await this.saveResults(results);
        this.displayResults(results);
    }

    calculateResults() {
        const categoryScores = {
            academic: { total: 0, count: 0 },
            social: { total: 0, count: 0 },
            family: { total: 0, count: 0 },
            personal: { total: 0, count: 0 },
            physical: { total: 0, count: 0 },
            lifestyle: { total: 0, count: 0 }
        };

        let totalScore = 0;
        let totalQuestions = 0;

        Object.values(this.answers).forEach(answer => {
            totalScore += answer.score;
            totalQuestions++;
            
            if (categoryScores[answer.category]) {
                categoryScores[answer.category].total += answer.score;
                categoryScores[answer.category].count++;
            }
        });

        const averageScore = totalScore / totalQuestions;
        const maxScore = 5;
        const stressPercentage = ((averageScore - 1) / (maxScore - 1)) * 100;

        const categoryResults = {};
        Object.keys(categoryScores).forEach(category => {
            const cat = categoryScores[category];
            if (cat.count > 0) {
                const catAverage = cat.total / cat.count;
                categoryResults[category] = {
                    score: catAverage,
                    percentage: ((catAverage - 1) / (maxScore - 1)) * 100,
                    level: this.getStressLevel(catAverage)
                };
            }
        });

        return {
            totalScore: averageScore,
            stressPercentage: Math.round(stressPercentage),
            level: this.getStressLevel(averageScore),
            categories: categoryResults,
            completedAt: new Date(),
            timeSpent: Math.round((new Date() - this.quizStartTime) / 1000)
        };
    }

    getStressLevel(score) {
        if (score <= 1.5) return 'Low';
        if (score <= 2.5) return 'Mild';
        if (score <= 3.5) return 'Moderate';
        if (score <= 4.5) return 'High';
        return 'Severe';
    }

    getStressLevelDescription(level) {
        const descriptions = {
            'Low': 'Your stress levels are well-managed. You have good coping mechanisms and a healthy balance in your life. Continue maintaining your current practices.',
            'Mild': 'You experience some stress, but it\'s generally manageable. Consider implementing a few stress-reduction techniques to prevent escalation.',
            'Moderate': 'You\'re experiencing noticeable stress that may be affecting your daily life. It\'s important to actively work on stress management strategies.',
            'High': 'Your stress levels are concerning and likely impacting your wellbeing significantly. Consider seeking support and implementing multiple stress-reduction techniques.',
            'Severe': 'You\'re experiencing severe stress that requires immediate attention. Please consider speaking with a counselor, therapist, or trusted adult for professional support.'
        };
        return descriptions[level] || '';
    }

    getCategoryName(category) {
        const names = {
            academic: 'Academic Stress',
            social: 'Social Stress',
            family: 'Family Stress',
            personal: 'Personal Identity',
            physical: 'Physical Health',
            lifestyle: 'Life Balance'
        };
        return names[category] || category;
    }

    async saveResults(results) {
        const user = window.authManager.getCurrentUser();
        if (!user) return;

        try {
            const { error } = await supabase
                .from('quiz_results')
                .insert([
                    {
                        user_id: user.id,
                        total_score: results.totalScore,
                        stress_percentage: results.stressPercentage,
                        stress_level: results.level,
                        category_scores: results.categories,
                        time_spent_seconds: results.timeSpent,
                        answers: this.answers
                    }
                ]);

            if (error) {
                console.error('Error saving quiz results:', error);
                throw error;
            }
        } catch (error) {
            console.error('Failed to save quiz results:', error);
            if (window.animationManager) {
                window.animationManager.showError('Failed to save results. Please try again.');
            }
        }
    }

    displayResults(results) {
        const container = document.getElementById('quizQuestionContainer');
        if (!container) return;

        const topCategories = Object.entries(results.categories)
            .sort((a, b) => b[1].percentage - a[1].percentage)
            .slice(0, 3);

        const allCategories = Object.entries(results.categories)
            .sort((a, b) => b[1].percentage - a[1].percentage);

        container.innerHTML = `
            <div class="quiz-results animate-fade-in">
                <h2 class="results-title">Your Stress Assessment Results</h2>
                
                <!-- Overall Score Section -->
                <div style="background: linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%); padding: 2rem; border-radius: 16px; margin-bottom: 2rem; text-align: center;">
                    <div class="results-score" style="font-size: 4rem; font-weight: 800; margin-bottom: 0.5rem;">${results.stressPercentage}%</div>
                    <div class="results-level" style="font-size: 1.75rem; font-weight: 700; margin-bottom: 1rem; color: ${this.getStressLevelColor(results.level)}">
                        ${results.level} Stress Level
                    </div>
                    <p class="results-description" style="max-width: 600px; margin: 0 auto; font-size: 1.05rem; line-height: 1.6;">${this.getStressLevelDescription(results.level)}</p>
                </div>

                <!-- Charts Grid -->
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 2rem; margin-bottom: 2rem;">
                    <!-- Category Breakdown Pie Chart -->
                    <div style="background-color: white; padding: 2rem; border-radius: 12px; border: 1px solid #e5e5e5;">
                        <h3 style="font-size: 1.5rem; font-weight: 700; margin-bottom: 0.5rem;">Stress by Category</h3>
                        <p style="color: #666; font-size: 0.95rem; margin-bottom: 1.5rem;">Distribution of stress across different life areas</p>
                        <div style="position: relative; height: 300px;">
                            <canvas id="categoryPieChart"></canvas>
                        </div>
                    </div>

                    <!-- Stress Level Distribution Doughnut Chart -->
                    <div style="background-color: white; padding: 2rem; border-radius: 12px; border: 1px solid #e5e5e5;">
                        <h3 style="font-size: 1.5rem; font-weight: 700; margin-bottom: 0.5rem;">Overall vs Target</h3>
                        <p style="color: #666; font-size: 0.95rem; margin-bottom: 1.5rem;">Your stress level compared to healthy range</p>
                        <div style="position: relative; height: 300px;">
                            <canvas id="overallDoughnutChart"></canvas>
                        </div>
                    </div>
                </div>

                <!-- Top 3 Categories Cards -->
                <div style="margin-bottom: 2rem;">
                    <h3 style="font-size: 1.5rem; font-weight: 700; margin-bottom: 1rem;">Top Stress Areas</h3>
                    <div class="results-categories">
                        ${topCategories.map(([category, data]) => `
                            <div class="category-result" style="background: white; padding: 1.5rem; border-radius: 12px; border: 1px solid #e5e5e5; transition: transform 0.3s ease, box-shadow 0.3s ease;">
                                <div class="category-name" style="font-size: 1.1rem; font-weight: 600; margin-bottom: 0.75rem;">${this.getCategoryName(category)}</div>
                                <div class="category-score" style="font-size: 2.5rem; font-weight: 800; margin-bottom: 0.5rem;">${Math.round(data.percentage)}%</div>
                                <div class="category-level" style="color: ${this.getStressLevelColor(data.level)}; font-weight: 600; margin-top: 0.5rem;">
                                    <span style="display: inline-block; padding: 0.375rem 0.75rem; background-color: ${this.getStressLevelColor(data.level)}15; border-radius: 6px;">
                                        ${data.level} Level
                                    </span>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <!-- Detailed Category Breakdown -->
                <div style="background-color: white; padding: 2rem; border-radius: 12px; border: 1px solid #e5e5e5; margin-bottom: 2rem;">
                    <h3 style="font-size: 1.5rem; font-weight: 700; margin-bottom: 1.5rem;">Detailed Category Analysis</h3>
                    <div style="display: grid; gap: 1rem;">
                        ${allCategories.map(([category, data]) => `
                            <div style="display: flex; align-items: center; gap: 1rem; padding: 1rem; background-color: #f9f9f9; border-radius: 8px;">
                                <div style="flex: 0 0 180px;">
                                    <div style="font-weight: 600; margin-bottom: 0.25rem;">${this.getCategoryName(category)}</div>
                                    <div style="font-size: 0.85rem; color: #666;">${data.level} Level</div>
                                </div>
                                <div style="flex: 1;">
                                    <div style="background-color: #e5e5e5; height: 24px; border-radius: 12px; overflow: hidden; position: relative;">
                                        <div style="background: linear-gradient(90deg, ${this.getStressLevelColor(data.level)}, ${this.getStressLevelColor(data.level)}dd); height: 100%; width: ${data.percentage}%; transition: width 1s ease; display: flex; align-items: center; justify-content: flex-end; padding-right: 0.5rem;">
                                            <span style="color: white; font-size: 0.75rem; font-weight: 700;">${Math.round(data.percentage)}%</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <!-- Recommendations -->
                <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); padding: 2rem; border-radius: 12px; border-left: 4px solid #0284c7; margin-bottom: 2rem;">
                    <h3 style="font-size: 1.5rem; font-weight: 700; margin-bottom: 1rem; color: #0c4a6e;">Personalized Recommendations</h3>
                    <ul style="list-style: none; display: flex; flex-direction: column; gap: 1rem;">
                        ${this.getRecommendations(results).map(rec => `
                            <li style="display: flex; gap: 1rem; align-items: flex-start; padding: 1rem; background-color: white; border-radius: 8px;">
                                <span style="font-size: 1.5rem; color: #0284c7; flex-shrink: 0;">✓</span>
                                <span style="line-height: 1.6;">${rec}</span>
                            </li>
                        `).join('')}
                    </ul>
                </div>

                <!-- Action Buttons -->
                <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
                    <button class="btn-primary" onclick="window.location.href='#solutions'" style="padding: 1rem 2rem; font-size: 1.05rem;">View Solutions</button>
                    <button class="btn-secondary" onclick="window.quizManager.retakeQuiz()" style="padding: 1rem 2rem; font-size: 1.05rem;">Retake Quiz</button>
                </div>
            </div>
        `;

        // Render charts after DOM is updated
        setTimeout(() => this.renderResultCharts(results), 100);
    }

    renderResultCharts(results) {
        // Category Pie Chart
        const categoryLabels = [];
        const categoryData = [];
        const categoryColors = [];

        Object.entries(results.categories)
            .sort((a, b) => b[1].percentage - a[1].percentage)
            .forEach(([category, data]) => {
                categoryLabels.push(this.getCategoryName(category));
                categoryData.push(Math.round(data.percentage));
                categoryColors.push(this.getStressLevelColor(data.level));
            });

        const categoryPieCtx = document.getElementById('categoryPieChart');
        if (categoryPieCtx) {
            new Chart(categoryPieCtx, {
                type: 'pie',
                data: {
                    labels: categoryLabels,
                    datasets: [{
                        data: categoryData,
                        backgroundColor: categoryColors,
                        borderColor: '#ffffff',
                        borderWidth: 3
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                padding: 15,
                                font: {
                                    size: 12,
                                    weight: '600'
                                }
                            }
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    return context.label + ': ' + context.parsed + '%';
                                }
                            }
                        }
                    }
                }
            });
        }

        // Overall Doughnut Chart
        const overallDoughnutCtx = document.getElementById('overallDoughnutChart');
        if (overallDoughnutCtx) {
            const targetHealthy = 30; // Target healthy stress level
            const yourStress = results.stressPercentage;
            const remaining = Math.max(0, 100 - yourStress);

            new Chart(overallDoughnutCtx, {
                type: 'doughnut',
                data: {
                    labels: ['Your Stress Level', 'Healthy Range'],
                    datasets: [{
                        data: [yourStress, remaining],
                        backgroundColor: [
                            this.getStressLevelColor(results.level),
                            '#E5E5E5'
                        ],
                        borderColor: '#ffffff',
                        borderWidth: 3
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    cutout: '70%',
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                padding: 15,
                                font: {
                                    size: 12,
                                    weight: '600'
                                }
                            }
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    return context.label + ': ' + context.parsed + '%';
                                }
                            }
                        }
                    }
                }
            });
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

    getRecommendations(results) {
        const recommendations = [];
        
        if (results.level === 'Severe' || results.level === 'High') {
            recommendations.push('Consider speaking with a school counselor or mental health professional');
            recommendations.push('Practice daily stress-reduction techniques like deep breathing or meditation');
        }
        
        if (results.categories.academic?.percentage > 60) {
            recommendations.push('Implement time management strategies and break large tasks into smaller steps');
        }
        
        if (results.categories.social?.percentage > 60) {
            recommendations.push('Set healthy boundaries with social media and focus on quality relationships');
        }
        
        if (results.categories.physical?.percentage > 60) {
            recommendations.push('Prioritize sleep hygiene and aim for 8-10 hours of sleep per night');
            recommendations.push('Incorporate regular physical activity into your routine');
        }
        
        if (results.categories.lifestyle?.percentage > 60) {
            recommendations.push('Schedule regular breaks and time for activities you enjoy');
        }

        recommendations.push('Review the stress management strategies in the Solutions section');
        
        return recommendations;
    }

    retakeQuiz() {
        this.currentQuestion = 0;
        this.answers = {};
        this.quizStartTime = null;
        this.loadQuiz();
    }
}

// Initialize quiz manager
const quizManager = new QuizManager();
window.quizManager = quizManager;

// Load quiz if user is already authenticated
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        if (window.authManager && window.authManager.isAuthenticated()) {
            quizManager.loadQuiz();
        }
    }, 500);
});
