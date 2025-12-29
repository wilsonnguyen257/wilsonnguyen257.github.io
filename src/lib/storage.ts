/**
 * Storage utility for managing site data (events, reflections, gallery)
 * Supports multiple backends: Firebase Firestore, API endpoints, and localStorage
 * Provides real-time synchronization across tabs and users
 */

/** Valid JSON data types that can be stored */
export type JsonName = 'events' | 'reflections' | 'gallery';

import { IS_FIREBASE_CONFIGURED, db } from './firebase';
import { doc, getDoc, setDoc, serverTimestamp, collection, getDocs, writeBatch } from 'firebase/firestore';

// Lightweight cross-tab/channel notification so UIs refresh immediately
const VERSION_KEY = (name: JsonName) => `site-data:version:${name}` as const;
const CHANNEL_NAME = 'site-data';
const LOCAL_KEY = (name: JsonName) => `site-data:${name}` as const;

/**
 * Fetch JSON data from storage
 * Tries Firebase Firestore first (supporting sub-collections for large data), falls back to API, then localStorage
 * 
 * @template T - Type of data being retrieved
 * @param name - Name of the data collection to fetch
 * @returns Promise resolving to the data (empty array if not found)
 * 
 * @example
 * const events = await getJson<Event[]>('events');
 */
export async function getJson<T = unknown>(name: JsonName): Promise<T> {
  // Prefer Firebase Firestore if configured
  if (IS_FIREBASE_CONFIGURED && db) {
    try {
      // Try sub-collection first (preferred for large lists like events)
      const colRef = collection(db, 'site-data', name, 'items');
      const snap = await getDocs(colRef);
      
      if (!snap.empty) {
        // If we have sub-collection items, use them
        const items = snap.docs.map(d => d.data() as T);
        // Sort if needed (optional, assuming client-side sort)
        return items as unknown as T;
      }
      
      // Fallback to single doc (legacy or small data)
      const ref = doc(db, 'site-data', name);
      const docSnap = await getDoc(ref);
      if (!docSnap.exists()) return ([] as unknown) as T;
      const data = docSnap.data() as { value?: T } | undefined;
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

/**
 * Save JSON data to storage
 * Saves to Firebase Firestore if configured, otherwise falls back to API or localStorage
 * Automatically notifies other tabs and users of the update
 * 
 * @param name - Name of the data collection to save
 * @param data - Data to save (will be JSON stringified if needed)
 * 
 * @example
 * await saveJson('events', updatedEvents);
 */
export async function saveJson(name: JsonName, data: unknown): Promise<void> {
  const json = typeof data === 'string' ? data : JSON.stringify(data);
  // Prefer Firebase Firestore if configured
  if (IS_FIREBASE_CONFIGURED && db) {
    try {
      // Check if data is an array (candidates for sub-collection split)
      if (Array.isArray(data)) {
        const batch = writeBatch(db);
        const colRef = collection(db, 'site-data', name, 'items');
        
        // 1. Get existing docs to identify deletions
        const existingSnap = await getDocs(colRef);
        const existingIds = new Set(existingSnap.docs.map(d => d.id));
        const newIds = new Set();
        
        // 2. Set/Update new items
        // We assume items have an 'id' field, if not, we generate one or skip
        for (const item of data) {
           const id = (item as { id?: string }).id;
           if (id) {
               const docRef = doc(colRef, id);
               batch.set(docRef, item);
               newIds.add(id);
           }
        }
        
        // 3. Delete removed items
        for (const id of existingIds) {
            if (!newIds.has(id)) {
                batch.delete(doc(colRef, id));
            }
        }
        
        // 4. Update parent doc timestamp for listeners
        const parentRef = doc(db, 'site-data', name);
        batch.set(parentRef, { updatedAt: serverTimestamp(), type: 'collection' });

        await batch.commit();
      } else {
          // Single document save (legacy/small data)
          const ref = doc(db, 'site-data', name);
          await setDoc(ref, { value: JSON.parse(json), updatedAt: serverTimestamp() });
      }

      announceJsonUpdate(name);
      return;
    } catch (err) {
      console.error(`Firestore save error for ${name}:`, err);
      if ((err as { code?: string }).code === 'permission-denied') {
          alert('Error: Permission denied. You must be logged in as an admin to save changes.');
          throw err;
      }
    }
  } else {
    console.warn('Firebase not configured or db not initialized. Falling back to API/Local.');
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

/**
 * Notify all listeners that data has been updated
 * Uses localStorage events for cross-tab sync and BroadcastChannel for same-tab
 * 
 * @param name - Name of the data collection that was updated
 */
export function announceJsonUpdate(name: JsonName): void {
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

/**
 * Subscribe to real-time updates of JSON data
 * Automatically refreshes when data changes via Firebase, storage events, or periodic polling
 * 
 * @template T - Type of data being subscribed to
 * @param name - Name of the data collection to subscribe to
 * @param callback - Function called with new data when updates occur
 * @param onError - Optional error handler
 * @returns Unsubscribe function to stop listening
 * 
 * @example
 * const unsubscribe = subscribeJson<Event[]>('events', (events) => {
 *   setEvents(events);
 * });
 * // Later: unsubscribe();
 */
export function subscribeJson<T = unknown>(
  name: JsonName,
  callback: (data: T) => void,
  onError?: (err: unknown) => void,
): () => void {
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
