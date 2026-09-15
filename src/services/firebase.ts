import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import {
  initializeFirestore,
  persistentLocalCache,
  type Firestore,
} from 'firebase/firestore';

function resolveAuthDomain(): string | undefined {
  const fromEnv = (
    import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string | undefined
  )?.trim();
  const projectId = (
    import.meta.env.VITE_FIREBASE_PROJECT_ID as string | undefined
  )?.trim();
  if (typeof window === 'undefined') return fromEnv;

  const host = window.location.hostname;
  if (host === 'localhost' || host === '127.0.0.1') {
    return projectId ? `${projectId}.firebaseapp.com` : fromEnv;
  }
  if (host.endsWith('.web.app') || host.endsWith('.firebaseapp.com')) {
    return host;
  }
  return fromEnv || host;
}

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY as string | undefined,
  authDomain: resolveAuthDomain(),
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID as string | undefined,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as
    | string
    | undefined,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as
    | string
    | undefined,
  appId: import.meta.env.VITE_FIREBASE_APP_ID as string | undefined,
};

export const isFirebaseConfigured = Boolean(
  config.apiKey &&
    config.apiKey.length > 0 &&
    config.projectId &&
    config.appId,
);

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

if (isFirebaseConfigured) {
  app = initializeApp(config);
  auth = getAuth(app);
  db = initializeFirestore(app, {
    localCache: persistentLocalCache(),
  });
}

export function requireDb(): Firestore {
  if (!db) {
    throw new Error('Firestore is not configured.');
  }
  return db;
}

export { app, auth, db };
