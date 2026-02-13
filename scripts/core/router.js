// Client-side routing for the application
export class Router {
    constructor() {
        this.routes = new Map();
        this.currentRoute = null;
        this.init();
    }

    init() {
        // Handle browser back/forward
        window.addEventListener('popstate', () => {
            this.handleRouteChange(window.location.pathname);
        });

        // Handle initial load
        this.handleRouteChange(window.location.pathname);
    }

    registerRoute(path, handler) {
        this.routes.set(path, handler);
    }

    navigate(path, state = {}, params={interface: 'default', projectid: '' }) {
        const queryParams = new URLSearchParams({ interface: params.interface, projectid: params.projectid });
        window.history.pushState({}, '', `/?${queryParams.toString()}`);
        this.handleRouteChange(params);
        console.log('Navigated to:', path);
    }

    handleRouteChange(params) {
        // Remove trailing slash
        // if (path !== '/' && path.endsWith('/')) {
        //     path = path.slice(0, -1);
        // }

        // Find matching route
        let matchedRoute = '/';
        // let params = {};

        // for (const [route, handler] of this.routes.entries()) {
        //     if (route === path) {
        //         matchedRoute = route;
        //         break;
        //     }

        //     // Check for parameterized routes
        //     if (route.includes(':')) {
        //         const routeParts = route.split('/');
        //         const pathParts = path.split('/');

        //         if (routeParts.length === pathParts.length) {
        //             let match = true;
        //             const routeParams = {};

        //             for (let i = 0; i < routeParts.length; i++) {
        //                 if (routeParts[i].startsWith(':')) {
        //                     const paramName = routeParts[i].slice(1);
        //                     routeParams[paramName] = pathParts[i];
        //                 } else if (routeParts[i] !== pathParts[i]) {
        //                     match = false;
        //                     break;
        //                 }
        //             }

        //             if (match) {
        //                 matchedRoute = route;
        //                 params = routeParams;
        //                 break;
        //             }
        //         }
        //     }
        // }
        // const queryParams = this.getQueryParams();
        // console.log(queryParams, this.getQueryParams(), 'thaisdads');
        if (this.routes.has(params.interface)) {
            this.currentRoute = matchedRoute;
            console.log('Handling route:', params.projectid, params);
            this.routes.get(params.interface)(params);
            // console.log(matchedRoute, this.routes.has(matchedRoute), params, path);
            return;
            
        } // else if (params.interface !== '/') {
        //     // Default route, but avoid infinite recursion
        //     this.navigate('/');
        // }
    }

    getQueryParams() {
        const params = new URLSearchParams(window.location.search);
        const interfaceType = params.get('interface'); // e.g., "editor"
        const projectId = params.get('projectid');     // e.g., "3Gqsw7ll2mmBW7PKWuGX"
        return { interface: interfaceType, id: projectId };
    }

    // Application-specific routes
    setupAppRoutes() {
        this.registerRoute('/', () => {
            this.showDashboard();
        });

        this.registerRoute('project', (params) => {
            this.showProject(params.projectid);
        });

        this.registerRoute('editor', (params) => {
            console.log(params, 'params in project route');
            this.showEditor(params.projectid);
        });

        // // Handle auth redirects
        // const urlParams = this.getQueryParams();
        // console.log(urlParams, 'initial url params');
        // if (urlParams.interface === 'editor' && urlParams.projectid) {
        //     console.log('Loading project from URL param:', urlParams.projectid);
        //     const projectId = urlParams.projectid;
        //     window.dispatchEvent(new CustomEvent('loadProject', {
        //     detail: { projectId }
        // }));
            // // Clean up URL
            // window.history.replaceState({}, '', window.location.pathname);
        // }
    }

    showDashboard() {
        // Show dashboard, hide editor
        const dashboard = document.getElementById('dashboard');
        const editor = document.getElementById('editor');
        const sidebar = document.getElementById('sidebar');
        const fab = document.getElementById('fab');

        if (dashboard) dashboard.style.display = 'block';
        if (editor) editor.style.display = 'none';
        if (sidebar) sidebar.style.display = 'none';
        if (fab) fab.style.display = 'none';

        // Update active state in navigation
        this.updateActiveNav('dashboard');
    }

    showProject(projectId) {
        // This would load the project and show editor
        // Implementation depends on your app structure
        console.log('Show project:', projectId);
        
        // For now, navigate to editor
        // this.navigate(`/editor/${projectId}`);
    }

    showEditor(projectId) {
        // Show editor, hide dashboard
        const dashboard = document.getElementById('dashboard');
        const editor = document.getElementById('editor');
        const sidebar = document.getElementById('sidebar');
        const fab = document.getElementById('fab');

        if (dashboard) dashboard.style.display = 'none';
        if (editor) editor.style.display = 'block';
        if (sidebar) sidebar.style.display = 'flex';
        if (fab) fab.style.display = 'none';
        
        // Update active state in navigation
        this.updateActiveNav('editor');
        console.log('Show editor for project:', projectId);
        

        // Hamburger menu for sidebar (mobile, CSS-driven)
        const hamburger = document.getElementById('sidebar-hamburger');
        // hamburger.style.display = 'block';
        if (hamburger) {
            hamburger.addEventListener('click', () => {
                console.log('sidebar-open/close')
                sidebar.classList.toggle('open');
                // if (sidebar.classList.contains('open')) {hamburger.style.position = 'fixed !important';} else {hamburger.style.position = 'absolute !important';}
            });
        }
        
        
        
    }

    updateActiveNav(activeView) {
        // Update any navigation indicators if needed
        const navItems = document.querySelectorAll('[data-nav]');
        navItems.forEach(item => {
            if (item.dataset.nav === activeView) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    }

    getCurrentRoute() {
        return this.currentRoute;
    }

    getQueryParams() {
        const params = new URLSearchParams(window.location.search);
        const result = {};
        for (const [key, value] of params.entries()) {
            result[key] = value;
        }
        return result;
    }
}

export const router = new Router();