import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { getJson, saveJson } from '../lib/storage';
import { v4 as uuidv4 } from 'uuid';
import { IS_FIREBASE_CONFIGURED, storage as fbStorage } from '../lib/firebase';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

type GalleryItem = { id: string; url: string; name: string; created: number; path?: string };

export default function AdminGallery() {
  const { t } = useLanguage();
  const [images, setImages] = useState<GalleryItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editDate, setEditDate] = useState('');

  // Load gallery metadata from Firebase Storage JSON
  useEffect(() => {
    setUploading(true);
    let active = true;
    (async () => {
      try {
        const items = await getJson<GalleryItem[]>('gallery');
        if (active) setImages(items || []);
      } catch {
        setError('Failed to load gallery images');
      } finally {
        if (active) setUploading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files?.[0] || null);
  };

  const handleUpload = async () => {
    if (!file) return;
    
    setUploading(true);
    setError(null);
    
    try {
      const uid = uuidv4();
      let url = '';
      let path: string | undefined;
      if (IS_FIREBASE_CONFIGURED && fbStorage) {
        // Upload to Firebase Storage and get a public URL
        path = `gallery/${uid}/${file.name}`;
        const objectRef = ref(fbStorage, path);
        await uploadBytes(objectRef, file);
        url = await getDownloadURL(objectRef);
      } else {
        // Fallback: data URL for local/preview-only storage
        url = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result));
          reader.onerror = () => reject(reader.error);
          reader.readAsDataURL(file);
        });
      }
      const newItem: GalleryItem = { id: uid, url, name: file.name || 'image', created: Date.now(), path };
      const updated = [...images, newItem];
      await saveJson('gallery', updated);
      setImages(updated);
      setFile(null);
    } catch (err) {
      setError('Failed to upload image. Please try again.');
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
    }
  };

  const startEdit = (img: GalleryItem) => {
    setEditingId(img.id);
    setEditName(img.name);
    setEditDate(new Date(img.created).toISOString().split('T')[0]);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName('');
    setEditDate('');
  };

  const saveEdit = async (id: string) => {
    setError(null);
    try {
      const updated = images.map(img => {
        if (img.id === id) {
          return {
            ...img,
            name: editName,
            created: new Date(editDate).getTime()
          };
        }
        return img;
      });
      await saveJson('gallery', updated);
      setImages(updated);
      cancelEdit();
    } catch (err) {
      setError('Failed to update image');
      console.error('Update error:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this image and remove from gallery?')) return;
    setError(null);
    try {
      const image = images.find(i => i.id === id);
      if (!image) throw new Error('Image not found');
      // Try to delete from Firebase Storage if configured and path recorded
      if (IS_FIREBASE_CONFIGURED && fbStorage && image.path) {
        try {
          await deleteObject(ref(fbStorage, image.path));
        } catch (err) {
          console.warn('Failed to delete storage object; proceeding to update index', err);
        }
      }
      const updated = images.filter(img => img.id !== id);
      await saveJson('gallery', updated);
      setImages(updated);
    } catch (err) {
      setError('Failed to delete image');
      console.error('Delete error:', err);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 py-10">
      <div className="max-w-5xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-center mb-8 text-brand-700 dark:text-brand-300">
          {t('admin.gallery.title')}
        </h1>
        <div className="mb-8 p-6 bg-white dark:bg-slate-800 rounded-lg shadow">
          <h2 className="h2 mb-4">Upload New Image</h2>
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
              {error}
            </div>
          )}
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            {IS_FIREBASE_CONFIGURED ? 'Images are uploaded to Firebase Storage and indexed for display.' : 'Firebase not configured — images are stored as data URLs locally for preview only.'}
          </p>
          <div className="flex flex-col md:flex-row gap-4">
            <input
              type="file"
              onChange={handleFileChange}
              accept="image/*"
              className="flex-1 p-2 border rounded"
              disabled={uploading}
            />
            <button
              onClick={handleUpload}
              disabled={!file || uploading}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {uploading ? 'Uploading...' : 'Upload'}
            </button>
          </div>
          {images.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No images in the gallery yet. Upload some images to get started.
            </div>
          ) : (
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {images.map((img) => (
                <div key={img.id} className="relative group bg-white dark:bg-slate-700 rounded-lg shadow p-4">
                  <img
                    src={img.url}
                    alt={img.name}
                    className="w-full h-48 object-cover rounded-lg mb-3"
                    loading="lazy"
                  />
                  
                  {editingId === img.id ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full px-2 py-1 border rounded text-sm dark:bg-slate-600 dark:text-white dark:border-slate-500"
                        placeholder="Image name"
                      />
                      <input
                        type="date"
                        value={editDate}
                        onChange={(e) => setEditDate(e.target.value)}
                        className="w-full px-2 py-1 border rounded text-sm dark:bg-slate-600 dark:text-white dark:border-slate-500"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => saveEdit(img.id)}
                          className="flex-1 px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                        >
                          Save
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="flex-1 px-3 py-1 bg-gray-500 text-white text-sm rounded hover:bg-gray-600"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="text-sm text-gray-700 dark:text-gray-200 font-medium truncate mb-1">
                        {img.name}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                        {new Date(img.created).toLocaleDateString()}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => startEdit(img)}
                          className="flex-1 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                          disabled={uploading}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(img.id)}
                          className="flex-1 px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                          disabled={uploading}
                        >
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
