import { useParams, useNavigate } from "react-router-dom";
import SEO from "../components/SEO";
import { useEffect, useState } from "react";
import { useLanguage } from "../contexts/LanguageContext";
import { subscribeJson } from "../lib/storage";
import { sanitizeRichHtml } from "../lib/sanitizeHtml";
import { getFacebookPluginUrl, getGoogleDriveEmbedUrl, getYouTubeEmbedUrl, validateOptionalExternalUrl } from "../lib/validation";

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
  facebookLink?: string;
  youtubeLink?: string;
  driveLink?: string;
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
          // Ensure both languages have content
          title: {
            vi: found.title?.vi || found.title?.en || '',
            en: found.title?.en || found.title?.vi || ''
          },
          content: {
            vi: found.content?.vi || found.content?.en || '',
            en: found.content?.en || found.content?.vi || ''
          },
          date: found.date,
          author: found.author,
          thumbnail: found.thumbnail,
          facebookLink: found.facebookLink,
          youtubeLink: found.youtubeLink,
          driveLink: found.driveLink,
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
  const safeContent = sanitizeRichHtml(content);
  const facebookLink = validateOptionalExternalUrl(reflection.facebookLink || '', 'facebook').normalized;
  const youtubeLink = validateOptionalExternalUrl(reflection.youtubeLink || '', 'youtube').normalized;
  const driveLink = validateOptionalExternalUrl(reflection.driveLink || '', 'drive').normalized;
  const facebookPluginUrl = getFacebookPluginUrl(facebookLink);
  const youtubeEmbedUrl = getYouTubeEmbedUrl(youtubeLink);
  const driveEmbedUrl = getGoogleDriveEmbedUrl(driveLink);
  
  const stripHtml = (html: string) => {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  return (
    <div className="bg-white min-h-screen">
      <SEO
        title={title}
        description={stripHtml(safeContent).slice(0, 160) + '...'}
      />
      {/* Header */}
      <section className="border-b border-slate-100 py-16">
        <div className="container-xl max-w-4xl mx-auto">
          <div className="mb-8">
            <button
              onClick={() => navigate("/reflections")}
              className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              {t('reflections.back_to_list')}
            </button>
          </div>

          <p className="eyebrow mb-4">{t('reflections.gospel')}</p>

          <h1 className="text-3xl md:text-4xl font-semibold text-slate-900 mb-6 tracking-tight">
            {typeof reflection.title === 'string' ? reflection.title : (reflection.title[language] || reflection.title.vi)}
          </h1>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-slate-500">
            <span>{reflection.date || t('reflections.recently')}</span>
            {reflection.author && <span>{reflection.author}</span>}

            {/* Social Links */}
            {facebookLink && (
              <a
                href={facebookLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-white bg-[#1877F2] hover:opacity-90 rounded-full px-3 py-1.5 text-sm font-medium transition-opacity"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                <span>Facebook</span>
              </a>
            )}
            {driveLink && (
              <a
                href={driveLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-white bg-[#1FA463] hover:opacity-90 rounded-full px-3 py-1.5 text-sm font-medium transition-opacity"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8.333 3.667h7.334l5.5 9.166-3.667 6.334H6.5L2.833 12.833l5.5-9.166zm0 0l-3.666 6.333 5.5 9.167h7.333M12 8.667L8.667 14.5h6.666L12 8.667z" />
                </svg>
                <span>Drive</span>
              </a>
            )}
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="container-xl max-w-4xl mx-auto">
          {reflection.thumbnail && (
            <div className="relative mb-10 h-[320px] sm:h-[420px] md:h-[480px] rounded-2xl overflow-hidden bg-slate-900">
              {/* Blurred, color-matched backdrop fills the frame regardless of the photo's aspect ratio */}
              <div
                className="absolute inset-0 bg-cover bg-center scale-110 blur-2xl opacity-50"
                style={{ backgroundImage: `url(${reflection.thumbnail})` }}
                aria-hidden="true"
              />
              {/* Full photo, never cropped, capped so it can't overwhelm the page */}
              <img
                src={reflection.thumbnail}
                alt={title}
                loading="lazy"
                className="relative mx-auto h-full w-auto max-w-full object-contain"
              />
            </div>
          )}
          <div className="card !p-8 md:!p-12">
            <div
              className="prose prose-lg max-w-none prose-headings:text-slate-900 prose-p:text-slate-700 prose-p:leading-relaxed"
              dangerouslySetInnerHTML={{
                __html: safeContent
              }}
            />

            {/* YouTube Video Embed */}
            {youtubeEmbedUrl && (
              <div className="mt-8">
                <div className="relative pt-[56.25%] rounded-xl overflow-hidden bg-black">
                   <iframe
                     className="absolute inset-0 w-full h-full"
                     src={youtubeEmbedUrl}
                     title="YouTube video player"
                     allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                     allowFullScreen
                   ></iframe>
                </div>
              </div>
            )}

            {/* Facebook Embed */}
            {facebookPluginUrl && (
              <div className="mt-8 flex justify-center">
                <iframe
                  src={facebookPluginUrl}
                  width="500"
                  height={facebookLink.includes('/videos/') || facebookLink.includes('/watch') || facebookLink.includes('fb.watch') ? "300" : "600"}
                  style={{border:'none', overflow:'hidden'}}
                  scrolling="no"
                  frameBorder="0"
                  allowFullScreen={true}
                  allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                  className="rounded-xl max-w-full bg-white"
                ></iframe>
              </div>
            )}

            {/* Google Drive Video Embed */}
            {driveEmbedUrl && (
              <div className="mt-8">
                <div className="relative pt-[56.25%] rounded-xl overflow-hidden bg-black">
                  <iframe
                    src={driveEmbedUrl}
                    className="absolute inset-0 w-full h-full"
                    allow="autoplay"
                    title="Google Drive Video"
                  ></iframe>
                </div>
              </div>
            )}
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
