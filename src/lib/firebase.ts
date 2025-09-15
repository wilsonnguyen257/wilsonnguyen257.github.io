// Database/auth removed. Provide minimal local stubs so the app runs without Firebase.

export type User = { email: string };

let currentUser: User | null = null;
const listeners = new Set<(user: User | null) => void>();

function notify() {
  for (const cb of listeners) cb(currentUser);
}

export const login = async (email: string, _password: string) => {
  try {
    // Accept any email; if matches configured admin email, treat as admin
    currentUser = { email };
    try { localStorage.setItem('admin:email', email); } catch {}
    notify();
    return { success: true };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, error: 'Login failed' };
  }
};

export const logout = async () => {
  try {
    currentUser = null;
    try { localStorage.removeItem('admin:email'); } catch {}
    notify();
    return { success: true };
  } catch (error) {
    console.error('Logout error:', error);
    return { success: false, error: 'Error signing out' };
  }
};

export const onAuthStateChanged = (callback: (user: User | null) => void) => {
  listeners.add(callback);
  // Initialize from localStorage
  if (!currentUser) {
    try {
      const email = localStorage.getItem('admin:email');
      if (email) currentUser = { email };
    } catch {}
  }
  // Notify immediately
  callback(currentUser);
  return () => { listeners.delete(callback); };
};

export const app = {} as unknown as Record<string, never>;
export const auth = { onAuthStateChanged: (cb: (user: User | null) => void) => onAuthStateChanged(cb) } as const;
