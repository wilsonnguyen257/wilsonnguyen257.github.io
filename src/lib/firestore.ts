import { app } from './firebase';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
} from 'firebase/firestore';

const db = getFirestore(app);

// Events
export type DbEvent = {
  id?: string;
  name: { vi: string; en: string };
  date: string; // ISO yyyy-mm-dd
  time: string; // e.g., '5:00 PM'
  location: string;
  description?: { vi: string; en: string };
};

export function subscribeEvents(
  callback: (events: DbEvent[]) => void,
  onError?: (error: unknown) => void,
) {
  const q = query(collection(db, 'events'), orderBy('date', 'asc'));
  return onSnapshot(
    q,
    {
      next: (snap) => {
        const items: DbEvent[] = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<DbEvent, 'id'>) }));
        callback(items);
      },
      error: (err) => {
        console.error('subscribeEvents error:', err);
        onError?.(err);
      },
    }
  );
}

export async function addOrSetEvent(event: DbEvent, id?: string) {
  const data = { ...event } as Omit<DbEvent, 'id'>;
  if (id) {
    await setDoc(doc(db, 'events', id), data);
    return id;
  }
  const ref = await addDoc(collection(db, 'events'), data);
  return ref.id;
}

export async function updateEventById(id: string, data: Partial<DbEvent>) {
  await updateDoc(doc(db, 'events', id), data);
}

export async function deleteEventById(id: string) {
  await deleteDoc(doc(db, 'events', id));
}

// Reflections
export type DbReflection = {
  id?: string;
  title: { vi: string; en: string };
  content: { vi: string; en: string };
  date: string; // ISO yyyy-mm-dd
  author: string;
  createdAt: string; // ISO datetime
  updatedAt: string; // ISO datetime
};

export function subscribeReflections(
  callback: (items: DbReflection[]) => void,
  onError?: (error: unknown) => void,
) {
  const q = query(collection(db, 'reflections'), orderBy('date', 'desc'));
  return onSnapshot(
    q,
    {
      next: (snap) => {
        const items: DbReflection[] = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<DbReflection, 'id'>) }));
        callback(items);
      },
      error: (err) => {
        console.error('subscribeReflections error:', err);
        onError?.(err);
      },
    }
  );
}

export async function addOrSetReflection(item: DbReflection, id?: string) {
  const data = { ...item } as Omit<DbReflection, 'id'>;
  if (id) {
    await setDoc(doc(db, 'reflections', id), data);
    return id;
  }
  const ref = await addDoc(collection(db, 'reflections'), data);
  return ref.id;
}

export async function updateReflectionById(id: string, data: Partial<DbReflection>) {
  await updateDoc(doc(db, 'reflections', id), data);
}

export async function deleteReflectionById(id: string) {
  await deleteDoc(doc(db, 'reflections', id));
}

// Gallery metadata (Cloudinary images)
export type DbGalleryItem = {
  id: string; // Cloudinary public_id
  url: string;
  name: string;
  created: number; // ms epoch
};

export function subscribeGallery(
  callback: (items: DbGalleryItem[]) => void,
  onError?: (error: unknown) => void,
) {
  const q = query(collection(db, 'gallery'), orderBy('created', 'desc'));
  return onSnapshot(
    q,
    {
      next: (snap) => {
        const items: DbGalleryItem[] = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<DbGalleryItem, 'id'>) }));
        callback(items);
      },
      error: (err) => {
        console.error('subscribeGallery error:', err);
        onError?.(err);
      },
    }
  );
}

export async function addGalleryItem(item: DbGalleryItem) {
  // Use Cloudinary public_id as Firestore document id for easy deletes
  await setDoc(doc(db, 'gallery', item.id), { url: item.url, name: item.name, created: item.created });
}

export async function deleteGalleryItem(id: string) {
  await deleteDoc(doc(db, 'gallery', id));
}
