import { useParams, useNavigate } from "react-router-dom";
import SEO from "../components/SEO";
import { useEffect, useState } from "react";
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

export default function ReflectionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const [reflection, setReflection] = useState<Reflection | null>(null);

  useEffect(() => {
    if (!id) return;
    type Item = Reflection & { id: string };
    const unsub = subscribeJson<Item[]>(
      'reflections',
      (items) => {
        const found = (items || []).find((r) => r.id === id);
        if (!found) {
          navigate("/reflections");
          return;
        }
        const mapped: Reflection = {
          title: { vi: found.title?.vi || '', en: found.title?.en || found.title?.vi || '' },
          content: { vi: found.content?.vi || '', en: found.content?.en || found.content?.vi || '' },
          date: found.date,
          author: found.author,
        };
        setReflection(mapped);
      },
      (e) => {
        console.error('Failed to load reflection detail:', e);
        navigate("/reflections");
      }
    );
    return () => { unsub(); };
  }, [id, navigate]);

  if (!reflection) return null;

  const title = typeof reflection.title === 'string' ? reflection.title : (reflection.title[language] || reflection.title.vi);
  const content = typeof reflection.content === 'string' ? reflection.content : (reflection.content[language] || reflection.content.vi);
  
  const stripHtml = (html: string) => {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  return (
    <div className="bg-slate-50 min-h-screen">
      <SEO 
        title={title}
        description={stripHtml(content).slice(0, 160) + '...'}
      />
      {/* Header */}
      <section className="relative bg-gradient-to-br from-brand-600 to-brand-800 text-white py-16">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30"></div>
        <div className="container-xl max-w-4xl mx-auto relative">
          <button 
            onClick={() => navigate("/reflections")}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm hover:bg-white/20 rounded-lg font-semibold transition-all mb-8"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            {t('reflections.back_to_list')}
          </button>
          
          <div className="mb-4">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z"/>
              </svg>
              <span className="text-sm font-semibold">{t('reflections.gospel')}</span>
            </div>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold mb-6">
            {typeof reflection.title === 'string' ? reflection.title : (reflection.title[language] || reflection.title.vi)}
          </h1>
          
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>{reflection.date || t('reflections.recently')}</span>
            </div>
            {reflection.author && (
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span>{reflection.author}</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-20">
        <div className="container-xl max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 border border-slate-200">
            <div 
              className="prose prose-lg max-w-none prose-headings:text-slate-900 prose-p:text-slate-700 prose-p:leading-relaxed"
              dangerouslySetInnerHTML={{ 
                __html: typeof reflection.content === 'string' 
                  ? reflection.content 
                  : (reflection.content[language] || reflection.content.vi) 
              }}
            />
          </div>
          
          {/* Navigation */}
          <div className="mt-8">
            <button 
              onClick={() => navigate("/reflections")}
              className="btn btn-outline"
            >
              ← {t('reflections.back_to_list')}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
