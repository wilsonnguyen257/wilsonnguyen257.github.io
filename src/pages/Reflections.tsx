import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../contexts/LanguageContext";
import { dataApi } from "../lib/cloudinaryData";

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

// Data now comes from Cloudinary JSON

export default function Reflections() {
  const { t, language } = useLanguage();
  const [reflections, setReflections] = useState<ReflectionItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAuthor, setSelectedAuthor] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "title">("newest");
  
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const items = await dataApi.getReflections();
        const mapped: ReflectionItem[] = (items || []).map((it: any) => ({
          id: it.id,
          title: { vi: it.title?.vi || '', en: it.title?.en || it.title?.vi || '' },
          content: { vi: it.content?.vi || '', en: it.content?.en || it.content?.vi || '' },
          date: it.date,
          author: it.author,
        }));
        if (active) setReflections(mapped);
      } catch (err) {
        console.error('Failed to load reflections from Cloudinary JSON:', err);
        if (active) setReflections([]);
      }
    })();
    return () => { active = false; };
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
        case "title":
          const aTitle = a.title[language] || a.title.vi;
          const bTitle = b.title[language] || b.title.vi;
          return aTitle.localeCompare(bTitle);
        default:
          return 0;
      }
    });

  return (
    <div className="bg-white dark:bg-slate-900">
      {/* Hero Section */}
      <section className="bg-brand-50 dark:bg-slate-800 py-16">
        <div className="container-xl">
          <h1 className="h1 text-center">{t('reflections.title')}</h1>
          <p className="mt-6 p-muted max-w-3xl mx-auto text-center text-lg">
            {t('reflections.subtitle')}
          </p>
        </div>
      </section>

      {/* Filter Section */}
      <section className="py-8 bg-slate-50 dark:bg-slate-800/50">
        <div className="container-xl">
          <div className="max-w-4xl mx-auto">
            <div className="grid gap-4 md:grid-cols-3">
              {/* Search */}
              <div>
                <label className="block text-sm font-medium mb-2">{t('reflections.search')}</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400">🔍</span>
                  <input
                    type="text"
                    placeholder={t('reflections.search_placeholder')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-300 focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Author Filter */}
              <div>
                <label className="block text-sm font-medium mb-2">{t('reflections.author')}</label>
                <select
                  value={selectedAuthor}
                  onChange={(e) => setSelectedAuthor(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                >
                  <option value="" className="bg-white dark:bg-slate-700 text-slate-900 dark:text-white">{t('reflections.all_authors')}</option>
                  {authors.map(author => (
                    <option key={author} value={author} className="bg-white dark:bg-slate-700 text-slate-900 dark:text-white">{author}</option>
                  ))}
                </select>
              </div>

              {/* Sort */}
              <div>
                <label className="block text-sm font-medium mb-2">{t('reflections.sort')}</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as "newest" | "oldest" | "title")}
                  className="w-full px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                >
                  <option value="newest" className="bg-white dark:bg-slate-700 text-slate-900 dark:text-white">{t('reflections.newest')}</option>
                  <option value="oldest" className="bg-white dark:bg-slate-700 text-slate-900 dark:text-white">{t('reflections.oldest')}</option>
                  <option value="title" className="bg-white dark:bg-slate-700 text-slate-900 dark:text-white">{t('reflections.by_title')}</option>
                </select>
              </div>
            </div>

            {/* Results count */}
            <div className="mt-4 text-sm text-slate-600 dark:text-slate-400">
              {t('reflections.showing')} {filteredReflections.length} {t('reflections.of')} {reflections.length} {t('reflections.reflections')}
            </div>
          </div>
        </div>
      </section>

      {/* Reflections List */}
      <section className="py-16">
        <div className="container-xl">
          {filteredReflections.length === 0 && reflections.length > 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold mb-2">{t('reflections.no_results')}</h3>
              <p className="p-muted">{t('reflections.no_results_desc')}</p>
              <button 
                onClick={() => {
                  setSearchTerm("");
                  setSelectedAuthor("");
                  setSortBy("newest");
                }}
                className="btn btn-outline mt-4"
              >
                {t('reflections.clear_filters')}
              </button>
            </div>
          ) : reflections.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📖</div>
              <h3 className="text-xl font-semibold mb-2">{t('reflections.no_reflections')}</h3>
              <p className="p-muted">{t('reflections.no_reflections_desc')}</p>
            </div>
          ) : (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {filteredReflections.map((reflection) => {
                return (
                  <Link
                    key={reflection.id}
                    to={`/reflections/${reflection.id}`}
                    className="card group hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                  >
                    <div className="mb-4">
                      <div className="inline-block bg-brand-100 text-brand-700 rounded-full px-3 py-1 text-sm font-medium dark:bg-brand-900 dark:text-brand-100">
                        {t('reflections.gospel')}
                      </div>
                    </div>
                    
                    <h2 className="text-xl font-semibold text-brand-600 dark:text-brand-400 mb-3 group-hover:text-brand-700 dark:group-hover:text-brand-300 transition-colors">
                      {reflection.title[language] || reflection.title.vi}
                    </h2>
                    
                    <p className="p-muted line-clamp-3 mb-4">
                      {(() => {
                        const content = reflection.content[language] || reflection.content.vi;
                        return content.slice(0, 150) + (content.length > 150 ? '...' : '');
                      })()}
                    </p>
                    
                    <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
                      <span className="flex items-center">
                        <span className="mr-1">📅</span>
                        {reflection.date || t('reflections.recently')}
                      </span>
                      <span className="text-brand-600 dark:text-brand-400 font-medium group-hover:text-brand-700 dark:group-hover:text-brand-300">
                        {t('reflections.read_more')}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
