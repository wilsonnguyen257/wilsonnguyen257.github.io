// Firebase client SDK initialization with safe fallback when not configured.
import { initializeApp, type FirebaseApp } from 'firebase/app';
import {
  getAuth,
  onAuthStateChanged as fbOnAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type User as FirebaseUser,
  type Auth,
} from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';

export type User = FirebaseUser | null;

const cfg = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY as string | undefined,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string | undefined,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID as string | undefined,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string | undefined,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string | undefined,
  appId: import.meta.env.VITE_FIREBASE_APP_ID as string | undefined,
};

const REQUIRED_KEYS = ['apiKey', 'authDomain', 'projectId', 'appId'] as const;
const isConfigured = REQUIRED_KEYS.every((k) => {
  const value = cfg[k as keyof typeof cfg];
  return value && String(value).length > 0;
});

export const IS_FIREBASE_CONFIGURED = isConfigured;

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let storage: FirebaseStorage | null = null;

if (isConfigured) {
  app = initializeApp(cfg as Record<string, string>);
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
}

export { app, auth, db, storage };

// Auth helpers with fallback to local stub when Firebase is not configured

type LoginResult = { success: true } | { success: false; error: string };

// Local stub state for non-configured environments
let localUser: { email: string } | null = null;
const localListeners = new Set<(user: { email: string } | null) => void>();
function notifyLocal() { for (const cb of localListeners) cb(localUser); }

export async function login(email: string, password: string): Promise<LoginResult> {
  if (auth) {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return { success: true };
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Login failed';
      return { success: false, error: msg };
    }
  }
  // Fallback (no Firebase): accept any credentials and persist in localStorage
  try { localStorage.setItem('admin:email', email); } catch { /* ignore */ }
  localUser = { email };
  notifyLocal();
  return { success: true };
}

export async function logout(): Promise<LoginResult> {
  if (auth) {
    try {
      await signOut(auth);
      return { success: true };
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Sign out failed';
      return { success: false, error: msg };
    }
  }
  // Fallback (no Firebase)
  try { localStorage.removeItem('admin:email'); } catch { /* ignore */ }
  localUser = null;
  notifyLocal();
  return { success: true };
}

export function onAuthStateChanged(callback: (user: User) => void) {
  if (auth) {
    return fbOnAuthStateChanged(auth, callback);
  }
  // Fallback: simulate auth state via localStorage
  localListeners.add(callback as (u: { email: string } | null) => void);
  if (!localUser) {
    try { const email = localStorage.getItem('admin:email'); if (email) localUser = { email }; } catch { /* ignore */ }
  }
  callback(localUser as unknown as User);
  return () => { localListeners.delete(callback as (u: { email: string } | null) => void); };
}
