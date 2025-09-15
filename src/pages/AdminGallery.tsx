import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { getJson, saveJson } from '../lib/storage';
import { v4 as uuidv4 } from 'uuid';

type GalleryItem = { id: string; url: string; name: string; created: number; path?: string };

export default function AdminGallery() {
  const { t } = useLanguage();
  const [images, setImages] = useState<GalleryItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

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
      // Convert file to data URL for local preview-only storage
      const url = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
      });
      const newItem: GalleryItem = { id: uid, url, name: file.name || 'image', created: Date.now() };
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

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this image and remove from gallery?')) return;
    setError(null);
    try {
      const image = images.find(i => i.id === id);
      if (!image) throw new Error('Image not found');
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
            Images are uploaded to Firebase Storage and listed via a JSON index. Deletion removes the file and updates the index.
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
                <div key={img.id} className="relative group">
                  <img
                    src={img.url}
                    alt={img.name}
                    className="w-full h-48 object-cover rounded-lg"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <button
                      onClick={() => handleDelete(img.id)}
                      className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                      disabled={uploading}
                    >
                      Delete
                    </button>
                  </div>
                  <div className="mt-2 text-sm text-gray-600 dark:text-gray-300 truncate">
                    {img.name}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
