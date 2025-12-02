// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBAqCFHTe2OAGJqU0w0OfmS-K9a8W_IVjQ",
  authDomain: "impaqt-content-planner.firebaseapp.com",
  projectId: "impaqt-content-planner",
  storageBucket: "impaqt-content-planner.firebasestorage.app",
  messagingSenderId: "958301435728",
  appId: "1:958301435728:web:75d792769e055a29121e55",
  measurementId: "G-XHVEE5GK65",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db, app };
