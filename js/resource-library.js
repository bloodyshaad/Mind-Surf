// Resource Library System
class ResourceLibrary {
    constructor() {
        this.resources = [];
        this.categories = [
            'stress-management',
            'breathing-exercises',
            'meditation',
            'time-management',
            'social-skills',
            'self-care',
            'academic-help',
            'crisis-support'
        ];
        this.init();
    }

    async init() {
        await this.loadResources();
    }

    async loadResources() {
        // Load from database or use default resources
        this.resources = this.getDefaultResources();
        window.logSuccess('RESOURCES', `Loaded ${this.resources.length} resources`);
    }

    getDefaultResources() {
        return [
            // Stress Management
            {
                id: 'stress-101',
                title: 'Understanding Stress: A Teen\'s Guide',
                description: 'Learn what stress is, how it affects you, and why it\'s important to manage it.',
                category: 'stress-management',
                type: 'article',
                duration: '5 min read',
                difficulty: 'beginner',
                tags: ['basics', 'education'],
                content: `
                    <h3>What is Stress?</h3>
                    <p>Stress is your body's natural response to challenges or demands. It's completely normal and everyone experiences it!</p>
                    
                    <h3>Types of Stress</h3>
                    <ul>
                        <li><strong>Acute Stress:</strong> Short-term stress from immediate pressures</li>
                        <li><strong>Chronic Stress:</strong> Long-term stress from ongoing situations</li>
                        <li><strong>Eustress:</strong> Positive stress that motivates you</li>
                    </ul>
                    
                    <h3>Common Signs of Stress</h3>
                    <ul>
                        <li>Difficulty sleeping</li>
                        <li>Headaches or muscle tension</li>
                        <li>Feeling overwhelmed or anxious</li>
                        <li>Changes in appetite</li>
                        <li>Difficulty concentrating</li>
                    </ul>
                    
                    <h3>Why Managing Stress Matters</h3>
                    <p>Unmanaged stress can affect your physical health, mental wellbeing, relationships, and academic performance. Learning to manage stress now will benefit you throughout your life!</p>
                `,
                helpful: 0,
                views: 0
            },
            {
                id: 'quick-stress-relief',
                title: '5 Quick Stress Relief Techniques',
                description: 'Simple techniques you can use anywhere, anytime to reduce stress in minutes.',
                category: 'stress-management',
                type: 'guide',
                duration: '3 min read',
                difficulty: 'beginner',
                tags: ['quick-tips', 'practical'],
                content: `
                    <h3>1. Deep Breathing (2 minutes)</h3>
                    <p>Breathe in slowly for 4 counts, hold for 4, exhale for 4. Repeat 5 times.</p>
                    
                    <h3>2. Progressive Muscle Relaxation (3 minutes)</h3>
                    <p>Tense and release each muscle group, starting from your toes to your head.</p>
                    
                    <h3>3. 5-4-3-2-1 Grounding (2 minutes)</h3>
                    <p>Name 5 things you see, 4 you can touch, 3 you hear, 2 you smell, 1 you taste.</p>
                    
                    <h3>4. Quick Walk (5 minutes)</h3>
                    <p>Take a short walk, focusing on your surroundings and breathing.</p>
                    
                    <h3>5. Positive Affirmations (1 minute)</h3>
                    <p>Repeat: "I am capable. I am strong. I can handle this."</p>
                `,
                helpful: 0,
                views: 0
            },

            // Breathing Exercises
            {
                id: 'box-breathing',
                title: 'Box Breathing Technique',
                description: 'A powerful breathing exercise used by Navy SEALs to stay calm under pressure.',
                category: 'breathing-exercises',
                type: 'exercise',
                duration: '5 min',
                difficulty: 'beginner',
                tags: ['breathing', 'calming'],
                content: `
                    <h3>What is Box Breathing?</h3>
                    <p>Box breathing is a simple but powerful relaxation technique. It's called "box" breathing because you visualize a square.</p>
                    
                    <h3>How to Do It:</h3>
                    <ol>
                        <li><strong>Breathe In:</strong> Slowly inhale through your nose for 4 counts</li>
                        <li><strong>Hold:</strong> Hold your breath for 4 counts</li>
                        <li><strong>Breathe Out:</strong> Slowly exhale through your mouth for 4 counts</li>
                        <li><strong>Hold:</strong> Hold your breath for 4 counts</li>
                        <li><strong>Repeat:</strong> Continue for 5-10 cycles</li>
                    </ol>
                    
                    <h3>When to Use It:</h3>
                    <ul>
                        <li>Before a test or presentation</li>
                        <li>When feeling anxious or overwhelmed</li>
                        <li>Before bed to help sleep</li>
                        <li>During a stressful situation</li>
                    </ul>
                    
                    <div class="tip-box">
                        <strong>Pro Tip:</strong> Close your eyes and visualize drawing a square as you breathe. This helps you focus and enhances the calming effect.
                    </div>
                `,
                helpful: 0,
                views: 0
            },
            {
                id: '478-breathing',
                title: '4-7-8 Breathing for Sleep',
                description: 'Dr. Andrew Weil\'s breathing technique to help you fall asleep faster.',
                category: 'breathing-exercises',
                type: 'exercise',
                duration: '3 min',
                difficulty: 'beginner',
                tags: ['breathing', 'sleep', 'relaxation'],
                content: `
                    <h3>The 4-7-8 Technique</h3>
                    <p>This breathing pattern acts as a natural tranquilizer for the nervous system.</p>
                    
                    <h3>Steps:</h3>
                    <ol>
                        <li>Place the tip of your tongue against the ridge behind your upper front teeth</li>
                        <li>Exhale completely through your mouth, making a whoosh sound</li>
                        <li>Close your mouth and inhale quietly through your nose for 4 counts</li>
                        <li>Hold your breath for 7 counts</li>
                        <li>Exhale completely through your mouth for 8 counts</li>
                        <li>Repeat the cycle 3-4 times</li>
                    </ol>
                    
                    <h3>Benefits:</h3>
                    <ul>
                        <li>Reduces anxiety</li>
                        <li>Helps you fall asleep</li>
                        <li>Manages stress responses</li>
                        <li>Improves focus</li>
                    </ul>
                `,
                helpful: 0,
                views: 0
            },

            // Time Management
            {
                id: 'pomodoro-technique',
                title: 'The Pomodoro Technique for Students',
                description: 'A time management method that helps you stay focused and avoid burnout.',
                category: 'time-management',
                type: 'guide',
                duration: '4 min read',
                difficulty: 'beginner',
                tags: ['productivity', 'study-tips'],
                content: `
                    <h3>What is the Pomodoro Technique?</h3>
                    <p>A time management method that uses a timer to break work into focused intervals (traditionally 25 minutes) separated by short breaks.</p>
                    
                    <h3>How It Works:</h3>
                    <ol>
                        <li>Choose a task to work on</li>
                        <li>Set a timer for 25 minutes</li>
                        <li>Work on the task until the timer rings</li>
                        <li>Take a 5-minute break</li>
                        <li>After 4 "pomodoros," take a longer 15-30 minute break</li>
                    </ol>
                    
                    <h3>Why It Works:</h3>
                    <ul>
                        <li>Reduces mental fatigue</li>
                        <li>Improves focus and concentration</li>
                        <li>Prevents burnout</li>
                        <li>Makes large tasks feel manageable</li>
                    </ul>
                    
                    <h3>Tips for Success:</h3>
                    <ul>
                        <li>Turn off notifications during pomodoros</li>
                        <li>Use breaks to move around</li>
                        <li>Track your completed pomodoros</li>
                        <li>Adjust timing to fit your needs</li>
                    </ul>
                `,
                helpful: 0,
                views: 0
            },

            // Self-Care
            {
                id: 'self-care-basics',
                title: 'Self-Care Essentials for Teens',
                description: 'Simple daily practices to take care of your physical and mental health.',
                category: 'self-care',
                type: 'guide',
                duration: '6 min read',
                difficulty: 'beginner',
                tags: ['wellness', 'daily-habits'],
                content: `
                    <h3>Physical Self-Care</h3>
                    <ul>
                        <li><strong>Sleep:</strong> Aim for 8-10 hours per night</li>
                        <li><strong>Nutrition:</strong> Eat regular, balanced meals</li>
                        <li><strong>Exercise:</strong> Move your body for 30 minutes daily</li>
                        <li><strong>Hydration:</strong> Drink plenty of water</li>
                    </ul>
                    
                    <h3>Mental Self-Care</h3>
                    <ul>
                        <li><strong>Journaling:</strong> Write down your thoughts and feelings</li>
                        <li><strong>Mindfulness:</strong> Practice being present</li>
                        <li><strong>Hobbies:</strong> Make time for activities you enjoy</li>
                        <li><strong>Boundaries:</strong> Learn to say no when needed</li>
                    </ul>
                    
                    <h3>Social Self-Care</h3>
                    <ul>
                        <li><strong>Connection:</strong> Spend time with supportive people</li>
                        <li><strong>Communication:</strong> Express your needs and feelings</li>
                        <li><strong>Limits:</strong> Set healthy boundaries with social media</li>
                    </ul>
                    
                    <h3>Creating Your Self-Care Routine</h3>
                    <p>Start small! Pick 2-3 practices and build from there. Consistency is more important than perfection.</p>
                `,
                helpful: 0,
                views: 0
            },

            // Crisis Support
            {
                id: 'crisis-resources',
                title: 'Crisis Support Resources',
                description: 'Important contacts and resources for when you need immediate help.',
                category: 'crisis-support',
                type: 'resource-list',
                duration: '2 min read',
                difficulty: 'beginner',
                tags: ['emergency', 'support'],
                content: `
                    <h3>⚠️ If You're in Crisis</h3>
                    <p><strong>If you're having thoughts of harming yourself or others, please reach out for help immediately.</strong></p>
                    
                    <h3>24/7 Crisis Hotlines:</h3>
                    <ul>
                        <li><strong>National Suicide Prevention Lifeline:</strong> 988 or 1-800-273-8255</li>
                        <li><strong>Crisis Text Line:</strong> Text HOME to 741741</li>
                        <li><strong>Trevor Project (LGBTQ+ Youth):</strong> 1-866-488-7386 or text START to 678678</li>
                        <li><strong>National Domestic Violence Hotline:</strong> 1-800-799-7233</li>
                    </ul>
                    
                    <h3>Other Support Resources:</h3>
                    <ul>
                        <li><strong>School Counselor:</strong> Available during school hours</li>
                        <li><strong>Trusted Adult:</strong> Parent, teacher, coach, or mentor</li>
                        <li><strong>Emergency Services:</strong> Call 911 for immediate danger</li>
                    </ul>
                    
                    <h3>Online Support:</h3>
                    <ul>
                        <li><strong>7 Cups:</strong> Free online therapy and counseling</li>
                        <li><strong>BetterHelp:</strong> Professional online counseling</li>
                        <li><strong>Teen Line:</strong> Teens helping teens (310-855-4673)</li>
                    </ul>
                    
                    <div class="important-box">
                        <strong>Remember:</strong> Asking for help is a sign of strength, not weakness. You deserve support.
                    </div>
                `,
                helpful: 0,
                views: 0
            },

            // Meditation
            {
                id: 'mindfulness-meditation',
                title: 'Beginner\'s Guide to Mindfulness Meditation',
                description: 'Learn the basics of mindfulness meditation and how to start your practice.',
                category: 'meditation',
                type: 'guide',
                duration: '7 min read',
                difficulty: 'beginner',
                tags: ['mindfulness', 'meditation', 'relaxation'],
                content: `
                    <h3>What is Mindfulness Meditation?</h3>
                    <p>Mindfulness meditation is the practice of focusing your attention on the present moment without judgment.</p>
                    
                    <h3>Benefits for Teens:</h3>
                    <ul>
                        <li>Reduces stress and anxiety</li>
                        <li>Improves focus and concentration</li>
                        <li>Better emotional regulation</li>
                        <li>Enhanced self-awareness</li>
                        <li>Improved sleep quality</li>
                    </ul>
                    
                    <h3>How to Start:</h3>
                    <ol>
                        <li><strong>Find a Quiet Space:</strong> Choose a comfortable, quiet place</li>
                        <li><strong>Set a Timer:</strong> Start with just 5 minutes</li>
                        <li><strong>Get Comfortable:</strong> Sit or lie down in a relaxed position</li>
                        <li><strong>Focus on Your Breath:</strong> Notice the sensation of breathing</li>
                        <li><strong>Notice When Your Mind Wanders:</strong> Gently bring attention back to your breath</li>
                        <li><strong>Be Kind to Yourself:</strong> It's normal for your mind to wander</li>
                    </ol>
                    
                    <h3>Common Challenges:</h3>
                    <ul>
                        <li><strong>"My mind won't stop thinking":</strong> That's normal! Just keep returning to your breath</li>
                        <li><strong>"I don't have time":</strong> Even 2-3 minutes helps</li>
                        <li><strong>"I'm not doing it right":</strong> There's no "perfect" meditation</li>
                    </ul>
                    
                    <h3>Tips for Success:</h3>
                    <ul>
                        <li>Practice at the same time each day</li>
                        <li>Start small and gradually increase duration</li>
                        <li>Use guided meditation apps if helpful</li>
                        <li>Be patient with yourself</li>
                    </ul>
                `,
                helpful: 0,
                views: 0
            }
        ];
    }

    async trackResourceView(resourceId) {
        const resource = this.resources.find(r => r.id === resourceId);
        if (resource) {
            resource.views++;
            
            // Track in gamification
            if (window.gamificationSystem) {
                await window.gamificationSystem.awardPoints(10, 'resource_read');
                
                // Check for achievement
                const totalViews = this.getUserResourceViews();
                if (totalViews >= 10) {
                    await window.gamificationSystem.awardAchievement('resource_reader');
                }
            }
            
            window.logInfo('RESOURCES', `Viewed resource: ${resource.title}`);
        }
    }

    async markResourceHelpful(resourceId) {
        const resource = this.resources.find(r => r.id === resourceId);
        if (resource) {
            resource.helpful++;
            window.showSuccess('Thank you for your feedback!', 'Feedback Received');
            window.logInfo('RESOURCES', `Marked helpful: ${resource.title}`);
        }
    }

    getUserResourceViews() {
        // This would track user-specific views in the database
        // Placeholder for now
        return 0;
    }

    getResourcesByCategory(category) {
        return this.resources.filter(r => r.category === category);
    }

    searchResources(query) {
        const lowerQuery = query.toLowerCase();
        return this.resources.filter(r => 
            r.title.toLowerCase().includes(lowerQuery) ||
            r.description.toLowerCase().includes(lowerQuery) ||
            r.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
        );
    }

    getResourceById(id) {
        return this.resources.find(r => r.id === id);
    }

    renderResourceCard(resource) {
        return `
            <div class="resource-card" data-resource-id="${resource.id}">
                <div class="resource-header">
                    <span class="resource-type badge">${resource.type}</span>
                    <span class="resource-difficulty badge badge-${resource.difficulty}">${resource.difficulty}</span>
                </div>
                <h3 class="resource-title">${resource.title}</h3>
                <p class="resource-description">${resource.description}</p>
                <div class="resource-meta">
                    <span class="resource-duration">⏱️ ${resource.duration}</span>
                    <span class="resource-views">👁️ ${resource.views} views</span>
                    <span class="resource-helpful">👍 ${resource.helpful} helpful</span>
                </div>
                <div class="resource-tags">
                    ${resource.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
                <button class="btn-primary btn-sm" onclick="resourceLibrary.viewResource('${resource.id}')">
                    Read More
                </button>
            </div>
        `;
    }

    viewResource(resourceId) {
        const resource = this.getResourceById(resourceId);
        if (!resource) return;

        this.trackResourceView(resourceId);

        // Show resource in modal or navigate to resource page
        console.log('View resource:', resource);
        // Implementation would show the full resource content
    }
}

// Initialize resource library
const resourceLibrary = new ResourceLibrary();
window.resourceLibrary = resourceLibrary;
