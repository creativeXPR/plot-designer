// Modal system for Plot-Designer
// Usage: Modal.open({ title, content, actions })

export class Modal {
    static open({ title = '', content = '', actions = [] }) {
        const container = document.getElementById('modal-container');
        if (!container) return;
        container.innerHTML = '';
        const modal = document.createElement('div');
        modal.className = 'modal glass-panel';
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-modal', 'true');
        modal.innerHTML = `
            <div class="modal-header">
                <h2 class="modal-title">${title}</h2>
                <button class="modal-close" aria-label="Close modal">&times;</button>
            </div>
            <div class="modal-content">${typeof content === 'string' ? content : ''}</div>
            <div class="modal-actions"></div>
        `;
        container.appendChild(modal);
        // Insert actions
        const actionsDiv = modal.querySelector('.modal-actions');
        actions.forEach(({ label, onClick, className = '' }) => {
            const btn = document.createElement('button');
            btn.textContent = label;
            btn.className = `btn ${className}`;
            btn.addEventListener('click', onClick);
            actionsDiv.appendChild(btn);
        });
        // Close button
        modal.querySelector('.modal-close').addEventListener('click', Modal.close);
        container.style.display = 'block';
        setTimeout(() => modal.classList.add('modal-in'), 10);
    }

    static close() {
        const container = document.getElementById('modal-container');
        if (!container) return;
        container.style.display = 'none';
        container.innerHTML = '';
    }
}

// Usage example:
// Modal.open({
//   title: 'Create New Project',
//   content: '<input ...>',
//   actions: [
//     { label: 'Create', onClick: () => { ... } },
//     { label: 'Cancel', onClick: Modal.close }
//   ]
// });
