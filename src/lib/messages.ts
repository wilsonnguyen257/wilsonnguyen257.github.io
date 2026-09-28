/**
 * Contact messages: the one genuinely new data surface this redesign adds.
 *
 * Unlike events/reflections/gallery (admin-authored, public-read via
 * site-data/* in storage.ts), a message is visitor-submitted. That needs a
 * different security shape — anyone can create one, only an admin can read,
 * update (mark answered), or delete — so it lives in its own top-level
 * `messages` collection rather than being shoehorned into storage.ts's
 * admin-write JsonName model. See firestore.rules.
 *
 * Falls back to localStorage when Firebase isn't configured, consistent
 * with the rest of the app's storage philosophy (dev/offline mode).
 */
import { IS_FIREBASE_CONFIGURED, db } from './firebase';
import {
  addDoc,
  collection,
  serverTimestamp,
  onSnapshot,
  orderBy,
  query,
  doc,
  updateDoc,
  type Timestamp,
} from 'firebase/firestore';

export type ContactMessage = {
  id: string;
  name: string;
  email: string;
  message: string;
  /** Optional context, e.g. "Re: <event name>" when sent from an event page. */
  context?: string;
  status: 'pending' | 'answered';
  createdAt: string; // ISO string, normalized from Firestore Timestamp or Date.now()
};

const LOCAL_KEY = 'site-data:messages';

function readLocal(): ContactMessage[] {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    return raw ? (JSON.parse(raw) as ContactMessage[]) : [];
  } catch {
    return [];
  }
}

function writeLocal(items: ContactMessage[]): void {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(items));
    window.dispatchEvent(new StorageEvent('storage', { key: LOCAL_KEY }));
  } catch {
    /* noop */
  }
}

/** Submit a new contact message. Resolves once persisted. */
export async function submitMessage(input: { name: string; email: string; message: string; context?: string }): Promise<void> {
  const name = input.name.trim();
  const email = input.email.trim();
  const message = input.message.trim();
  if (!name || !email || !message) {
    throw new Error('Missing required fields');
  }

  if (IS_FIREBASE_CONFIGURED && db) {
    await addDoc(collection(db, 'messages'), {
      name,
      email,
      message,
      context: input.context || null,
      status: 'pending',
      createdAt: serverTimestamp(),
    });
    return;
  }

  const items = readLocal();
  items.unshift({
    id: `local-${Date.now()}`,
    name,
    email,
    message,
    context: input.context,
    status: 'pending',
    createdAt: new Date().toISOString(),
  });
  writeLocal(items);
}

/** Admin: subscribe to all messages, newest first. */
export function subscribeMessages(
  onData: (messages: ContactMessage[]) => void,
  onError?: (e: unknown) => void
): () => void {
  if (IS_FIREBASE_CONFIGURED && db) {
    const q = query(collection(db, 'messages'), orderBy('createdAt', 'desc'));
    return onSnapshot(
      q,
      (snap) => {
        const items: ContactMessage[] = snap.docs.map((d) => {
          const data = d.data() as Record<string, unknown>;
          const createdAt = data.createdAt as Timestamp | undefined;
          return {
            id: d.id,
            name: (data.name as string) || '',
            email: (data.email as string) || '',
            message: (data.message as string) || '',
            context: (data.context as string) || undefined,
            status: (data.status as 'pending' | 'answered') || 'pending',
            createdAt: createdAt?.toDate ? createdAt.toDate().toISOString() : new Date().toISOString(),
          };
        });
        onData(items);
      },
      onError
    );
  }

  // localStorage fallback: poll on the storage event (same-tab writes dispatch it manually above)
  const handler = () => onData(readLocal());
  handler();
  window.addEventListener('storage', handler);
  return () => window.removeEventListener('storage', handler);
}

/** Admin: mark a message answered. */
export async function markMessageAnswered(id: string): Promise<void> {
  if (IS_FIREBASE_CONFIGURED && db) {
    await updateDoc(doc(db, 'messages', id), { status: 'answered' });
    return;
  }
  const items = readLocal().map((m) => (m.id === id ? { ...m, status: 'answered' as const } : m));
  writeLocal(items);
}
