import { initializeApp, getApps, getApp } from "firebase/app";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut,
  onAuthStateChanged as onAuthStateChangedFirebase
} from "firebase/auth";
import type { User } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Debug: Log config (except apiKey)
console.log('Firebase Config:', {
  ...firebaseConfig,
  apiKey: '[HIDDEN]'
});

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

// Auth functions
export const login = async (email: string, password: string) => {
  console.log('Attempting login with email:', email);
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log('Login successful, user:', userCredential.user?.email);
    return { success: true };
  } catch (error: unknown) {
    console.error('Login error:', error);
    const firebaseError = error as { code?: string; message: string };
    return { 
      success: false, 
      error: firebaseError.code === 'auth/user-not-found' || firebaseError.code === 'auth/wrong-password' 
        ? 'Invalid email or password. Please try again.'
        : 'An error occurred during login. Please try again.'
    };
  }
};

export const logout = async () => {
  try {
    await firebaseSignOut(auth);
    return { success: true };
  } catch (error) {
    console.error('Logout error:', error);
    return { success: false, error: 'Error signing out' };
  }
};

export const onAuthStateChanged = (callback: (user: User | null) => void) => {
  console.log('Setting up auth state listener');
  const unsubscribe = onAuthStateChangedFirebase(auth, (user) => {
    console.log('Auth state changed, user:', user ? user.email : 'No user');
    callback(user);
  });
  return unsubscribe;
};

export { app, auth };
