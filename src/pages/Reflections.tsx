import { useEffect, useState } from "react";
import SEO from "../components/SEO";
import { Link } from "react-router-dom";
import { useLanguage } from "../contexts/LanguageContext";
import { subscribeJson } from "../lib/storage";

type Reflection = {
  title: {
    vi: string;
    en: string;
  };
  content: {
    vi: string;
    en: string;
  };
  date?: string;
  author?: string;
  thumbnail?: string;
  status?: 'draft' | 'published';
};
type ReflectionItem = Reflection & { id: string };

// Helper function to strip HTML tags for preview text
const stripHtml = (html: string): string => {
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
};

export default function Reflections() {
  const { t, language } = useLanguage();
  const [reflections, setReflections] = useState<ReflectionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(9);

  useEffect(() => {
    const unsub = subscribeJson<ReflectionItem[]>(
      'reflections',
      (items) => {
        const mapped: ReflectionItem[] = (items || []).map((it) => {
          // Ensure both languages have content
          const titleVi = it.title?.vi || it.title?.en || '';
          const titleEn = it.title?.en || it.title?.vi || '';
          const contentVi = it.content?.vi || it.content?.en || '';
          const contentEn = it.content?.en || it.content?.vi || '';

          return {
            id: it.id,
            title: { vi: titleVi, en: titleEn },
            content: { vi: contentVi, en: contentEn },
            date: it.date,
            author: it.author,
            thumbnail: it.thumbnail,
            status: it.status || 'published',
          };
        }).filter(r => r.status === 'published')
          .sort((a, b) => new Date(b.date || "").getTime() - new Date(a.date || "").getTime());
        setReflections(mapped);
        setLoading(false);
      },
      () => {
        setReflections([]);
        setLoading(false);
      }
    );
    return () => { unsub(); };
  }, []);

  return (
    <div className="bg-surface min-h-screen">
      <SEO
        title={t('reflections.title')}
        description={t('reflections.subtitle')}
      />

      <section className="pt-16 pb-2 text-center">
        <div className="container-xl">
          <h1 className="h1 !text-4xl md:!text-5xl">{t('reflections.title')}</h1>
          <p className="mt-4 text-slate-600 max-w-lg mx-auto">{t('reflections.subtitle')}</p>
        </div>
      </section>

      {/* A plain 3-up grid of hoverable cards, per the prototype — no
          featured/archive split, no search: date, title, body preview,
          "Đọc thêm" — plus a thumbnail on top when the post has one. */}
      <section className="pt-10 pb-20">
        <div className="container-xl">
          {loading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
              {[1, 2, 3].map((i) => (
                <div key={i} className="card !p-0 overflow-hidden animate-pulse">
                  <div className="h-40 bg-slate-200" />
                  <div className="p-6 space-y-3">
                    <div className="h-3 w-1/3 bg-slate-200 rounded" />
                    <div className="h-5 w-3/4 bg-slate-200 rounded" />
                    <div className="h-3 w-full bg-slate-200 rounded" />
                    <div className="h-3 w-2/3 bg-slate-200 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : reflections.length === 0 ? (
            <p className="text-slate-600 text-center py-16">{t('reflections.no_reflections')}</p>
          ) : (
            <>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
                {reflections.slice(0, visibleCount).map((reflection) => (
                  <Link
                    key={reflection.id}
                    to={`/reflections/${reflection.id}`}
                    className="card !p-0 overflow-hidden flex flex-col group"
                  >
                    <div className="h-40 overflow-hidden bg-slate-200 shrink-0">
                      {reflection.thumbnail ? (
                        <img
                          src={reflection.thumbnail}
                          alt={reflection.title[language] || reflection.title.vi}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400">
                          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="p-6 flex flex-col gap-3 flex-1">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                        {reflection.date || t('reflections.recently')}
                      </p>
                      <h3 className="font-serif text-xl font-bold text-slate-900 leading-snug group-hover:text-brand-600 transition-colors">
                        {reflection.title[language] || reflection.title.vi}
                      </h3>
                      <p className="text-sm text-slate-600 leading-relaxed line-clamp-3">
                        {stripHtml(reflection.content[language] || reflection.content.vi)}
                      </p>
                      <span className="text-brand-600 font-semibold text-sm mt-1">{t('reflections.read_more')}</span>
                    </div>
                  </Link>
                ))}
              </div>
              {reflections.length > visibleCount && (
                <div className="text-center mt-10">
                  <button onClick={() => setVisibleCount((v) => v + 9)} className="btn btn-outline">
                    {t('reflections.load_more')}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}
