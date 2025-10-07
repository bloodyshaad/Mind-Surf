// Feedback Widget System
class FeedbackWidget {
    constructor() {
        this.isOpen = false;
        this.init();
    }

    init() {
        this.createWidget();
        this.setupEventListeners();
    }

    createWidget() {
        // Create feedback button
        const button = document.createElement('button');
        button.id = 'feedback-button';
        button.className = 'feedback-button';
        button.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span>Feedback</span>
        `;
        document.body.appendChild(button);

        // Create feedback modal
        const modal = document.createElement('div');
        modal.id = 'feedback-modal';
        modal.className = 'feedback-modal';
        modal.innerHTML = `
            <div class="feedback-modal-overlay"></div>
            <div class="feedback-modal-content">
                <div class="feedback-modal-header">
                    <h3>Send Feedback</h3>
                    <button class="feedback-modal-close" aria-label="Close">&times;</button>
                </div>
                <div class="feedback-modal-body">
                    <p class="feedback-description">Help us improve MindSurf! Share your thoughts, report bugs, or suggest new features.</p>
                    
                    <div class="feedback-type-selector">
                        <button class="feedback-type-btn active" data-type="general">
                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="currentColor" stroke-width="2"/>
                            </svg>
                            <span>General</span>
                        </button>
                        <button class="feedback-type-btn" data-type="bug">
                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M8 2V5M16 2V5M3.5 9.09H21.5M21 8.5V17C21 20 19.5 22 16 22H8C4.5 22 3 20 3 17V8.5C3 5.5 4.5 3.5 8 3.5H16C19.5 3.5 21 5.5 21 8.5Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                <circle cx="12" cy="15" r="1" fill="currentColor"/>
                            </svg>
                            <span>Bug Report</span>
                        </button>
                        <button class="feedback-type-btn" data-type="feature">
                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                            <span>Feature Request</span>
                        </button>
                    </div>

                    <form id="feedback-form" class="feedback-form">
                        <input type="hidden" id="feedback-type" value="general">
                        
                        <div class="feedback-form-group">
                            <label for="feedback-email">Email (optional)</label>
                            <input type="email" id="feedback-email" placeholder="your@email.com" class="feedback-input">
                        </div>

                        <div class="feedback-form-group">
                            <label for="feedback-message">Your Feedback *</label>
                            <textarea id="feedback-message" rows="5" placeholder="Tell us what you think..." class="feedback-textarea" required></textarea>
                        </div>

                        <div class="feedback-rating">
                            <label>How would you rate your experience?</label>
                            <div class="feedback-stars">
                                <button type="button" class="feedback-star" data-rating="1">★</button>
                                <button type="button" class="feedback-star" data-rating="2">★</button>
                                <button type="button" class="feedback-star" data-rating="3">★</button>
                                <button type="button" class="feedback-star" data-rating="4">★</button>
                                <button type="button" class="feedback-star" data-rating="5">★</button>
                            </div>
                            <input type="hidden" id="feedback-rating" value="0">
                        </div>

                        <div class="feedback-form-actions">
                            <button type="button" class="btn-secondary" id="feedback-cancel">Cancel</button>
                            <button type="submit" class="btn-primary" id="feedback-submit">
                                <span class="feedback-submit-text">Send Feedback</span>
                                <span class="feedback-submit-loader" style="display: none;">
                                    <div class="loader"></div>
                                </span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    setupEventListeners() {
        const button = document.getElementById('feedback-button');
        const modal = document.getElementById('feedback-modal');
        const overlay = modal.querySelector('.feedback-modal-overlay');
        const closeBtn = modal.querySelector('.feedback-modal-close');
        const cancelBtn = document.getElementById('feedback-cancel');
        const form = document.getElementById('feedback-form');
        const typeButtons = modal.querySelectorAll('.feedback-type-btn');
        const stars = modal.querySelectorAll('.feedback-star');

        // Open modal
        button.addEventListener('click', () => this.open());

        // Close modal
        overlay.addEventListener('click', () => this.close());
        closeBtn.addEventListener('click', () => this.close());
        cancelBtn.addEventListener('click', () => this.close());

        // Type selection
        typeButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                typeButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                document.getElementById('feedback-type').value = btn.dataset.type;
            });
        });

        // Star rating
        stars.forEach(star => {
            star.addEventListener('click', () => {
                const rating = parseInt(star.dataset.rating);
                document.getElementById('feedback-rating').value = rating;
                
                stars.forEach((s, index) => {
                    if (index < rating) {
                        s.classList.add('active');
                    } else {
                        s.classList.remove('active');
                    }
                });
            });

            star.addEventListener('mouseenter', () => {
                const rating = parseInt(star.dataset.rating);
                stars.forEach((s, index) => {
                    if (index < rating) {
                        s.classList.add('hover');
                    } else {
                        s.classList.remove('hover');
                    }
                });
            });
        });

        modal.querySelector('.feedback-stars').addEventListener('mouseleave', () => {
            stars.forEach(s => s.classList.remove('hover'));
        });

        // Form submission
        form.addEventListener('submit', (e) => this.handleSubmit(e));

        // Keyboard shortcut (Ctrl/Cmd + K)
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                this.open();
            }
            if (e.key === 'Escape' && this.isOpen) {
                this.close();
            }
        });
    }

    open() {
        const modal = document.getElementById('feedback-modal');
        modal.classList.add('active');
        this.isOpen = true;
        
        // Focus on textarea
        setTimeout(() => {
            document.getElementById('feedback-message').focus();
        }, 300);
    }

    close() {
        const modal = document.getElementById('feedback-modal');
        modal.classList.remove('active');
        this.isOpen = false;
        
        // Reset form
        document.getElementById('feedback-form').reset();
        document.querySelectorAll('.feedback-star').forEach(s => s.classList.remove('active'));
        document.getElementById('feedback-rating').value = '0';
    }

    async handleSubmit(e) {
        e.preventDefault();

        const submitBtn = document.getElementById('feedback-submit');
        const submitText = submitBtn.querySelector('.feedback-submit-text');
        const submitLoader = submitBtn.querySelector('.feedback-submit-loader');

        // Get form data
        const type = document.getElementById('feedback-type').value;
        const email = document.getElementById('feedback-email').value;
        const message = document.getElementById('feedback-message').value;
        const rating = document.getElementById('feedback-rating').value;

        // Show loading
        submitBtn.disabled = true;
        submitText.style.display = 'none';
        submitLoader.style.display = 'inline-flex';

        try {
            // Get user info if authenticated
            const user = window.authManager?.getCurrentUser();
            
            // Save feedback to database
            const { error } = await supabase
                .from('feedback')
                .insert([
                    {
                        type,
                        email: email || user?.email || null,
                        message,
                        rating: parseInt(rating) || null,
                        user_id: user?.id || null,
                        page_url: window.location.href,
                        user_agent: navigator.userAgent
                    }
                ]);

            if (error) throw error;

            // Show success message
            if (window.showSuccess) {
                window.showSuccess('Thank you for your feedback! We appreciate your input.');
            }

            // Close modal
            this.close();

        } catch (error) {
            console.error('Error submitting feedback:', error);
            
            if (window.showError) {
                window.showError('Failed to submit feedback. Please try again.');
            }
        } finally {
            // Reset button
            submitBtn.disabled = false;
            submitText.style.display = 'inline';
            submitLoader.style.display = 'none';
        }
    }
}

// Initialize feedback widget
document.addEventListener('DOMContentLoaded', () => {
    const feedbackWidget = new FeedbackWidget();
    window.feedbackWidget = feedbackWidget;
});
