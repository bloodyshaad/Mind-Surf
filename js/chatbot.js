// AI Chatbot System using Gemini API
class ChatbotSystem {
    constructor() {
        this.apiKey = 'AIzaSyB2brjGwxLtSz_EqG9eBKBRaxqblRyNwyo';
        this.apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';
        this.conversationHistory = [];
        this.isOpen = false;
        this.isTyping = false;
        this.userQuizData = null;
        this.systemPrompt = `You are MindBot, a compassionate AI assistant for MindSurf, a teen stress management platform. Your role is to:

1. Provide immediate emotional support and stress relief guidance
2. Be empathetic, understanding, and non-judgmental
3. Offer evidence-based coping strategies for teens (ages 13-19)
4. Recognize crisis situations and provide appropriate resources
5. Keep responses concise (2-3 paragraphs max)
6. Use teen-friendly language without being condescending
7. Never provide medical diagnoses or replace professional help

IMPORTANT CRISIS PROTOCOL:
If a user mentions self-harm, suicide, or immediate danger:
- Express concern and care
- Provide crisis hotline: 988 (Suicide & Crisis Lifeline)
- Provide text line: Text HOME to 741741
- Encourage them to talk to a trusted adult
- Remind them help is available 24/7

Remember: You're a supportive friend, not a therapist. Always encourage professional help for serious issues.`;
        
        this.init();
    }

    async init() {
        // Only initialize chatbot for authenticated users
        if (!window.authManager?.isAuthenticated()) {
            window.logInfo('CHATBOT', 'User not authenticated, chatbot disabled');
            return;
        }

        this.loadConversationHistory();
        this.createChatWidget();
        this.setupEventListeners();
        await this.loadUserQuizData();
        this.updateWelcomeMessage();
    }

    async loadUserQuizData() {
        if (!window.authManager?.isAuthenticated()) return;

        const userId = window.authManager.getCurrentUser()?.id;
        if (!userId) return;

        try {
            // Get user's most recent quiz result
            const { data, error } = await supabase
                .from('quiz_results')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
                .limit(1)
                .single();

            if (error && error.code !== 'PGRST116') throw error;

            if (data) {
                this.userQuizData = data;
                window.logInfo('CHATBOT', 'Loaded user quiz data for personalized support');
            }
        } catch (error) {
            window.logError('CHATBOT', `Failed to load quiz data: ${error.message}`);
        }
    }

    getQuizAnalysisContext() {
        if (!this.userQuizData) return '';

        const { overall_stress_percentage, stress_level, category_scores } = this.userQuizData;
        
        // Parse category scores
        let categoryInfo = '';
        if (category_scores) {
            const categories = {
                academic: 'Academic Pressure',
                social: 'Social Relationships',
                family: 'Family Dynamics',
                personal: 'Personal Identity',
                physical: 'Physical Health',
                lifestyle: 'Life Balance'
            };

            const sortedCategories = Object.entries(category_scores)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 3);

            categoryInfo = sortedCategories.map(([key, value]) => 
                `${categories[key]}: ${value}%`
            ).join(', ');
        }

        return `

USER'S STRESS ASSESSMENT DATA:
- Overall Stress Level: ${overall_stress_percentage}% (${stress_level})
- Top Stress Areas: ${categoryInfo}
- Assessment Date: ${new Date(this.userQuizData.created_at).toLocaleDateString()}

Use this information to provide personalized, relevant support. Reference their specific stress areas when appropriate, but don't overwhelm them with data. Be natural and conversational.`;
    }

    createChatWidget() {
        // Create chat button
        const chatButton = document.createElement('button');
        chatButton.id = 'chatbotButton';
        chatButton.className = 'chatbot-button';
        chatButton.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span class="chatbot-badge" id="chatbotBadge" style="display: none;">1</span>
        `;
        document.body.appendChild(chatButton);

        // Create chat window
        const chatWindow = document.createElement('div');
        chatWindow.id = 'chatbotWindow';
        chatWindow.className = 'chatbot-window';
        chatWindow.innerHTML = `
            <div class="chatbot-header">
                <div class="chatbot-header-info">
                    <div class="chatbot-avatar">
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                            <path d="M8 14C8 14 9.5 16 12 16C14.5 16 16 14 16 14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                            <circle cx="9" cy="9" r="1" fill="currentColor"/>
                            <circle cx="15" cy="9" r="1" fill="currentColor"/>
                        </svg>
                    </div>
                    <div class="chatbot-header-text">
                        <h3>MindBot</h3>
                        <span class="chatbot-status">
                            <span class="status-dot"></span>
                            Online
                        </span>
                    </div>
                </div>
                <div class="chatbot-header-actions">
                    <button class="chatbot-action-btn" id="clearChatBtn" title="Clear chat">
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M3 6H5H21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                            <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                        </svg>
                    </button>
                    <button class="chatbot-action-btn" id="closeChatBtn" title="Close chat">
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                        </svg>
                    </button>
                </div>
            </div>
            <div class="chatbot-messages" id="chatbotMessages">
                <div class="chatbot-welcome">
                    <div class="welcome-icon">👋</div>
                    <h4>Hi! I'm MindBot</h4>
                    <p>I'm here to provide immediate support and stress relief guidance. How are you feeling today?</p>
                    <div class="quick-actions">
                        <button class="quick-action-btn" data-message="I'm feeling stressed">😰 Feeling Stressed</button>
                        <button class="quick-action-btn" data-message="I'm feeling anxious">😟 Feeling Anxious</button>
                        <button class="quick-action-btn" data-message="I need breathing exercises">🧘 Breathing Help</button>
                        <button class="quick-action-btn" data-message="I can't sleep">😴 Sleep Issues</button>
                    </div>
                </div>
            </div>
            <div class="chatbot-input-container">
                <textarea 
                    id="chatbotInput" 
                    class="chatbot-input" 
                    placeholder="Type your message..."
                    rows="1"
                ></textarea>
                <button id="chatbotSendBtn" class="chatbot-send-btn">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 8L11 13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </button>
            </div>
        `;
        document.body.appendChild(chatWindow);

        // Add styles
        this.addStyles();
    }

    addStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .chatbot-button {
                position: fixed;
                bottom: 100px;
                right: 24px;
                width: 64px;
                height: 64px;
                border-radius: 50%;
                background: var(--color-black);
                color: var(--color-white);
                border: 2px solid var(--color-black);
                cursor: pointer;
                box-shadow: var(--shadow-2xl);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 9998;
                transition: var(--transition-smooth);
                overflow: hidden;
            }

            .chatbot-button::before {
                content: '';
                position: absolute;
                top: 0;
                left: -100%;
                width: 100%;
                height: 100%;
                background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
                transition: left 0.5s;
            }

            .chatbot-button:hover::before {
                left: 100%;
            }

            .chatbot-button:hover {
                transform: translateY(-4px);
                box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
            }

            .chatbot-button svg {
                width: 30px;
                height: 30px;
                position: relative;
                z-index: 1;
            }

            .chatbot-badge {
                position: absolute;
                top: -6px;
                right: -6px;
                background: var(--color-black);
                color: var(--color-white);
                border: 2px solid var(--bg-primary);
                border-radius: 50%;
                width: 26px;
                height: 26px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 11px;
                font-weight: 700;
                z-index: 2;
            }

            .chatbot-window {
                position: fixed;
                bottom: 100px;
                right: 24px;
                width: 420px;
                height: 650px;
                background: var(--bg-primary);
                border-radius: 20px;
                box-shadow: var(--shadow-2xl);
                display: none;
                flex-direction: column;
                z-index: 9999;
                overflow: hidden;
                animation: slideInUp 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                border: 1px solid var(--border-color);
            }

            @keyframes slideInUp {
                from {
                    opacity: 0;
                    transform: translateY(20px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }

            .chatbot-window.open {
                display: flex;
            }

            .chatbot-header {
                background: var(--color-black);
                color: var(--color-white);
                padding: 20px;
                display: flex;
                align-items: center;
                justify-content: space-between;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            }

            .chatbot-header-info {
                display: flex;
                align-items: center;
                gap: 14px;
            }

            .chatbot-avatar {
                width: 44px;
                height: 44px;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.15);
                display: flex;
                align-items: center;
                justify-content: center;
                border: 2px solid rgba(255, 255, 255, 0.2);
            }

            .chatbot-avatar svg {
                width: 26px;
                height: 26px;
            }

            .chatbot-header-text h3 {
                margin: 0;
                font-size: 1.1rem;
                font-weight: 700;
                letter-spacing: -0.02em;
                font-family: var(--font-display);
            }

            .chatbot-status {
                display: flex;
                align-items: center;
                gap: 6px;
                font-size: 0.8rem;
                opacity: 0.85;
                font-weight: 500;
            }

            .status-dot {
                width: 7px;
                height: 7px;
                border-radius: 50%;
                background: var(--color-white);
                animation: pulse 2s infinite;
            }

            @keyframes pulse {
                0%, 100% { opacity: 1; transform: scale(1); }
                50% { opacity: 0.6; transform: scale(0.9); }
            }

            .chatbot-header-actions {
                display: flex;
                gap: 6px;
            }

            .chatbot-action-btn {
                background: rgba(255, 255, 255, 0.1);
                border: 1px solid rgba(255, 255, 255, 0.15);
                border-radius: 10px;
                width: 36px;
                height: 36px;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                transition: var(--transition-smooth);
            }

            .chatbot-action-btn:hover {
                background: rgba(255, 255, 255, 0.2);
                border-color: rgba(255, 255, 255, 0.3);
                transform: scale(1.05);
            }

            .chatbot-action-btn svg {
                width: 18px;
                height: 18px;
                stroke: white;
            }

            .chatbot-messages {
                flex: 1;
                overflow-y: auto;
                padding: 24px;
                display: flex;
                flex-direction: column;
                gap: 20px;
                background: var(--bg-secondary);
            }

            .chatbot-messages::-webkit-scrollbar {
                width: 6px;
            }

            .chatbot-messages::-webkit-scrollbar-track {
                background: transparent;
            }

            .chatbot-messages::-webkit-scrollbar-thumb {
                background: var(--color-gray-300);
                border-radius: 10px;
            }

            .chatbot-messages::-webkit-scrollbar-thumb:hover {
                background: var(--color-gray-400);
            }

            .chatbot-welcome {
                text-align: center;
                padding: 30px 20px;
                background: var(--bg-primary);
                border-radius: 16px;
                border: 1px solid var(--border-color);
            }

            .welcome-icon {
                font-size: 56px;
                margin-bottom: 16px;
                animation: wave 2s ease-in-out infinite;
            }

            @keyframes wave {
                0%, 100% { transform: rotate(0deg); }
                25% { transform: rotate(20deg); }
                75% { transform: rotate(-20deg); }
            }

            .chatbot-welcome h4 {
                margin: 0 0 10px 0;
                color: var(--text-primary);
                font-size: 1.3rem;
                font-weight: 700;
                font-family: var(--font-display);
                letter-spacing: -0.02em;
            }

            .chatbot-welcome p {
                color: var(--text-secondary);
                margin: 0 0 24px 0;
                line-height: 1.6;
                font-size: 0.95rem;
            }

            .quick-actions {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 10px;
                margin-top: 20px;
            }

            .quick-action-btn {
                padding: 14px 12px;
                border: 2px solid var(--border-color);
                border-radius: 12px;
                background: var(--bg-primary);
                color: var(--text-primary);
                cursor: pointer;
                font-size: 0.85rem;
                font-weight: 600;
                transition: var(--transition-smooth);
                font-family: var(--font-primary);
            }

            .quick-action-btn:hover {
                border-color: var(--color-black);
                background: var(--color-gray-50);
                transform: translateY(-2px);
                box-shadow: var(--shadow-md);
            }

            .chat-message {
                display: flex;
                gap: 12px;
                animation: fadeInUp 0.3s ease;
            }

            @keyframes fadeInUp {
                from {
                    opacity: 0;
                    transform: translateY(10px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }

            .chat-message.user {
                flex-direction: row-reverse;
            }

            .message-avatar {
                width: 36px;
                height: 36px;
                border-radius: 50%;
                flex-shrink: 0;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 20px;
                border: 2px solid var(--border-color);
            }

            .message-avatar.bot {
                background: var(--color-black);
                color: white;
                border-color: var(--color-black);
            }

            .message-avatar.user {
                background: var(--bg-primary);
                border-color: var(--border-color);
            }

            .message-content {
                max-width: 75%;
            }

            .message-bubble {
                padding: 14px 18px;
                border-radius: 18px;
                word-wrap: break-word;
                line-height: 1.5;
                font-size: 0.95rem;
            }

            .chat-message.bot .message-bubble {
                background: var(--bg-primary);
                color: var(--text-primary);
                border-bottom-left-radius: 6px;
                border: 1px solid var(--border-color);
                box-shadow: var(--shadow-sm);
            }

            .chat-message.user .message-bubble {
                background: var(--color-black);
                color: var(--color-white);
                border-bottom-right-radius: 6px;
                box-shadow: var(--shadow-md);
            }

            .message-time {
                font-size: 0.7rem;
                color: var(--text-tertiary);
                margin-top: 6px;
                padding: 0 6px;
                font-weight: 500;
            }

            .chat-message.user .message-time {
                text-align: right;
            }

            .typing-indicator {
                display: flex;
                gap: 12px;
                padding: 12px 0;
            }

            .typing-dots {
                display: flex;
                gap: 5px;
                padding: 14px 18px;
                background: var(--bg-primary);
                border-radius: 18px;
                border-bottom-left-radius: 6px;
                border: 1px solid var(--border-color);
            }

            .typing-dot {
                width: 8px;
                height: 8px;
                border-radius: 50%;
                background: var(--color-gray-400);
                animation: typingDot 1.4s infinite;
            }

            .typing-dot:nth-child(2) {
                animation-delay: 0.2s;
            }

            .typing-dot:nth-child(3) {
                animation-delay: 0.4s;
            }

            @keyframes typingDot {
                0%, 60%, 100% { transform: translateY(0); opacity: 0.5; }
                30% { transform: translateY(-8px); opacity: 1; }
            }

            .chatbot-input-container {
                padding: 20px;
                border-top: 1px solid var(--border-color);
                display: flex;
                gap: 12px;
                align-items: flex-end;
                background: var(--bg-primary);
            }

            .chatbot-input {
                flex: 1;
                border: 2px solid var(--border-color);
                border-radius: 14px;
                padding: 14px 16px;
                font-size: 0.95rem;
                resize: none;
                max-height: 120px;
                font-family: var(--font-primary);
                background: var(--bg-secondary);
                color: var(--text-primary);
                transition: var(--transition-smooth);
            }

            .chatbot-input:focus {
                outline: none;
                border-color: var(--color-black);
                background: var(--bg-primary);
                box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.05);
            }

            .chatbot-input::placeholder {
                color: var(--text-tertiary);
            }

            .chatbot-send-btn {
                width: 48px;
                height: 48px;
                border-radius: 14px;
                background: var(--color-black);
                color: var(--color-white);
                border: none;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: var(--transition-smooth);
                flex-shrink: 0;
                position: relative;
                overflow: hidden;
            }

            .chatbot-send-btn::before {
                content: '';
                position: absolute;
                top: 0;
                left: -100%;
                width: 100%;
                height: 100%;
                background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
                transition: left 0.5s;
            }

            .chatbot-send-btn:hover::before {
                left: 100%;
            }

            .chatbot-send-btn:hover {
                transform: translateY(-2px);
                box-shadow: var(--shadow-lg);
            }

            .chatbot-send-btn:disabled {
                opacity: 0.4;
                cursor: not-allowed;
                transform: none;
            }

            .chatbot-send-btn svg {
                width: 22px;
                height: 22px;
                position: relative;
                z-index: 1;
            }

            .crisis-alert {
                background: var(--bg-primary);
                border: 2px solid var(--color-black);
                border-radius: 14px;
                padding: 18px;
                margin: 8px 0;
                box-shadow: var(--shadow-md);
            }

            .crisis-alert h4 {
                color: var(--text-primary);
                margin: 0 0 10px 0;
                font-size: 1rem;
                font-weight: 700;
            }

            .crisis-alert p {
                color: var(--text-secondary);
                margin: 0 0 12px 0;
                font-size: 0.9rem;
                line-height: 1.6;
            }

            .crisis-alert p:last-child {
                margin-bottom: 0;
            }

            .crisis-alert a {
                color: var(--color-black);
                font-weight: 700;
                text-decoration: underline;
                text-underline-offset: 2px;
            }

            .crisis-alert a:hover {
                text-decoration-thickness: 2px;
            }

            .quiz-prompt {
                margin-top: 20px;
                padding: 20px;
                background: var(--bg-secondary);
                border-radius: 12px;
                border: 1px solid var(--border-color);
            }

            .quiz-prompt p {
                margin: 0 0 12px 0;
                color: var(--text-primary);
                font-weight: 600;
            }

            .quiz-prompt ul {
                margin: 12px 0;
                padding-left: 20px;
                color: var(--text-secondary);
            }

            .quiz-prompt li {
                margin-bottom: 8px;
                line-height: 1.5;
            }

            @media (max-width: 768px) {
                .chatbot-window {
                    bottom: 0;
                    right: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    max-height: 100vh;
                    border-radius: 0;
                }

                .chatbot-button {
                    bottom: 20px;
                    right: 20px;
                    width: 60px;
                    height: 60px;
                }

                .chatbot-button svg {
                    width: 28px;
                    height: 28px;
                }

                .quick-actions {
                    grid-template-columns: 1fr;
                }
            }

            @media (max-width: 480px) {
                .chatbot-messages {
                    padding: 16px;
                }

                .chatbot-input-container {
                    padding: 16px;
                }

                .message-bubble {
                    font-size: 0.9rem;
                }
            }
        `;
        document.head.appendChild(style);
    }

    setupEventListeners() {
        const chatButton = document.getElementById('chatbotButton');
        const chatWindow = document.getElementById('chatbotWindow');
        const closeBtn = document.getElementById('closeChatBtn');
        const clearBtn = document.getElementById('clearChatBtn');
        const sendBtn = document.getElementById('chatbotSendBtn');
        const input = document.getElementById('chatbotInput');

        chatButton.addEventListener('click', () => this.toggleChat());
        closeBtn.addEventListener('click', () => this.closeChat());
        clearBtn.addEventListener('click', () => this.clearChat());
        sendBtn.addEventListener('click', () => this.sendMessage());

        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // Auto-resize textarea
        input.addEventListener('input', () => {
            input.style.height = 'auto';
            input.style.height = input.scrollHeight + 'px';
        });

        // Quick action buttons
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('quick-action-btn')) {
                const message = e.target.dataset.message;
                this.sendMessage(message);
            }
        });
    }

    toggleChat() {
        // Check if chatbot is initialized
        const chatWindow = document.getElementById('chatbotWindow');
        if (!chatWindow) {
            window.logWarning('CHATBOT', 'Chatbot not initialized - user may not be authenticated');
            return;
        }

        this.isOpen = !this.isOpen;
        const badge = document.getElementById('chatbotBadge');
        
        if (this.isOpen) {
            chatWindow.classList.add('open');
            if (badge) badge.style.display = 'none';
            this.scrollToBottom();
            
            // Log activity
            if (window.errorHandler) {
                window.logInfo('CHATBOT', 'Chat opened');
            }
        } else {
            chatWindow.classList.remove('open');
        }
    }

    closeChat() {
        this.isOpen = false;
        document.getElementById('chatbotWindow').classList.remove('open');
    }

    async sendMessage(messageText = null) {
        const input = document.getElementById('chatbotInput');
        const message = messageText || input.value.trim();

        if (!message || this.isTyping) return;

        // Clear input
        input.value = '';
        input.style.height = 'auto';

        // Add user message
        this.addMessage(message, 'user');

        // Show typing indicator
        this.showTypingIndicator();

        // Get AI response
        try {
            const response = await this.getAIResponse(message);
            this.hideTypingIndicator();
            this.addMessage(response, 'bot');

            // Check for crisis keywords
            if (this.detectCrisis(message)) {
                this.showCrisisAlert();
            }

            // Award points for using chatbot
            if (window.gamificationSystem) {
                await window.gamificationSystem.awardPoints(5, 'chatbot_interaction');
            }

        } catch (error) {
            this.hideTypingIndicator();
            this.addMessage('I apologize, but I\'m having trouble connecting right now. Please try again in a moment, or reach out to a trusted adult if you need immediate help.', 'bot');
            
            if (window.errorHandler) {
                window.logError('CHATBOT', `API Error: ${error.message}`);
            }
        }

        this.scrollToBottom();
    }

    async getAIResponse(userMessage) {
        // Build conversation context with quiz analysis
        const quizContext = this.getQuizAnalysisContext();
        const fullSystemPrompt = this.systemPrompt + quizContext;
        
        const messages = [
            { role: 'user', parts: [{ text: fullSystemPrompt }] },
            { role: 'model', parts: [{ text: 'I understand. I will be MindBot, a compassionate AI assistant for teens dealing with stress. I will provide supportive, evidence-based guidance while recognizing my limitations and directing users to professional help when needed. I have access to their stress assessment data and will use it to provide personalized support.' }] }
        ];

        // Add recent conversation history (last 5 exchanges)
        const recentHistory = this.conversationHistory.slice(-10);
        recentHistory.forEach(msg => {
            messages.push({
                role: msg.role === 'user' ? 'user' : 'model',
                parts: [{ text: msg.content }]
            });
        });

        // Add current message
        messages.push({
            role: 'user',
            parts: [{ text: userMessage }]
        });

        const requestBody = {
            contents: messages,
            generationConfig: {
                temperature: 0.7,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 500,
            },
            safetySettings: [
                {
                    category: 'HARM_CATEGORY_HARASSMENT',
                    threshold: 'BLOCK_MEDIUM_AND_ABOVE'
                },
                {
                    category: 'HARM_CATEGORY_HATE_SPEECH',
                    threshold: 'BLOCK_MEDIUM_AND_ABOVE'
                },
                {
                    category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
                    threshold: 'BLOCK_MEDIUM_AND_ABOVE'
                },
                {
                    category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
                    threshold: 'BLOCK_MEDIUM_AND_ABOVE'
                }
            ]
        };

        const response = await fetch(`${this.apiUrl}?key=${this.apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            throw new Error(`API request failed: ${response.status}`);
        }

        const data = await response.json();
        const aiResponse = data.candidates[0].content.parts[0].text;

        // Save to conversation history
        this.conversationHistory.push({ role: 'user', content: userMessage });
        this.conversationHistory.push({ role: 'bot', content: aiResponse });
        this.saveConversationHistory();

        return aiResponse;
    }

    addMessage(content, sender) {
        const messagesContainer = document.getElementById('chatbotMessages');
        
        // Remove welcome message if exists
        const welcome = messagesContainer.querySelector('.chatbot-welcome');
        if (welcome) {
            welcome.remove();
        }

        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${sender}`;

        const avatar = sender === 'bot' ? '🤖' : '👤';
        const time = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

        messageDiv.innerHTML = `
            <div class="message-avatar ${sender}">${avatar}</div>
            <div class="message-content">
                <div class="message-bubble">${this.formatMessage(content)}</div>
                <div class="message-time">${time}</div>
            </div>
        `;

        messagesContainer.appendChild(messageDiv);
        this.scrollToBottom();
    }

    formatMessage(text) {
        // Convert markdown-style formatting
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/\n/g, '<br>');
    }

    showTypingIndicator() {
        this.isTyping = true;
        const messagesContainer = document.getElementById('chatbotMessages');
        
        const typingDiv = document.createElement('div');
        typingDiv.className = 'typing-indicator';
        typingDiv.id = 'typingIndicator';
        typingDiv.innerHTML = `
            <div class="message-avatar bot">🤖</div>
            <div class="typing-dots">
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
            </div>
        `;

        messagesContainer.appendChild(typingDiv);
        this.scrollToBottom();
    }

    hideTypingIndicator() {
        this.isTyping = false;
        const typingIndicator = document.getElementById('typingIndicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    detectCrisis(message) {
        const crisisKeywords = [
            'suicide', 'kill myself', 'end my life', 'want to die',
            'self harm', 'hurt myself', 'cutting', 'overdose',
            'no reason to live', 'better off dead', 'end it all'
        ];

        const lowerMessage = message.toLowerCase();
        return crisisKeywords.some(keyword => lowerMessage.includes(keyword));
    }

    showCrisisAlert() {
        const messagesContainer = document.getElementById('chatbotMessages');
        
        const alertDiv = document.createElement('div');
        alertDiv.className = 'crisis-alert';
        alertDiv.innerHTML = `
            <h4>⚠️ Immediate Help Available</h4>
            <p>If you're in crisis or having thoughts of harming yourself, please reach out for help immediately:</p>
            <p>
                <strong>Call:</strong> <a href="tel:988">988</a> (Suicide & Crisis Lifeline)<br>
                <strong>Text:</strong> <a href="sms:741741">HOME to 741741</a> (Crisis Text Line)<br>
                <strong>Chat:</strong> <a href="https://988lifeline.org/chat/" target="_blank">988lifeline.org/chat</a>
            </p>
            <p>You're not alone. Help is available 24/7.</p>
        `;

        messagesContainer.appendChild(alertDiv);
        this.scrollToBottom();

        // Log crisis detection
        if (window.errorHandler) {
            window.logWarning('CHATBOT', 'Crisis keywords detected');
        }
    }

    clearChat() {
        if (!confirm('Are you sure you want to clear the chat history?')) return;

        const messagesContainer = document.getElementById('chatbotMessages');
        messagesContainer.innerHTML = `
            <div class="chatbot-welcome">
                <div class="welcome-icon">👋</div>
                <h4>Hi! I'm MindBot</h4>
                <p>I'm here to provide immediate support and stress relief guidance. How are you feeling today?</p>
                <div class="quick-actions">
                    <button class="quick-action-btn" data-message="I'm feeling stressed">😰 Feeling Stressed</button>
                    <button class="quick-action-btn" data-message="I'm feeling anxious">😟 Feeling Anxious</button>
                    <button class="quick-action-btn" data-message="I need breathing exercises">🧘 Breathing Help</button>
                    <button class="quick-action-btn" data-message="I can't sleep">😴 Sleep Issues</button>
                </div>
            </div>
        `;

        this.conversationHistory = [];
        this.saveConversationHistory();

        if (window.errorHandler) {
            window.logInfo('CHATBOT', 'Chat history cleared');
        }
    }

    scrollToBottom() {
        const messagesContainer = document.getElementById('chatbotMessages');
        setTimeout(() => {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }, 100);
    }

    saveConversationHistory() {
        try {
            // Keep only last 20 messages
            const historyToSave = this.conversationHistory.slice(-20);
            localStorage.setItem('chatbot_history', JSON.stringify(historyToSave));
        } catch (error) {
            console.error('Failed to save chat history:', error);
        }
    }

    loadConversationHistory() {
        try {
            const saved = localStorage.getItem('chatbot_history');
            if (saved) {
                this.conversationHistory = JSON.parse(saved);
            }
        } catch (error) {
            console.error('Failed to load chat history:', error);
            this.conversationHistory = [];
        }
    }

    updateWelcomeMessage() {
        const messagesContainer = document.getElementById('chatbotMessages');
        if (!messagesContainer) return;

        const welcomeDiv = messagesContainer.querySelector('.chatbot-welcome');
        if (!welcomeDiv) return;

        if (!this.userQuizData) {
            // User hasn't taken quiz - show prompt to take it
            welcomeDiv.innerHTML = `
                <div class="welcome-icon">📊</div>
                <h4>Welcome to MindBot!</h4>
                <p>To provide you with personalized support, please take the stress assessment quiz first.</p>
                <div class="quiz-prompt">
                    <p><strong>Why take the quiz?</strong></p>
                    <ul style="text-align: left; margin: 12px 0; padding-left: 20px;">
                        <li>Get personalized AI support</li>
                        <li>Understand your stress levels</li>
                        <li>Receive targeted coping strategies</li>
                    </ul>
                    <button class="btn-primary" onclick="window.location.href='#quiz'" style="width: 100%; margin-top: 12px;">
                        Take Quiz Now
                    </button>
                </div>
            `;
        } else {
            // User has taken quiz - show normal welcome
            const stressLevel = this.userQuizData.stress_level;
            const stressEmoji = {
                'Low': '😊',
                'Moderate': '😐',
                'High': '😟',
                'Severe': '😰'
            }[stressLevel] || '👋';

            welcomeDiv.innerHTML = `
                <div class="welcome-icon">${stressEmoji}</div>
                <h4>Hi! I'm MindBot</h4>
                <p>I've reviewed your stress assessment (${stressLevel} stress level). I'm here to provide personalized support. How are you feeling today?</p>
                <div class="quick-actions">
                    <button class="quick-action-btn" data-message="I'm feeling stressed">😰 Feeling Stressed</button>
                    <button class="quick-action-btn" data-message="I'm feeling anxious">😟 Feeling Anxious</button>
                    <button class="quick-action-btn" data-message="I need breathing exercises">🧘 Breathing Help</button>
                    <button class="quick-action-btn" data-message="I can't sleep">😴 Sleep Issues</button>
                </div>
            `;
        }
    }

    showNewMessageBadge() {
        const badge = document.getElementById('chatbotBadge');
        if (!this.isOpen && badge) {
            badge.style.display = 'flex';
        }
    }
}

// Initialize chatbot after auth is ready
function initializeChatbot() {
    if (window.chatbotSystem) {
        // Already initialized
        return;
    }
    
    const chatbotSystem = new ChatbotSystem();
    window.chatbotSystem = chatbotSystem;

    // Show welcome notification after 5 seconds (only for authenticated users)
    setTimeout(() => {
        if (window.authManager?.isAuthenticated() && !chatbotSystem.isOpen && window.notificationSystem) {
            window.showInfo(
                'Need someone to talk to? Click the chat button for immediate support!',
                'MindBot is Here',
                {
                    duration: 8000,
                    actions: [
                        {
                            label: 'Chat Now',
                            primary: true,
                            onClick: () => chatbotSystem.toggleChat()
                        }
                    ]
                }
            );
        }
    }, 5000);
}

// Wait for auth to be ready before initializing chatbot
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        // Wait a bit for auth to initialize
        setTimeout(() => {
            if (window.authManager?.isAuthenticated()) {
                initializeChatbot();
            }
        }, 500);
    });
} else {
    // DOM already loaded
    setTimeout(() => {
        if (window.authManager?.isAuthenticated()) {
            initializeChatbot();
        }
    }, 500);
}

// Also listen for auth state changes to initialize chatbot when user logs in
window.addEventListener('authStateChanged', (event) => {
    if (event.detail?.authenticated && !window.chatbotSystem) {
        initializeChatbot();
    }
});
