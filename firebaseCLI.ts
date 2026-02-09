import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';

declare global {
  interface Window {
    __APP_CONFIG__?: Record<string, string>;
  }
}

// Firebase configuration pulled from runtime config first, then Vite env.
const getEnv = (key: keyof ImportMetaEnv) => {
  const runtimeValue = typeof window !== 'undefined' ? window.__APP_CONFIG__?.[key as string] : undefined;
  const viteValue = import.meta.env[key];
  const v = runtimeValue || viteValue;
  if (!v) throw new Error(`${key} is not set`);
  return String(v);
};

const firebaseConfig = {
  apiKey: getEnv('VITE_FIREBASE_API_KEY'),
  authDomain: getEnv('VITE_FIREBASE_AUTH_DOMAIN'),
  projectId: getEnv('VITE_FIREBASE_PROJECT_ID'),
  storageBucket: getEnv('VITE_FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: getEnv('VITE_FIREBASE_MESSAGING_SENDER_ID'),
  appId: getEnv('VITE_FIREBASE_APP_ID'),
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app);