// Toast notification system for Plot-Designer
// Usage: Toast.show('Message', { type: 'success'|'error'|'info', duration: ms })

export class Toast {
    static show(message, { type = 'info', duration = 3000 } = {}) {
        const container = document.getElementById('toast-container');
        if (!container) return;
        const toast = document.createElement('div');
        toast.className = `toast toast-${type} glass-panel`;
        toast.setAttribute('role', 'status');
        toast.setAttribute('aria-live', 'polite');
        toast.textContent = message;
        container.appendChild(toast);
        setTimeout(() => {
            toast.classList.add('toast-in');
        }, 10);
        setTimeout(() => {
            toast.classList.remove('toast-in');
            toast.classList.add('toast-out');
            toast.addEventListener('transitionend', () => {
                toast.remove();
            });
        }, duration);
    }
}

// Usage example:
// Toast.show('Project saved!', { type: 'success' });
