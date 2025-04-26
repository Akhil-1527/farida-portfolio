/**
 * Theme handling functionality
 * - Manages light/dark theme switching
 * - Persists theme preference
 */

/**
 * Initialize theme functionality
 */
export function initTheme() {
    // Load saved theme
    loadSavedTheme();
    
    // Set up theme toggle button
    setupThemeToggle();
}

/**
 * Load the saved theme preference
 */
function loadSavedTheme() {
    const savedTheme = localStorage.getItem('portfolio_theme');
    
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme');
    } else if (savedTheme === 'light') {
        document.body.classList.remove('dark-theme');
    } else {
        // Check system preference if no saved preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (prefersDark) {
            document.body.classList.add('dark-theme');
        }
    }
}

/**
 * Set up theme toggle button functionality
 */
function setupThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
}

/**
 * Toggle between light and dark themes
 */
export function toggleTheme() {
    document.body.classList.toggle('dark-theme');
    
    // Save theme preference to localStorage
    const isDarkTheme = document.body.classList.contains('dark-theme');
    localStorage.setItem('portfolio_theme', isDarkTheme ? 'dark' : 'light');
    
    // Update charts colors if they exist
    if (window.updateChartColors) {
        window.updateChartColors();
    }
}