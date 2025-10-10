// Comprehensive Notification System
class NotificationSystem {
    constructor() {
        this.notifications = [];
        this.preferences = this.loadPreferences();
        this.init();
    }

    init() {
        this.createNotificationContainer();
        this.loadStoredNotifications();
        this.setupServiceWorker();
    }

    createNotificationContainer() {
        if (document.getElementById('notificationContainer')) return;

        const container = document.createElement('div');
        container.id = 'notificationContainer';
        container.className = 'notification-container';
        document.body.appendChild(container);

        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            .notification-container {
                position: fixed;
                top: 80px;
                right: 20px;
                z-index: 9999;
                display: flex;
                flex-direction: column;
                gap: 10px;
                max-width: 400px;
                pointer-events: none;
            }

            .notification {
                background: var(--color-white);
                border-radius: 12px;
                padding: 16px;
                box-shadow: var(--shadow-xl);
                display: flex;
                align-items: flex-start;
                gap: 12px;
                animation: slideInRight 0.3s ease;
                pointer-events: all;
                border-left: 4px solid;
                max-width: 100%;
            }

            [data-theme="dark"] .notification {
                background: var(--bg-primary);
                border-color: var(--border-color);
            }

            .notification.success {
                border-left-color: #10B981;
            }

            .notification.error {
                border-left-color: #EF4444;
            }

            .notification.warning {
                border-left-color: #F59E0B;
            }

            .notification.info {
                border-left-color: #3B82F6;
            }

            .notification-icon {
                flex-shrink: 0;
                width: 24px;
                height: 24px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 20px;
            }

            .notification-content {
                flex: 1;
                min-width: 0;
            }

            .notification-title {
                font-weight: 600;
                margin-bottom: 4px;
                color: var(--text-primary);
            }

            .notification-message {
                font-size: 0.9rem;
                color: var(--text-secondary);
                word-wrap: break-word;
            }

            .notification-close {
                flex-shrink: 0;
                background: none;
                border: none;
                cursor: pointer;
                padding: 4px;
                color: var(--text-tertiary);
                font-size: 20px;
                line-height: 1;
                transition: var(--transition-smooth);
            }

            .notification-close:hover {
                color: var(--text-primary);
            }

            .notification-actions {
                margin-top: 12px;
                display: flex;
                gap: 8px;
            }

            .notification-action {
                padding: 6px 12px;
                border-radius: 6px;
                border: none;
                font-size: 0.85rem;
                font-weight: 600;
                cursor: pointer;
                transition: var(--transition-smooth);
            }

            .notification-action.primary {
                background: var(--color-black);
                color: var(--color-white);
            }

            .notification-action.secondary {
                background: var(--color-gray-200);
                color: var(--color-black);
            }

            .notification-action:hover {
                opacity: 0.8;
            }

            @keyframes slideInRight {
                from {
                    transform: translateX(400px);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }

            @keyframes slideOutRight {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(400px);
                    opacity: 0;
                }
            }

            .notification.removing {
                animation: slideOutRight 0.3s ease;
            }

            @media (max-width: 768px) {
                .notification-container {
                    left: 20px;
                    right: 20px;
                    max-width: none;
                }
            }
        `;
        document.head.appendChild(style);
    }

    show(options) {
        const {
            type = 'info',
            title,
            message,
            duration = 5000,
            actions = [],
            persistent = false
        } = options;

        const notification = {
            id: Date.now() + Math.random(),
            type,
            title,
            message,
            timestamp: new Date(),
            read: false
        };

        this.notifications.push(notification);
        this.saveNotifications();

        const container = document.getElementById('notificationContainer');
        const notificationEl = this.createNotificationElement(notification, actions);
        container.appendChild(notificationEl);

        // Auto-remove after duration (unless persistent)
        if (!persistent && duration > 0) {
            setTimeout(() => {
                this.remove(notificationEl);
            }, duration);
        }

        // Log notification
        if (window.errorHandler) {
            window.errorHandler.log('NOTIFICATION', `${type}: ${title}`, type === 'error' ? 'error' : 'info');
        }

        return notification.id;
    }

    createNotificationElement(notification, actions) {
        const el = document.createElement('div');
        el.className = `notification ${notification.type}`;
        el.dataset.id = notification.id;

        const icons = {
            success: '✓',
            error: '✕',
            warning: '⚠',
            info: 'ℹ'
        };

        el.innerHTML = `
            <div class="notification-icon">${icons[notification.type]}</div>
            <div class="notification-content">
                ${notification.title ? `<div class="notification-title">${notification.title}</div>` : ''}
                <div class="notification-message">${notification.message}</div>
                ${actions.length > 0 ? `
                    <div class="notification-actions">
                        ${actions.map((action, index) => `
                            <button class="notification-action ${action.primary ? 'primary' : 'secondary'}" data-action="${index}">
                                ${action.label}
                            </button>
                        `).join('')}
                    </div>
                ` : ''}
            </div>
            <button class="notification-close" aria-label="Close notification">×</button>
        `;

        // Close button
        el.querySelector('.notification-close').addEventListener('click', () => {
            this.remove(el);
        });

        // Action buttons
        actions.forEach((action, index) => {
            const btn = el.querySelector(`[data-action="${index}"]`);
            if (btn) {
                btn.addEventListener('click', () => {
                    action.onClick();
                    this.remove(el);
                });
            }
        });

        return el;
    }

    remove(element) {
        element.classList.add('removing');
        setTimeout(() => {
            element.remove();
        }, 300);
    }

    // Notification type shortcuts
    success(message, title = 'Success', options = {}) {
        return this.show({ type: 'success', title, message, ...options });
    }

    error(message, title = 'Error', options = {}) {
        return this.show({ type: 'error', title, message, duration: 7000, ...options });
    }

    warning(message, title = 'Warning', options = {}) {
        return this.show({ type: 'warning', title, message, ...options });
    }

    info(message, title = 'Info', options = {}) {
        return this.show({ type: 'info', title, message, ...options });
    }

    // Email notification scheduling
    async scheduleEmailNotification(userId, type, data) {
        if (!this.preferences.emailEnabled) {
            return { success: false, reason: 'Email notifications disabled' };
        }

        const emailTypes = {
            'daily_checkin': {
                subject: 'Daily Stress Check-in Reminder',
                template: 'daily-checkin'
            },
            'goal_reminder': {
                subject: 'Goal Progress Update',
                template: 'goal-reminder'
            },
            'achievement': {
                subject: 'New Achievement Unlocked! 🎉',
                template: 'achievement'
            },
            'stress_alert': {
                subject: 'Stress Level Alert',
                template: 'stress-alert'
            },
            'weekly_summary': {
                subject: 'Your Weekly Stress Summary',
                template: 'weekly-summary'
            }
        };

        const emailConfig = emailTypes[type];
        if (!emailConfig) {
            return { success: false, reason: 'Invalid email type' };
        }

        // Store in database for processing by backend
        try {
            const { error } = await supabase
                .from('email_queue')
                .insert({
                    user_id: userId,
                    type: type,
                    subject: emailConfig.subject,
                    template: emailConfig.template,
                    data: data,
                    scheduled_for: new Date(),
                    status: 'pending'
                });

            if (error) throw error;

            window.logSuccess('EMAIL', `Email notification scheduled: ${type}`);
            return { success: true };
        } catch (error) {
            window.logError('EMAIL', `Failed to schedule email: ${error.message}`);
            return { success: false, error: error.message };
        }
    }

    // Push notification support
    async setupServiceWorker() {
        if ('serviceWorker' in navigator && 'PushManager' in window) {
            try {
                // Register service worker (if you create one)
                // const registration = await navigator.serviceWorker.register('/sw.js');
                // console.log('Service Worker registered:', registration);
            } catch (error) {
                console.log('Service Worker registration failed:', error);
            }
        }
    }

    async requestPushPermission() {
        if (!('Notification' in window)) {
            return { success: false, reason: 'Notifications not supported' };
        }

        if (Notification.permission === 'granted') {
            return { success: true, permission: 'granted' };
        }

        if (Notification.permission !== 'denied') {
            const permission = await Notification.requestPermission();
            this.preferences.pushEnabled = permission === 'granted';
            this.savePreferences();
            return { success: permission === 'granted', permission };
        }

        return { success: false, permission: 'denied' };
    }

    // Notification preferences
    loadPreferences() {
        try {
            const saved = localStorage.getItem('notification_preferences');
            return saved ? JSON.parse(saved) : {
                emailEnabled: true,
                pushEnabled: false,
                dailyCheckin: true,
                goalReminders: true,
                achievements: true,
                stressAlerts: true,
                weeklySummary: true
            };
        } catch (error) {
            return {
                emailEnabled: true,
                pushEnabled: false,
                dailyCheckin: true,
                goalReminders: true,
                achievements: true,
                stressAlerts: true,
                weeklySummary: true
            };
        }
    }

    savePreferences() {
        try {
            localStorage.setItem('notification_preferences', JSON.stringify(this.preferences));
        } catch (error) {
            console.error('Failed to save notification preferences:', error);
        }
    }

    updatePreferences(updates) {
        this.preferences = { ...this.preferences, ...updates };
        this.savePreferences();
    }

    // Store notifications for history
    saveNotifications() {
        try {
            const recent = this.notifications.slice(-50);
            localStorage.setItem('notifications_history', JSON.stringify(recent));
        } catch (error) {
            console.error('Failed to save notifications:', error);
        }
    }

    loadStoredNotifications() {
        try {
            const stored = localStorage.getItem('notifications_history');
            if (stored) {
                this.notifications = JSON.parse(stored);
            }
        } catch (error) {
            console.error('Failed to load notifications:', error);
        }
    }

    getUnreadCount() {
        return this.notifications.filter(n => !n.read).length;
    }

    markAsRead(notificationId) {
        const notification = this.notifications.find(n => n.id === notificationId);
        if (notification) {
            notification.read = true;
            this.saveNotifications();
        }
    }

    markAllAsRead() {
        this.notifications.forEach(n => n.read = true);
        this.saveNotifications();
    }

    clearAll() {
        this.notifications = [];
        this.saveNotifications();
        const container = document.getElementById('notificationContainer');
        if (container) {
            container.innerHTML = '';
        }
    }
}

// Initialize notification system
const notificationSystem = new NotificationSystem();
window.notificationSystem = notificationSystem;

// Add global helper functions
window.showSuccess = (message, title, options) => notificationSystem.success(message, title, options);
window.showError = (message, title, options) => notificationSystem.error(message, title, options);
window.showWarning = (message, title, options) => notificationSystem.warning(message, title, options);
window.showInfo = (message, title, options) => notificationSystem.info(message, title, options);
