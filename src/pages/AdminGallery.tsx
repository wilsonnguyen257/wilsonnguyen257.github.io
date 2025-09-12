import React, { useState, useEffect } from 'react';
import { getStorage, ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { useLanguage } from '../contexts/LanguageContext';
import { auth } from '../lib/firebase';

export default function AdminGallery() {
  const { t } = useLanguage();
  const [isAdmin, setIsAdmin] = useState(false);
  const [images, setImages] = useState<{ id: string; url: string; name: string; created: number }[]>([]);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user && user.email === import.meta.env.VITE_ADMIN_EMAIL) {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchImages = async () => {
      const db = getFirestore();
      const querySnapshot = await getDocs(collection(db, 'gallery'));
      setImages(querySnapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as { url: string; name: string; created: number }) })));
    };
    fetchImages();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    setFile(selected || null);
    if (selected) {
      setPreview(URL.createObjectURL(selected));
    } else {
      setPreview(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    const storage = getStorage();
    const storageRef = ref(storage, `gallery/${Date.now()}_${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);
    uploadTask.on('state_changed', null, null, async () => {
      const url = await getDownloadURL(storageRef);
      const db = getFirestore();
      await addDoc(collection(db, 'gallery'), { url, name: file.name, created: Date.now() });
      setUploading(false);
      setPreview(null);
      setFile(null);
      const querySnapshot = await getDocs(collection(db, 'gallery'));
      setImages(querySnapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as { url: string; name: string; created: number }) })));
    });
  };

  const handleDelete = async (id: string, url: string) => {
    const storage = getStorage();
    const imageRef = ref(storage, url.replace(/^.*\/o\//, ''));
    await deleteObject(imageRef);
    const db = getFirestore();
    await deleteDoc(doc(db, 'gallery', id));
    setImages(images.filter((img) => img.id !== id));
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-red-600">{t('admin.only')}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 py-10">
      <div className="max-w-5xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-center mb-8 text-brand-700 dark:text-brand-300">
          {t('admin.gallery.title')}
        </h1>
        <div className="mb-8 flex flex-col items-center">
          <input type="file" accept="image/*" onChange={handleFileChange} className="mb-4" />
          {preview && (
            <img src={preview} alt="Preview" className="w-64 h-64 object-cover rounded-xl mb-4 border" />
          )}
          <button
            onClick={handleUpload}
            disabled={uploading || !file}
            className="px-6 py-2 bg-brand-600 text-white rounded-full font-bold shadow hover:bg-brand-700 transition disabled:opacity-50"
          >
            {uploading ? t('admin.gallery.uploading') : t('admin.gallery.upload')}
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {images.map((img) => (
            <div key={img.id} className="relative group rounded-xl overflow-hidden shadow border bg-white dark:bg-slate-800">
              <img src={img.url} alt={img.name} className="w-full h-64 object-cover" />
              <button
                onClick={() => handleDelete(img.id, img.url)}
                className="absolute top-2 right-2 bg-red-600 text-white rounded-full px-3 py-1 text-xs opacity-0 group-hover:opacity-100 transition"
              >
                {t('admin.gallery.delete')}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
