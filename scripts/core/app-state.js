// Central state management for the application
class AppState {
    constructor() {
        this.currentUser = null;
        this.currentProject = null;
        this.currentProjectId = null;
        this.projects = [];
        this.templates = [];
        this.isLoading = false;
        this.listeners = new Map();
        this.unsubscribes = {
            projects: null,
            project: null
        };
    }

    // User management
    setUser(user) {
        this.currentUser = user;
        this.emit('userChanged', user);
        
        // Update UI elements
        this.updateUserUI(user);
    }

    updateUserUI(user) {
        const avatar = document.getElementById('user-avatar');
        const dropdownAvatar = document.getElementById('dropdown-avatar');
        const dropdownName = document.getElementById('dropdown-name');
        const dropdownEmail = document.getElementById('dropdown-email');
        const avatarInitials = document.getElementById('avatar-initials');
        const dropdownInitials = document.getElementById('dropdown-initials');

        if (user) {
            const initials = user.initials || 'U';
            
            if (avatarInitials) avatarInitials.textContent = initials;
            if (dropdownInitials) dropdownInitials.textContent = initials;
            if (dropdownName) dropdownName.textContent = user.displayName || 'User';
            if (dropdownEmail) dropdownEmail.textContent = user.email || '';
            
            if (user.photoURL && avatar) {
                avatar.innerHTML = `<img src="${user.photoURL}" alt="${user.displayName}" class="avatar-img">`;
            }
        }
    }

    // Project management
    setProjects(projects) {
        this.projects = projects;
        this.emit('projectsChanged', projects);
    }

    setCurrentProject(project) {
        this.currentProject = project;
        this.currentProjectId = project?.id || null;
        this.emit('projectChanged', project);
        
        // Update UI
        this.updateProjectUI(project);
        // ...removed debug log...
    }

    updateProjectUI(project) {
        const projectTitle = document.getElementById('project-title');
        const editorProjectTitle = document.getElementById('editor-project-title');
        const lastEdited = document.getElementById('last-edited-time');
        const totalWords = document.getElementById('total-words');

        if (project) {
            if (projectTitle) projectTitle.textContent = project.title;
            if (editorProjectTitle) editorProjectTitle.textContent = project.title;
            
            if (lastEdited) {
                const date = new Date(project.updatedAt);
                lastEdited.textContent = date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            }
            
            if (totalWords) {
                const wordCount = Object.values(project.steps || {}).reduce((total, step) => total + (step.wordCount || 0), 0);
                totalWords.textContent = wordCount.toLocaleString();
            }
        }
    }

    setCurrentProjectId(projectId) {
        this.currentProjectId = projectId;
    }

    // Loading state
    setLoading(loading) {
        this.isLoading = loading;
        this.emit('loadingChanged', loading);
    }

    // Subscription management
    setProjectsUnsubscribe(unsubscribe) {
        if (this.unsubscribes.projects) {
            this.unsubscribes.projects();
        }
        this.unsubscribes.projects = unsubscribe;
    }

    setProjectUnsubscribe(unsubscribe) {
        if (this.unsubscribes.project) {
            this.unsubscribes.project();
        }
        this.unsubscribes.project = unsubscribe;
    }

    // Clean up all subscriptions
    cleanup() {
        Object.values(this.unsubscribes).forEach(unsubscribe => {
            if (unsubscribe) unsubscribe();
        });
        this.unsubscribes = {
            projects: null,
            project: null
        };
    }

    // Event system
    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
        
        // Return unsubscribe function
        return () => {
            const callbacks = this.listeners.get(event) || [];
            this.listeners.set(event, callbacks.filter(cb => cb !== callback));
        };
    }

    emit(event, data) {
        const callbacks = this.listeners.get(event) || [];
        callbacks.forEach(callback => callback(data));
    }

    // Getters
    getCurrentUser() {
        return this.currentUser;
    }

    getCurrentProject() {
        return this.currentProject;
    }

    getCurrentProjectId() {
        return this.currentProjectId;
    }

    getProjects() {
        return this.projects;
    }

    getIsLoading() {
        return this.isLoading;
    }
}

// Export singleton instance
export const appState = new AppState();
window.appState = appState;