import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore } from 'firebase/firestore';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';

type AppConfigKey =
  | 'VITE_FIREBASE_API_KEY'
  | 'VITE_FIREBASE_AUTH_DOMAIN'
  | 'VITE_FIREBASE_PROJECT_ID'
  | 'VITE_FIREBASE_STORAGE_BUCKET'
  | 'VITE_FIREBASE_MESSAGING_SENDER_ID'
  | 'VITE_FIREBASE_APP_ID';

type AppConfig = Partial<Record<AppConfigKey, string>>;

const runtimeConfig =
  typeof window !== 'undefined'
    ? (window as { __APP_CONFIG__?: AppConfig }).__APP_CONFIG__
    : undefined;

const getEnv = (key: AppConfigKey) => {
  const v = runtimeConfig?.[key] ?? import.meta.env[key];
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

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
});
export const functions = getFunctions(app, 'us-central1');

// When running the app locally in dev, connect to the Functions emulator
// so callable functions hit the local emulator instead of production.
if (typeof import.meta !== 'undefined' && (import.meta.env?.DEV || import.meta.env?.VITE_USE_FIREBASE_EMULATOR === 'true')) {
  try {
    connectFunctionsEmulator(functions, 'localhost', 5001);
    console.log('Connected to Functions emulator at http://localhost:5001');
  } catch (e) {
    // ignore if emulator lib not available in this environment
  }
}