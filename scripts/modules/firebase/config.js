// Firebase Configuration
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-app.js";

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC1iB1X-qqbfB9hwHnZ8SyLWn_i1SU29iI",
  authDomain: "vedatabase25.firebaseapp.com",
  projectId: "vedatabase25",
  storageBucket: "vedatabase25.firebasestorage.app",
  messagingSenderId: "881280967764",
  appId: "1:881280967764:web:668a3b41b3b99da820b9c1",
  measurementId: "G-XMR4RFZPD1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export { app };