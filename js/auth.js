// Authentication Module
class AuthManager {
    constructor() {
        this.currentUser = null;
        this.isAdmin = false;
        this.initialized = false;
    }

    async init() {
        if (this.initialized) return;
        this.initialized = true;

        // Setup event listeners first (synchronous)
        this.setupEventListeners();

        // Defer auth check to not block page load
        requestIdleCallback(() => {
            this.checkSession();
        }, { timeout: 100 });

        // Listen for auth changes
        supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_IN') {
                // Verify user exists before allowing sign in
                if (session && session.user) {
                    const userExists = await this.verifyUserExists(session.user.id);
                    if (!userExists) {
                        // User was deleted, sign out immediately
                        await supabase.auth.signOut({ scope: 'local' });
                        this.clearSupabaseStorage();
                        this.currentUser = null;
                        this.isAdmin = false;
                        this.updateUI();
                        return;
                    }
                }
                this.currentUser = session.user;
                this.checkAdminStatus();
                this.updateUI();
            } else if (event === 'SIGNED_OUT') {
                this.currentUser = null;
                this.isAdmin = false;
                this.updateUI();
            } else if (event === 'TOKEN_REFRESHED') {
                // Verify user still exists on token refresh
                if (session && session.user) {
                    const userExists = await this.verifyUserExists(session.user.id);
                    if (!userExists) {
                        await supabase.auth.signOut({ scope: 'local' });
                        this.clearSupabaseStorage();
                        this.currentUser = null;
                        this.isAdmin = false;
                        this.updateUI();
                    }
                }
            }
        });
        
        // Periodic session validation (every 5 minutes)
        this.startSessionValidation();
    }
    
    startSessionValidation() {
        // Check session validity every 5 minutes
        setInterval(async () => {
            if (this.currentUser) {
                const userExists = await this.verifyUserExists(this.currentUser.id);
                if (!userExists) {
                    // User was deleted, force logout
                    await this.handleLogout();
                }
            }
        }, 5 * 60 * 1000); // 5 minutes
    }

    async checkSession() {
        try {
            const { data: { session }, error } = await supabase.auth.getSession();
            
            if (error) {
                // Session error - clear everything
                this.clearSupabaseStorage();
                this.currentUser = null;
                this.isAdmin = false;
                this.updateUI();
                return;
            }
            
            if (session) {
                // Verify the user still exists in the database
                const userExists = await this.verifyUserExists(session.user.id);
                
                if (!userExists) {
                    // User was deleted - clear session and storage
                    await supabase.auth.signOut({ scope: 'local' });
                    this.clearSupabaseStorage();
                    this.currentUser = null;
                    this.isAdmin = false;
                    this.updateUI();
                    return;
                }
                
                this.currentUser = session.user;
                await this.checkAdminStatus();
                this.updateUI();
            }
        } catch (error) {
            console.error('Session check error:', error);
            // On error, clear everything to be safe
            this.clearSupabaseStorage();
            this.currentUser = null;
            this.isAdmin = false;
            this.updateUI();
        }
    }
    
    async verifyUserExists(userId) {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('id')
                .eq('id', userId)
                .maybeSingle();
            
            // If error or no data, user doesn't exist
            return !error && data !== null;
        } catch (error) {
            console.error('Error verifying user:', error);
            return false;
        }
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

            // Show history link for authenticated users
            if (window.app) {
                window.app.updateHistoryLinkVisibility(true);
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

            // Hide history link for non-authenticated users
            if (window.app) {
                window.app.updateHistoryLinkVisibility(false);
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
        // Clear local state immediately
        this.currentUser = null;
        this.isAdmin = false;
        
        try {
            // Attempt to sign out from Supabase
            await supabase.auth.signOut({ scope: 'local' });
        } catch (error) {
            // Silently handle sign out errors - we'll clear storage anyway
        }
        
        // Clear all Supabase-related storage
        this.clearSupabaseStorage();
        
        // Redirect to home page (using replace to prevent back button issues)
        window.location.replace('index.html');
    }
    
    clearSupabaseStorage() {
        // Clear localStorage
        const localStorageKeys = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && (key.includes('supabase') || key.includes('sb-'))) {
                localStorageKeys.push(key);
            }
        }
        localStorageKeys.forEach(key => localStorage.removeItem(key));
        
        // Clear sessionStorage
        const sessionStorageKeys = [];
        for (let i = 0; i < sessionStorage.length; i++) {
            const key = sessionStorage.key(i);
            if (key && (key.includes('supabase') || key.includes('sb-'))) {
                sessionStorageKeys.push(key);
            }
        }
        sessionStorageKeys.forEach(key => sessionStorage.removeItem(key));
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

// Initialize auth manager lazily
const authManager = new AuthManager();
window.authManager = authManager;

// Defer initialization to not block page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        requestAnimationFrame(() => authManager.init());
    });
} else {
    requestAnimationFrame(() => authManager.init());
}
