import { Capacitor } from "@capacitor/core";
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import {
  getAuth,
  indexedDBLocalPersistence,
  initializeAuth,
  type Auth,
} from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

function getFirebaseApp(): FirebaseApp {
  if (typeof window === "undefined") {
    throw new Error("Firebase client SDK is only available in the browser.");
  }
  if (!firebaseConfig.apiKey) {
    throw new Error(
      "Missing Firebase config. Copy .env.example to .env.local and set NEXT_PUBLIC_FIREBASE_* variables.",
    );
  }
  return getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
}

let authInstance: Auth | undefined;

export function getFirebaseAuth(): Auth {
  if (authInstance) return authInstance;

  const app = getFirebaseApp();
  if (Capacitor.isNativePlatform()) {
    authInstance = initializeAuth(app, {
      persistence: indexedDBLocalPersistence,
    });
  } else {
    authInstance = getAuth(app);
  }
  return authInstance;
}

export function getFirebaseDb(): Firestore {
  return getFirestore(getFirebaseApp());
}

export function getFirebaseStorage(): FirebaseStorage {
  return getStorage(getFirebaseApp());
}
