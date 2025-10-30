import { useEffect, useState } from "react";
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
};
type ReflectionItem = Reflection & { id: string };

// Data now comes from Firebase Storage JSON

export default function Reflections() {
  const { t, language } = useLanguage();
  const [reflections, setReflections] = useState<ReflectionItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAuthor, setSelectedAuthor] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "title">("newest");
  
  useEffect(() => {
    const unsub = subscribeJson<ReflectionItem[]>(
      'reflections',
      (items) => {
        const mapped: ReflectionItem[] = (items || []).map((it) => ({
          id: it.id,
          title: { vi: it.title?.vi || '', en: it.title?.en || it.title?.vi || '' },
          content: { vi: it.content?.vi || '', en: it.content?.en || it.content?.vi || '' },
          date: it.date,
          author: it.author,
        }));
        setReflections(mapped);
      },
      () => setReflections([])
    );
    return () => { unsub(); };
  }, []);

  // Get unique authors for filter
  const authors = Array.from(new Set(reflections.map(r => r.author).filter(Boolean)));

  // Filter and sort reflections
  const filteredReflections = reflections.filter(reflection => {
    const title = reflection.title[language] || reflection.title.vi;
    const content = reflection.content[language] || reflection.content.vi;
    const matchesSearch = title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAuthor = !selectedAuthor || reflection.author === selectedAuthor;
    return matchesSearch && matchesAuthor;
  })
    .sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.date || "").getTime() - new Date(a.date || "").getTime();
        case "oldest":
          return new Date(a.date || "").getTime() - new Date(b.date || "").getTime();
        case "title": {
          const aTitle = a.title[language] || a.title.vi;
          const bTitle = b.title[language] || b.title.vi;
          return aTitle.localeCompare(bTitle);
        }
        default:
          return 0;
      }
    });

  // Get featured reflection (most recent)
  const featuredReflection = filteredReflections.length > 0 ? filteredReflections[0] : null;
  const otherReflections = filteredReflections.slice(1);

  return (
    <div className="bg-slate-50 dark:bg-slate-900">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-brand-600 to-brand-800 text-white py-20">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30"></div>
        <div className="container-xl relative">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z"/>
              </svg>
              <span className="font-medium">{t('reflections.gospel')}</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{t('reflections.title')}</h1>
            <p className="text-xl text-white/90 leading-relaxed">{t('reflections.subtitle')}</p>
          </div>
        </div>
      </section>

      {/* Filter Section */}
      <section className="py-8 bg-white dark:bg-slate-800 shadow-sm">
        <div className="container-xl">
          <div className="max-w-5xl mx-auto">
            <div className="grid gap-4 md:grid-cols-3">
              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  {t('reflections.search')}
                </label>
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder={t('reflections.search_placeholder')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-colors"
                  />
                </div>
              </div>

              {/* Author Filter */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  {t('reflections.author')}
                </label>
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <select
                    value={selectedAuthor}
                    onChange={(e) => setSelectedAuthor(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent appearance-none transition-colors"
                  >
                    <option value="">{t('reflections.all_authors')}</option>
                    {authors.map(author => (
                      <option key={author} value={author}>{author}</option>
                    ))}
                  </select>
                  <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {/* Sort */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  {t('reflections.sort')}
                </label>
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                  </svg>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as "newest" | "oldest" | "title")}
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent appearance-none transition-colors"
                  >
                    <option value="newest">{t('reflections.newest')}</option>
                    <option value="oldest">{t('reflections.oldest')}</option>
                    <option value="title">{t('reflections.by_title')}</option>
                  </select>
                  <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Results count and clear filters */}
            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-slate-600 dark:text-slate-400">
                {t('reflections.showing')} <span className="font-semibold text-slate-900 dark:text-white">{filteredReflections.length}</span> {t('reflections.of')} <span className="font-semibold text-slate-900 dark:text-white">{reflections.length}</span> {t('reflections.reflections')}
              </div>
              {(searchTerm || selectedAuthor || sortBy !== "newest") && (
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedAuthor("");
                    setSortBy("newest");
                  }}
                  className="text-sm text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 font-medium transition-colors"
                >
                  {t('reflections.clear_filters')}
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Reflection */}
      {featuredReflection && (
        <section className="py-12 bg-white dark:bg-slate-800">
          <div className="container-xl">
            <div className="max-w-5xl mx-auto">
              <div className="flex items-center gap-2 mb-6">
                <svg className="w-5 h-5 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                </svg>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{t('reflections.featured')}</h2>
              </div>
              
              <Link
                to={`/reflections/${featuredReflection.id}`}
                className="group block bg-gradient-to-br from-white to-slate-50 dark:from-slate-700 dark:to-slate-800 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden border border-slate-200 dark:border-slate-600"
              >
                <div className="p-8 md:p-10">
                  <div className="flex flex-wrap items-center gap-3 mb-6">
                    <span className="inline-flex items-center gap-2 bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 rounded-full px-4 py-1.5 text-sm font-semibold">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z"/>
                      </svg>
                      {t('reflections.gospel')}
                    </span>
                    {featuredReflection.author && (
                      <span className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 text-sm">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        {featuredReflection.author}
                      </span>
                    )}
                  </div>
                  
                  <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-4 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                    {featuredReflection.title[language] || featuredReflection.title.vi}
                  </h3>
                  
                  <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed mb-6 line-clamp-3">
                    {(() => {
                      const content = featuredReflection.content[language] || featuredReflection.content.vi;
                      return content.slice(0, 200) + (content.length > 200 ? '...' : '');
                    })()}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>{featuredReflection.date || t('reflections.recently')}</span>
                    </div>
                    <span className="inline-flex items-center gap-2 text-brand-600 dark:text-brand-400 font-semibold group-hover:gap-3 transition-all">
                      {t('reflections.read_more')}
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </span>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Reflections Grid */}
      <section className="py-16">
        <div className="container-xl">
          {filteredReflections.length === 0 && reflections.length > 0 ? (
            <div className="text-center py-16 max-w-md mx-auto">
              <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">{t('reflections.no_results')}</h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6">{t('reflections.no_results_desc')}</p>
              <button 
                onClick={() => {
                  setSearchTerm("");
                  setSelectedAuthor("");
                  setSortBy("newest");
                }}
                className="inline-flex items-center gap-2 px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                {t('reflections.clear_filters')}
              </button>
            </div>
          ) : reflections.length === 0 ? (
            <div className="text-center py-16 max-w-md mx-auto">
              <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">{t('reflections.no_reflections')}</h3>
              <p className="text-slate-600 dark:text-slate-400">{t('reflections.no_reflections_desc')}</p>
            </div>
          ) : otherReflections.length > 0 ? (
            <>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8">{t('reflections.all_reflections')}</h2>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {otherReflections.map((reflection) => {
                  return (
                    <Link
                      key={reflection.id}
                      to={`/reflections/${reflection.id}`}
                      className="group bg-white dark:bg-slate-800 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-slate-200 dark:border-slate-700 hover:-translate-y-1"
                    >
                      <div className="p-6">
                        <div className="flex items-center gap-2 mb-4">
                          <span className="inline-flex items-center gap-1.5 bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 rounded-full px-3 py-1 text-xs font-semibold">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z"/>
                            </svg>
                            {t('reflections.gospel')}
                          </span>
                        </div>
                        
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors line-clamp-2">
                          {reflection.title[language] || reflection.title.vi}
                        </h3>
                        
                        <p className="text-slate-600 dark:text-slate-300 mb-4 line-clamp-3 leading-relaxed">
                          {(() => {
                            const content = reflection.content[language] || reflection.content.vi;
                            return content.slice(0, 120) + (content.length > 120 ? '...' : '');
                          })()}
                        </p>
                        
                        <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700">
                          <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span>{reflection.date || t('reflections.recently')}</span>
                          </div>
                          <span className="inline-flex items-center gap-1 text-brand-600 dark:text-brand-400 font-medium text-sm group-hover:gap-2 transition-all">
                            {t('reflections.read_more')}
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </>
          ) : null}
        </div>
      </section>
    </div>
  );
}
