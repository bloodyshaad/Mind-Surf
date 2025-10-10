// Supabase Configuration
const SUPABASE_CONFIG = {
    url: 'https://ecurgvxuwpphdkycbcly.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjdXJndnh1d3BwaGRreWNiY2x5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3NDYxNzEsImV4cCI6MjA3NTMyMjE3MX0.5YFOUic9GlNNVlWZobD-1z0Bwju0LgdpZDIly1yEbQ0'
};

// Initialize Supabase Client
const supabase = window.supabase.createClient(
    SUPABASE_CONFIG.url,
    SUPABASE_CONFIG.anonKey
);

// App Configuration
const APP_CONFIG = {
    appName: 'MindSurf',
    version: '1.0.0',
    jwtAccessTokenTime: 604800, // 7 days in seconds
    features: {
        quiz: true,
        analytics: true,
        animations: true
    }
};

// Export for use in other modules
window.supabase = supabase;
window.APP_CONFIG = APP_CONFIG;
