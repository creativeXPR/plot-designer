// Main application entry point
import { authService } from './modules/firebase/auth.js';
import { firestoreService } from './modules/firebase/firestore.js';
import { templateManager } from './modules/templates.js';
import { themeManager } from './modules/theme.js';
import { exporter } from './modules/exporter.js';
import { appState } from './core/app-state.js';
import { router } from './core/router.js';
import { uiManager } from './core/ui-manager.js';
import { Sidebar } from './components/sidebar.js';
import { Editor } from './components/editor.js';
import { authModal } from './components/auth-modal.js';

import { Fab } from './components/fab.js';
import { Modal } from './components/modal.js';
import { Toast } from './components/toast.js';

import { Onboarding } from './components/onboarding.js';

class PlotDesignerApp {
    constructor() {
        this.sidebar = null;
        this.editor = null;
        this.currentProjectId = null;
        this.isDemoMode = false;
        this.init();
    }

    async init() {
        // Show snowflake spinner on load
        this.showSpinner();
        // Setup event listeners
        this.setupEventListeners();
        // Setup router
        await router.setupAppRoutes();
        // Check authentication state
        await this.checkAuthState();
        // Load templates
        this.loadTemplates();
        // Show onboarding for first-time users
        if (!localStorage.getItem('plot-designer-onboarding')) {
            setTimeout(() => Onboarding.show(), 400);
        }
        // Initialize Floating Action Button
        this.fab = new Fab({
            onClick: () => this.openCreateProjectModal()
        });
        // Initialize theme
        themeManager.init();
    }

    showSpinner() {
        if (!document.getElementById('snowflake-spinner')) {
            const spinner = document.createElement('div');
            spinner.id = 'snowflake-spinner';
            spinner.innerHTML = `
                <div class="spinner-center">
                    <div class="snowflake-spinner">❄️</div>
                </div>
            `;
            spinner.style.position = 'fixed';
            spinner.style.top = '0';
            spinner.style.left = '0';
            spinner.style.width = '100vw';
            spinner.style.height = '100vh';
            spinner.style.display = 'flex';
            spinner.style.alignItems = 'center';
            spinner.style.justifyContent = 'center';
            spinner.style.background = 'var(--color-bg, #f8fafc)';
            spinner.style.zIndex = '9999';
            document.body.appendChild(spinner);
            // Add animation via CSS
            const style = document.createElement('style');
            style.id = 'snowflake-spinner-style';
            style.textContent = `
                .spinner-center {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    height: 100vh;
                }
                .snowflake-spinner {
                    font-size: 4rem;
                    animation: snowflake-spin 1.2s linear infinite;
                    display: inline-block;
                }
                @keyframes snowflake-spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `;
            document.head.appendChild(style);
        }
    }

    hideSpinner() {
        const spinner = document.getElementById('snowflake-spinner');
        if (spinner) spinner.remove();
        const style = document.getElementById('snowflake-spinner-style');
        if (style) style.remove();
    }

    async checkAuthState() {
        // Show spinner until auth state is known
        authService.onAuthStateChange((user) => {
            this.hideSpinner();
            if (user) {
                appState.setUser(user);
                uiManager.showMainApp();
                this.loadUserProjects(user.uid);
                const urlParams = router.getQueryParams();
                if (urlParams.interface === 'editor' && urlParams.projectid) {
                    const projectId = urlParams.projectid;
                    this.loadProject(projectId);
                }
                window.currentUser = user;
            } else {
                // Redirect to auth.html if not authenticated
                window.location.href = 'auth.html';
            }
        });
    }

    setupEventListeners() {
        // Auth events
        window.addEventListener('googleSignin', () => this.handleGoogleSignIn());
        window.addEventListener('demoSignin', () => this.handleDemoSignIn());
        window.addEventListener('signout', () => this.handleSignOut());
        
        // Project events
        window.addEventListener('createProject', (e) => this.createProject(e.detail.templateId));
        window.addEventListener('loadProject', (e) => this.loadProject(e.detail.projectId));
        window.addEventListener('updateStep', (e) => this.updateStep(e.detail.stepId, e.detail.content));
        window.addEventListener('exportProject', () => this.exportProject());
        window.addEventListener('loadDashboard', () => this.loadDashboard());
        
        // Drag and drop initialization
        window.addEventListener('initDragDrop', () => {
            if (this.sidebar) {
                this.sidebar.initDragDrop();
            }
        });
        
        // App state changes
        appState.on('userChanged', (user) => this.handleUserChange(user));
        appState.on('projectsChanged', (projects) => uiManager.renderProjectsList(projects));
        appState.on('projectChanged', (project) => this.handleProjectChange(project));
    }

    openCreateProjectModal() {
        Modal.open({
            title: 'Create New Project',
            content: `
                <form id="create-project-form" onsubmit="return false;">
                    <label for="project-title-input">Project Title</label>
                    <input id="project-title-input" name="title" type="text" class="input" required autofocus placeholder="e.g. My Epic Novel" style="width:100%;margin-bottom:1rem;">
                </form>
            `,
            actions: [
                {
                    label: 'Create',
                    className: 'btn-primary',
                    onClick: async () => {
                        const input = document.getElementById('project-title-input');
                        if (input && input.value.trim()) {
                            Modal.close();
                            await this.createProjectWithTitle(input.value.trim());
                        } else {
                            Toast.show('Please enter a project title.', { type: 'error' });
                        }
                    }
                },
                {
                    label: 'Cancel',
                    onClick: Modal.close
                }
            ]
        });
    }

    async createProjectWithTitle(title) {
        const user = appState.getCurrentUser();
        if (!user) {
            Toast.show('Please sign in to create a project', { type: 'error' });
            return;
        }
        const projectData = {
            title,
            description: 'A new writing project',
            templateId: null
        };
        const result = await firestoreService.createProject(user.uid, projectData);
        if (result.success) {
            Toast.show('Project created successfully', { type: 'success' });
            this.loadProject(result.project.id);
        } else {
            Toast.show(`Failed to create project: ${result.error}`, { type: 'error' });
        }
    }
    async handleGoogleSignIn() {
        const result = await authService.signInWithGoogle();
        if (!result.success) {
            uiManager.showToast(`Sign in failed: ${result.error}`, 'error');
        }
    }

    handleDemoSignIn() {
        const demoUser = authService.getDemoUser();
        localStorage.setItem('plot-designer-user', JSON.stringify(demoUser));
        this.isDemoMode = true;
        appState.setUser(demoUser);
        uiManager.showMainApp();
        uiManager.showToast('Welcome to Demo Mode! Your work will be saved locally.', 'info', 5000);
    }

    async handleSignOut() {
        if (this.isDemoMode) {
            localStorage.removeItem('plot-designer-user');
            localStorage.removeItem('plot-designer-projects');
            this.isDemoMode = false;
        } else {
            await authService.signOutUser();
        }
        
        appState.setUser(null);
        appState.setProjects([]);
        appState.setCurrentProject(null);
        uiManager.showAuthScreen();
        firestoreService.cleanup();
    }

    handleUserChange(user) {
        if (user) {
            this.loadUserProjects(user.uid);
        }
    }

    async loadUserProjects(userId) {
        const unsubscribe = firestoreService.subscribeToProjectsList(
            userId,
            (result) => {
                if (result.success) {
                    appState.setProjects(result.projects);
                } else {
                    console.error('Failed to load projects:', result.error);
                }
            }
        );
        
        appState.setProjectsUnsubscribe(unsubscribe);
    }

    loadTemplates() {
        const templates = templateManager.getAllTemplates();
        uiManager.renderTemplates(templates);
    }

    loadDashboard() {
        this.loadTemplates();
        // Projects are loaded via subscription
    }

    async createProject(templateId = null) {
        const user = appState.getCurrentUser();
        if (!user) {
            uiManager.showToast('Please sign in to create a project', 'error');
            return;
        }

        const template = templateId ? templateManager.getTemplate(templateId) : null;
        const projectData = {
            title: template ? `${template.name} Project` : 'Untitled Project',
            templateId: templateId,
            description: template?.description || 'A new writing project'
        };

        const result = await firestoreService.createProject(user.uid, projectData);
        
        if (result.success) {
            uiManager.showToast('Project created successfully', 'success');
            this.loadProject(result.project.id);
        } else {
            uiManager.showToast(`Failed to create project: ${result.error}`, 'error');
        }
    }

    async loadProject(projectId) {
        const user = appState.getCurrentUser();
        if (!user) return;
        // ...removed debug log...

        this.currentProjectId = projectId;
        appState.setCurrentProjectId(projectId);
        
        // Show loading state
        appState.setLoading(true);

        // Subscribe to project updates
        // ...removed debug log...
        const unsubscribe = firestoreService.subscribeToProject(
            user.uid,
            projectId,
            (result) => {
                appState.setLoading(false);
                
                if (result.success) {
                    // ...removed debug log...
                    appState.setCurrentProject(result.project);
                } else {
                    uiManager.showToast(`Failed to load project: ${result.error}`, 'error');
                    router.navigate('/');
                }
            }
        );

        appState.setProjectUnsubscribe(unsubscribe);
        
        // Navigate to editor view
        // if (router.getQueryParams().interface === 'editor' && router.getQueryParams().id === projectId) return;
        // ...removed debug log...
        router.navigate(`/`, {}, { interface: 'editor', projectid: projectId });
    }

    handleProjectChange(project) {
        if (!project) return;
        
        // Initialize sidebar if needed
        if (!this.sidebar) {
            this.sidebar = new Sidebar({
                onStepSelect: (stepId) => this.selectStep(stepId),
                onStepReorder: (newOrder) => this.reorderSteps(newOrder)
            });
        }
        
        // Initialize editor if needed
        if (!this.editor) {
            this.editor = new Editor({
                onContentUpdate: (stepId, content) => this.updateStep(stepId, content)
            });
        }
        
        // Update UI
        this.sidebar.render(project);
        // ...removed debug log...
        const currentStep = project.steps[project.currentStep];
        // ...removed debug log...
        if (currentStep) {
            // ...removed debug log...
            this.editor.render(currentStep);
        } else {
                // ...removed debug log...
                const firstStep = Object.keys(project.steps).length > 0 ? project.steps[Object.keys(project.steps)[0]] : null;
                if (firstStep) {
                    // ...removed debug log...
                    firestoreService.updateProject(window.currentUser.uid, project.id, { currentStep: Object.keys(project.steps)[0] });
                }
        }
    }

    async selectStep(stepId) {
        const user = appState.getCurrentUser();
        const projectId = this.currentProjectId;
        
        if (user && projectId) {
            await firestoreService.updateProject(user.uid, projectId, { currentStep: stepId });
        }
    }

    async updateStep(stepId, content) {
        const user = appState.getCurrentUser();
        const projectId = this.currentProjectId;
        
        if (user && projectId) {
            const result = await firestoreService.updateStep(user.uid, projectId, stepId, content);
            
            if (result.success && this.sidebar) {
                this.sidebar.updateStepWordCount(stepId, result.wordCount);
                this.sidebar.updateStepCompletion(stepId, content.trim().length > 0);
            } else if (!result.success) {
                uiManager.showToast(`Failed to save: ${result.error}`, 'error');
                this.editor?.showErrorIndicator();
            }
        }
    }

    async reorderSteps(newOrder) {
        const user = appState.getCurrentUser();
        const projectId = this.currentProjectId;
        
        if (user && projectId) {
            await firestoreService.reorderSteps(user.uid, projectId, newOrder);
        }
    }

    async exportProject() {
        const project = appState.getCurrentProject();
        if (!project) {
            uiManager.showToast('No project to export', 'error');
            return;
        }

        try {
            // For now, export as Markdown
            const result = await exporter.exportProject(project, 'markdown');
            
            // Create download link
            const a = document.createElement('a');
            a.href = result.url;
            a.download = result.filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            
            // Clean up URL
            URL.revokeObjectURL(result.url);
            
            uiManager.showToast('Project exported successfully', 'success');
        } catch (error) {
            uiManager.showToast(`Export failed: ${error.message}`, 'error');
        }
    }

    // Clean up on page unload
    cleanup() {
        firestoreService.cleanup();
        appState.cleanup();
        
        if (this.sidebar) {
            this.sidebar.destroy();
        }
        
        if (this.editor) {
            this.editor.destroy();
        }
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.plotDesignerApp = new PlotDesignerApp();
});

// Clean up on page unload
window.addEventListener('beforeunload', () => {
    if (window.plotDesignerApp) {
        window.plotDesignerApp.cleanup();
    }
});