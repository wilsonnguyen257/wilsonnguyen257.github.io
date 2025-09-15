export type JsonName = 'events' | 'reflections' | 'gallery';
import { IS_FIREBASE_CONFIGURED, db } from './firebase';
import { doc, getDoc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore';

// Lightweight cross-tab/channel notification so UIs refresh immediately
const VERSION_KEY = (name: JsonName) => `site-data:version:${name}` as const;
const CHANNEL_NAME = 'site-data';
const LOCAL_KEY = (name: JsonName) => `site-data:${name}` as const;

export async function getJson<T = unknown>(name: JsonName): Promise<T> {
  // Prefer Firebase Firestore if configured
  if (IS_FIREBASE_CONFIGURED && db) {
    try {
      const ref = doc(db, 'site-data', name);
      const snap = await getDoc(ref);
      if (!snap.exists()) return ([] as unknown) as T;
      const data = snap.data() as { value?: T } | undefined;
      return (data?.value ?? ([] as unknown)) as T;
    } catch {
      // fall through to API/local
    }
  }
  // Try shared serverless storage first
  try {
    const v = (() => { try { return localStorage.getItem(VERSION_KEY(name)) || ''; } catch { return ''; } })();
    const res = await fetch(`/api/site-data/${name}${v ? `?v=${encodeURIComponent(v)}` : ''}`, { cache: 'no-store' });
    if (res.ok) return await res.json();
  } catch { /* ignore */ }
  // Fallback to localStorage-only
  try {
    const raw = localStorage.getItem(LOCAL_KEY(name));
    if (!raw) return ([] as unknown) as T;
    return JSON.parse(raw) as T;
  } catch {
    return ([] as unknown) as T;
  }
}

// No edit token required

export async function saveJson(name: JsonName, data: unknown) {
  const json = typeof data === 'string' ? data : JSON.stringify(data);
  // Prefer Firebase Firestore if configured
  if (IS_FIREBASE_CONFIGURED && db) {
    try {
      const ref = doc(db, 'site-data', name);
      await setDoc(ref, { value: JSON.parse(json), updatedAt: serverTimestamp() });
      announceJsonUpdate(name);
      return;
    } catch {
      // fall back
    }
  }
  // Try shared API first
  try {
    const res = await fetch(`/api/site-data/${name}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: json });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  } catch {
    // Fallback to localStorage
    try { localStorage.setItem(LOCAL_KEY(name), json); } catch { /* ignore */ }
  }
  announceJsonUpdate(name);
}

export function announceJsonUpdate(name: JsonName) {
  try {
    const ts = Date.now().toString();
    // Update version in localStorage (triggers storage events in other tabs)
    localStorage.setItem(VERSION_KEY(name), ts);
    // BroadcastChannel for same-tab single-page listeners
    try {
      const bc = new BroadcastChannel(CHANNEL_NAME);
      bc.postMessage({ type: 'updated', name, ts });
      bc.close();
    } catch {
      // Ignore if BroadcastChannel unsupported (Safari private mode, etc.)
    }
  } catch {
    // Access to localStorage may fail in some embeds; ignore
  }
}

export function subscribeJson<T = unknown>(
  name: JsonName,
  callback: (data: T) => void,
  onError?: (err: unknown) => void,
) {
  let active = true;

  const load = async () => {
    try {
      const data = await getJson<T>(name);
      if (active) callback(data);
    } catch (err) {
      console.error('subscribeJson load error:', err);
      onError?.(err);
    }
  };

  // Initial fetch
  void load();

  // If Firebase configured, also live-listen to the doc
  let unsubscribeFirestore: (() => void) | null = null;
  if (IS_FIREBASE_CONFIGURED && db) {
    try {
      const ref = doc(db, 'site-data', name);
      unsubscribeFirestore = onSnapshot(ref, (snap) => {
        const data = (snap.data() as { value?: T } | undefined)?.value;
        if (data !== undefined) callback(data);
      });
    } catch (err) {
      console.error('Firestore subscribe error:', err);
    }
  }

  // Listen for cross-tab updates via storage events
  const storageHandler = (e: StorageEvent) => {
    if (!e.key || e.key !== VERSION_KEY(name)) return;
    void load();
  };
  window.addEventListener('storage', storageHandler);

  // Listen for same-tab updates via BroadcastChannel
  let bc: BroadcastChannel | null = null;
  try {
    bc = new BroadcastChannel(CHANNEL_NAME);
    bc.onmessage = (msg: MessageEvent) => {
      const data = msg.data as { type?: string; name?: JsonName };
      if (data?.type === 'updated' && data?.name === name) {
        void load();
      }
    };
  } catch {
    // ignore if unsupported
  }

  // Periodic refresh (every 30s) so other users see updates soon after save
  const interval = window.setInterval(() => void load(), 30_000);

  return () => {
    active = false;
    window.removeEventListener('storage', storageHandler);
    if (bc) {
      try { bc.close(); } catch { /* ignore close errors */ void 0; }
    }
    window.clearInterval(interval);
    if (unsubscribeFirestore) {
      try { unsubscribeFirestore(); } catch { /* ignore */ }
    }
  };
}
