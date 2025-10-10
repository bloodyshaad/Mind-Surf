// Main Application Module
class App {
    constructor() {
        this.darkMode = false;
        this.isOnline = navigator.onLine;
        this.retryAttempts = 0;
        this.maxRetries = 3;
        this.init();
    }

    init() {
        try {
            this.initDarkMode();
            this.setupEventListeners();
            this.initScrollAnimations();
            this.initMobileMenu();
            this.initNavbarScroll();
            this.initStatCounters();
            this.checkBrowserCompatibility();
        } catch (error) {
            this.handleError(error, 'Failed to initialize application');
        }
    }

    checkBrowserCompatibility() {
        // Check for required features
        const requiredFeatures = [
            'localStorage',
            'fetch',
            'Promise',
            'IntersectionObserver'
        ];

        const missingFeatures = requiredFeatures.filter(feature => {
            if (feature === 'localStorage') return !window.localStorage;
            if (feature === 'fetch') return !window.fetch;
            if (feature === 'Promise') return !window.Promise;
            if (feature === 'IntersectionObserver') return !window.IntersectionObserver;
            return false;
        });

        if (missingFeatures.length > 0) {
            console.warn('Missing browser features:', missingFeatures);
            this.showBrowserWarning();
        }
    }

    showBrowserWarning() {
        const warning = document.createElement('div');
        warning.className = 'browser-warning';
        warning.innerHTML = `
            <div class="browser-warning-content">
                <strong>⚠️ Browser Compatibility Notice</strong>
                <p>Your browser may not support all features. Please update to the latest version for the best experience.</p>
                <button onclick="this.parentElement.parentElement.remove()">Dismiss</button>
            </div>
        `;
        document.body.insertBefore(warning, document.body.firstChild);
    }

    initScrollAnimations() {
        if (!window.IntersectionObserver) return;

        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        // Observe all scroll-animate elements
        document.querySelectorAll('.scroll-animate, .scroll-animate-left, .scroll-animate-right, .scroll-animate-scale').forEach(el => {
            observer.observe(el);
        });
    }

    initMobileMenu() {
        // Mobile menu is now handled by animations.js to avoid conflicts
        // This method is kept for compatibility but does nothing
    }

    initNavbarScroll() {
        const navbar = document.querySelector('.navbar');
        if (!navbar) return;

        let lastScroll = 0;
        const handleScroll = this.throttle(() => {
            const currentScroll = window.pageYOffset;

            if (currentScroll > 100) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }

            // Hide navbar on scroll down, show on scroll up
            if (currentScroll > lastScroll && currentScroll > 500) {
                navbar.style.transform = 'translateY(-100%)';
            } else {
                navbar.style.transform = 'translateY(0)';
            }

            lastScroll = currentScroll;
        }, 100);

        window.addEventListener('scroll', handleScroll);
    }

    initStatCounters() {
        const statNumbers = document.querySelectorAll('.stat-number');
        if (statNumbers.length === 0) return;

        const animateCounter = (element) => {
            const target = parseInt(element.getAttribute('data-target'));
            const duration = 2000;
            const increment = target / (duration / 16);
            let current = 0;

            const updateCounter = () => {
                current += increment;
                if (current < target) {
                    element.textContent = Math.floor(current);
                    requestAnimationFrame(updateCounter);
                } else {
                    element.textContent = target;
                }
            };

            updateCounter();
        };

        // Animate when visible
        if (window.IntersectionObserver) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        animateCounter(entry.target);
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.5 });

            statNumbers.forEach(stat => observer.observe(stat));
        } else {
            statNumbers.forEach(animateCounter);
        }
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
        
        // Log to error tracking service (if available)
        this.logError(error);

        // Show user-friendly message
        if (window.toastManager) {
            window.toastManager.show(userMessage, 'error');
        } else {
            alert(userMessage);
        }

        // Retry logic for network errors
        if (this.isNetworkError(error) && this.retryAttempts < this.maxRetries) {
            this.retryAttempts++;
            console.log(`Retry attempt ${this.retryAttempts}/${this.maxRetries}`);
            return true; // Indicate retry is possible
        }

        this.retryAttempts = 0;
        return false;
    }

    handleSuccess(message) {
        if (window.toastManager) {
            window.toastManager.show(message, 'success');
        }
    }

    isNetworkError(error) {
        return error.message.includes('network') || 
               error.message.includes('fetch') ||
               error.message.includes('timeout') ||
               !this.isOnline;
    }

    logError(error) {
        // Send to error tracking service (e.g., Sentry)
        const errorLog = {
            message: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href
        };

        // Store locally for debugging
        try {
            const errors = this.getFromLocalStorage('error_logs') || [];
            errors.push(errorLog);
            // Keep only last 10 errors
            if (errors.length > 10) errors.shift();
            this.saveToLocalStorage('error_logs', errors);
        } catch (e) {
            console.error('Failed to log error:', e);
        }
    }

    async retryOperation(operation, maxRetries = 3, delay = 1000) {
        for (let i = 0; i < maxRetries; i++) {
            try {
                return await operation();
            } catch (error) {
                if (i === maxRetries - 1) throw error;
                await this.sleep(delay * Math.pow(2, i)); // Exponential backoff
            }
        }
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    validatePassword(password) {
        return password.length >= 6;
    }

    sanitizeInput(input) {
        const div = document.createElement('div');
        div.textContent = input;
        return div.innerHTML;
    }

    showLoadingState(element, isLoading = true) {
        if (!element) return;

        if (isLoading) {
            element.disabled = true;
            element.classList.add('loading');
            element.setAttribute('data-original-text', element.textContent);
            element.innerHTML = '<span class="loader"></span>';
        } else {
            element.disabled = false;
            element.classList.remove('loading');
            const originalText = element.getAttribute('data-original-text');
            if (originalText) {
                element.textContent = originalText;
                element.removeAttribute('data-original-text');
            }
        }
    }

    copyToClipboard(text) {
        if (navigator.clipboard) {
            return navigator.clipboard.writeText(text)
                .then(() => this.handleSuccess('Copied to clipboard'))
                .catch(err => this.handleError(err, 'Failed to copy'));
        } else {
            // Fallback for older browsers
            const textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.select();
            try {
                document.execCommand('copy');
                this.handleSuccess('Copied to clipboard');
            } catch (err) {
                this.handleError(err, 'Failed to copy');
            }
            document.body.removeChild(textarea);
        }
    }

    detectDevice() {
        const ua = navigator.userAgent;
        return {
            isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua),
            isTablet: /iPad|Android/i.test(ua) && !/Mobile/i.test(ua),
            isDesktop: !/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua),
            isIOS: /iPhone|iPad|iPod/i.test(ua),
            isAndroid: /Android/i.test(ua)
        };
    }

    getPerformanceMetrics() {
        if (!window.performance) return null;

        const navigation = performance.getEntriesByType('navigation')[0];
        return {
            loadTime: navigation ? navigation.loadEventEnd - navigation.fetchStart : 0,
            domContentLoaded: navigation ? navigation.domContentLoadedEventEnd - navigation.fetchStart : 0,
            firstPaint: performance.getEntriesByType('paint').find(entry => entry.name === 'first-paint')?.startTime || 0
        };
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
