import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: User to provide these values
// Fallback for development to prevent crash before config is provided
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "mock_key",
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "mock_domain",
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "mock_project",
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "mock_bucket",
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "mock_sender",
    appId: import.meta.env.VITE_FIREBASE_APP_ID || "mock_app_id"
};

console.log("Firebase Config Loaded:", {
    apiKey: firebaseConfig.apiKey ? "PRESENT (Starts with " + firebaseConfig.apiKey.substring(0, 5) + ")" : "MISSING",
    authDomain: firebaseConfig.authDomain,
    projectId: firebaseConfig.projectId
});

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Initialize Firestore with offline persistence enabled
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from "firebase/firestore";

export const db = initializeFirestore(app, {
    localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager()
    })
});
