// Gamification System - Achievements, Badges, Points, Streaks
class GamificationSystem {
    constructor() {
        this.userProgress = {
            points: 0,
            level: 1,
            streak: 0,
            lastCheckIn: null,
            achievements: [],
            badges: []
        };
        this.achievements = this.defineAchievements();
        this.init();
    }

    async init() {
        await this.loadUserProgress();
        this.checkDailyStreak();
    }

    defineAchievements() {
        return {
            // Quiz Achievements
            first_quiz: {
                id: 'first_quiz',
                title: 'First Step',
                description: 'Complete your first stress assessment',
                icon: '🎯',
                points: 50,
                category: 'quiz'
            },
            quiz_master: {
                id: 'quiz_master',
                title: 'Quiz Master',
                description: 'Complete 10 stress assessments',
                icon: '📊',
                points: 200,
                category: 'quiz',
                requirement: 10
            },
            stress_warrior: {
                id: 'stress_warrior',
                title: 'Stress Warrior',
                description: 'Complete 50 stress assessments',
                icon: '⚔️',
                points: 500,
                category: 'quiz',
                requirement: 50
            },

            // Streak Achievements
            week_streak: {
                id: 'week_streak',
                title: 'Week Warrior',
                description: 'Maintain a 7-day check-in streak',
                icon: '🔥',
                points: 150,
                category: 'streak',
                requirement: 7
            },
            month_streak: {
                id: 'month_streak',
                title: 'Monthly Champion',
                description: 'Maintain a 30-day check-in streak',
                icon: '🏆',
                points: 500,
                category: 'streak',
                requirement: 30
            },

            // Improvement Achievements
            stress_reducer: {
                id: 'stress_reducer',
                title: 'Stress Reducer',
                description: 'Reduce your stress level by 20%',
                icon: '📉',
                points: 300,
                category: 'improvement'
            },
            zen_master: {
                id: 'zen_master',
                title: 'Zen Master',
                description: 'Achieve "Low" stress level',
                icon: '🧘',
                points: 400,
                category: 'improvement'
            },

            // Goal Achievements
            goal_setter: {
                id: 'goal_setter',
                title: 'Goal Setter',
                description: 'Create your first goal',
                icon: '🎯',
                points: 100,
                category: 'goals'
            },
            goal_master: {
                id: 'goal_master',
                title: 'Goal Master',
                description: 'Complete a goal',
                icon: '✅',
                points: 250,
                category: 'goals'
            },

            // Social Achievements
            helpful_peer: {
                id: 'helpful_peer',
                title: 'Helpful Peer',
                description: 'Share a resource with others',
                icon: '🤝',
                points: 150,
                category: 'social'
            },

            // Exploration Achievements
            explorer: {
                id: 'explorer',
                title: 'Explorer',
                description: 'Visit all sections of MindSurf',
                icon: '🗺️',
                points: 100,
                category: 'exploration'
            },
            resource_reader: {
                id: 'resource_reader',
                title: 'Resource Reader',
                description: 'Read 10 stress management resources',
                icon: '📚',
                points: 200,
                category: 'exploration',
                requirement: 10
            }
        };
    }

    async loadUserProgress() {
        if (!window.authManager?.isAuthenticated()) return;

        const userId = window.authManager.getCurrentUser()?.id;
        if (!userId) return;

        try {
            const { data, error } = await supabase
                .from('user_gamification')
                .select('*')
                .eq('user_id', userId)
                .maybeSingle();

            if (error && error.code !== 'PGRST116') throw error;

            if (data) {
                this.userProgress = data;
            } else {
                // Create initial progress
                await this.createUserProgress(userId);
            }

            window.logSuccess('GAMIFICATION', 'User progress loaded');
        } catch (error) {
            window.logError('GAMIFICATION', `Failed to load progress: ${error.message}`);
        }
    }

    async createUserProgress(userId) {
        try {
            const { data, error } = await supabase
                .from('user_gamification')
                .insert({
                    user_id: userId,
                    points: 0,
                    level: 1,
                    streak: 0,
                    achievements: [],
                    badges: [],
                    stats: {}
                })
                .select()
                .single();

            if (error) throw error;

            this.userProgress = data;
        } catch (error) {
            window.logError('GAMIFICATION', `Failed to create progress: ${error.message}`);
        }
    }

    async awardPoints(points, reason = 'activity') {
        if (!window.authManager?.isAuthenticated()) return;

        const userId = window.authManager.getCurrentUser()?.id;
        if (!userId) {
            console.warn('GAMIFICATION: Cannot award points - user ID not available');
            return { success: false };
        }

        // Ensure user progress is loaded
        if (!this.userProgress.user_id) {
            await this.loadUserProgress();
        }

        const newPoints = this.userProgress.points + points;
        const newLevel = this.calculateLevel(newPoints);
        const leveledUp = newLevel > this.userProgress.level;

        try {
            const { data, error } = await supabase
                .from('user_gamification')
                .update({
                    points: newPoints,
                    level: newLevel,
                    updated_at: new Date().toISOString()
                })
                .eq('user_id', userId)
                .select()
                .single();

            if (error) throw error;

            this.userProgress = data;

            // Show notification
            if (window.showSuccess) {
                window.showSuccess(
                    `+${points} points earned!`,
                    leveledUp ? `🎉 Level Up! You're now level ${newLevel}` : 'Points Earned',
                    { duration: 4000 }
                );
            }

            if (leveledUp) {
                this.celebrateLevelUp(newLevel);
            }

            if (window.logSuccess) {
                window.logSuccess('GAMIFICATION', `Awarded ${points} points for ${reason}`);
            }

            return { success: true, leveledUp };
        } catch (error) {
            if (window.logError) {
                window.logError('GAMIFICATION', `Failed to award points: ${error.message}`);
            }
            return { success: false };
        }
    }

    calculateLevel(points) {
        // Level formula: level = floor(sqrt(points / 100)) + 1
        return Math.floor(Math.sqrt(points / 100)) + 1;
    }

    getPointsForNextLevel() {
        const nextLevel = this.userProgress.level + 1;
        const pointsNeeded = Math.pow(nextLevel - 1, 2) * 100;
        return pointsNeeded - this.userProgress.points;
    }

    async awardAchievement(achievementId, context = {}) {
        if (!window.authManager?.isAuthenticated()) return;

        const achievement = this.achievements[achievementId];
        if (!achievement) {
            window.logWarning('GAMIFICATION', `Achievement not found: ${achievementId}`);
            return { success: false };
        }

        // Check if already earned
        if (this.userProgress.achievements.includes(achievementId)) {
            return { success: false, reason: 'Already earned' };
        }

        try {
            const updatedAchievements = [...this.userProgress.achievements, achievementId];

            const { data, error } = await supabase
                .from('user_gamification')
                .update({
                    achievements: updatedAchievements,
                    updated_at: new Date().toISOString()
                })
                .eq('user_id', this.userProgress.user_id)
                .select()
                .single();

            if (error) throw error;

            this.userProgress = data;

            // Award points
            await this.awardPoints(achievement.points, `achievement: ${achievement.title}`);

            // Show achievement notification
            window.showSuccess(
                `${achievement.icon} ${achievement.description}`,
                `Achievement Unlocked: ${achievement.title}`,
                {
                    duration: 7000,
                    actions: [
                        {
                            label: 'View Achievements',
                            primary: true,
                            onClick: () => this.showAchievementsModal()
                        }
                    ]
                }
            );

            window.logSuccess('GAMIFICATION', `Achievement unlocked: ${achievement.title}`);

            return { success: true, achievement };
        } catch (error) {
            window.logError('GAMIFICATION', `Failed to award achievement: ${error.message}`);
            return { success: false };
        }
    }

    async updateStreak() {
        if (!window.authManager?.isAuthenticated()) return;

        const now = new Date();
        const lastCheckIn = this.userProgress.last_check_in ? new Date(this.userProgress.last_check_in) : null;

        let newStreak = this.userProgress.streak || 0;

        if (!lastCheckIn) {
            // First check-in
            newStreak = 1;
        } else {
            const daysSinceLastCheckIn = Math.floor((now - lastCheckIn) / (1000 * 60 * 60 * 24));

            if (daysSinceLastCheckIn === 1) {
                // Consecutive day
                newStreak++;
            } else if (daysSinceLastCheckIn > 1) {
                // Streak broken
                newStreak = 1;
                window.showWarning('Your streak was reset. Start a new one today!', 'Streak Reset');
            } else {
                // Same day, no change
                return { success: true, streak: newStreak };
            }
        }

        try {
            const { data, error } = await supabase
                .from('user_gamification')
                .update({
                    streak: newStreak,
                    last_check_in: now.toISOString(),
                    updated_at: now.toISOString()
                })
                .eq('user_id', this.userProgress.user_id)
                .select()
                .single();

            if (error) throw error;

            this.userProgress = data;

            // Check for streak achievements
            if (newStreak === 7) {
                await this.awardAchievement('week_streak');
            } else if (newStreak === 30) {
                await this.awardAchievement('month_streak');
            }

            // Award streak bonus points
            if (newStreak > 1) {
                const bonusPoints = Math.min(newStreak * 5, 50); // Max 50 points
                await this.awardPoints(bonusPoints, 'streak bonus');
            }

            window.showSuccess(
                `${newStreak} day streak! 🔥`,
                'Daily Check-in',
                { duration: 4000 }
            );

            window.logSuccess('GAMIFICATION', `Streak updated: ${newStreak} days`);

            return { success: true, streak: newStreak };
        } catch (error) {
            window.logError('GAMIFICATION', `Failed to update streak: ${error.message}`);
            return { success: false };
        }
    }

    checkDailyStreak() {
        // Check streak on app load
        if (window.authManager?.isAuthenticated()) {
            const lastCheckIn = this.userProgress.last_check_in ? new Date(this.userProgress.last_check_in) : null;
            const now = new Date();

            if (!lastCheckIn || this.isDifferentDay(lastCheckIn, now)) {
                // Prompt for daily check-in
                setTimeout(() => {
                    window.showInfo(
                        'Complete your daily stress check-in to maintain your streak!',
                        'Daily Check-in Available',
                        {
                            duration: 8000,
                            actions: [
                                {
                                    label: 'Check In Now',
                                    primary: true,
                                    onClick: () => window.location.href = '#quiz'
                                }
                            ]
                        }
                    );
                }, 5000);
            }
        }
    }

    isDifferentDay(date1, date2) {
        return date1.toDateString() !== date2.toDateString();
    }

    celebrateLevelUp(level) {
        // Create confetti effect or special animation
        const rewards = {
            5: { badge: 'bronze_star', title: 'Bronze Star' },
            10: { badge: 'silver_star', title: 'Silver Star' },
            20: { badge: 'gold_star', title: 'Gold Star' },
            50: { badge: 'platinum_star', title: 'Platinum Star' }
        };

        if (rewards[level]) {
            window.showSuccess(
                `You've earned the ${rewards[level].title} badge!`,
                `🌟 Level ${level} Milestone`,
                { duration: 8000 }
            );
        }
    }

    showAchievementsModal() {
        const earned = this.userProgress.achievements;
        const total = Object.keys(this.achievements).length;

        const modalContent = `
            <div class="achievements-modal">
                <h2>Your Achievements</h2>
                <p class="achievements-progress">${earned.length} / ${total} Unlocked</p>
                <div class="achievements-grid">
                    ${Object.values(this.achievements).map(achievement => {
                        const isEarned = earned.includes(achievement.id);
                        return `
                            <div class="achievement-card ${isEarned ? 'earned' : 'locked'}">
                                <div class="achievement-icon">${achievement.icon}</div>
                                <div class="achievement-title">${achievement.title}</div>
                                <div class="achievement-description">${achievement.description}</div>
                                <div class="achievement-points">${achievement.points} points</div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;

        // You would implement a modal system to show this
        console.log('Show achievements modal:', modalContent);
    }

    getLeaderboardPosition() {
        // This would query the database for user rankings
        // Placeholder for now
        return {
            position: 0,
            totalUsers: 0,
            percentile: 0
        };
    }

    getUserStats() {
        return {
            points: this.userProgress.points,
            level: this.userProgress.level,
            streak: this.userProgress.streak,
            achievements: this.userProgress.achievements.length,
            totalAchievements: Object.keys(this.achievements).length,
            pointsToNextLevel: this.getPointsForNextLevel()
        };
    }
}

// Initialize gamification system
const gamificationSystem = new GamificationSystem();
window.gamificationSystem = gamificationSystem;
