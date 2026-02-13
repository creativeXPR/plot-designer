// Editor component for step content
export class Editor {
    constructor(options = {}) {
        this.container = document.getElementById('step-container');
        this.onContentUpdate = options.onContentUpdate;
        this.currentStep = null;
        this.saveTimeout = null;
        this.init();
    }

    init() {
        // Auto-save on input
        if (this.container) {
            this.container.addEventListener('input', (e) => {
                if (e.target.id === 'step-content') {
                    this.handleContentUpdate(e.target.value);
                }
            });
        }
    }

    render(step) {
        this.currentStep = step;
        let stepKey = null;
        for (const key in window.appState.currentProject.steps) {
            if (window.appState.currentProject.steps[key] === step) {
                stepKey = key;
                break;
            }
        }
        this.currentStepKey = stepKey;

        if (!this.container || !step) return;

        // --- Preserve textarea focus and selection ---
        let prevTextarea = document.getElementById('step-content');
        let wasFocused = false;
        let selectionStart = 0, selectionEnd = 0;
        if (prevTextarea && document.activeElement === prevTextarea) {
            wasFocused = true;
            selectionStart = prevTextarea.selectionStart;
            selectionEnd = prevTextarea.selectionEnd;
        }

        const wordCount = step.content.trim().split(/\s+/).filter(w => w.length > 0).length;
        const charCount = step.content.length;
        const charCountClass = charCount > 1000 ? 'warning' : charCount > 2000 ? 'error' : '';

        this.container.innerHTML = `
            <div class="step-editor" role="region" aria-label="Step editor for ${step.title ? step.title : ''}">
                <div class="step-header">
                    <div class="step-header-icon" aria-hidden="true">${step.icon}</div>
                    <h2>${step.title ? step.title : ''}</h2>
                </div>
                <div class="step-prompt" id="step-prompt" aria-live="polite">
                    ${this.getStepPrompt(stepKey)}
                </div>
                <textarea id="step-content"
                          placeholder="Start typing your ${step.title ? step.title.toLowerCase() : ''}..."
                          rows="12"
                          aria-label="${step.title ? step.title : ''} content"
                          aria-describedby="step-prompt"
                          spellcheck="true"
                          style="resize:vertical;width:100%;min-height:6em;">${step.content || ''}</textarea>
                <div class="step-footer">
                    <div class="char-count ${charCountClass}">
                        ${wordCount} words • ${charCount} characters
                    </div>
                    <div class="save-indicator" id="save-indicator" aria-live="polite">
                        <span>Auto-saved</span>
                    </div>
                </div>
            </div>
        `;

        // Auto-resize textarea
        const textarea = document.getElementById('step-content');
        if (textarea) {
            this.adjustTextareaHeight(textarea);

            textarea.addEventListener('input', function() {
                this.style.height = 'auto';
                this.style.height = (this.scrollHeight) + 'px';
            });

            // --- Restore focus and selection if needed ---
            if (wasFocused) {
                textarea.focus();
                try {
                    textarea.setSelectionRange(selectionStart, selectionEnd);
                } catch (e) {}
            }
        }
    }

    handleContentUpdate(content) {
        if (!this.currentStep || !this.onContentUpdate) return;
        
        // Update character count
        const textarea = document.getElementById('step-content');
        if (textarea && textarea.value !== content) {
            textarea.value = content;
            this.adjustTextareaHeight(textarea);
        }

        // Update character count
        const wordCount = content.trim().split(/\s+/).filter(w => w.length > 0).length;
        const charCount = content.length;
        const charCountEl = document.querySelector('.char-count');
        if (charCountEl) {
            charCountEl.textContent = `${wordCount} words • ${charCount} characters`;
            charCountEl.className = `char-count ${charCount > 1000 ? 'warning' : charCount > 2000 ? 'error' : ''}`;
        }

        // Show saving indicator
        this.showSavingIndicator();

        // Debounce save
        clearTimeout(this.saveTimeout);
        this.saveTimeout = setTimeout(() => {
            this.onContentUpdate(this.currentStepKey, content);
            this.showSavedIndicator();
        }, 1000);
    }

    showSavingIndicator() {
        const indicator = document.getElementById('save-indicator');
        if (indicator) {
            indicator.innerHTML = '<span class="saving">Saving...</span>';
        }
    }

    showSavedIndicator() {
        const indicator = document.getElementById('save-indicator');
        if (indicator) {
            indicator.innerHTML = '<span class="saved">✓ Saved</span>';
            
            // Reset after 2 seconds
            setTimeout(() => {
                if (indicator) {
                    indicator.innerHTML = '<span>Auto-saved</span>';
                }
            }, 2000);
        }
    }

    showErrorIndicator() {
        const indicator = document.getElementById('save-indicator');
        if (indicator) {
            indicator.innerHTML = '<span class="error">✗ Error</span>';
        }
    }

    adjustTextareaHeight(textarea) {
        if (!textarea) return;
        
        textarea.style.height = 'auto';
        textarea.style.height = (textarea.scrollHeight) + 'px';
    }

    getStepPrompt(stepId) {
        const prompts = {
            summary: "Write a one-sentence summary of your entire story. Focus on the core conflict and character goal. Try to keep it under 25 words.",
            characters: "Describe your main characters, their roles, motivations, and character arcs. Include their goals, fears, and how they change throughout the story.",
            scenes: "Outline the key scenes that drive your plot forward. Focus on major turning points, conflicts, and character development moments.",
            notes: "Add any additional notes, themes, research, or ideas that don't fit in other categories. This is your free-form space for brainstorming."
        };
        
        return prompts[stepId] || "Write your content here...";
    }

    updateContent(content) {
        const textarea = document.getElementById('step-content');
        if (textarea) {
            textarea.value = content;
            this.adjustTextareaHeight(textarea);
        }
    }

    destroy() {
        clearTimeout(this.saveTimeout);
        this.saveTimeout = null;
    }
}