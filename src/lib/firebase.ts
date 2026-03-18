// src/lib/firebase.ts

import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// 🔥 Tera config (same rakha hai)
const firebaseConfig = {
  apiKey: "AIzaSyClBCSy4vCfhmqrA-klPKnjrZ-4VF3-MAw",
  authDomain: "charity-app-2-ca3c2.firebaseapp.com",
  projectId: "charity-app-2-ca3c2",
  storageBucket: "charity-app-2-ca3c2.firebasestorage.app",
  messagingSenderId: "304770091011",
  appId: "1:304770091011:web:3f1f50ef2294d45731a636"
};

// ✅ Next.js safe initialization (IMPORTANT)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// ✅ EXPORTS (ye hi missing tha)
export const auth = getAuth(app);
export const db = getFirestore(app);