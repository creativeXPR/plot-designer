// Sidebar component for Snowflake steps
import { DragDropManager } from '../modules/drag-drop.js';

export class Sidebar {
    constructor(options = {}) {
        this.container = document.getElementById('sidebar');
        this.stepsContainer = document.getElementById('snowflake-steps');
        this.onStepSelect = options.onStepSelect;
        this.onStepReorder = options.onStepReorder;
        this.dragDropManager = null;
        this.currentProject = null;
        this.init();
    }

    init() {
        if (!this.container || !this.stepsContainer) return;
        
        // Listen for step clicks
        this.stepsContainer.addEventListener('click', (e) => {
            const stepItem = e.target.closest('.step-item');
            if (stepItem && !e.target.closest('.drag-handle')) {
                const stepId = stepItem.dataset.stepId;
                this.selectStep(stepId);
            }
        });
    }

    render(project) {
        this.currentProject = project;
        // ...removed debug logs...
        if (!project || !project.steps) return;
        
        // Sort steps by order and keep keys
        const stepEntries = Object.entries(project.steps || {})
            .sort((a, b) => a[1].order - b[1].order);
        // ...removed debug logs...
        this.stepsContainer.innerHTML = stepEntries.map(([stepKey, step]) => {
            const isActive = stepKey === project.currentStep;
            const wordCount = step.wordCount || 0;
            // ARIA and keyboard support
            return `
                <div id="step-none" class="step-item ${isActive ? 'active' : ''}"
                     data-step-id="${stepKey}"
                     draggable="true"
                     role="option"
                     aria-selected="${isActive}"
                     tabindex="0"
                     aria-label="${step.title}, ${wordCount} words${step.completed ? ', completed' : ''}">
                    <div class="drag-handle" draggable="true" tabindex="0" role="button" aria-label="Reorder step ${step.title}" aria-grabbed="false">⋮⋮</div>
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
        this.initDragDrop();
        // Keyboard navigation
        this.setupKeyboardNavigation();

        // ...existing code...
        document.getElementById('edit-project').addEventListener('click', (e) => {
            // Remove any existing popup
            let oldPopup = document.getElementById('project-edit-popup');
            if (oldPopup) oldPopup.remove();

            // Create popup
            const popup = document.createElement('div');
            popup.id = 'project-edit-popup';
            popup.style.position = 'fixed';
            popup.style.left = window.screen.width/2 < e.clientX ? '10px' : e.clientX + 'px';
            popup.style.top = e.clientY + 'px';
            popup.style.zIndex = 9999;
            popup.className = 'project-edit-popup';

            popup.innerHTML = `
                <input type="text" id="project-edit-input" value="${document.getElementById('project-title').textContent}" />
                <button id="project-edit-save">Save</button>
            `;
            document.body.appendChild(popup);

            document.getElementById('project-edit-save').onclick = async () => {
                const newName = document.getElementById('project-edit-input').value;
                document.getElementById('project-title').textContent = newName;
                popup.remove();
                // Optionally: save to state/server here
                await window.firestoreService.updateProject(window.currentUser.uid, this.currentProject.id, { title: newName });
            };
        });
    }
    setupKeyboardNavigation() {
        // Focus and keyboard navigation for step items
        const items = this.stepsContainer.querySelectorAll('.step-item');
        items.forEach((item, idx) => {
            item.addEventListener('keydown', (e) => {
                if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    if (items[idx + 1]) items[idx + 1].focus();
                } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    if (items[idx - 1]) items[idx - 1].focus();
                } else if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    item.click();
                }
            });
        });
        // Drag handle keyboard support
        const handles = this.stepsContainer.querySelectorAll('.drag-handle');
        handles.forEach((handle, idx) => {
            handle.addEventListener('keydown', (e) => {
                if (e.key === ' ' || e.key === 'Enter') {
                    e.preventDefault();
                    // Optionally, trigger drag-and-drop via keyboard here
                    // For now, just focus the parent step
                    handle.closest('.step-item').focus();
                }
            });
        });
    }

    initDragDrop() {
        if (this.dragDropManager) {
            this.dragDropManager.destroy();
        }
        
        this.dragDropManager = new DragDropManager(
            this.stepsContainer,
            this.handleStepReorder.bind(this)
        );
    }

    selectStep(stepId) {
        // ...removed debug logs...
        if (!this.currentProject || this.currentProject.currentStep === stepId) return;

        // Update UI
        this.stepsContainer.querySelectorAll('.step-item').forEach(item => {
            item.classList.remove('active');
            if (item.dataset.stepId === stepId) {
                item.classList.add('active');
            }
        });

        // Call callback
        if (this.onStepSelect) {
            this.onStepSelect(stepId);
        }
    }

    async handleStepReorder(draggedId, targetId, position) {
        if (!this.currentProject || !this.onStepReorder) return;
        const stepEntries = Object.entries(this.currentProject.steps)
        .sort((a, b) => a[1].order - b[1].order);
        // Remove dragged step from list
        const filtered = stepEntries.filter(([key]) => key !== draggedId);
        let newOrder = {};
        if (position === 'top') {
            // Place dragged step first
            newOrder[draggedId] = 0;
            console.log('key', filtered)
            filtered.forEach(([key], idx) => {
                newOrder[key] = idx + 1;
            });
        } else if (position === 'bottom') {
            // Place dragged step last
            filtered.forEach(([key], idx) => {
                newOrder[key] = idx;
            });
            newOrder[draggedId] = filtered.length;
        } else {
            // fallback: keep order unchanged
            stepEntries.forEach(([key], idx) => {
                newOrder[key] = idx;
            });
        }
        // Optimistic UI update: render immediately
        this.render({
            ...this.currentProject,
            steps: stepEntries.reduce((acc, [key, step]) => {
                acc[key] = {
                    ...step,
                    order: newOrder[key]
                };
                return acc;
            }, {})
        });
        // Update backend in background, do not re-render after
        this.onStepReorder(newOrder);
    }

    updateStepCompletion(stepId, completed) {
        const stepItem = this.stepsContainer.querySelector(`[data-step-id="${stepId}"]`);
        if (!stepItem) return;
        
        const check = stepItem.querySelector('.completion-check');
        if (check) {
            check.classList.toggle('checked', completed);
        }
    }

    updateStepWordCount(stepId, wordCount) {
        const stepItem = this.stepsContainer.querySelector(`[data-step-id="${stepId}"]`);
        if (!stepItem) return;
        
        const wordCountEl = stepItem.querySelector('.step-completion span');
        if (wordCountEl) {
            wordCountEl.textContent = `${wordCount} words`;
        }
    }
   
    destroy() {
        if (this.dragDropManager) {
            this.dragDropManager.destroy();
            this.dragDropManager = null;
        }
        
        this.stepsContainer.removeEventListener('click', this.handleStepClick);
    }
}