// firebase/firebase.js

import { initializeApp } from "firebase/app";
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAxmUOsaBUE7FrlEK1T6FDtL4A16Zorb94",
  authDomain: "expiry-reminder-app-bdb5c.firebaseapp.com",
  projectId: "expiry-reminder-app-bdb5c",
  storageBucket: "expiry-reminder-app-bdb5c.firebasestorage.app",
  messagingSenderId: "46201686703",
  appId: "1:46201686703:web:ce5a6fb6c86deeddcbe25a",
  measurementId: "G-NBPQSMZ4VZ"
};

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// NEW: Initialize Firestore with persistent local cache
const db = initializeFirestore(app, {
  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() })
});

// Auth setup
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export { db };
