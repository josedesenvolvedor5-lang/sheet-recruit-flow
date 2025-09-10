// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getStorage, connectStorageEmulator } from "firebase/storage";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDrxjBqeGkWa-3OWK9QKBwzlOHVLP1qzMY",
  authDomain: "rhtest-cb00f.firebaseapp.com",
  projectId: "rhtest-cb00f",
  storageBucket: "rhtest-cb00f.firebasestorage.app",
  messagingSenderId: "970873757553",
  appId: "1:970873757553:web:3a4aa003c2effc0c50a0d0",
  measurementId: "G-2NJC9WLW2K"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
const db = getFirestore(app);
const storage = getStorage(app);

// Only initialize analytics if not in development
let analytics;
try {
  analytics = getAnalytics(app);
} catch (error) {
  console.log('Analytics not available:', error);
}

export { db, storage, analytics };
export default app;