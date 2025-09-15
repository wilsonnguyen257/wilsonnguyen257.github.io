const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;

export type GalleryItem = { id: string; url: string; name: string; created: number };

async function fetchJson<T>(name: 'events'|'reflections'|'gallery'): Promise<T> {
  const url = `https://res.cloudinary.com/${CLOUD_NAME}/raw/upload/site-data/${name}.json`;
  try {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (e) {
    return ([] as unknown) as T;
  }
}

export const dataApi = {
  getEvents: () => fetchJson<Array<any>>('events'),
  getReflections: () => fetchJson<Array<any>>('reflections'),
  getGallery: () => fetchJson<Array<GalleryItem>>('gallery'),
  saveJson: async (name: 'events'|'reflections'|'gallery', data: unknown, idToken: string) => {
    const res = await fetch('/api/cloudinary-raw-put', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, data, idToken })
    });
    if (!res.ok) {
      const msg = await res.json().catch(() => ({}));
      throw new Error(msg?.error || 'Failed to save');
    }
    return true;
  }
};

