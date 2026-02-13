
import { 
    getFirestore, 
    doc, 
    collection, 
    setDoc, 
    getDoc, 
    updateDoc, 
    deleteDoc,
    query,
    where,
    orderBy,
    onSnapshot,
    serverTimestamp,
    writeBatch
} from "https://www.gstatic.com/firebasejs/12.8.0/firebase-firestore.js";
import { app } from './config.js';

const db = getFirestore(app);

// Local storage fallback for demo mode
const isDemoMode = () => {
    const user = JSON.parse(localStorage.getItem('plot-designer-user') || 'null');
    return user && user.isDemo;
};

const getDemoProjects = () => {
    return JSON.parse(localStorage.getItem('plot-designer-projects') || '[]');
};

const saveDemoProjects = (projects) => {
    localStorage.setItem('plot-designer-projects', JSON.stringify(projects));
};

export class FirestoreService {
    constructor() {
        this.db = db;
        this.unsubscribes = new Map();
    }

    // Save or update user profile in Firestore
    async saveUserProfile(user) {
        if (!user || isDemoMode()) return;
        try {
            const userRef = doc(this.db, 'users', user.uid);
            const userData = {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName || '',
                photoURL: user.photoURL || '',
                lastSignIn: serverTimestamp(),
                feedbacks: [],
            };
            // Only set feedbacks to [] if not present (merge true)
            await setDoc(userRef, userData, { merge: true });
        } catch (error) {
            console.error('Error saving user profile:', error);
        }
    }

    // Create new project
    async createProject(userId, projectData) {
        if (isDemoMode()) {
            return this.createDemoProject(projectData);
        }

        try {
            const projectRef = doc(collection(this.db, 'users', userId, 'projects'));
            const project = {
                ...projectData,
                id: projectRef.id,
                userId,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                steps: {
                    summary: { 
                        content: '', 
                        order: 0,
                        title: 'One-Sentence Summary',
                        icon: '💡',
                        completed: false
                    },
                    characters: { 
                        content: '', 
                        order: 1,
                        title: 'Main Characters', 
                        icon: '👤',
                        completed: false
                    },
                    scenes: { 
                        content: '', 
                        order: 2,
                        title: 'Key Scenes', 
                        icon: '🎬',
                        completed: false
                    },
                    notes: { 
                        content: '', 
                        order: 3,
                        title: 'Additional Notes', 
                        icon: '📝',
                        completed: false
                    }
                },
                currentStep: 'summary',
                wordCount: 0
            };

            await setDoc(projectRef, project);
            return { success: true, project };
        } catch (error) {
            console.error('Create project error:', error);
            return { success: false, error: error.message };
        }
    }

    // Demo project creation
    createDemoProject(projectData) {
        const projects = getDemoProjects();
        const project = {
            ...projectData,
            id: `demo-${Date.now()}`,
            userId: 'demo-user-id',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            steps: {
                summary: { 
                    content: '', 
                    order: 0,
                    title: 'One-Sentence Summary',
                    icon: '💡',
                    completed: false
                },
                characters: { 
                    content: '', 
                    order: 1,
                    title: 'Main Characters', 
                    icon: '👤',
                    completed: false
                },
                scenes: { 
                    content: '', 
                    order: 2,
                    title: 'Key Scenes', 
                    icon: '🎬',
                    completed: false
                },
                notes: { 
                    content: '', 
                    order: 3,
                    title: 'Additional Notes', 
                    icon: '📝',
                    completed: false
                }
            },
            currentStep: 'summary',
            wordCount: 0
        };

        projects.push(project);
        saveDemoProjects(projects);
        
        // Simulate async operation
        return new Promise(resolve => {
            setTimeout(() => {
                resolve({ success: true, project });
            }, 300);
        });
    }

    // Get project by ID
    async getProject(userId, projectId) {
        if (isDemoMode()) {
            return this.getDemoProject(projectId);
        }

        try {
            const projectRef = doc(this.db, 'users', userId, 'projects', projectId);
            const projectSnap = await getDoc(projectRef);
            
            if (projectSnap.exists()) {
                const data = projectSnap.data();
                return { 
                    success: true, 
                    project: { 
                        id: projectSnap.id, 
                        ...data,
                        createdAt: data.createdAt?.toDate?.() || new Date(),
                        updatedAt: data.updatedAt?.toDate?.() || new Date()
                    } 
                };
            } else {
                return { success: false, error: 'Project not found' };
            }
        } catch (error) {
            console.error('Get project error:', error);
            return { success: false, error: error.message };
        }
    }

    getDemoProject(projectId) {
        const projects = getDemoProjects();
        const project = projects.find(p => p.id === projectId);
        
        if (project) {
            return { success: true, project };
        } else {
            return { success: false, error: 'Project not found' };
        }
    }

    // Update project
    async updateProject(userId, projectId, updates) {
        if (isDemoMode()) {
            return this.updateDemoProject(projectId, updates);
        }

        try {
            const projectRef = doc(this.db, 'users', userId, 'projects', projectId);
            await updateDoc(projectRef, {
                ...updates,
                updatedAt: serverTimestamp()
            });
            return { success: true };
        } catch (error) {
            console.error('Update project error:', error);
            return { success: false, error: error.message };
        }
    }

    updateDemoProject(projectId, updates) {
        const projects = getDemoProjects();
        const projectIndex = projects.findIndex(p => p.id === projectId);
        
        if (projectIndex !== -1) {
            projects[projectIndex] = {
                ...projects[projectIndex],
                ...updates,
                updatedAt: new Date().toISOString()
            };
            saveDemoProjects(projects);
            
            return new Promise(resolve => {
                setTimeout(() => {
                    resolve({ success: true });
                }, 300);
            });
        }
        
        return { success: false, error: 'Project not found' };
    }

    // Update step content
    async updateStep(userId, projectId, stepId, content) {
        if (isDemoMode()) {
            return this.updateDemoStep(projectId, stepId, content);
        }

        try {
            const projectRef = doc(this.db, 'users', userId, 'projects', projectId);
            const wordCount = content.trim().split(/\s+/).filter(word => word.length > 0).length;
            
            await updateDoc(projectRef, {
                [`steps.${stepId}.content`]: content,
                [`steps.${stepId}.completed`]: content.trim().length > 0,
                [`steps.${stepId}.wordCount`]: wordCount,
                updatedAt: serverTimestamp()
            });
            return { success: true, wordCount };
        } catch (error) {
            console.error('Update step error:', error);
            return { success: false, error: error.message };
        }
    }

    updateDemoStep(projectId, stepId, content) {
        const projects = getDemoProjects();
        const projectIndex = projects.findIndex(p => p.id === projectId);
        
        if (projectIndex !== -1) {
            const wordCount = content.trim().split(/\s+/).filter(word => word.length > 0).length;
            
            projects[projectIndex].steps[stepId].content = content;
            projects[projectIndex].steps[stepId].completed = content.trim().length > 0;
            projects[projectIndex].steps[stepId].wordCount = wordCount;
            projects[projectIndex].updatedAt = new Date().toISOString();
            
            saveDemoProjects(projects);
            
            return new Promise(resolve => {
                setTimeout(() => {
                    resolve({ success: true, wordCount });
                }, 300);
            });
        }
        
        return { success: false, error: 'Project not found' };
    }

    // Reorder steps
    async reorderSteps(userId, projectId, stepsOrder) {
        if (isDemoMode()) {
            return this.reorderDemoSteps(projectId, stepsOrder);
        }

        try {
            const projectRef = doc(this.db, 'users', userId, 'projects', projectId);
            const updates = {};
            
            Object.entries(stepsOrder).forEach(([stepId, order]) => {
                updates[`steps.${stepId}.order`] = order;
            });
            
            updates.updatedAt = serverTimestamp();
            
            await updateDoc(projectRef, updates);
            return { success: true };
        } catch (error) {
            console.error('Reorder steps error:', error);
            return { success: false, error: error.message };
        }
    }

    reorderDemoSteps(projectId, stepsOrder) {
        const projects = getDemoProjects();
        const projectIndex = projects.findIndex(p => p.id === projectId);
        
        if (projectIndex !== -1) {
            Object.entries(stepsOrder).forEach(([stepId, order]) => {
                projects[projectIndex].steps[stepId].order = order;
            });
            
            projects[projectIndex].updatedAt = new Date().toISOString();
            saveDemoProjects(projects);
            
            return new Promise(resolve => {
                setTimeout(() => {
                    resolve({ success: true });
                }, 300);
            });
        }
        
        return { success: false, error: 'Project not found' };
    }

    // Get all projects for user
    async getUserProjects(userId) {
        if (isDemoMode()) {
            return { success: true, projects: getDemoProjects() };
        }

        try {
            const projectsRef = collection(this.db, 'users', userId, 'projects');
            const projectsQuery = query(projectsRef, orderBy('updatedAt', 'desc'));
            
            // For Firestore, we need to use onSnapshot for real-time updates
            // This function is called from main.js with subscription
            return { success: true, query: projectsQuery };
        } catch (error) {
            console.error('Get user projects error:', error);
            return { success: false, error: error.message };
        }
    }

    // Real-time subscription to project
    subscribeToProject(userId, projectId, callback) {
        if (isDemoMode()) {
            return this.subscribeToDemoProject(projectId, callback);
        }

        const docPath = `users/${userId}/projects/${projectId}`;
        
        if (this.unsubscribes.has(docPath)) {
            this.unsubscribes.get(docPath)();
        }

        const projectRef = doc(this.db, 'users', userId, 'projects', projectId);
        const unsubscribe = onSnapshot(projectRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                const project = { 
                    id: docSnap.id, 
                    ...data,
                    createdAt: data.createdAt?.toDate?.() || new Date(),
                    updatedAt: data.updatedAt?.toDate?.() || new Date()
                };
                callback({ success: true, project });
            } else {
                callback({ success: false, error: 'Project not found' });
            }
        }, (error) => {
            console.error('Snapshot error:', error);
            callback({ success: false, error: error.message });
        });

        this.unsubscribes.set(docPath, unsubscribe);
        return unsubscribe;
    }

    subscribeToDemoProject(projectId, callback) {
        const interval = setInterval(() => {
            const projects = getDemoProjects();
            const project = projects.find(p => p.id === projectId);
            
            if (project) {
                callback({ success: true, project });
            } else {
                callback({ success: false, error: 'Project not found' });
            }
        }, 1000);

        return () => clearInterval(interval);
    }

    // Subscribe to user's projects list
    subscribeToProjectsList(userId, callback) {
        if (isDemoMode()) {
            return this.subscribeToDemoProjectsList(callback);
        }

        const collectionPath = `users/${userId}/projects`;
        
        if (this.unsubscribes.has(collectionPath)) {
            this.unsubscribes.get(collectionPath)();
        }

        const projectsRef = collection(this.db, 'users', userId, 'projects');
        const projectsQuery = query(projectsRef, orderBy('updatedAt', 'desc'));
        
        const unsubscribe = onSnapshot(projectsQuery, (querySnapshot) => {
            const projects = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                projects.push({ 
                    id: doc.id, 
                    ...data,
                    createdAt: data.createdAt?.toDate?.() || new Date(),
                    updatedAt: data.updatedAt?.toDate?.() || new Date()
                });
            });
            callback({ success: true, projects });
        }, (error) => {
            console.error('Projects list snapshot error:', error);
            callback({ success: false, error: error.message });
        });

        this.unsubscribes.set(collectionPath, unsubscribe);
        return unsubscribe;
    }

    subscribeToDemoProjectsList(callback) {
        const interval = setInterval(() => {
            const projects = getDemoProjects();
            callback({ success: true, projects });
        }, 2000);

        return () => clearInterval(interval);
    }

    // Delete project
    async deleteProject(userId, projectId) {
        if (isDemoMode()) {
            return this.deleteDemoProject(projectId);
        }

        try {
            const projectRef = doc(this.db, 'users', userId, 'projects', projectId);
            await deleteDoc(projectRef);
            return { success: true };
        } catch (error) {
            console.error('Delete project error:', error);
            return { success: false, error: error.message };
        }
    }

    deleteDemoProject(projectId) {
        const projects = getDemoProjects();
        const filteredProjects = projects.filter(p => p.id !== projectId);
        saveDemoProjects(filteredProjects);
        
        return new Promise(resolve => {
            setTimeout(() => {
                resolve({ success: true });
            }, 300);
        });
    }

    // Clean up all subscriptions
    cleanup() {
        this.unsubscribes.forEach(unsubscribe => unsubscribe());
        this.unsubscribes.clear();
    }
}

export const firestoreService = new FirestoreService();
window.firestoreService = firestoreService;