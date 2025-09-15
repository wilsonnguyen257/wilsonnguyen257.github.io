import { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { subscribeJson } from '../lib/storage';
type GalleryItem = { id: string; url: string; name: string; created: number };

export default function Gallery() {
  const { t } = useLanguage();
  const [images, setImages] = useState<Array<{ id: string; url: string; name: string; created: number }>>([]);
  const [loading, setLoading] = useState(true);

  // Load gallery items from Cloudinary JSON
  useEffect(() => {
    const unsub = subscribeJson<GalleryItem[]>(
      'gallery',
      (items) => {
        setImages(items || []);
        setLoading(false);
      },
      () => setLoading(false)
    );
    return () => { unsub(); };
  }, []);



  return (
    <section className="container-xl py-12">
  <h1 className="h1 text-center">{t('gallery.title')}</h1>
      <p className="mt-3 p-muted max-w-prose mx-auto text-center">{t('gallery.subtitle')}</p>
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-600 dark:border-brand-300"></div>
        </div>
      ) : images.length === 0 ? (
        <div className="flex flex-col items-center py-20">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-brand-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M9 10l3 3m0 0l3-3m-3 3V4" />
          </svg>
          <p className="text-xl text-gray-500 dark:text-slate-400">{t('gallery.empty')}</p>
        </div>
      ) : (
        <div className="grid gap-6 mt-8 md:grid-cols-2 lg:grid-cols-3">
          {images.map((img) => (
            <div key={img.id} className="card relative group overflow-hidden">
              <img
                src={img.url}
                alt={img.name}
                className="w-full h-64 object-cover rounded-xl"
                loading="lazy"
              />
              <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/60 to-transparent px-4 py-2 text-white text-sm font-medium opacity-0 group-hover:opacity-100 transition">
                {img.name}
                <span className="ml-2 text-xs text-gray-300">{new Date(img.created).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
