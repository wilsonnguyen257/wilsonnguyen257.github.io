import { app } from './firebase';
import { getStorage, ref, getDownloadURL, uploadString } from 'firebase/storage';

const storage = getStorage(app);

export type JsonName = 'events' | 'reflections' | 'gallery';

// Lightweight cross-tab/channel notification so UIs refresh immediately
const VERSION_KEY = (name: JsonName) => `site-data:version:${name}` as const;
const CHANNEL_NAME = 'site-data';

export async function getJson<T = unknown>(name: JsonName): Promise<T> {
  try {
    const fileRef = ref(storage, `site-data/${name}.json`);
    const url = await getDownloadURL(fileRef);
    // Debug: log the resolved download URL to help verify CORS
    try {
      console.log('[storage] getDownloadURL', {
        path: `site-data/${name}.json`,
        url,
        origin: typeof window !== 'undefined' ? window.location.origin : undefined,
      });
    } catch {
      // ignore logging failures
    }
    // Cache-bust in addition to no-store to avoid any intermediary caching
    const v = localStorage.getItem(VERSION_KEY(name)) || '';
    const fetchUrl = v ? `${url}&v=${encodeURIComponent(v)}` : url;
    try {
      console.log('[storage] fetching JSON', { fetchUrl });
    } catch {
      // ignore logging failures
    }
    const res = await fetch(fetchUrl, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch {
    return ([] as unknown) as T;
  }
}

export async function saveJson(name: JsonName, data: unknown) {
  const json = typeof data === 'string' ? data : JSON.stringify(data);
  const fileRef = ref(storage, `site-data/${name}.json`);
  await uploadString(fileRef, json, 'raw', { contentType: 'application/json' });
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

  // Simple periodic refresh fallback (every 2 minutes) for robustness
  const interval = window.setInterval(() => void load(), 120_000);

  return () => {
    active = false;
    window.removeEventListener('storage', storageHandler);
    if (bc) {
      try { bc.close(); } catch { /* ignore close errors */ void 0; }
    }
    window.clearInterval(interval);
  };
}
