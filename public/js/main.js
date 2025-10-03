// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Active navigation link on scroll
window.addEventListener('scroll', () => {
    const sections = document.querySelectorAll('section[id]');
    const scrollY = window.pageYOffset;

    sections.forEach(section => {
        const sectionHeight = section.offsetHeight;
        const sectionTop = section.offsetTop - 100;
        const sectionId = section.getAttribute('id');
        const navLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);

        if (navLink && scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
            document.querySelectorAll('.nav-link').forEach(link => {
                link.classList.remove('active');
            });
            navLink.classList.add('active');
        }
    });
});

// Quiz form submission
const quizForm = document.getElementById('quizForm');
if (quizForm) {
    quizForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData(quizForm);
        const data = Object.fromEntries(formData);

        try {
            const response = await fetch('/submit-quiz', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (result.success) {
                // Hide form and show result
                quizForm.style.display = 'none';
                const resultDiv = document.getElementById('quizResult');
                const stressLevelSpan = document.getElementById('stressLevel');
                const stressMessage = document.getElementById('stressMessage');

                stressLevelSpan.textContent = result.stressLevel;

                // Set message based on stress level
                let message = '';
                if (result.stressLevel === 'High') {
                    message = 'Your responses indicate high stress levels when performing in public. This is completely normal! Check out our stress-beating tips below to help manage these feelings.';
                } else if (result.stressLevel === 'Moderate') {
                    message = 'You experience moderate stress when performing in public. Many people feel this way! Our tips can help you feel more confident and relaxed.';
                } else {
                    message = 'Great! You seem to handle public performance situations well. Keep up the good work, and feel free to explore our tips for maintaining your confidence.';
                }

                stressMessage.textContent = message;
                resultDiv.style.display = 'block';

                // Scroll to result
                resultDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });

                // Add confetti effect
                createConfetti();
            }
        } catch (error) {
            console.error('Error submitting quiz:', error);
            alert('There was an error submitting your quiz. Please try again.');
        }
    });
}

// Confetti effect
function createConfetti() {
    const colors = ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe'];
    const confettiCount = 50;

    for (let i = 0; i < confettiCount; i++) {
        const confetti = document.createElement('div');
        confetti.style.position = 'fixed';
        confetti.style.width = '10px';
        confetti.style.height = '10px';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.top = '-10px';
        confetti.style.opacity = '1';
        confetti.style.borderRadius = '50%';
        confetti.style.pointerEvents = 'none';
        confetti.style.zIndex = '9999';
        document.body.appendChild(confetti);

        const duration = Math.random() * 3 + 2;
        const rotation = Math.random() * 360;

        confetti.animate([
            { transform: 'translateY(0) rotate(0deg)', opacity: 1 },
            { transform: `translateY(${window.innerHeight + 10}px) rotate(${rotation}deg)`, opacity: 0 }
        ], {
            duration: duration * 1000,
            easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
        });

        setTimeout(() => {
            confetti.remove();
        }, duration * 1000);
    }
}

// Breathing exercise
let breathingInterval;

function startBreathingExercise() {
    const modal = document.getElementById('breathingModal');
    const circle = document.getElementById('breathingCircle');
    const text = document.getElementById('breathingText');

    modal.style.display = 'block';

    let phase = 0;
    const phases = [
        { text: 'Breathe In', duration: 4000, class: 'breathe-in' },
        { text: 'Hold', duration: 7000, class: 'hold' },
        { text: 'Breathe Out', duration: 8000, class: 'breathe-out' }
    ];

    function runPhase() {
        const currentPhase = phases[phase];
        text.textContent = currentPhase.text;
        circle.className = 'breathing-circle ' + currentPhase.class;

        breathingInterval = setTimeout(() => {
            phase = (phase + 1) % phases.length;
            runPhase();
        }, currentPhase.duration);
    }

    // Start with a countdown
    let countdown = 3;
    text.textContent = `Starting in ${countdown}...`;

    const countdownInterval = setInterval(() => {
        countdown--;
        if (countdown > 0) {
            text.textContent = `Starting in ${countdown}...`;
        } else {
            clearInterval(countdownInterval);
            runPhase();
        }
    }, 1000);
}

function closeBreathingExercise() {
    const modal = document.getElementById('breathingModal');
    modal.style.display = 'none';
    clearTimeout(breathingInterval);
}

// Gratitude prompt
function showGratitudePrompt() {
    const gratitudes = prompt('Write down 3 things you\'re grateful for today (separate with commas):');
    if (gratitudes) {
        alert('Thank you for practicing gratitude! 🙏\n\nYour gratitudes:\n' + gratitudes.split(',').map((item, index) => `${index + 1}. ${item.trim()}`).join('\n') + '\n\nKeep this practice up daily for better mental health!');
    }
}

// Animate elements on scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe all cards and sections
document.addEventListener('DOMContentLoaded', () => {
    const animatedElements = document.querySelectorAll('[data-aos]');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
        observer.observe(el);
    });
});

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('breathingModal');
    if (event.target === modal) {
        closeBreathingExercise();
    }
}

// Add loading animation
window.addEventListener('load', () => {
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.5s ease-in';
        document.body.style.opacity = '1';
    }, 100);
});

// Navbar background on scroll
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.style.background = 'rgba(255, 255, 255, 0.98)';
        navbar.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.1)';
    } else {
        navbar.style.background = 'rgba(255, 255, 255, 0.95)';
        navbar.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
    }
});

// Add ripple effect to buttons
document.querySelectorAll('.btn').forEach(button => {
    button.addEventListener('click', function(e) {
        const ripple = document.createElement('span');
        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;

        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.style.position = 'absolute';
        ripple.style.borderRadius = '50%';
        ripple.style.background = 'rgba(255, 255, 255, 0.5)';
        ripple.style.transform = 'scale(0)';
        ripple.style.animation = 'ripple 0.6s ease-out';
        ripple.style.pointerEvents = 'none';

        this.style.position = 'relative';
        this.style.overflow = 'hidden';
        this.appendChild(ripple);

        setTimeout(() => ripple.remove(), 600);
    });
});

// Add ripple animation
const style = document.createElement('style');
style.textContent = `
    @keyframes ripple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Quiz option selection animation
document.querySelectorAll('.quiz-option').forEach(option => {
    option.addEventListener('click', function() {
        const radio = this.querySelector('input[type="radio"]');
        radio.checked = true;

        // Remove selection from siblings
        const parent = this.parentElement;
        parent.querySelectorAll('.quiz-option').forEach(opt => {
            opt.style.borderColor = 'transparent';
            opt.style.background = 'white';
        });

        // Highlight selected option
        this.style.borderColor = '#6366f1';
        this.style.background = 'rgba(99, 102, 241, 0.05)';
    });
});

// Form validation feedback
const inputs = document.querySelectorAll('input[required]');
inputs.forEach(input => {
    input.addEventListener('blur', function() {
        if (this.value.trim() === '') {
            this.style.borderColor = '#ef4444';
        } else {
            this.style.borderColor = '#10b981';
        }
    });

    input.addEventListener('focus', function() {
        this.style.borderColor = '#6366f1';
    });
});

console.log('🧠 MindSurf loaded successfully! Ride the waves of stress with confidence.');
