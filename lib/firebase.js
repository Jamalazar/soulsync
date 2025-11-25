import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// ⚠️ REPLACE THE OBJECT BELOW WITH YOUR KEYS FROM THE FIREBASE CONSOLE ⚠️
// Go to Project Settings > General > Your Apps > SDK Setup and Configuration
const firebaseConfig = {
  apiKey: "AIzaSyB4pc7EBlVOAqxh4BaHMAeMrdSdE7w6Lmo",
  authDomain: "soulsync-mvp.firebaseapp.com",
  projectId: "soulsync-mvp",
  storageBucket: "soulsync-mvp.firebasestorage.app",
  messagingSenderId: "650844653336",
  appId: "1:650844653336:web:323d8ee9dc8afdd27a806d"
};

// Singleton pattern: ensures we only initialize Firebase once
// This prevents "Firebase App named '[DEFAULT]' already exists" errors
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const auth = getAuth(app);

// This export line is CRITICAL. Without it, page.tsx cannot see 'db' or 'auth'
export { db, auth };