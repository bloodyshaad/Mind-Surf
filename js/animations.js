// Animations and Interactions Module
class AnimationManager {
    constructor() {
        this.init();
    }

    init() {
        this.setupScrollAnimations();
        this.setupCounterAnimations();
        this.setupNavbarScroll();
        this.setupSmoothScroll();
        this.setupParallax();
        this.setupHoverEffects();
    }

    setupScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    
                    // Trigger counter animation if element has counter
                    if (entry.target.classList.contains('stat-number')) {
                        this.animateCounter(entry.target);
                    }
                }
            });
        }, observerOptions);

        // Observe elements
        const animateElements = document.querySelectorAll(`
            .effect-card,
            .solution-card,
            .cycle-step,
            .hero-stats,
            .section-header
        `);

        animateElements.forEach(el => {
            el.classList.add('scroll-animate');
            observer.observe(el);
        });
    }

    setupCounterAnimations() {
        const counters = document.querySelectorAll('.stat-number');
        const counterObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
                    this.animateCounter(entry.target);
                    entry.target.classList.add('counted');
                }
            });
        }, { threshold: 0.5 });

        counters.forEach(counter => counterObserver.observe(counter));
    }

    animateCounter(element) {
        const target = parseInt(element.dataset.target);
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
    }

    setupNavbarScroll() {
        const navbar = document.querySelector('.navbar');
        let lastScroll = 0;
        let ticking = false;

        const updateNavbar = (currentScroll) => {
            if (currentScroll > 100) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }

            // Hide/show navbar on scroll
            if (currentScroll > lastScroll && currentScroll > 500) {
                navbar.style.transform = 'translateY(-100%)';
            } else {
                navbar.style.transform = 'translateY(0)';
            }

            lastScroll = currentScroll;
            ticking = false;
        };

        window.addEventListener('scroll', () => {
            const currentScroll = window.pageYOffset;
            
            if (!ticking) {
                requestAnimationFrame(() => updateNavbar(currentScroll));
                ticking = true;
            }
        }, { passive: true });
    }

    setupSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                const href = anchor.getAttribute('href');
                if (href === '#' || !href) return;

                e.preventDefault();
                const target = document.querySelector(href);
                
                if (target) {
                    requestAnimationFrame(() => {
                        const offsetTop = target.offsetTop - 80;
                        window.scrollTo({
                            top: offsetTop,
                            behavior: 'smooth'
                        });
                    });

                    // Update active nav link
                    document.querySelectorAll('.nav-link').forEach(link => {
                        link.classList.remove('active');
                    });
                    anchor.classList.add('active');

                    // Close mobile menu if open
                    const mobileMenu = document.getElementById('mobileMenu');
                    if (mobileMenu && mobileMenu.classList.contains('active')) {
                        mobileMenu.classList.remove('active');
                    }
                }
            });
        });

        // Cache section positions
        let sectionPositions = [];
        let ticking = false;

        const cacheSectionPositions = () => {
            const sections = document.querySelectorAll('section[id]');
            sectionPositions = Array.from(sections).map(section => ({
                id: section.getAttribute('id'),
                top: section.offsetTop,
                height: section.offsetHeight
            }));
        };

        // Cache positions on load and resize
        cacheSectionPositions();
        window.addEventListener('resize', () => {
            clearTimeout(this.resizeTimeout);
            this.resizeTimeout = setTimeout(cacheSectionPositions, 200);
        });

        // Update active nav on scroll with throttling
        const updateActiveNav = () => {
            const scrollPosition = window.pageYOffset + 150;

            for (const section of sectionPositions) {
                if (scrollPosition >= section.top && scrollPosition < section.top + section.height) {
                    document.querySelectorAll('.nav-link').forEach(link => {
                        link.classList.remove('active');
                        if (link.getAttribute('href') === `#${section.id}`) {
                            link.classList.add('active');
                        }
                    });
                    break;
                }
            }
            ticking = false;
        };

        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(updateActiveNav);
                ticking = true;
            }
        }, { passive: true });
    }

    setupParallax() {
        const shapes = document.querySelectorAll('.floating-shape');
        let ticking = false;
        
        const updateParallax = (scrolled) => {
            shapes.forEach((shape, index) => {
                const speed = 0.5 + (index * 0.1);
                const yPos = -(scrolled * speed);
                shape.style.transform = `translateY(${yPos}px)`;
            });
            ticking = false;
        };

        window.addEventListener('scroll', () => {
            if (!ticking) {
                const scrolled = window.pageYOffset;
                requestAnimationFrame(() => updateParallax(scrolled));
                ticking = true;
            }
        }, { passive: true });
    }

    setupHoverEffects() {
        // Card hover effects
        const cards = document.querySelectorAll('.effect-card, .solution-card, .cycle-step');
        
        cards.forEach(card => {
            card.addEventListener('mouseenter', function() {
                this.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
            });
        });

        // Button ripple effect
        const buttons = document.querySelectorAll('.btn-primary, .btn-secondary, .quiz-option');
        
        buttons.forEach(button => {
            button.addEventListener('click', function(e) {
                const ripple = document.createElement('span');
                const rect = this.getBoundingClientRect();
                const size = Math.max(rect.width, rect.height);
                const x = e.clientX - rect.left - size / 2;
                const y = e.clientY - rect.top - size / 2;

                ripple.style.width = ripple.style.height = size + 'px';
                ripple.style.left = x + 'px';
                ripple.style.top = y + 'px';
                ripple.classList.add('ripple-effect');

                this.style.position = 'relative';
                this.style.overflow = 'hidden';
                this.appendChild(ripple);

                setTimeout(() => ripple.remove(), 600);
            });
        });

        // Add ripple styles
        const style = document.createElement('style');
        style.textContent = `
            .ripple-effect {
                position: absolute;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.6);
                transform: scale(0);
                animation: ripple 0.6s ease-out;
                pointer-events: none;
            }
            @keyframes ripple {
                to {
                    transform: scale(4);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }

    // Mobile menu toggle
    setupMobileMenu() {
        const mobileMenuBtn = document.getElementById('mobileMenuBtn');
        const mobileMenu = document.getElementById('mobileMenu');

        if (mobileMenuBtn && mobileMenu) {
            mobileMenuBtn.addEventListener('click', () => {
                mobileMenu.classList.toggle('active');
                mobileMenuBtn.classList.toggle('active');
            });
        }
    }

    // Animate element on scroll into view
    animateOnScroll(element, animationClass) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add(animationClass);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        observer.observe(element);
    }

    // Stagger animation for multiple elements
    staggerAnimation(elements, delay = 100) {
        elements.forEach((element, index) => {
            setTimeout(() => {
                element.classList.add('animate-fade-in-up');
            }, index * delay);
        });
    }

    // Loading animation
    showLoading(container) {
        container.innerHTML = `
            <div style="display: flex; justify-content: center; align-items: center; padding: 3rem;">
                <div class="loading-spinner"></div>
            </div>
        `;
    }

    // Success animation
    showSuccess(message, duration = 3000) {
        const notification = document.createElement('div');
        notification.className = 'notification success';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 2rem;
            background: var(--color-black);
            color: var(--color-white);
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: var(--shadow-xl);
            z-index: 3000;
            animation: slideInFromRight 0.3s ease;
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, duration);
    }

    // Error animation
    showError(message, duration = 3000) {
        const notification = document.createElement('div');
        notification.className = 'notification error';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 2rem;
            background: #C41E3A;
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: var(--shadow-xl);
            z-index: 3000;
            animation: slideInFromRight 0.3s ease;
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, duration);
    }

    // Pulse animation for attention
    pulseElement(element, duration = 1000) {
        element.style.animation = `pulse ${duration}ms ease-in-out`;
        setTimeout(() => {
            element.style.animation = '';
        }, duration);
    }

    // Shake animation for errors
    shakeElement(element) {
        element.style.animation = 'shake 0.5s ease-in-out';
        setTimeout(() => {
            element.style.animation = '';
        }, 500);
    }
}

// Initialize animation manager
const animationManager = new AnimationManager();
window.animationManager = animationManager;

// Setup mobile menu after DOM loads
document.addEventListener('DOMContentLoaded', () => {
    animationManager.setupMobileMenu();

    // Add entrance animations to hero content
    const heroTitle = document.querySelector('.hero-title');
    const heroDescription = document.querySelector('.hero-description');
    const heroCta = document.querySelector('.hero-cta');

    if (heroTitle) {
        setTimeout(() => heroTitle.classList.add('animate-fade-in-up'), 100);
    }
    if (heroDescription) {
        setTimeout(() => heroDescription.classList.add('animate-fade-in-up'), 300);
    }
    if (heroCta) {
        setTimeout(() => heroCta.classList.add('animate-fade-in-up'), 500);
    }
});


// Prevent animations on page resize
let resizeTimer;
window.addEventListener('resize', () => {
    document.body.classList.add('resize-animation-stopper');
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        document.body.classList.remove('resize-animation-stopper');
    }, 400);
});

// Add resize animation stopper styles
const resizeStyle = document.createElement('style');
resizeStyle.textContent = `
    .resize-animation-stopper * {
        animation: none !important;
        transition: none !important;
    }
`;
document.head.appendChild(resizeStyle);
