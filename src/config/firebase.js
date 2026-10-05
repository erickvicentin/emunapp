import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyA3RA20hfW1C9RXekT75Kb5muZ_yQjX1GI",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "emuna-pilates.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "emuna-pilates",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "emuna-pilates.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "116509800002",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:116509800002:web:d48fa154b4c4211b2edfdb",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-LSPZ303PQR"
};

// Initialize Firebase once
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });
const databaseId = import.meta.env.VITE_FIREBASE_DATABASE_ID || 'emunapp-db';
export const db = getFirestore(app, databaseId);
export default app;
