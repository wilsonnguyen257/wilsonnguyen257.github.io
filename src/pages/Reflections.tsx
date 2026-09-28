import { useEffect, useState } from "react";
import SEO from "../components/SEO";
import { Link } from "react-router-dom";
import { useLanguage } from "../contexts/LanguageContext";
import { subscribeJson } from "../lib/storage";
import ReflectionCover from "../components/ReflectionCover";

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
                    <div className="h-44 overflow-hidden bg-slate-200 shrink-0">
                      {reflection.thumbnail ? (
                        <img
                          src={reflection.thumbnail}
                          alt={reflection.title[language] || reflection.title.vi}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <ReflectionCover content={reflection.content.vi} date={reflection.date} className="h-full" />
                      )}
                    </div>
                    <div className="p-6 flex flex-col gap-3 flex-1">
                      <p className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-600 nums-lining">
                        {reflection.date && /^\d{4}-\d{2}-\d{2}$/.test(reflection.date) ? (
                          <time dateTime={reflection.date}>
                            {new Date(`${reflection.date}T00:00`).toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-AU', { day: 'numeric', month: 'long', year: 'numeric' })}
                          </time>
                        ) : (reflection.date || t('reflections.recently'))}
                      </p>
                      <div>
                        <h3 className="font-serif text-xl font-bold text-slate-900 leading-snug group-hover:text-brand-600 transition-colors">
                          {reflection.title[language] || reflection.title.vi}
                        </h3>
                        {/* The same Gospel is often shared by more than one
                            author — the byline is how readers tell them apart. */}
                        {reflection.author && (
                          <p className="mt-1.5 flex items-center gap-1.5 text-sm font-semibold text-slate-700">
                            <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className="w-4 h-4 shrink-0 text-slate-600">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                            </svg>
                            <span className="truncate">{reflection.author}</span>
                          </p>
                        )}
                      </div>
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
