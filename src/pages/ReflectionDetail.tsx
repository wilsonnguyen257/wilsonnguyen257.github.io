import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useLanguage } from "../contexts/LanguageContext";

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

function getReflections(): Reflection[] {
  const data = localStorage.getItem("reflections");
  return data ? JSON.parse(data) : [];
}

export default function ReflectionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const [reflection, setReflection] = useState<Reflection | null>(null);

  useEffect(() => {
    const list = getReflections();
    const idx = Number(id);
    if (isNaN(idx) || idx < 0 || idx >= list.length) {
      navigate("/reflections");
      return;
    }
    setReflection(list[idx]);
  }, [id, navigate]);

  if (!reflection) return null;

  return (
    <div className="bg-white dark:bg-slate-900 min-h-screen">
      {/* Header */}
      <section className="bg-brand-50 dark:bg-slate-800 py-12">
        <div className="container-xl max-w-4xl mx-auto">
          <button 
            onClick={() => navigate("/reflections")}
            className="btn btn-outline mb-6 flex items-center gap-2"
          >
            ← {t('reflections.back_to_list')}
          </button>
          
          <div className="mb-4">
            <div className="inline-block bg-brand-100 text-brand-700 rounded-full px-4 py-2 text-sm font-medium dark:bg-brand-900 dark:text-brand-100">
              {t('reflections.gospel')}
            </div>
          </div>
          
          <h1 className="h1 mb-4">
            {typeof reflection.title === 'string' ? reflection.title : (reflection.title[language] || reflection.title.vi)}
          </h1>
          
          <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
            <span className="flex items-center gap-1">
              📅 {reflection.date || t('reflections.recently')}
            </span>
            {reflection.author && (
              <span className="flex items-center gap-1">
                ✍️ {reflection.author}
              </span>
            )}
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12">
        <div className="container-xl max-w-4xl mx-auto">
          <div className="card">
            <div className="prose prose-lg max-w-none dark:prose-invert">
              <div className="whitespace-pre-line leading-relaxed text-lg">
                {typeof reflection.content === 'string' ? reflection.content : (reflection.content[language] || reflection.content.vi)}
              </div>
            </div>
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
