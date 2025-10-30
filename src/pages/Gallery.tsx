import { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { subscribeJson } from '../lib/storage';
type GalleryItem = { id: string; url: string; name: string; created: number };

export default function Gallery() {
  const { t } = useLanguage();
  const [images, setImages] = useState<Array<{ id: string; url: string; name: string; created: number }>>([]);
  const [loading, setLoading] = useState(true);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState<GalleryItem | null>(null);

  // Load gallery items from Firebase Storage JSON
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

  const openLightbox = (img: GalleryItem) => {
    setCurrentImage(img);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    setCurrentImage(null);
  };

  const showNext = () => {
    if (!currentImage) return;
    const currentIndex = images.findIndex(img => img.id === currentImage.id);
    const nextIndex = (currentIndex + 1) % images.length;
    setCurrentImage(images[nextIndex]);
  };

  const showPrevious = () => {
    if (!currentImage) return;
    const currentIndex = images.findIndex(img => img.id === currentImage.id);
    const prevIndex = (currentIndex - 1 + images.length) % images.length;
    setCurrentImage(images[prevIndex]);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!lightboxOpen) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') showNext();
      if (e.key === 'ArrowLeft') showPrevious();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxOpen, currentImage, images]);


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
            <div 
              key={img.id} 
              className="card relative group overflow-hidden cursor-pointer"
              onClick={() => openLightbox(img)}
            >
              <img
                src={img.url}
                alt={img.name}
                className="w-full h-64 object-cover rounded-xl transition-transform duration-300 group-hover:scale-110"
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

      {/* Lightbox Modal */}
      {lightboxOpen && currentImage && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={closeLightbox}
        >
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition"
            aria-label="Close"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {images.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); showPrevious(); }}
                className="absolute left-4 text-white hover:text-gray-300 transition"
                aria-label="Previous"
              >
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <button
                onClick={(e) => { e.stopPropagation(); showNext(); }}
                className="absolute right-4 text-white hover:text-gray-300 transition"
                aria-label="Next"
              >
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}

          <div 
            className="max-w-7xl max-h-full flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={currentImage.url}
              alt={currentImage.name}
              className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
            />
            <div className="mt-4 text-white text-center">
              <h3 className="text-xl font-semibold">{currentImage.name}</h3>
              <p className="text-sm text-gray-300 mt-1">
                {new Date(currentImage.created).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
