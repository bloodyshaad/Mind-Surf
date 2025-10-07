// Main Application Module
class App {
    constructor() {
        this.darkMode = false;
        this.init();
    }

    init() {
        this.initDarkMode();
        this.setupEventListeners();
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

    setupEventListeners() {
        // Dark mode toggle
        const darkModeToggle = document.getElementById('darkModeToggle');
        if (darkModeToggle) {
            darkModeToggle.addEventListener('click', () => {
                this.toggleDarkMode();
            });
        }

        // Get started button
        const getStartedBtn = document.getElementById('getStartedBtn');
        if (getStartedBtn) {
            getStartedBtn.addEventListener('click', () => {
                if (window.authManager && window.authManager.isAuthenticated()) {
                    document.getElementById('quiz').scrollIntoView({ behavior: 'smooth' });
                } else {
                    window.location.href = 'login.html';
                }
            });
        }

        // Learn more button
        const learnMoreBtn = document.getElementById('learnMoreBtn');
        if (learnMoreBtn) {
            learnMoreBtn.addEventListener('click', () => {
                document.getElementById('understanding').scrollIntoView({ behavior: 'smooth' });
            });
        }

        // Handle hash navigation for history section
        window.addEventListener('hashchange', () => {
            this.handleHashNavigation();
        });

        // Initial hash check
        this.handleHashNavigation();

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const userMenu = document.querySelector('.user-menu');
                if (userMenu) {
                    userMenu.remove();
                }
            }
            
            // Toggle dark mode with Ctrl/Cmd + D
            if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
                e.preventDefault();
                this.toggleDarkMode();
            }
        });

        // Listen for system theme changes
        if (window.matchMedia) {
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
                const savedTheme = this.getFromLocalStorage('theme');
                if (!savedTheme) {
                    if (e.matches) {
                        this.enableDarkMode();
                    } else {
                        this.disableDarkMode();
                    }
                }
            });
        }
    }

    formatDate(date) {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}m ${remainingSeconds}s`;
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
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

    removeFromLocalStorage(key) {
        try {
            localStorage.removeItem(key);
        } catch (error) {
            console.error('Error removing from localStorage:', error);
        }
    }

    handleError(error, userMessage = 'An error occurred. Please try again.') {
        console.error('Application error:', error);
        if (window.animationManager) {
            window.animationManager.showError(userMessage);
        }
    }

    handleSuccess(message) {
        if (window.animationManager) {
            window.animationManager.showSuccess(message);
        }
    }

    handleHashNavigation() {
        const hash = window.location.hash;
        
        // Show/hide history section based on hash
        const historySection = document.getElementById('history');
        if (historySection) {
            if (hash === '#history') {
                historySection.style.display = 'block';
                // Load history if authenticated
                if (window.authManager && window.authManager.isAuthenticated() && window.historyManager) {
                    window.historyManager.loadHistory();
                }
            } else {
                historySection.style.display = 'none';
            }
        }
    }

    updateHistoryLinkVisibility(isAuthenticated) {
        const historyNavLink = document.getElementById('historyNavLink');
        const historyNavLinkMobile = document.getElementById('historyNavLinkMobile');
        
        if (historyNavLink) {
            historyNavLink.style.display = isAuthenticated ? 'inline-block' : 'none';
        }
        if (historyNavLinkMobile) {
            historyNavLinkMobile.style.display = isAuthenticated ? 'block' : 'none';
        }
    }
}

// Initialize app
const app = new App();
window.app = app;

// Online/Offline detection
window.addEventListener('online', () => {
    if (window.animationManager) {
        window.animationManager.showSuccess('Connection restored');
    }
});

window.addEventListener('offline', () => {
    if (window.animationManager) {
        window.animationManager.showError('No internet connection');
    }
});
