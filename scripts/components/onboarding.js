// Onboarding modal for first-time users
// Usage: import and call Onboarding.show() on first visit

export class Onboarding {
    static show() {
        const container = document.getElementById('modal-container');
        if (!container) return;
        container.innerHTML = '';
        const modal = document.createElement('div');
        modal.className = 'modal glass-panel onboarding-modal';
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-modal', 'true');
        modal.innerHTML = `
            <div class="modal-header">
                <h2 class="modal-title">Welcome to Plot-Designer!</h2>
                <button class="modal-close" aria-label="Close modal">&times;</button>
            </div>
            <div class="modal-content">
                <img src="./assets/illustrations/onboarding.svg" alt="Onboarding illustration" style="max-width:100%;margin-bottom:1.5em;">
                <p>Structure your story step-by-step with the Snowflake Method, drag and drop your plot, and export your work in multiple formats.</p>
                <ul style="margin:1em 0 1.5em 1.5em;text-align:left;">
                    <li>📝 Write and arrange plot steps</li>
                    <li>🔀 Drag-and-drop to reorder</li>
                    <li>🌈 Glassmorphic, distraction-free UI</li>
                    <li>📤 Export to PDF, Markdown, and more</li>
                </ul>
                <p style="font-size:0.95em;color:var(--color-text-muted);">You can always revisit this guide from the Help menu.</p>
            </div>
            <div class="modal-actions">
                <button class="btn btn-primary" id="onboarding-close">Get Started</button>
            </div>
        `;
        container.appendChild(modal);
        container.style.display = 'block';
        setTimeout(() => modal.classList.add('modal-in'), 10);
        modal.querySelector('.modal-close').addEventListener('click', Onboarding.close);
        modal.querySelector('#onboarding-close').addEventListener('click', Onboarding.close);
    }

    static close() {
        const container = document.getElementById('modal-container');
        if (!container) return;
        container.style.display = 'none';
        container.innerHTML = '';
        localStorage.setItem('plot-designer-onboarding', 'seen');
    }
}

// Usage: import { Onboarding } from './components/onboarding.js';
// if (!localStorage.getItem('plot-designer-onboarding')) Onboarding.show();
