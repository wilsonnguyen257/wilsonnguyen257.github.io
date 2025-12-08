import React, { useState, useEffect } from 'react';
import { getJson, saveJson } from '../lib/storage';
import { v4 as uuidv4 } from 'uuid';
import { IS_FIREBASE_CONFIGURED, storage as fbStorage } from '../lib/firebase';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { useLanguage } from '../contexts/LanguageContext';

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
        setError(t('admin.gallery.error_load'));
      } finally {
        if (active) setUploading(false);
      }
    })();
    return () => { active = false; };
  }, [t]);

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
      setError(t('admin.gallery.error_upload'));
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
      setError(t('admin.gallery.error_update'));
      console.error('Update error:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm(t('admin.gallery.confirm_delete'))) return;
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
      setError(t('admin.gallery.error_delete'));
      console.error('Delete error:', err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-6 py-4 rounded-r-lg mb-6 flex items-start gap-3 shadow-md">
            <svg className="w-6 h-6 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
            </svg>
            <span>{error}</span>
          </div>
        )}
        
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-slate-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-slate-900">{t('admin.gallery.upload_new')}</h2>
          </div>
          <p className="text-sm text-slate-600 mb-4 flex items-start gap-2">
            <svg className="w-5 h-5 flex-shrink-0 mt-0.5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
            </svg>
            <span>{IS_FIREBASE_CONFIGURED ? t('admin.gallery.firebase_desc') : t('admin.gallery.no_firebase')}</span>
          </p>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <input
                id="file-upload"
                type="file"
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
                disabled={uploading}
              />
              <label
                htmlFor="file-upload"
                className="flex items-center gap-3 p-2.5 border border-slate-300 rounded-lg bg-white text-slate-700 cursor-pointer hover:border-brand-500 transition-colors"
              >
                <span className="px-4 py-2 rounded-lg border-0 text-sm font-semibold bg-brand-50 text-brand-700 hover:bg-brand-100 transition-colors">
                  {t('admin.gallery.choose_file')}
                </span>
                <span className="flex-1 text-sm truncate">
                  {file ? file.name : t('admin.gallery.no_file')}
                </span>
              </label>
            </div>
            <button
              onClick={handleUpload}
              disabled={!file || uploading}
              className="px-6 py-2.5 bg-brand-600 text-white font-semibold rounded-lg hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
            >
              {uploading ? (
                <>
                  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>{t('admin.gallery.uploading')}</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <span>{t('admin.gallery.upload_button')}</span>
                </>
              )}
            </button>
          </div>
        </div>
          
        {images.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center border border-slate-200">
            <svg className="w-20 h-20 mx-auto text-slate-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-slate-500 font-medium text-lg">{t('admin.gallery.no_images')}</p>
          </div>
        ) : (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {images.map((img) => (
              <div key={img.id} className="relative group bg-white rounded-xl shadow-lg overflow-hidden border border-slate-200 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                <div className="relative overflow-hidden">
                  <img
                    src={img.url}
                    alt={img.name}
                    className="w-full h-56 object-cover transition-transform duration-300 group-hover:scale-110"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                
                <div className="p-4">
                  {editingId === img.id ? (
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                        placeholder={t('admin.gallery.name')}
                      />
                      <input
                        type="date"
                        value={editDate}
                        onChange={(e) => setEditDate(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-transparent [color-scheme:light]"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => saveEdit(img.id)}
                          className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-lg hover:bg-emerald-700 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span>{t('admin.gallery.save')}</span>
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 bg-slate-500 text-white text-sm font-semibold rounded-lg hover:bg-slate-600 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          <span>{t('admin.gallery.cancel')}</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="text-sm text-slate-900 font-semibold truncate mb-1">
                        {img.name}
                      </div>
                      <div className="text-xs text-slate-500 mb-3 flex items-center gap-1.5">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>{new Date(img.created).toLocaleDateString()}</span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => startEdit(img)}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                          disabled={uploading}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          <span>{t('admin.gallery.edit')}</span>
                        </button>
                        <button
                          onClick={() => handleDelete(img.id)}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 transition-colors"
                          disabled={uploading}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          <span>{t('admin.gallery.delete')}</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
