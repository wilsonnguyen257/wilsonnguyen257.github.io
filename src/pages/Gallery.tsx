import { useState, useEffect, useMemo } from 'react';
import SEO from '../components/SEO';
import PageHero from '../components/PageHero';
import { useLanguage } from '../contexts/LanguageContext';
import { subscribeJson } from '../lib/storage';
import { GallerySkeleton } from '../components/Skeleton';
import LightboxViewer from '../components/gallery/LightboxViewer';
import type { ImageMetadata } from '../types/gallery';

type GalleryItem = { id: string; url: string; name: string; created: number; thumbnailUrl?: string };
type GalleryGroup = { key: string; label: string; items: GalleryItem[] };

// Groups items into month buckets, in the order they appear (caller controls sort order).
function groupByMonth(items: GalleryItem[], locale: string): GalleryGroup[] {
  const groups: GalleryGroup[] = [];
  const indexByKey = new Map<string, number>();

  for (const item of items) {
    const d = new Date(item.created);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    let idx = indexByKey.get(key);
    if (idx === undefined) {
      const label = d.toLocaleDateString(locale, { month: 'long', year: 'numeric' });
      idx = groups.push({ key, label, items: [] }) - 1;
      indexByKey.set(key, idx);
    }
    groups[idx].items.push(item);
  }

  return groups;
}

export default function Gallery() {
  const { t, language } = useLanguage();
  const [images, setImages] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

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

  const filteredSorted = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    const filtered = term
      ? images.filter((img) => img.name.toLowerCase().includes(term))
      : images;
    return [...filtered].sort((a, b) =>
      sortBy === 'newest' ? b.created - a.created : a.created - b.created
    );
  }, [images, searchTerm, sortBy]);

  const groups = useMemo(
    () => groupByMonth(filteredSorted, language === 'vi' ? 'vi-VN' : 'en-US'),
    [filteredSorted, language]
  );

  // Adapt our simple GalleryItem into the richer shape LightboxViewer expects
  const lightboxImages: ImageMetadata[] = useMemo(
    () =>
      filteredSorted.map((img) => ({
        id: img.id,
        url: img.url,
        name: img.name,
        originalName: img.name,
        tags: [],
        uploadedAt: new Date(img.created).toISOString(),
        size: 0,
      })),
    [filteredSorted]
  );

  const openLightbox = (img: GalleryItem) => {
    const idx = filteredSorted.findIndex((i) => i.id === img.id);
    if (idx !== -1) setLightboxIndex(idx);
  };

  const hasFilters = searchTerm !== '' || sortBy !== 'newest';
  const clearFilters = () => {
    setSearchTerm('');
    setSortBy('newest');
  };

  return (
    <div className="bg-white">
      <SEO
        title={t('gallery.title')}
        description={t('gallery.subtitle')}
      />
      <PageHero
        title={t('gallery.title')}
        subtitle={t('gallery.subtitle')}
        badgeLabel={t('gallery.title')}
        badgeIcon={
          <svg className="w-5 h-5 text-brand-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        }
      />

      {/* Gallery Grid Section */}
      <section className="py-20">
        <div className="container-xl">
          {!loading && images.length > 0 && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 mb-12 max-w-5xl mx-auto">
              <div className="grid gap-4 md:grid-cols-3">
                {/* Search */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider">
                    {t('gallery.search')}
                  </label>
                  <div className="relative">
                    <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                      type="text"
                      placeholder={t('gallery.search_placeholder')}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all hover:bg-white focus:bg-white"
                    />
                  </div>
                </div>

                {/* Sort */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider">
                    {t('gallery.sort')}
                  </label>
                  <div className="relative">
                    <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                    </svg>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest')}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:ring-2 focus:ring-brand-500 focus:border-transparent appearance-none transition-all hover:bg-white focus:bg-white cursor-pointer"
                    >
                      <option value="newest">{t('gallery.newest')}</option>
                      <option value="oldest">{t('gallery.oldest')}</option>
                    </select>
                    <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between pt-4 border-t border-slate-100">
                <div className="text-sm text-slate-500 font-medium">
                  {t('gallery.showing')} <span className="font-bold text-slate-900">{filteredSorted.length}</span> {t('gallery.of')} <span className="font-bold text-slate-900">{images.length}</span> {t('gallery.photos')}
                </div>
                {hasFilters && (
                  <button
                    onClick={clearFilters}
                    className="text-sm text-brand-600 hover:text-brand-700 font-bold transition-colors flex items-center gap-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    {t('gallery.clear_filters')}
                  </button>
                )}
              </div>
            </div>
          )}

          {loading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <GallerySkeleton key={i} />
              ))}
            </div>
          ) : images.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border-2 border-dashed border-slate-300">
              <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">{t('gallery.empty')}</h3>
              <p className="text-slate-600">Hình ảnh sẽ được cập nhật sớm.</p>
            </div>
          ) : filteredSorted.length === 0 ? (
            <div className="text-center py-16 max-w-md mx-auto">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">{t('gallery.no_results')}</h3>
              <p className="text-slate-600 mb-6">{t('gallery.no_results_desc')}</p>
              <button
                onClick={clearFilters}
                className="inline-flex items-center gap-2 px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
              >
                {t('gallery.clear_filters')}
              </button>
            </div>
          ) : (
            <div className="space-y-14">
              {groups.map((group) => (
                <div key={group.key}>
                  <h2 className="text-2xl font-semibold text-slate-900 mb-8 border-l-2 border-brand-500 pl-4 capitalize">
                    {group.label}
                  </h2>
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {group.items.map((img) => (
                      <div
                        key={img.id}
                        className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer border border-slate-100 hover:border-brand-200 hover:-translate-y-1"
                        onClick={() => openLightbox(img)}
                      >
                        <div className="aspect-[4/3] bg-slate-100 overflow-hidden relative">
                          <img
                            src={img.thumbnailUrl || img.url}
                            alt={img.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                            loading="lazy"
                          />

                          {/* Hover overlay (desktop) */}
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300"></div>
                          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transform scale-50 group-hover:scale-100 transition-all duration-300 border border-white/30">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                            </svg>
                          </div>
                        </div>

                        {/* Always-visible caption strip — readable on mobile, not just on hover */}
                        <div className="px-4 py-3 border-t border-slate-50">
                          <p className="text-sm font-semibold text-slate-800 line-clamp-1" title={img.name}>
                            {img.name}
                          </p>
                          <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span>{new Date(img.created).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <LightboxViewer
        images={lightboxImages}
        initialIndex={lightboxIndex ?? 0}
        isOpen={lightboxIndex !== null}
        onClose={() => setLightboxIndex(null)}
        allowDownloads
      />
    </div>
  );
}
