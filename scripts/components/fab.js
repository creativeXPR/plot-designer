// Floating Action Button (FAB) component
// Usage: import and initialize in main.js

export class Fab {
    constructor({ onClick }) {
        this.button = document.getElementById('fab');
        if (!this.button) return;
        this.onClick = onClick;
        this.init();
    }

    init() {
        this.button.addEventListener('click', (e) => {
            if (typeof this.onClick === 'function') {
                this.onClick(e);
            }
        });
        this.show();
    }

    show() {
        this.button.style.display = 'block';
        this.button.classList.add('fab-animate-in');
    }

    hide() {
        this.button.style.display = 'none';
    }

    setLoading(isLoading) {
        if (isLoading) {
            this.button.classList.add('loading');
            this.button.disabled = true;
        } else {
            this.button.classList.remove('loading');
            this.button.disabled = false;
        }
    }
}

// Optionally, auto-initialize in main.js like:
// import { Fab } from './components/fab.js';
// const fab = new Fab({ onClick: () => { /* open modal */ } });
