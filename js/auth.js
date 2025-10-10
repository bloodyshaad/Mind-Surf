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
                        this.dispatchAuthStateChange(false);
                        return;
                    }
                }
                this.currentUser = session.user;
                this.checkAdminStatus();
                this.updateUI();
                this.dispatchAuthStateChange(true);
            } else if (event === 'SIGNED_OUT') {
                this.currentUser = null;
                this.isAdmin = false;
                this.updateUI();
                this.dispatchAuthStateChange(false);
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
                        this.dispatchAuthStateChange(false);
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
                .select('is_admin, age')
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
            
            // Check if user has age, if not prompt for it
            if (!data.age) {
                await this.promptAndUpdateAge();
            }
            
            this.isAdmin = data.is_admin || false;
        } catch (error) {
            console.error('Error checking admin status:', error);
            this.isAdmin = false;
        }
    }

    async promptAndUpdateAge() {
        const age = await this.promptForAge();
        if (!age) {
            // User cancelled, sign them out
            await this.handleLogout();
            return;
        }
        
        // Update user metadata and database
        try {
            // Update auth metadata
            await supabase.auth.updateUser({
                data: { age: age }
            });
            
            // Update database
            await supabase
                .from('users')
                .update({ age: age })
                .eq('id', this.currentUser.id);
                
        } catch (error) {
            console.error('Error updating age:', error);
        }
    }

    async createUserProfile() {
        if (!this.currentUser) return;

        let ageToUse = this.currentUser.user_metadata?.age;
        
        // Check if age is missing (OAuth users)
        if (!ageToUse) {
            // Prompt for age before creating profile
            const age = await this.promptForAge();
            if (!age) {
                // User cancelled, sign them out
                await this.handleLogout();
                return;
            }
            
            ageToUse = age;
            
            // Update user metadata with age
            try {
                const { error: updateError } = await supabase.auth.updateUser({
                    data: { age: age }
                });
                
                if (updateError) {
                    console.error('Error updating user metadata:', updateError);
                    // Continue anyway with the age we collected
                }
                
                // Refresh current user to get updated metadata
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    this.currentUser = user;
                }
            } catch (error) {
                console.error('Error updating user metadata:', error);
                // Continue anyway with the age we collected
            }
        }

        try {
            const fullName = this.currentUser.user_metadata?.full_name || 
                             this.currentUser.user_metadata?.name || 
                             this.currentUser.email?.split('@')[0] || 
                             'User';
            
            const { error } = await supabase
                .from('users')
                .insert({
                    id: this.currentUser.id,
                    email: this.currentUser.email,
                    full_name: fullName,
                    age: ageToUse,
                    is_admin: false
                });
            
            if (error) {
                console.error('Error creating user profile:', error);
            }
        } catch (error) {
            console.error('Error creating user profile:', error);
        }
    }

    promptForAge() {
        return new Promise((resolve) => {
            // Create modal
            const modal = document.createElement('div');
            modal.className = 'age-prompt-modal';
            modal.innerHTML = `
                <div class="age-prompt-overlay"></div>
                <div class="age-prompt-content">
                    <h2>Welcome to MindSurf!</h2>
                    <p>To provide you with age-appropriate content, please tell us your age.</p>
                    <form id="agePromptForm">
                        <div class="form-group">
                            <label for="ageInput">Your Age</label>
                            <input type="number" id="ageInput" min="13" max="19" required placeholder="Enter your age (13-19)" autofocus>
                            <small>You must be between 13-19 years old to use MindSurf</small>
                        </div>
                        <div class="age-prompt-error" id="agePromptError"></div>
                        <div class="age-prompt-buttons">
                            <button type="submit" class="btn-primary">Continue</button>
                        </div>
                    </form>
                </div>
            `;

            // Add styles
            const style = document.createElement('style');
            style.textContent = `
                .age-prompt-modal {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    z-index: 10000;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .age-prompt-overlay {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.7);
                    backdrop-filter: blur(4px);
                }
                .age-prompt-content {
                    position: relative;
                    background: var(--color-white);
                    border-radius: 16px;
                    padding: 2rem;
                    max-width: 400px;
                    width: 90%;
                    box-shadow: var(--shadow-2xl);
                    animation: slideInUp 0.3s ease;
                }
                [data-theme="dark"] .age-prompt-content {
                    background: var(--bg-primary);
                    border: 1px solid var(--border-color);
                }
                .age-prompt-content h2 {
                    margin-bottom: 0.5rem;
                    font-size: 1.5rem;
                    color: var(--text-primary);
                }
                .age-prompt-content p {
                    margin-bottom: 1.5rem;
                    color: var(--text-secondary);
                }
                .age-prompt-content .form-group {
                    margin-bottom: 1rem;
                }
                .age-prompt-content label {
                    display: block;
                    margin-bottom: 0.5rem;
                    font-weight: 600;
                    color: var(--text-primary);
                }
                .age-prompt-content input {
                    width: 100%;
                    padding: 0.75rem;
                    border: 2px solid var(--color-gray-300);
                    border-radius: 8px;
                    font-size: 1rem;
                    background: var(--bg-primary);
                    color: var(--text-primary);
                }
                .age-prompt-content input:focus {
                    outline: none;
                    border-color: var(--color-black);
                }
                .age-prompt-content small {
                    display: block;
                    margin-top: 0.5rem;
                    color: var(--text-tertiary);
                    font-size: 0.85rem;
                }
                .age-prompt-error {
                    color: #EF4444;
                    font-size: 0.9rem;
                    margin-bottom: 1rem;
                    display: none;
                }
                .age-prompt-buttons {
                    display: flex;
                    gap: 1rem;
                }
                .age-prompt-buttons button {
                    flex: 1;
                }
            `;
            document.head.appendChild(style);

            document.body.appendChild(modal);

            // Handle form submission
            const form = modal.querySelector('#agePromptForm');
            const ageInput = modal.querySelector('#ageInput');
            const errorDiv = modal.querySelector('#agePromptError');

            form.addEventListener('submit', (e) => {
                e.preventDefault();
                const age = parseInt(ageInput.value);

                if (age < 13 || age > 19) {
                    errorDiv.textContent = 'Age must be between 13 and 19';
                    errorDiv.style.display = 'block';
                    return;
                }

                modal.remove();
                resolve(age);
            });

            // Prevent closing by clicking overlay
            modal.querySelector('.age-prompt-overlay').addEventListener('click', (e) => {
                e.stopPropagation();
            });
        });
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
            this.updateHistoryLinkVisibility(true);
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
            this.updateHistoryLinkVisibility(false);
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

    dispatchAuthStateChange(authenticated) {
        // Dispatch custom event for other modules to listen to
        const event = new CustomEvent('authStateChanged', {
            detail: { authenticated, user: this.currentUser }
        });
        window.dispatchEvent(event);
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
