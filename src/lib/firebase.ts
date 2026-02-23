import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getFunctions } from "firebase/functions";

// Web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "dummy-key",
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "dummy-domain",
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "dummy-id",
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "dummy-bucket",
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "123456",
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:1234:web:1234"
};

if (firebaseConfig.apiKey === "dummy-key" && typeof window !== 'undefined') {
    console.warn(
        "%c[FIREBASE CONFIG MISSING]",
        "background: red; color: white; font-size: 16px; font-weight: bold; padding: 4px;",
        "You are using dummy Firebase credentials! Firestore/Auth calls will fail. Please populate .env.local with real keys."
    );
}

// Initialize Firebase only if it hasn't been initialized already
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize services
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);
const functions = getFunctions(app);

export { app, db, auth, storage, functions };
