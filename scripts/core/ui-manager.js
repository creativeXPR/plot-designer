// UI management and DOM manipulation
export class UIManager {
    constructor() {
        this.currentView = 'auth';
        this.modals = new Map();
        this.toasts = [];
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.renderEmptyStates();
    }

    setupEventListeners() {
        // Back to dashboard button
        const backBtn = document.getElementById('back-to-dashboard');
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                this.showDashboard();
                const queryParams = new URLSearchParams({ interface: 'default', projectid: '' });
                window.history.pushState({}, '', `/?${queryParams.toString()}`);
            });
        }

        // Create blank project button
        const createBtn = document.getElementById('create-blank-project');
        if (createBtn) {
            createBtn.addEventListener('click', () => {
                window.dispatchEvent(new CustomEvent('createProject', {
                    detail: { templateId: null }
                }));
            });
        }

        // Export button
        const exportBtn = document.getElementById('export-btn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                window.dispatchEvent(new Event('exportProject'));
            });
        }

        // Focus mode button
        const focusBtn = document.getElementById('focus-mode');
        if (focusBtn) {
            focusBtn.addEventListener('click', () => {
                this.toggleFocusMode();
            });
        }

        // User menu
        const userMenuBtn = document.getElementById('user-menu');
        const userDropdown = document.getElementById('user-dropdown');
        
        if (userMenuBtn && userDropdown) {
            userMenuBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleDropdown(userDropdown);
            });

            // Close dropdown when clicking outside
            document.addEventListener('click', () => {
                userDropdown.style.display = 'none';
            });
        }

        // Sign out button
        const signoutBtn = document.getElementById('signout-btn');
        if (signoutBtn) {
            signoutBtn.addEventListener('click', () => {
                window.dispatchEvent(new Event('signout'));
            });
        }

        // Demo sign in
        const demoBtn = document.getElementById('demo-signin');
        if (demoBtn) {
            demoBtn.addEventListener('click', () => {
                window.dispatchEvent(new Event('demoSignin'));
            });
        }

        // Google sign in
        const googleBtn = document.getElementById('google-signin');
        if (googleBtn) {
            googleBtn.addEventListener('click', () => {
                window.dispatchEvent(new Event('googleSignin'));
            });
        }
    }

    // View management
    showAuthScreen() {
        const authScreen = document.getElementById('auth-screen');
        const appContainer = document.getElementById('app-container');
        
        if (authScreen) authScreen.style.display = 'flex';
        if (appContainer) appContainer.style.display = 'none';
        
        this.currentView = 'auth';
    }

    showMainApp() {
        const authScreen = document.getElementById('auth-screen');
        const appContainer = document.getElementById('app-container');
        const fab = document.getElementById('fab');
        
        if (authScreen) authScreen.style.display = 'none';
        if (appContainer) appContainer.style.display = 'flex';
        if (fab) fab.style.display = 'flex';
        
        this.currentView = 'app';
        this.showDashboard();
    }

    showDashboard() {
        const dashboard = document.getElementById('dashboard');
        const editor = document.getElementById('editor');
        const sidebar = document.getElementById('sidebar');
        const fab = document.getElementById('fab');
        
        if (dashboard) dashboard.style.display = 'block';
        if (editor) editor.style.display = 'none';
        if (sidebar) sidebar.style.display = 'none';
        if (fab) fab.style.display = 'flex';

        const hamburger = document.getElementById('sidebar-hamburger');

        sidebar.classList.remove('open');
        hamburger.style.display = 'none';
        
        // Load templates and projects
        window.dispatchEvent(new Event('loadDashboard'));
    }

    // NOT ACTIVE///////!
    showEditor() {
        // ...removed debug log...
        const dashboard = document.getElementById('dashboard');
        const editor = document.getElementById('editor');
        const sidebar = document.getElementById('sidebar');
        const fab = document.getElementById('fab');
        if (dashboard) dashboard.style.display = 'none';
        if (editor) editor.style.display = 'block';
        if (fab) fab.style.display = 'none';

        // Hamburger menu for sidebar (mobile, CSS-driven)
        const hamburger = document.getElementById('sidebar-hamburger');
        hamburger.style.display = 'flex';
        if (hamburger) {
            hamburger.addEventListener('click', () => {
                // ...removed debug log...
                sidebar.classList.toggle('open');
                // if (sidebar.classList.contains('open')) {hamburger.style.position = 'fixed !important';} else {hamburger.style.position = 'absolute !important';}
            });
        }

    // ...existing code...
    }

    // Template rendering
    renderTemplates(templates) {
        const container = document.getElementById('templates-grid');
        if (!container) return;

        container.innerHTML = templates.map(template => `
            <div class="template-card" data-template-id="${template.id}">
                <div class="template-icon">${template.icon}</div>
                <h3>${template.name}</h3>
                <p>${template.description}</p>
                <div class="template-meta">
                    <span>${template.steps.length} steps</span>
                    <button class="btn-text use-template" data-template-id="${template.id}">
                        Use Template
                    </button>
                </div>
            </div>
        `).join('');

        // Add event listeners to template buttons
        container.querySelectorAll('.use-template').forEach(button => {
            button.addEventListener('click', (e) => {
                const templateId = e.target.closest('[data-template-id]').dataset.templateId;
                window.dispatchEvent(new CustomEvent('createProject', {
                    detail: { templateId }
                }));
            });
        });
    }

    renderProjectsList(projects) {
        const container = document.getElementById('projects-list');
        if (!container) return;

        if (projects.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📝</div>
                    <h3>No projects yet</h3>
                    <p>Create your first project to start organizing your story with the Snowflake Method.</p>
                    <button id="create-first-project" class="btn-primary">
                        Create Your First Project
                    </button>
                </div>
            `;

            const createBtn = document.getElementById('create-first-project');
            if (createBtn) {
                createBtn.addEventListener('click', () => {
                    window.dispatchEvent(new CustomEvent('createProject', {
                        detail: { templateId: null }
                    }));
                });
            }
            return;
        }

        container.innerHTML = projects.map(project => {
            const updated = new Date(project.updatedAt);
            const steps = Object.values(project.steps || {});
            const completedSteps = steps.filter(step => step.completed).length;
            const totalSteps = steps.length;
            const wordCount = steps.reduce((total, step) => total + (step.wordCount || 0), 0);
            
            return `
                <div class="project-card" data-project-id="${project.id}">
                    <h3>${project.title}</h3>
                    <p>${project.description || 'No description'}</p>
                    <div class="project-meta">
                        <span>${updated.toLocaleDateString()}</span>
                        <span>${completedSteps}/${totalSteps} steps</span>
                        <span>${wordCount} words</span>
                    </div>
                </div>
            `;
        }).join('');

        // Add event listeners to project cards
        container.querySelectorAll('.project-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (!e.target.closest('.btn-text')) {
                    const projectId = card.dataset.projectId;
                    window.dispatchEvent(new CustomEvent('loadProject', {
                        detail: { projectId }
                    }));
                }
            });
        });
    }

    renderSnowflakeSteps(project) {
        const container = document.getElementById('snowflake-steps');
        if (!container || !project) return;

        const stepEntries = Object.entries(project.steps || {})
            .sort((a, b) => a[1].order - b[1].order);

        container.innerHTML = stepEntries.map(([stepKey, step]) => {
            const isActive = stepKey === project.currentStep;
            const wordCount = step.wordCount || 0;

            return `
                <div class="step-item ${isActive ? 'active' : ''}" 
                     data-step-id="${stepKey}"
                     draggable="true">
                    <div class="drag-handle" draggable="true">⋮⋮</div>
                    <div class="step-icon">${step.icon}</div>
                    <div class="step-content">
                        <div class="step-title">${step.title}</div>
                        <div class="step-completion">
                            <div class="completion-check ${step.completed ? 'checked' : ''}"></div>
                            <span>${wordCount} words</span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        // Initialize drag and drop
        window.dispatchEvent(new Event('initDragDrop'));
    }

    renderStepEditor(step, project) {
        let stepKey = null;
        for (const key in window.appState.currentProject.steps) {
            if (window.appState.currentProject.steps[key] === step) {
                stepKey = key;
                break;
            }
        }
        this.currentStepKey = stepKey;
        const container = document.getElementById('step-container');
        if (!container) return;

        const wordCount = step.content.trim().split(/\s+/).filter(w => w.length > 0).length;
        const charCount = step.content.length;
        const charCountClass = charCount > 1000 ? 'warning' : charCount > 2000 ? 'error' : '';

        // stepKey is not passed here, so you may need to refactor the call site to pass it if needed for getStepPrompt
        container.innerHTML = `
            <div class="step-editor">
                <div class="step-header">
                    <div class="step-header-icon">${step.icon}</div>
                    <h2>${step.title}</h2>
                </div>
                
                <div class="step-prompt">
                    ${this.getStepPrompt(project.templateId, this.currentStepKey)}
                </div>
                
                <textarea id="step-content" 
                          placeholder="Start typing your ${step.title.toLowerCase()}..."
                          rows="12">${step.content || ''}</textarea>
                
                <div class="step-footer">
                    <div class="char-count ${charCountClass}">
                        ${wordCount} words • ${charCount} characters
                    </div>
                    <div class="save-indicator" id="save-indicator">
                        <span>Auto-saved</span>
                    </div>
                </div>
            </div>
        `;

        // Add event listener for content changes
        const textarea = document.getElementById('step-content');
        if (textarea) {
            let saveTimeout;
            
            textarea.addEventListener('input', (e) => {
                const content = e.target.value;
                const wordCount = content.trim().split(/\s+/).filter(w => w.length > 0).length;
                const charCount = content.length;
                const charCountEl = document.querySelector('.char-count');
                
                if (charCountEl) {
                    charCountEl.textContent = `${wordCount} words • ${charCount} characters`;
                    charCountEl.className = `char-count ${charCount > 1000 ? 'warning' : charCount > 2000 ? 'error' : ''}`;
                }
                
                // Show saving indicator
                const saveIndicator = document.getElementById('save-indicator');
                if (saveIndicator) {
                    saveIndicator.innerHTML = '<span class="saving">Saving...</span>';
                }
                
                // Debounce save
                clearTimeout(saveTimeout);
                saveTimeout = setTimeout(() => {
                    window.dispatchEvent(new CustomEvent('updateStep', {
                        detail: { stepId: this.currentStepKey || '', content }
                    }));
                }, 1000);
            });

            // Auto-resize textarea
            textarea.addEventListener('input', function() {
                this.style.height = 'auto';
                this.style.height = (this.scrollHeight) + 'px';
            });

            // Trigger initial resize
            setTimeout(() => {
                textarea.style.height = 'auto';
                textarea.style.height = (textarea.scrollHeight) + 'px';
            }, 0);
        }
    }

    getStepPrompt(templateId, stepId) {
        // Default prompts based on step type
        const prompts = {
            summary: "Write a one-sentence summary of your entire story. Focus on the core conflict and character goal.",
            characters: "Describe your main characters, their roles, motivations, and character arcs.",
            scenes: "Outline the key scenes that drive your plot forward. Focus on major turning points.",
            notes: "Add any additional notes, themes, research, or ideas that don't fit in other categories."
        };

        return prompts[stepId] || "Write your content here...";
    }

    // Toast notifications
    showToast(message, type = 'info', duration = 3000) {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <div class="toast-content">
                <span class="toast-message">${message}</span>
            </div>
            <button class="toast-close">&times;</button>
        `;

        container.appendChild(toast);

        // Add entrance animation
        setTimeout(() => {
            toast.classList.add('toast-enter');
        }, 10);

        // Close button
        const closeBtn = toast.querySelector('.toast-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.removeToast(toast);
            });
        }

        // Auto-remove
        if (duration > 0) {
            setTimeout(() => {
                this.removeToast(toast);
            }, duration);
        }

        this.toasts.push(toast);
        return toast;
    }

    removeToast(toast) {
        if (!toast || !toast.parentNode) return;

        toast.classList.add('toast-exit');
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
            this.toasts = this.toasts.filter(t => t !== toast);
        }, 300);
    }

    // Dropdown management
    toggleDropdown(dropdown) {
        if (!dropdown) return;

        const isVisible = dropdown.style.display === 'block';
        dropdown.style.display = isVisible ? 'none' : 'block';
        
        if (!isVisible) {
            // Position dropdown
            const userBtn = document.getElementById('user-menu');
            if (userBtn) {
                const rect = userBtn.getBoundingClientRect();
                dropdown.style.top = `${rect.bottom + 5}px`;
                dropdown.style.right = `${window.innerWidth - rect.right}px`;
            }
        }
    }

    // Modal management
    showModal(modalId, content) {
        // Implementation depends on your modal system
        // ...removed debug log...
    }

    closeAllModals() {
        // Implementation depends on your modal system
    }

    // Focus mode
    toggleFocusMode() {
        const editor = document.querySelector('.step-editor');
        if (!editor) return;

        const isFocusMode = document.body.classList.contains('focus-mode-active');
        
        if (isFocusMode) {
            document.body.classList.remove('focus-mode-active');
            document.exitFullscreen?.();
        } else {
            document.body.classList.add('focus-mode-active');
            editor.requestFullscreen?.();
        }
    }

    // Empty states
    renderEmptyStates() {
        // This would render various empty states throughout the app
    }

    // Update save indicator
    updateSaveIndicator(status) {
        const indicator = document.getElementById('save-indicator');
        if (!indicator) return;

        indicator.innerHTML = status === 'saving' 
            ? '<span class="saving">Saving...</span>'
            : status === 'saved'
            ? '<span class="saved">✓ Saved</span>'
            : status === 'error'
            ? '<span class="error">✗ Error</span>'
            : '<span>Auto-saved</span>';
    }
}

export const uiManager = new UIManager();