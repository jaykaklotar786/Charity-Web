// Import the functions you need from the SDKs
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBxac1xsGHO9WrNFt75joVsvWKEhdWRoNA",
  authDomain: "charity-app-98d1c.firebaseapp.com",
  projectId: "charity-app-98d1c",
  storageBucket: "charity-app-98d1c.firebasestorage.app",
  messagingSenderId: "467341735066",
  appId: "1:467341735066:web:ecffc044e4bd493ff99b23",
  measurementId: "G-4Y14PLQ27Z"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);