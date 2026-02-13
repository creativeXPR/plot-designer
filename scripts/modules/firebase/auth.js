import { 
    getAuth, 
    signInWithPopup, 
    GoogleAuthProvider, 
    signOut,
    onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/12.8.0/firebase-auth.js";
import { app } from './config.js';

const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

googleProvider.setCustomParameters({
    prompt: 'select_account'
});

export class AuthService {
    constructor() {
        this.auth = auth;
        this.user = null;
        this.listeners = [];
    }

    async signInWithGoogle() {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const user = result.user;
            // Save user profile to Firestore
            // console.log('Google sign in successful:', user);
            if (window.firestoreService && typeof window.firestoreService.saveUserProfile === 'function') {
                await window.firestoreService.saveUserProfile({
                    uid: user.uid,
                    email: user.email,
                    displayName: user.displayName,
                    photoURL: user.photoURL
                });
            }
            return {
                success: true,
                user: this.formatUser(user)
            };
        } catch (error) {
            console.error('Google sign in error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    async signOutUser() {
        try {
            await signOut(auth);
            return { success: true };
        } catch (error) {
            console.error('Sign out error:', error);
            return { success: false, error: error.message };
        }
    }

    onAuthStateChange(callback) {
        return onAuthStateChanged(auth, (user) => {
            this.user = user ? this.formatUser(user) : null;
            callback(this.user);
            this.listeners.forEach(listener => listener(this.user));
        });
    }

    getCurrentUser() {
        return this.user;
    }

    addListener(callback) {
        this.listeners.push(callback);
        return () => {
            this.listeners = this.listeners.filter(listener => listener !== callback);
        };
    }

    formatUser(firebaseUser) {
        return {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
            initials: this.getInitials(firebaseUser.displayName || firebaseUser.email)
        };
    }

    getInitials(name) {
        if (!name) return 'U';
        return name
            .split(' ')
            .map(part => part[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    }

    // Demo user for testing without Firebase
    getDemoUser() {
        return {
            uid: 'demo-user-id',
            email: 'demo@plotdesigner.com',
            displayName: 'Demo User',
            photoURL: null,
            initials: 'DU',
            isDemo: true
        };
    }
}

export const authService = new AuthService();