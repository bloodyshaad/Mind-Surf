// Authentication Module
class AuthManager {
    constructor() {
        this.currentUser = null;
        this.isAdmin = false;
        this.init();
    }

    async init() {
        // Check for existing session
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
            this.currentUser = session.user;
            await this.checkAdminStatus();
            this.updateUI();
        }

        // Listen for auth changes
        supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN') {
                this.currentUser = session.user;
                this.checkAdminStatus();
                this.updateUI();
            } else if (event === 'SIGNED_OUT') {
                this.currentUser = null;
                this.isAdmin = false;
                this.updateUI();
            }
        });

        this.setupEventListeners();
    }

    setupEventListeners() {
        // Get Started button
        const getStartedBtn = document.getElementById('getStartedBtn');
        if (getStartedBtn) {
            getStartedBtn.addEventListener('click', () => this.handleGetStarted());
        }
    }

    async checkAdminStatus() {
        if (!this.currentUser) return;

        try {
            const { data, error } = await supabase
                .from('users')
                .select('is_admin')
                .eq('id', this.currentUser.id)
                .maybeSingle();

            if (error) {
                if (error.code === 'PGRST116' || error.message.includes('no rows')) {
                    await this.createUserProfile();
                }
                this.isAdmin = false;
                return;
            }
            
            if (!data) {
                await this.createUserProfile();
                this.isAdmin = false;
                return;
            }
            
            this.isAdmin = data.is_admin || false;
        } catch (error) {
            console.error('Error checking admin status:', error);
            this.isAdmin = false;
        }
    }

    async createUserProfile() {
        if (!this.currentUser) return;

        try {
            const { error } = await supabase
                .from('users')
                .insert({
                    id: this.currentUser.id,
                    email: this.currentUser.email,
                    full_name: this.currentUser.user_metadata?.full_name || 'User',
                    age: this.currentUser.user_metadata?.age || 18,
                    is_admin: false
                });
            
            if (error) {
                console.error('Error creating user profile:', error);
            }
        } catch (error) {
            console.error('Error creating user profile:', error);
        }
    }

    updateUI() {
        const authBtn = document.getElementById('authBtn');
        const authBtnMobile = document.getElementById('authBtnMobile');

        if (this.currentUser) {
            // User is logged in
            const userName = this.currentUser.user_metadata?.full_name || 'User';
            const initials = userName.split(' ').map(n => n[0]).join('').toUpperCase();

            if (authBtn) {
                authBtn.textContent = initials;
                authBtn.href = '#';
                authBtn.onclick = (e) => {
                    e.preventDefault();
                    this.showUserMenu();
                };
            }
            
            if (authBtnMobile) {
                authBtnMobile.textContent = 'Logout';
                authBtnMobile.href = '#';
                authBtnMobile.onclick = (e) => {
                    e.preventDefault();
                    this.handleLogout();
                };
            }

            // Show quiz content
            this.loadQuizContent();

            // Show admin link if admin
            if (this.isAdmin) {
                this.showAdminLink();
            }
        } else {
            // User is logged out
            if (authBtn) {
                authBtn.textContent = 'Login';
                authBtn.href = 'login.html';
                authBtn.onclick = null;
            }
            
            if (authBtnMobile) {
                authBtnMobile.textContent = 'Login';
                authBtnMobile.href = 'login.html';
                authBtnMobile.onclick = null;
            }
        }
    }

    showUserMenu() {
        const menu = document.createElement('div');
        menu.className = 'user-menu';
        menu.innerHTML = `
            <div class="user-menu-content">
                <div class="user-info">
                    <strong>${this.currentUser.user_metadata?.full_name || 'User'}</strong>
                    <span>${this.currentUser.email}</span>
                </div>
                ${this.isAdmin ? '<a href="admin.html" class="menu-item">Admin Dashboard</a>' : ''}
                <button class="menu-item" id="logoutBtn">Logout</button>
            </div>
        `;

        // Remove existing menu if any
        const existingMenu = document.querySelector('.user-menu');
        if (existingMenu) existingMenu.remove();

        document.body.appendChild(menu);

        // Position menu
        const authBtn = document.getElementById('authBtn');
        const rect = authBtn.getBoundingClientRect();
        menu.style.position = 'fixed';
        menu.style.top = `${rect.bottom + 10}px`;
        menu.style.right = '2rem';

        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            .user-menu {
                z-index: 2000;
                animation: fadeInUp 0.3s ease;
            }
            .user-menu-content {
                background: white;
                border: 1px solid var(--color-gray-200);
                border-radius: 12px;
                padding: 1rem;
                box-shadow: var(--shadow-xl);
                min-width: 200px;
            }
            .user-info {
                display: flex;
                flex-direction: column;
                padding-bottom: 1rem;
                border-bottom: 1px solid var(--color-gray-200);
                margin-bottom: 0.5rem;
            }
            .user-info strong {
                font-size: 1rem;
                margin-bottom: 0.25rem;
            }
            .user-info span {
                font-size: 0.85rem;
                color: var(--color-gray-600);
            }
            .menu-item {
                display: block;
                width: 100%;
                padding: 0.75rem;
                background: none;
                border: none;
                text-align: left;
                cursor: pointer;
                border-radius: 6px;
                transition: var(--transition-smooth);
                text-decoration: none;
                color: var(--color-black);
                font-size: 0.95rem;
            }
            .menu-item:hover {
                background-color: var(--color-gray-100);
            }
        `;
        document.head.appendChild(style);

        // Close menu on outside click
        setTimeout(() => {
            document.addEventListener('click', function closeMenu(e) {
                if (!menu.contains(e.target) && e.target !== authBtn) {
                    menu.remove();
                    document.removeEventListener('click', closeMenu);
                }
            });
        }, 100);

        // Logout button
        const logoutBtn = menu.querySelector('#logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                menu.remove();
                this.handleLogout();
            });
        }
    }

    showAdminLink() {
        const navLinks = document.querySelector('.nav-links');
        if (navLinks && !document.getElementById('adminLink')) {
            const adminLink = document.createElement('a');
            adminLink.id = 'adminLink';
            adminLink.href = 'admin.html';
            adminLink.className = 'nav-link';
            adminLink.textContent = 'Admin';
            navLinks.insertBefore(adminLink, navLinks.lastElementChild);
        }
    }

    loadQuizContent() {
        // This will be called by quiz.js
        if (window.quizManager) {
            window.quizManager.loadQuiz();
        }
    }

    handleGetStarted() {
        if (this.currentUser) {
            document.getElementById('quiz').scrollIntoView({ behavior: 'smooth' });
        } else {
            window.location.href = 'login.html';
        }
    }

    async handleLogout() {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) {
                console.error('Error signing out:', error);
                throw error;
            }
            
            window.location.href = 'index.html';
        } catch (error) {
            console.error('Logout error:', error);
            if (window.animationManager) {
                window.animationManager.showError('Error logging out. Please try again.');
            }
        }
    }

    isAuthenticated() {
        return this.currentUser !== null;
    }

    getCurrentUser() {
        return this.currentUser;
    }

    isUserAdmin() {
        return this.isAdmin;
    }
}

// Initialize auth manager
const authManager = new AuthManager();
window.authManager = authManager;
