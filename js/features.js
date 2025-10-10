// Advanced Features Module
class AdvancedFeatures {
    constructor() {
        this.isDesktop = window.innerWidth >= 1024;
        this.isMobile = window.innerWidth < 768;
        this.isTablet = window.innerWidth >= 768 && window.innerWidth < 1024;
        this.touchDevice = 'ontouchstart' in window;
        this.init();
    }

    init() {
        this.initParallax();
        this.initCursorEffects();
        this.initTiltEffects();
        this.initSwipeGestures();
        this.initPullToRefresh();
        this.initHapticFeedback();
        this.initVoiceCommands();
        this.initShortcuts();
        this.initProgressiveImage();
        this.initLazyLoad();
        this.initShareAPI();
        this.initNotifications();
        this.initFullscreen();
        this.initScreenWake();
        this.initContextMenu();
        this.initDoubleClick();
        this.initLongPress();
        this.initPinchZoom();
        this.initShakeDetection();
        this.initOrientationChange();
        this.initBatteryStatus();
        this.initNetworkInfo();
        this.initClipboardAPI();
        this.initSpeechSynthesis();
    }

    // Parallax Scrolling Effect
    initParallax() {
        if (!this.isDesktop) return;

        const parallaxElements = document.querySelectorAll('.floating-shape');
        
        window.addEventListener('mousemove', (e) => {
            const mouseX = e.clientX / window.innerWidth;
            const mouseY = e.clientY / window.innerHeight;

            parallaxElements.forEach((el, index) => {
                const speed = (index + 1) * 0.05;
                const x = (mouseX - 0.5) * 100 * speed;
                const y = (mouseY - 0.5) * 100 * speed;
                
                el.style.transform = `translate(${x}px, ${y}px)`;
            });
        });
    }

    // Custom Cursor Effects - Removed for better readability
    initCursorEffects() {
        // Custom cursor removed - using default cursor for better UX
    }

    // 3D Tilt Effect - Removed for better readability
    initTiltEffects() {
        // Tilt effects removed - cards should be stable for reading
    }

    // Swipe Gestures (Mobile)
    initSwipeGestures() {
        if (!this.touchDevice) return;

        let touchStartX = 0;
        let touchStartY = 0;
        let touchEndX = 0;
        let touchEndY = 0;

        document.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
            touchStartY = e.changedTouches[0].screenY;
        });

        document.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            touchEndY = e.changedTouches[0].screenY;
            this.handleSwipe(touchStartX, touchStartY, touchEndX, touchEndY);
        });
    }

    handleSwipe(startX, startY, endX, endY) {
        const diffX = endX - startX;
        const diffY = endY - startY;
        const threshold = 50;

        if (Math.abs(diffX) > Math.abs(diffY)) {
            if (Math.abs(diffX) > threshold) {
                if (diffX > 0) {
                    this.onSwipeRight();
                } else {
                    this.onSwipeLeft();
                }
            }
        } else {
            if (Math.abs(diffY) > threshold) {
                if (diffY > 0) {
                    this.onSwipeDown();
                } else {
                    this.onSwipeUp();
                }
            }
        }
    }

    onSwipeRight() {
        console.log('Swiped right');
        // Navigate back or show previous content
    }

    onSwipeLeft() {
        console.log('Swiped left');
        // Navigate forward or show next content
    }

    onSwipeUp() {
        console.log('Swiped up');
        // Scroll to next section
    }

    onSwipeDown() {
        console.log('Swiped down');
        // Scroll to previous section
    }

    // Pull to Refresh (Mobile)
    initPullToRefresh() {
        if (!this.isMobile) return;

        let startY = 0;
        let currentY = 0;
        let pulling = false;

        const refreshIndicator = document.createElement('div');
        refreshIndicator.className = 'pull-to-refresh-indicator';
        refreshIndicator.innerHTML = '<div class="refresh-spinner"></div><span>Pull to refresh</span>';
        document.body.insertBefore(refreshIndicator, document.body.firstChild);

        document.addEventListener('touchstart', (e) => {
            if (window.scrollY === 0) {
                startY = e.touches[0].pageY;
                pulling = true;
            }
        });

        document.addEventListener('touchmove', (e) => {
            if (!pulling) return;
            
            currentY = e.touches[0].pageY;
            const diff = currentY - startY;

            if (diff > 0 && diff < 150) {
                refreshIndicator.style.transform = `translateY(${diff}px)`;
                refreshIndicator.style.opacity = diff / 150;
            }
        });

        document.addEventListener('touchend', () => {
            if (!pulling) return;
            
            const diff = currentY - startY;
            if (diff > 100) {
                refreshIndicator.classList.add('refreshing');
                setTimeout(() => {
                    window.location.reload();
                }, 1000);
            } else {
                refreshIndicator.style.transform = 'translateY(-100%)';
                refreshIndicator.style.opacity = '0';
            }
            pulling = false;
        });
    }

    // Haptic Feedback (Mobile) - DISABLED to prevent continuous vibration issues
    initHapticFeedback() {
        // Haptic feedback disabled due to continuous vibration issues
        // Can be re-enabled with user preference setting in the future
        return;
    }

    // Voice Commands (Experimental)
    initVoiceCommands() {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) return;

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        
        recognition.continuous = false;
        recognition.lang = 'en-US';

        const voiceBtn = document.createElement('button');
        voiceBtn.className = 'voice-command-btn';
        voiceBtn.innerHTML = '🎤';
        voiceBtn.title = 'Voice Commands';
        document.body.appendChild(voiceBtn);

        voiceBtn.addEventListener('click', () => {
            recognition.start();
            voiceBtn.classList.add('listening');
        });

        recognition.onresult = (event) => {
            const command = event.results[0][0].transcript.toLowerCase();
            this.handleVoiceCommand(command);
            voiceBtn.classList.remove('listening');
        };

        recognition.onerror = () => {
            voiceBtn.classList.remove('listening');
        };
    }

    handleVoiceCommand(command) {
        if (command.includes('home')) {
            window.location.hash = '#home';
        } else if (command.includes('quiz')) {
            window.location.hash = '#quiz';
        } else if (command.includes('dark mode')) {
            window.app.toggleDarkMode();
        } else if (command.includes('scroll down')) {
            window.scrollBy({ top: window.innerHeight, behavior: 'smooth' });
        }
    }

    // Keyboard Shortcuts
    initShortcuts() {
        const shortcuts = {
            'h': () => window.location.hash = '#home',
            'q': () => window.location.hash = '#quiz',
            's': () => window.location.hash = '#solutions',
            '/': () => this.focusSearch(),
            '?': () => this.showShortcutsHelp()
        };

        document.addEventListener('keydown', (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
            
            const key = e.key.toLowerCase();
            if (shortcuts[key]) {
                e.preventDefault();
                shortcuts[key]();
            }
        });
    }

    showShortcutsHelp() {
        const modal = document.createElement('div');
        modal.className = 'shortcuts-modal';
        modal.innerHTML = `
            <div class="shortcuts-content">
                <h3>Keyboard Shortcuts</h3>
                <ul>
                    <li><kbd>H</kbd> - Go to Home</li>
                    <li><kbd>Q</kbd> - Go to Quiz</li>
                    <li><kbd>S</kbd> - Go to Solutions</li>
                    <li><kbd>Ctrl/Cmd + D</kbd> - Toggle Dark Mode</li>
                    <li><kbd>Esc</kbd> - Close Menus</li>
                    <li><kbd>?</kbd> - Show this help</li>
                </ul>
                <button onclick="this.parentElement.parentElement.remove()">Close</button>
            </div>
        `;
        document.body.appendChild(modal);
    }

    // Progressive Image Loading
    initProgressiveImage() {
        const images = document.querySelectorAll('img[data-src]');
        
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.add('loaded');
                    imageObserver.unobserve(img);
                }
            });
        });

        images.forEach(img => imageObserver.observe(img));
    }

    // Lazy Load Content
    initLazyLoad() {
        const lazyElements = document.querySelectorAll('[data-lazy]');
        
        const lazyObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('loaded');
                    lazyObserver.unobserve(entry.target);
                }
            });
        });

        lazyElements.forEach(el => lazyObserver.observe(el));
    }

    // Web Share API - Removed (not needed)
    initShareAPI() {
        // Share functionality removed
    }

    // Push Notifications
    initNotifications() {
        if (!('Notification' in window)) return;

        if (Notification.permission === 'default') {
            // Don't auto-request, wait for user action
        }
    }

    requestNotificationPermission() {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                this.showNotification('Notifications enabled!', 'You\'ll receive stress management tips.');
            }
        });
    }

    showNotification(title, body) {
        if (Notification.permission === 'granted') {
            new Notification(title, {
                body,
                icon: '/assets/icon-192x192.svg',
                badge: '/assets/icon-72x72.svg'
            });
        }
    }

    // Fullscreen API - Removed (not needed)
    initFullscreen() {
        // Fullscreen functionality removed
    }

    // Screen Wake Lock
    initScreenWake() {
        if (!('wakeLock' in navigator)) return;

        let wakeLock = null;

        const requestWakeLock = async () => {
            try {
                wakeLock = await navigator.wakeLock.request('screen');
            } catch (err) {
                console.log('Wake Lock error:', err);
            }
        };

        // Request wake lock when taking quiz
        document.addEventListener('quiz-started', requestWakeLock);
    }

    // Custom Context Menu
    initContextMenu() {
        const contextMenu = document.createElement('div');
        contextMenu.className = 'custom-context-menu';
        contextMenu.innerHTML = `
            <div class="context-menu-item" data-action="copy">Copy</div>
            <div class="context-menu-item" data-action="share">Share</div>
            <div class="context-menu-item" data-action="print">Print</div>
        `;
        document.body.appendChild(contextMenu);

        document.addEventListener('contextmenu', (e) => {
            if (e.target.closest('.effect-card, .solution-card')) {
                e.preventDefault();
                contextMenu.style.display = 'block';
                contextMenu.style.left = e.pageX + 'px';
                contextMenu.style.top = e.pageY + 'px';
            }
        });

        document.addEventListener('click', () => {
            contextMenu.style.display = 'none';
        });

        contextMenu.addEventListener('click', (e) => {
            const action = e.target.dataset.action;
            if (action) this.handleContextAction(action);
        });
    }

    handleContextAction(action) {
        switch(action) {
            case 'copy':
                // Copy content
                break;
            case 'share':
                // Share content
                break;
            case 'print':
                window.print();
                break;
        }
    }

    // Double Click Actions
    initDoubleClick() {
        const cards = document.querySelectorAll('.effect-card, .solution-card');
        
        cards.forEach(card => {
            card.addEventListener('dblclick', () => {
                card.classList.toggle('expanded');
            });
        });
    }

    // Long Press (Mobile) - DISABLED to prevent vibration issues
    initLongPress() {
        // Long press vibration disabled to prevent continuous vibration issues
        // Visual feedback only
        if (!this.touchDevice) return;

        let pressTimer;
        const buttons = document.querySelectorAll('button, .btn-primary, .btn-secondary');

        buttons.forEach(btn => {
            btn.addEventListener('touchstart', (e) => {
                pressTimer = setTimeout(() => {
                    this.handleLongPress(btn);
                    // Vibration removed to prevent issues
                }, 500);
            }, { passive: true });

            btn.addEventListener('touchend', () => {
                clearTimeout(pressTimer);
            }, { passive: true });

            btn.addEventListener('touchmove', () => {
                clearTimeout(pressTimer);
            }, { passive: true });
        });
    }

    handleLongPress(element) {
        element.classList.add('long-pressed');
        setTimeout(() => element.classList.remove('long-pressed'), 300);
    }

    // Pinch to Zoom (Mobile)
    initPinchZoom() {
        if (!this.touchDevice) return;

        let initialDistance = 0;
        let currentScale = 1;

        document.addEventListener('touchstart', (e) => {
            if (e.touches.length === 2) {
                initialDistance = this.getDistance(e.touches[0], e.touches[1]);
            }
        });

        document.addEventListener('touchmove', (e) => {
            if (e.touches.length === 2) {
                const currentDistance = this.getDistance(e.touches[0], e.touches[1]);
                const scale = currentDistance / initialDistance;
                currentScale = Math.min(Math.max(scale, 0.5), 3);
            }
        });
    }

    getDistance(touch1, touch2) {
        const dx = touch1.clientX - touch2.clientX;
        const dy = touch1.clientY - touch2.clientY;
        return Math.sqrt(dx * dx + dy * dy);
    }

    // Shake Detection (Mobile)
    initShakeDetection() {
        if (!this.isMobile || !window.DeviceMotionEvent) return;

        let lastX, lastY, lastZ;
        let lastUpdate = 0;
        const shakeThreshold = 15;

        window.addEventListener('devicemotion', (e) => {
            const current = Date.now();
            if ((current - lastUpdate) > 100) {
                const diffTime = current - lastUpdate;
                lastUpdate = current;

                const acceleration = e.accelerationIncludingGravity;
                const x = acceleration.x;
                const y = acceleration.y;
                const z = acceleration.z;

                if (lastX !== undefined) {
                    const deltaX = Math.abs(x - lastX);
                    const deltaY = Math.abs(y - lastY);
                    const deltaZ = Math.abs(z - lastZ);

                    if ((deltaX + deltaY + deltaZ) / diffTime * 10000 > shakeThreshold) {
                        this.onShake();
                    }
                }

                lastX = x;
                lastY = y;
                lastZ = z;
            }
        });
    }

    onShake() {
        console.log('Device shaken!');
        // Trigger refresh or special action
        if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
    }

    // Orientation Change
    initOrientationChange() {
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                this.handleOrientationChange();
            }, 200);
        });
    }

    handleOrientationChange() {
        const orientation = window.orientation;
        if (orientation === 90 || orientation === -90) {
            // Landscape
            document.body.classList.add('landscape');
            document.body.classList.remove('portrait');
        } else {
            // Portrait
            document.body.classList.add('portrait');
            document.body.classList.remove('landscape');
        }
    }

    // Battery Status
    initBatteryStatus() {
        if (!('getBattery' in navigator)) return;

        navigator.getBattery().then(battery => {
            this.updateBatteryStatus(battery);

            battery.addEventListener('levelchange', () => {
                this.updateBatteryStatus(battery);
            });
        });
    }

    updateBatteryStatus(battery) {
        if (battery.level < 0.2 && !battery.charging) {
            // Low battery - reduce animations
            document.body.classList.add('low-power-mode');
        } else {
            document.body.classList.remove('low-power-mode');
        }
    }

    // Network Information
    initNetworkInfo() {
        if (!('connection' in navigator)) return;

        const connection = navigator.connection;
        this.updateNetworkStatus(connection);

        connection.addEventListener('change', () => {
            this.updateNetworkStatus(connection);
        });
    }

    updateNetworkStatus(connection) {
        if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
            // Slow connection - reduce quality
            document.body.classList.add('slow-connection');
        } else {
            document.body.classList.remove('slow-connection');
        }
    }

    // Clipboard API
    initClipboardAPI() {
        document.addEventListener('copy', (e) => {
            const selection = window.getSelection().toString();
            if (selection) {
                e.clipboardData.setData('text/plain', selection + '\n\nFrom: MindSurf - https://mind-surf.netlify.app');
                e.preventDefault();
            }
        });
    }

    // Speech Synthesis - Removed (not needed)
    initSpeechSynthesis() {
        // Speech synthesis functionality removed
    }

    focusSearch() {
        const searchInput = document.querySelector('input[type="search"]');
        if (searchInput) searchInput.focus();
    }
}

// Initialize Advanced Features
const advancedFeatures = new AdvancedFeatures();
window.advancedFeatures = advancedFeatures;
