// Theme management for light/dark mode
export class ThemeManager {
    constructor() {
        this.theme = localStorage.getItem('plot-designer-theme') || 'light';
        this.init();
    }

    init() {
        this.applyTheme();
        this.setupEventListeners();
    }

    applyTheme() {
        document.documentElement.setAttribute('data-theme', this.theme);
        localStorage.setItem('plot-designer-theme', this.theme);
        
        // Update theme toggle button
        const toggleBtn = document.getElementById('theme-toggle');
        if (toggleBtn) {
            const sunIcon = toggleBtn.querySelector('.icon-sun');
            const moonIcon = toggleBtn.querySelector('.icon-moon');
            
            if (this.theme === 'dark') {
                sunIcon.style.display = 'none';
                moonIcon.style.display = 'block';
            } else {
                sunIcon.style.display = 'block';
                moonIcon.style.display = 'none';
            }
        }
    }

    toggleTheme() {
        this.theme = this.theme === 'light' ? 'dark' : 'light';
        this.applyTheme();
        
        // Dispatch custom event for theme change
        document.dispatchEvent(new CustomEvent('themeChanged', {
            detail: { theme: this.theme }
        }));
    }

    setupEventListeners() {
        // Theme toggle button
         const attachToggle = () => {
            const toggleBtn = document.getElementById('theme-toggle');
            if (toggleBtn && !toggleBtn._themeListenerAttached) {
                toggleBtn.addEventListener('click', () => this.toggleTheme());
                toggleBtn._themeListenerAttached = true;
            }
        };
        attachToggle();
        // Watch for DOM changes in case #theme-toggle is loaded later
        const observer = new MutationObserver(attachToggle);
        observer.observe(document.body, { childList: true, subtree: true });

        // Listen for system theme changes
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
        prefersDark.addEventListener('change', (e) => {
            if (!localStorage.getItem('plot-designer-theme')) {
                this.theme = e.matches ? 'dark' : 'light';
                this.applyTheme();
            }
        });
    }

    getCurrentTheme() {
        return this.theme;
    }

    isDarkMode() {
        return this.theme === 'dark';
    }
}

export const themeManager = new ThemeManager();