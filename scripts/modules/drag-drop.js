// Drag and Drop functionality for Snowflake steps
export class DragDropManager {
        _rafId = null;
        _pendingDeltaY = null;
    constructor(container, onReorder) {
        this.container = container;
        this.onReorder = onReorder;
        this.draggedItem = null;
        this.dragStartY = 0;
        this.dragEndY = 0;
        this.init();
    }

    init() {
        this.container.addEventListener('dragstart', this.handleDragStart.bind(this));
        this.container.addEventListener('dragover', this.handleDragOver.bind(this));
        this.container.addEventListener('drop', this.handleDrop.bind(this));
        this.container.addEventListener('dragend', this.handleDragEnd.bind(this));
        
        // Touch events for mobile
        this.container.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
        this.container.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
        this.container.addEventListener('touchend', this.handleTouchEnd.bind(this));
    }

    handleDragStart(e) {
        // Only allow drag from drag-handle
        if (!e.target.classList.contains('drag-handle')) return;

        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', '');

        this.draggedItem = e.target.closest('.step-item');
        this.draggedItem.classList.add('dragging');
        this.dragStartY = e.clientY;
        this._pendingDeltaY = 0;
        this._rafId = null;
        // Set drag image to be the step item
        const dragImage = this.draggedItem.cloneNode(true);
        dragImage.style.width = `${this.draggedItem.offsetWidth}px`;
        dragImage.style.opacity = '0.8';
        dragImage.style.position = 'absolute';
        dragImage.style.top = '-1000px';
        document.body.appendChild(dragImage);
        e.dataTransfer.setDragImage(dragImage, 20, 20);
        setTimeout(() => document.body.removeChild(dragImage), 0);
        // Haptic feedback for mobile
        if (navigator.vibrate) navigator.vibrate(10);
    }

    handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        // For visual feedback, throttle transform update
        if (this.draggedItem) {
            const deltaY = e.clientY - this.dragStartY;
            this._pendingDeltaY = deltaY;
            if (!this._rafId) {
                this._rafId = requestAnimationFrame(() => {
                    if (this.draggedItem) {
                        this.draggedItem.style.transform = `translateY(${this._pendingDeltaY}px)`;
                    }
                    this._rafId = null;
                });
            }
        }
    }

    async handleDrop(e) {
        e.preventDefault();
        if (!this.draggedItem) return;
        // Fallback: if dragStartY is zero, set it to e.clientY
        if (!this.dragStartY) this.dragStartY = e.clientY;
        this.dragEndY = e.clientY;
        const draggedId = this.draggedItem.dataset.stepId;
        let position = null;
        if (this.dragEndY < this.dragStartY) {
            position = 'top';
        } else if (this.dragEndY > this.dragStartY) {
            position = 'bottom';
        }
        if (this.onReorder && position) {
            await this.onReorder(draggedId, null, position);
        }
        // Success haptic feedback
        if (navigator.vibrate) navigator.vibrate(20);
        // Mark that drop was handled
        this._dropHandled = true;
    }

    handleDragEnd() {
        // Reset transform on drag end
        if (this.draggedItem) {
            this.draggedItem.style.transform = '';
        }
        if (this._rafId) {
            cancelAnimationFrame(this._rafId);
            this._rafId = null;
        }
        this._pendingDeltaY = null;
        // If drop was not handled, fallback to reorder logic
        if (!this._dropHandled && this.draggedItem) {
            const draggedId = this.draggedItem.dataset.stepId;
            let position = null;
            if (this.dragEndY < this.dragStartY) {
                position = 'top';
            } else if (this.dragEndY > this.dragStartY) {
                position = 'bottom';
            }
            if (this.onReorder && position) {
                this.onReorder(draggedId, null, position);
            }
            if (navigator.vibrate) navigator.vibrate(20);
        }
        this._dropHandled = false;
        if (this.draggedItem) {
            this.draggedItem.classList.remove('dragging');
        }
        this.container.querySelectorAll('.step-item').forEach(item => {
            item.classList.remove('drag-over-before', 'drag-over-after');
        });
        this.draggedItem = null;
        this.dragStartY = 0;
        this.dragEndY = 0;
    }

    // Touch event handlers for mobile
    handleTouchStart(e) {
        const handle = e.target.closest('.drag-handle');
        if (!handle) return;
        
        this.draggedItem = handle.closest('.step-item');
        this.dragStartY = e.touches[0].clientY;
        this.draggedItem.classList.add('dragging');
        this._pendingDeltaY = 0;
        this._rafId = null;
        e.preventDefault();
    }

    handleTouchMove(e) {
        if (!this.draggedItem) return;
        e.preventDefault();
        const touch = e.touches[0];
        const deltaY = touch.clientY - this.dragStartY;
        this._pendingDeltaY = deltaY;
        if (!this._rafId) {
            this._rafId = requestAnimationFrame(() => {
                if (this.draggedItem) {
                    this.draggedItem.style.transform = `translateY(${this._pendingDeltaY}px)`;
                }
                this._rafId = null;
            });
        }
    }

    async handleTouchEnd() {
        // Reset transform on touch end
        if (this.draggedItem) {
            this.draggedItem.style.transform = '';
        }
        if (this._rafId) {
            cancelAnimationFrame(this._rafId);
            this._rafId = null;
        }
        this._pendingDeltaY = null;
        if (!this.draggedItem) {
            this.cleanupTouch();
            return;
        }
        const touch = event.changedTouches[0];
        this.dragEndY = touch.clientY;
        const draggedId = this.draggedItem.dataset.stepId;
        let position = null;
        if (this.dragEndY < this.dragStartY) {
            position = 'top';
        } else if (this.dragEndY > this.dragStartY) {
            position = 'bottom';
        }
        // Reset transform
        if (this.onReorder && position) {
            await this.onReorder(draggedId, null, position);
        }
        this.cleanupTouch();
        if (navigator.vibrate) navigator.vibrate(20);
    }

    cleanupTouch() {
        if (this._rafId) {
            cancelAnimationFrame(this._rafId);
            this._rafId = null;
        }
        this._pendingDeltaY = null;
        if (this.draggedItem) {
            this.draggedItem.classList.remove('dragging');
            this.draggedItem.style.transform = '';
        }
        this.container.querySelectorAll('.step-item').forEach(item => {
            item.classList.remove('drag-over-before', 'drag-over-after');
        });
        this.draggedItem = null;
        this.dragStartY = 0;
        this.dragEndY = 0;
    }

    destroy() {
        this.container.removeEventListener('dragstart', this.handleDragStart);
        this.container.removeEventListener('dragover', this.handleDragOver);
        this.container.removeEventListener('drop', this.handleDrop);
        this.container.removeEventListener('dragend', this.handleDragEnd);
        
        this.container.removeEventListener('touchstart', this.handleTouchStart);
        this.container.removeEventListener('touchmove', this.handleTouchMove);
        this.container.removeEventListener('touchend', this.handleTouchEnd);
    }
}