// Comprehensive Error Handling and Logging System
class ErrorHandler {
    constructor() {
        this.logs = [];
        this.maxLogs = 100;
        this.errorQueue = [];
        this.isOnline = navigator.onLine;
        this.setupGlobalHandlers();
        this.setupNetworkMonitoring();
    }

    setupGlobalHandlers() {
        // Catch unhandled errors
        window.addEventListener('error', (event) => {
            this.logError({
                type: 'UNHANDLED_ERROR',
                message: event.message,
                filename: event.filename,
                line: event.lineno,
                column: event.colno,
                stack: event.error?.stack
            });
        });

        // Catch unhandled promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            this.logError({
                type: 'UNHANDLED_REJECTION',
                message: event.reason?.message || event.reason,
                stack: event.reason?.stack
            });
        });
    }

    setupNetworkMonitoring() {
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.log('NETWORK', 'Connection restored', 'info');
            this.flushErrorQueue();
        });

        window.addEventListener('offline', () => {
            this.isOnline = false;
            this.log('NETWORK', 'Connection lost', 'warning');
        });
    }

    log(category, message, level = 'info', data = null) {
        const logEntry = {
            timestamp: new Date().toISOString(),
            category,
            message,
            level,
            data,
            userAgent: navigator.userAgent,
            url: window.location.href
        };

        this.logs.push(logEntry);

        // Keep only last maxLogs entries
        if (this.logs.length > this.maxLogs) {
            this.logs.shift();
        }

        // Store in localStorage for persistence
        try {
            localStorage.setItem('app_logs', JSON.stringify(this.logs.slice(-50)));
        } catch (e) {
            console.warn('Failed to store logs:', e);
        }

        // Console output with styling
        const styles = {
            info: 'color: #3B82F6',
            warning: 'color: #F59E0B',
            error: 'color: #EF4444',
            success: 'color: #10B981'
        };

        console.log(
            `%c[${category}] ${message}`,
            styles[level] || styles.info,
            data || ''
        );

        // Send critical errors to server (if implemented)
        if (level === 'error' && this.isOnline) {
            this.sendErrorToServer(logEntry);
        } else if (level === 'error') {
            this.errorQueue.push(logEntry);
        }
    }

    logError(error) {
        this.log('ERROR', error.message || 'Unknown error', 'error', {
            type: error.type,
            stack: error.stack,
            filename: error.filename,
            line: error.line,
            column: error.column
        });

        // Show user-friendly error message
        if (window.showError) {
            window.showError(this.getUserFriendlyMessage(error));
        }
    }

    getUserFriendlyMessage(error) {
        const errorMessages = {
            'NETWORK_ERROR': 'Unable to connect. Please check your internet connection.',
            'AUTH_ERROR': 'Authentication failed. Please try logging in again.',
            'DATABASE_ERROR': 'Unable to save data. Please try again.',
            'VALIDATION_ERROR': 'Please check your input and try again.',
            'PERMISSION_ERROR': 'You don\'t have permission to perform this action.',
            'NOT_FOUND': 'The requested resource was not found.',
            'TIMEOUT': 'Request timed out. Please try again.',
            'RATE_LIMIT': 'Too many requests. Please wait a moment and try again.'
        };

        return errorMessages[error.type] || 'Something went wrong. Please try again.';
    }

    async sendErrorToServer(logEntry) {
        // Placeholder for server error logging
        // In production, send to your error tracking service (Sentry, LogRocket, etc.)
        try {
            // await fetch('/api/logs', {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify(logEntry)
            // });
            console.log('Error logged:', logEntry);
        } catch (e) {
            this.errorQueue.push(logEntry);
        }
    }

    flushErrorQueue() {
        if (this.errorQueue.length > 0 && this.isOnline) {
            this.errorQueue.forEach(error => this.sendErrorToServer(error));
            this.errorQueue = [];
        }
    }

    getLogs(category = null, level = null) {
        let filtered = this.logs;

        if (category) {
            filtered = filtered.filter(log => log.category === category);
        }

        if (level) {
            filtered = filtered.filter(log => log.level === level);
        }

        return filtered;
    }

    clearLogs() {
        this.logs = [];
        localStorage.removeItem('app_logs');
        this.log('SYSTEM', 'Logs cleared', 'info');
    }

    exportLogs() {
        const dataStr = JSON.stringify(this.logs, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `mindsurf-logs-${new Date().toISOString()}.json`;
        link.click();
        URL.revokeObjectURL(url);
    }

    // Wrapper methods for common operations
    async handleAsync(operation, errorType = 'OPERATION_ERROR') {
        try {
            const result = await operation();
            return { success: true, data: result };
        } catch (error) {
            this.log(errorType, error.message, 'error', error);
            return { success: false, error: error.message };
        }
    }

    wrapFunction(fn, context = null) {
        return async (...args) => {
            try {
                return await fn.apply(context, args);
            } catch (error) {
                this.logError({
                    type: 'FUNCTION_ERROR',
                    message: error.message,
                    stack: error.stack,
                    function: fn.name
                });
                throw error;
            }
        };
    }
}

// Database operation wrapper with retry logic
class DatabaseHandler {
    constructor(errorHandler) {
        this.errorHandler = errorHandler;
        this.maxRetries = 3;
        this.retryDelay = 1000;
    }

    async executeWithRetry(operation, operationName) {
        let lastError;
        
        for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
            try {
                this.errorHandler.log('DATABASE', `${operationName} - Attempt ${attempt}`, 'info');
                const result = await operation();
                
                if (attempt > 1) {
                    this.errorHandler.log('DATABASE', `${operationName} succeeded after ${attempt} attempts`, 'success');
                }
                
                return { success: true, data: result };
            } catch (error) {
                lastError = error;
                this.errorHandler.log('DATABASE', `${operationName} failed - Attempt ${attempt}`, 'warning', error);
                
                if (attempt < this.maxRetries) {
                    await this.delay(this.retryDelay * attempt);
                }
            }
        }

        this.errorHandler.log('DATABASE', `${operationName} failed after ${this.maxRetries} attempts`, 'error', lastError);
        return { success: false, error: lastError.message };
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Network request handler with timeout and retry
class NetworkHandler {
    constructor(errorHandler) {
        this.errorHandler = errorHandler;
        this.timeout = 30000; // 30 seconds
    }

    async fetchWithTimeout(url, options = {}) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        try {
            this.errorHandler.log('NETWORK', `Fetching: ${url}`, 'info');
            
            const response = await fetch(url, {
                ...options,
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            this.errorHandler.log('NETWORK', `Success: ${url}`, 'success');
            return { success: true, data: await response.json() };
        } catch (error) {
            clearTimeout(timeoutId);
            
            if (error.name === 'AbortError') {
                this.errorHandler.log('NETWORK', `Timeout: ${url}`, 'error');
                return { success: false, error: 'Request timed out' };
            }

            this.errorHandler.log('NETWORK', `Failed: ${url}`, 'error', error);
            return { success: false, error: error.message };
        }
    }
}

// Initialize global error handler
const errorHandler = new ErrorHandler();
const dbHandler = new DatabaseHandler(errorHandler);
const networkHandler = new NetworkHandler(errorHandler);

// Export for use in other modules
window.errorHandler = errorHandler;
window.dbHandler = dbHandler;
window.networkHandler = networkHandler;

// Add helper methods to window for easy access
window.logInfo = (category, message, data) => errorHandler.log(category, message, 'info', data);
window.logWarning = (category, message, data) => errorHandler.log(category, message, 'warning', data);
window.logError = (category, message, data) => errorHandler.log(category, message, 'error', data);
window.logSuccess = (category, message, data) => errorHandler.log(category, message, 'success', data);
