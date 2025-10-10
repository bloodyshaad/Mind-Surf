// Goal Setting and Tracking System
class GoalSystem {
    constructor() {
        this.goals = [];
        this.init();
    }

    async init() {
        await this.loadGoals();
        this.setupDailyCheck();
    }

    async loadGoals() {
        if (!window.authManager?.isAuthenticated()) return;

        const userId = window.authManager.getCurrentUser()?.id;
        if (!userId) return;

        try {
            const { data, error } = await supabase
                .from('user_goals')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            if (error) throw error;

            this.goals = data || [];
            window.logSuccess('GOALS', `Loaded ${this.goals.length} goals`);
        } catch (error) {
            window.logError('GOALS', `Failed to load goals: ${error.message}`);
        }
    }

    async createGoal(goalData) {
        if (!window.authManager?.isAuthenticated()) {
            window.showError('Please login to create goals');
            return { success: false };
        }

        const userId = window.authManager.getCurrentUser()?.id;

        const goal = {
            user_id: userId,
            title: goalData.title,
            description: goalData.description,
            category: goalData.category,
            target_value: goalData.targetValue,
            current_value: 0,
            unit: goalData.unit || 'points',
            start_date: new Date().toISOString(),
            target_date: goalData.targetDate,
            status: 'active',
            milestones: goalData.milestones || [],
            created_at: new Date().toISOString()
        };

        try {
            const { data, error } = await supabase
                .from('user_goals')
                .insert(goal)
                .select()
                .single();

            if (error) throw error;

            this.goals.push(data);
            window.showSuccess('Goal created successfully!', 'Success');
            window.logSuccess('GOALS', `Created goal: ${goal.title}`);

            // Schedule reminder notification
            await this.scheduleGoalReminder(data.id);

            return { success: true, data };
        } catch (error) {
            window.showError('Failed to create goal. Please try again.');
            window.logError('GOALS', `Failed to create goal: ${error.message}`);
            return { success: false, error: error.message };
        }
    }

    async updateGoalProgress(goalId, progress) {
        try {
            const goal = this.goals.find(g => g.id === goalId);
            if (!goal) throw new Error('Goal not found');

            const newValue = Math.min(goal.current_value + progress, goal.target_value);
            const percentage = (newValue / goal.target_value) * 100;

            const { data, error } = await supabase
                .from('user_goals')
                .update({
                    current_value: newValue,
                    updated_at: new Date().toISOString()
                })
                .eq('id', goalId)
                .select()
                .single();

            if (error) throw error;

            // Update local copy
            const index = this.goals.findIndex(g => g.id === goalId);
            if (index !== -1) {
                this.goals[index] = data;
            }

            // Check for milestone achievements
            await this.checkMilestones(data);

            // Check if goal is completed
            if (newValue >= goal.target_value) {
                await this.completeGoal(goalId);
            }

            window.showSuccess(`Progress updated: ${percentage.toFixed(0)}% complete`, 'Goal Progress');
            window.logSuccess('GOALS', `Updated goal progress: ${goal.title}`);

            return { success: true, data };
        } catch (error) {
            window.showError('Failed to update progress');
            window.logError('GOALS', `Failed to update progress: ${error.message}`);
            return { success: false, error: error.message };
        }
    }

    async completeGoal(goalId) {
        try {
            const { data, error } = await supabase
                .from('user_goals')
                .update({
                    status: 'completed',
                    completed_at: new Date().toISOString()
                })
                .eq('id', goalId)
                .select()
                .single();

            if (error) throw error;

            // Update local copy
            const index = this.goals.findIndex(g => g.id === goalId);
            if (index !== -1) {
                this.goals[index] = data;
            }

            // Award achievement
            if (window.gamificationSystem) {
                await window.gamificationSystem.awardAchievement('goal_master', {
                    goalTitle: data.title
                });
            }

            window.showSuccess('🎉 Congratulations! Goal completed!', 'Achievement Unlocked', {
                duration: 7000,
                actions: [
                    {
                        label: 'View Goals',
                        primary: true,
                        onClick: () => window.location.href = '#goals'
                    }
                ]
            });

            window.logSuccess('GOALS', `Completed goal: ${data.title}`);

            return { success: true, data };
        } catch (error) {
            window.logError('GOALS', `Failed to complete goal: ${error.message}`);
            return { success: false, error: error.message };
        }
    }

    async checkMilestones(goal) {
        if (!goal.milestones || goal.milestones.length === 0) return;

        const percentage = (goal.current_value / goal.target_value) * 100;

        for (const milestone of goal.milestones) {
            if (percentage >= milestone.percentage && !milestone.achieved) {
                milestone.achieved = true;
                milestone.achieved_at = new Date().toISOString();

                // Update in database
                await supabase
                    .from('user_goals')
                    .update({ milestones: goal.milestones })
                    .eq('id', goal.id);

                window.showSuccess(
                    `Milestone reached: ${milestone.title}`,
                    '🎯 Milestone Achievement',
                    { duration: 6000 }
                );

                // Award points
                if (window.gamificationSystem) {
                    await window.gamificationSystem.awardPoints(milestone.points || 50, 'milestone');
                }
            }
        }
    }

    async deleteGoal(goalId) {
        try {
            const { error } = await supabase
                .from('user_goals')
                .delete()
                .eq('id', goalId);

            if (error) throw error;

            this.goals = this.goals.filter(g => g.id !== goalId);
            window.showSuccess('Goal deleted successfully');
            window.logSuccess('GOALS', 'Goal deleted');

            return { success: true };
        } catch (error) {
            window.showError('Failed to delete goal');
            window.logError('GOALS', `Failed to delete goal: ${error.message}`);
            return { success: false, error: error.message };
        }
    }

    async scheduleGoalReminder(goalId) {
        const goal = this.goals.find(g => g.id === goalId);
        if (!goal) return;

        // Schedule email reminder
        if (window.notificationSystem) {
            await window.notificationSystem.scheduleEmailNotification(
                goal.user_id,
                'goal_reminder',
                {
                    goalTitle: goal.title,
                    progress: (goal.current_value / goal.target_value) * 100,
                    daysRemaining: this.getDaysRemaining(goal.target_date)
                }
            );
        }
    }

    getDaysRemaining(targetDate) {
        const now = new Date();
        const target = new Date(targetDate);
        const diff = target - now;
        return Math.ceil(diff / (1000 * 60 * 60 * 24));
    }

    setupDailyCheck() {
        // Check daily for goal reminders
        setInterval(() => {
            this.checkDailyReminders();
        }, 24 * 60 * 60 * 1000); // Once per day

        // Initial check
        this.checkDailyReminders();
    }

    async checkDailyReminders() {
        const activeGoals = this.goals.filter(g => g.status === 'active');

        for (const goal of activeGoals) {
            const daysRemaining = this.getDaysRemaining(goal.target_date);
            const progress = (goal.current_value / goal.target_value) * 100;

            // Remind if goal is due soon and progress is low
            if (daysRemaining <= 7 && progress < 50) {
                window.showWarning(
                    `Your goal "${goal.title}" is due in ${daysRemaining} days. Keep going!`,
                    'Goal Reminder',
                    { duration: 8000 }
                );
            }
        }
    }

    getGoalsByCategory(category) {
        return this.goals.filter(g => g.category === category);
    }

    getActiveGoals() {
        return this.goals.filter(g => g.status === 'active');
    }

    getCompletedGoals() {
        return this.goals.filter(g => g.status === 'completed');
    }

    getGoalStats() {
        const active = this.getActiveGoals();
        const completed = this.getCompletedGoals();
        const totalProgress = active.reduce((sum, g) => {
            return sum + (g.current_value / g.target_value) * 100;
        }, 0);

        return {
            total: this.goals.length,
            active: active.length,
            completed: completed.length,
            averageProgress: active.length > 0 ? totalProgress / active.length : 0,
            completionRate: this.goals.length > 0 ? (completed.length / this.goals.length) * 100 : 0
        };
    }

    renderGoalCard(goal) {
        const progress = (goal.current_value / goal.target_value) * 100;
        const daysRemaining = this.getDaysRemaining(goal.target_date);

        return `
            <div class="goal-card" data-goal-id="${goal.id}">
                <div class="goal-header">
                    <h3 class="goal-title">${goal.title}</h3>
                    <span class="goal-status badge badge-${goal.status}">${goal.status}</span>
                </div>
                <p class="goal-description">${goal.description}</p>
                <div class="goal-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progress}%"></div>
                    </div>
                    <div class="progress-text">${progress.toFixed(0)}% Complete</div>
                </div>
                <div class="goal-stats">
                    <div class="goal-stat">
                        <span class="stat-label">Progress:</span>
                        <span class="stat-value">${goal.current_value} / ${goal.target_value} ${goal.unit}</span>
                    </div>
                    <div class="goal-stat">
                        <span class="stat-label">Due in:</span>
                        <span class="stat-value">${daysRemaining} days</span>
                    </div>
                </div>
                ${goal.status === 'active' ? `
                    <div class="goal-actions">
                        <button class="btn-secondary btn-sm" onclick="goalSystem.updateGoalProgress('${goal.id}', 1)">
                            Update Progress
                        </button>
                        <button class="btn-secondary btn-sm" onclick="goalSystem.deleteGoal('${goal.id}')">
                            Delete
                        </button>
                    </div>
                ` : ''}
            </div>
        `;
    }
}

// Initialize goal system
const goalSystem = new GoalSystem();
window.goalSystem = goalSystem;
