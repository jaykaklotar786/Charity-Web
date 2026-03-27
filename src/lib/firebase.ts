
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyClBCSy4vCfhmqrA-klPKnjrZ-4VF3-MAw",
  authDomain: "charity-app-2-ca3c2.firebaseapp.com",
  projectId: "charity-app-2-ca3c2",
  storageBucket: "charity-app-2-ca3c2.firebasestorage.app",
  messagingSenderId: "304770091011",
  appId: "1:304770091011:web:3f1f50ef2294d45731a636"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);