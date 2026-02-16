import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import type { Event } from '../types/content';
import { useEffect, useState, memo } from 'react';
import EventCountdown from '../components/EventCountdown';
import { useLanguage } from '../contexts/LanguageContext';
import { subscribeJson } from '../lib/storage';
import { hasEventPassed, parseEventDate } from '../lib/timezone';
import { db } from '../lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { CHURCH_INFO, UI_CONSTANTS } from '../lib/constants';
import LazyLoadSection from '../components/LazyLoadSection';

// Debounce hook to prevent excessive re-renders
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
}

type Reflection = { 
  id?: string;
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

// Reflections now come from Firebase Storage JSON

// Helper function to strip HTML tags for preview text
const stripHtml = (html: string): string => {
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
};

// Background pattern types
export type BackgroundPattern = 'dots' | 'grid' | 'diagonal' | 'waves' | 'crosses' | 'none';

// Extend Window interface for global function
declare global {
  interface Window {
    changeHeroBackground?: (pattern: BackgroundPattern) => void;
  }
}

/**
 * Get background pattern style for the hero section
 * @param pattern - The pattern type to use
 * @returns Style object for the background pattern
 */
const getBackgroundPatternStyle = (pattern: BackgroundPattern): React.CSSProperties => {
  switch (pattern) {
    case 'dots':
      return {
        backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
        backgroundSize: '40px 40px'
      };
    case 'grid':
      return {
        backgroundImage: 'linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)',
        backgroundSize: '50px 50px'
      };
    case 'diagonal':
      return {
        backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 35px, white 35px, white 37px)',
        backgroundSize: '100% 100%'
      };
    case 'waves':
      return {
        backgroundImage: 'radial-gradient(circle at 100% 50%, transparent 20%, white 21%, white 22%, transparent 22%, transparent), radial-gradient(circle at 0% 50%, transparent 20%, white 21%, white 22%, transparent 22%, transparent)',
        backgroundSize: '80px 80px',
        backgroundPosition: '0 0, 40px 40px'
      };
    case 'crosses':
      return {
        backgroundImage: 'linear-gradient(white 2px, transparent 2px), linear-gradient(90deg, white 2px, transparent 2px)',
        backgroundSize: '20px 20px',
        backgroundPosition: 'center center'
      };
    case 'none':
      return {};
    default:
      return {
        backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
        backgroundSize: '40px 40px'
      };
  }
}

const Home: React.FC = () => {
  const { t, language } = useLanguage();

  const [events, setEvents] = useState<Event[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  
  // State to control the hero background pattern (can be changed dynamically)
  const [heroBackgroundPattern, setHeroBackgroundPattern] = useState<BackgroundPattern>('dots');
  const [heroBackgroundImage, setHeroBackgroundImage] = useState<string>('');
  const debouncedHeroImage = useDebounce(heroBackgroundImage, 300);

  // Load saved pattern and image from Firestore with real-time updates
  useEffect(() => {
    if (!db) {
      // Fallback to localStorage if Firebase not configured
      const savedPattern = localStorage.getItem('heroBackgroundPattern') as BackgroundPattern;
      const savedImageUrl = localStorage.getItem('heroBackgroundImageUrl');
      if (savedPattern) setHeroBackgroundPattern(savedPattern);
      if (savedImageUrl) setHeroBackgroundImage(savedImageUrl);
      return;
    }

    // Subscribe to real-time updates from Firestore
    const settingsRef = doc(db, 'site-settings', 'homepage');
    const unsubscribe = onSnapshot(settingsRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.heroBackgroundPattern) {
          setHeroBackgroundPattern(data.heroBackgroundPattern);
          localStorage.setItem('heroBackgroundPattern', data.heroBackgroundPattern);
        }
        if (data.heroBackgroundImageUrl) {
          const imageUrl = data.heroBackgroundImageUrl;
          setHeroBackgroundImage(imageUrl);
          localStorage.setItem('heroBackgroundImageUrl', imageUrl);

          // Preload the LCP image
          const link = document.createElement('link');
          link.rel = 'preload';
          link.as = 'image';
          link.href = imageUrl;
          document.head.appendChild(link);
        } else {
          setHeroBackgroundImage('');
          localStorage.removeItem('heroBackgroundImageUrl');
        }
      } else {
        // No settings in Firestore, try localStorage
        const savedPattern = localStorage.getItem('heroBackgroundPattern') as BackgroundPattern;
        const savedImageUrl = localStorage.getItem('heroBackgroundImageUrl');
        if (savedPattern) setHeroBackgroundPattern(savedPattern);
        if (savedImageUrl) setHeroBackgroundImage(savedImageUrl);
      }
    }, (error) => {
      console.error('Error loading settings:', error);
      // Fallback to localStorage on error
      const savedPattern = localStorage.getItem('heroBackgroundPattern') as BackgroundPattern;
      const savedImageUrl = localStorage.getItem('heroBackgroundImageUrl');
      if (savedPattern) setHeroBackgroundPattern(savedPattern);
      if (savedImageUrl) setHeroBackgroundImage(savedImageUrl);
    });

    return () => unsubscribe();
  }, []);

  // Find index of the current event: first event that hasn't passed yet (using Melbourne timezone)
  const currentIndex = events.findIndex(ev => !hasEventPassed(ev.date, ev.time || '11:59 PM'));
  const startIndex = currentIndex === -1 ? events.length : currentIndex;
  const upcomingEvents = events.slice(startIndex, startIndex + 3);
  const [latestReflections, setLatestReflections] = useState<Reflection[]>([]);
  const [expandedReflectionId, setExpandedReflectionId] = useState<string | null>(null);
  
  // Function to change the hero background pattern
  const changeHeroBackground = (pattern: BackgroundPattern) => {
    setHeroBackgroundPattern(pattern);
  };

  // Make changeHeroBackground function available globally for easy access
  useEffect(() => {
    // Expose function to window object for console access
    window.changeHeroBackground = changeHeroBackground;
    
    // Log usage instructions to console for developers
    console.log(
      '%c🎨 Homepage Background Pattern Changer',
      'font-size: 16px; font-weight: bold; color: #4f46e5;'
    );
    console.log(
      '%cAvailable patterns: dots, grid, diagonal, waves, crosses, none',
      'font-size: 12px; color: #6b7280;'
    );
    console.log(
      '%cUsage: window.changeHeroBackground("grid")',
      'font-size: 12px; color: #059669; font-family: monospace;'
    );
    
    return () => {
      // Cleanup on unmount
      delete window.changeHeroBackground;
    };
  }, []);

  useEffect(() => {
    // Live reflections
    type RawReflection = Reflection & { id?: string };
    const unsubRefl = subscribeJson<RawReflection[]>(
      'reflections',
      (items) => {
        const mapped: Reflection[] = (items || []).map((it) => {
          // Ensure both languages have content
          const titleVi = it.title?.vi || it.title?.en || '';
          const titleEn = it.title?.en || it.title?.vi || '';
          const contentVi = it.content?.vi || it.content?.en || '';
          const contentEn = it.content?.en || it.content?.vi || '';
          
          return {
            title: { vi: titleVi, en: titleEn },
            content: { vi: contentVi, en: contentEn },
            date: it.date,
            author: it.author,
          };
        });
        setLatestReflections(mapped.slice(0, 2));
      },
      () => setLatestReflections([])
    );

    // Live events from cloud database
    type RawEvent = Event;
    const unsubEvents = subscribeJson<RawEvent[]>(
      'events',
      (eventsData) => {
        const mapped: Event[] = (eventsData || []).map((d) => {
          // Ensure both languages have content
          const nameVi = d.name?.vi || d.name?.en || '';
          const nameEn = d.name?.en || d.name?.vi || '';
          const contentVi = d.content?.vi || d.content?.en || '';
          const contentEn = d.content?.en || d.content?.vi || '';
          
          return {
            id: d.id,
            name: { vi: nameVi, en: nameEn },
            date: d.date,
            time: d.time,
            location: d.location,
            content: d.content ? { vi: contentVi, en: contentEn } : undefined,
            thumbnail: d.thumbnail,
            thumbnailPath: d.thumbnailPath,
            facebookLink: d.facebookLink,
            youtubeLink: d.youtubeLink,
            driveLink: d.driveLink,
            status: d.status || 'published',
          };
        }).filter(e => e.status === 'published').sort((a, b) => parseEventDate(a.date).getTime() - parseEventDate(b.date).getTime());
        setEvents(mapped);
        setEventsLoading(false);
      },
      () => {
        setEvents([]);
        setEventsLoading(false);
      }
    );

    return () => { unsubRefl(); unsubEvents(); };
  }, []);

  return (
    <>
      <SEO 
        title={t('home.title')} 
        description={t('home.description')} 
      />
      {/* Hero - Modern Gradient Design */}
      <section className="relative bg-gradient-to-br from-brand-600 via-brand-700 to-brand-800 py-20 md:py-28 overflow-hidden h-[800px] md:h-auto md:min-h-[700px]">
        {/* Custom Background Image (if set) */}
        {debouncedHeroImage && (
          <div className="absolute inset-0">
            <img 
              src={debouncedHeroImage} 
              alt="Hero background" 
              className="w-full h-full object-cover opacity-20 mix-blend-overlay"
            />
          </div>
        )}
        
        {/* Background Pattern & Effects */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={getBackgroundPatternStyle(heroBackgroundPattern)}></div>
        </div>
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/3 w-96 h-96 bg-brand-400/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/3 w-80 h-80 bg-brand-500/20 rounded-full blur-3xl"></div>
        
        <div className="container-xl relative z-10">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
            {/* Content */}
            <div className="text-white text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 mb-8 shadow-sm hover:bg-white/20 transition-colors">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                <span className="font-medium text-sm text-brand-50">{t('home.welcome_badge') || 'Chào mừng đến với Cộng đoàn'}</span>
              </div>

              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-brand-50 to-brand-100 tracking-tight">
                {t('home.title')}
              </h1>
              <p className="text-xl md:text-2xl text-brand-100 mb-6 leading-relaxed font-medium max-w-2xl mx-auto lg:mx-0">
                {t('home.subtitle')}
              </p>
              <p className="text-base md:text-lg text-brand-200 mb-10 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                {t('home.description')}
              </p>
              
              <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start mb-12">
                <Link to="/about" className="w-full sm:w-auto px-8 py-4 bg-white text-brand-700 font-bold rounded-xl hover:bg-brand-50 hover:-translate-y-1 transition-all duration-300 shadow-xl shadow-brand-900/20 flex items-center justify-center gap-2 group">
                  {t('home.learn_more')}
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
                <Link to="/contact" className="w-full sm:w-auto px-8 py-4 bg-brand-800/40 backdrop-blur-sm text-white font-bold rounded-xl border border-white/20 hover:bg-brand-800/60 hover:-translate-y-1 transition-all duration-300 shadow-lg flex items-center justify-center">
                  {t('home.contact_us')}
                </Link>
              </div>

              {/* Quick Info Bar */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 md:gap-8 pt-8 border-t border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center backdrop-blur-sm">
                    <span className="text-xl">⛪</span>
                  </div>
                  <div className="text-left">
                    <p className="text-xs text-brand-200 uppercase tracking-wider font-semibold">{t('home.mass')}</p>
                    <p className="font-bold text-white">{t('home.mass_time')}</p>
                  </div>
                </div>
                <div className="w-px h-10 bg-white/10 hidden sm:block"></div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center backdrop-blur-sm">
                    <span className="text-xl">📍</span>
                  </div>
                  <div className="text-left">
                    <p className="text-xs text-brand-200 uppercase tracking-wider font-semibold">{t('home.location')}</p>
                    <p className="font-bold text-white">{t('home.location_short')}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Map Card */}
            <div className="relative lg:translate-x-8 aspect-w-1 aspect-h-1 md:aspect-w-4 md:aspect-h-3">
              <div className="absolute -inset-4 bg-gradient-to-r from-brand-400 to-brand-300 rounded-[2rem] blur-2xl opacity-30 animate-pulse"></div>
              <div className="relative bg-white p-2 rounded-[2rem] shadow-2xl rotate-1 hover:rotate-0 transition-transform duration-500">
                <div className="relative rounded-[1.5rem] overflow-hidden border border-slate-100 h-[400px] md:h-[500px]">
                  <iframe 
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3150.982869339574!2d145.11869731531985!3d-37.81564207974633!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6ad6404f2b6c09f9%3A0x5045675218ce6e0!2s138%20Woodhouse%20Grove%2C%20Box%20Hill%20North%20VIC%203129!5e0!3m2!1sen!2sau!4v1734134400000!5m2!1sen!2sau"
                    title="St Francis Xavier's Catholic Church Location"
                    className="w-full h-full"
                    style={{ border: 0 }}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  ></iframe>
                  
                  {/* Map Overlay Card */}
                  <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md p-4 rounded-xl shadow-lg border border-slate-100">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-brand-50 rounded-lg text-brand-600">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-sm">St Francis Xavier's Catholic Church</p>
                        <p className="text-slate-500 text-xs mt-0.5">138 Woodhouse Grove, Box Hill North</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Welcome Message - Elevated Cards */}
      <LazyLoadSection placeholderHeight="700px">
      <section className="py-24 bg-gradient-to-b from-white to-slate-50 relative overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>
        <div className="absolute -left-64 top-1/2 w-96 h-96 bg-brand-50 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute -right-64 bottom-0 w-96 h-96 bg-blue-50 rounded-full blur-3xl opacity-50"></div>

        <div className="container-xl relative z-10">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 bg-brand-50 border border-brand-100/50 rounded-full px-5 py-2 mb-8 shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500"></span>
              </span>
              <span className="font-bold text-brand-800 text-sm tracking-wide uppercase">Welcome</span>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-6 tracking-tight">
              {t('home.welcome_title')}
            </h2>
            <div className="w-24 h-1.5 bg-brand-500 mx-auto rounded-full"></div>
          </div>
          
          <div className="grid gap-8 md:grid-cols-3">
            {[
              { icon: '🙏', title: t('home.faith_title'), desc: t('home.faith_desc'), color: 'from-blue-500 to-blue-600', bg: 'bg-blue-50', border: 'border-blue-100', delay: 'delay-100' },
              { icon: '❤️', title: t('home.community_title'), desc: t('home.community_desc'), color: 'from-red-500 to-red-600', bg: 'bg-red-50', border: 'border-red-100', delay: 'delay-200' },
              { icon: '✨', title: t('home.service_title'), desc: t('home.service_desc'), color: 'from-amber-500 to-amber-600', bg: 'bg-amber-50', border: 'border-amber-100', delay: 'delay-300' }
            ].map((item, idx) => (
              <div key={idx} className={`group relative bg-white rounded-[2rem] p-10 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-brand-900/10 transition-all duration-500 border border-slate-100 hover:-translate-y-2 ${item.delay}`}>
                <div className={`w-20 h-20 ${item.bg} rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 shadow-inner`}>
                  <span className="text-4xl">{item.icon}</span>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4 group-hover:text-brand-700 transition-colors">{item.title}</h3>
                <p className="text-slate-600 leading-relaxed text-lg">{item.desc}</p>
                
                {/* Hover Effect Line */}
                <div className={`absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-r ${item.color} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 rounded-b-[2rem]`}></div>
              </div>
            ))}
          </div>
        </div>
      </section>
      </LazyLoadSection>

      {/* Mass Times & Location - Modern Information Cards */}
      <LazyLoadSection placeholderHeight="700px">
      <section className="py-24 bg-gradient-to-b from-slate-50 via-white to-slate-50 relative">
        <div className="absolute top-1/2 left-0 w-64 h-64 bg-brand-50 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2 opacity-50"></div>
        <div className="container-xl relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-brand-50 border border-brand-100/50 rounded-full px-5 py-2.5 mb-6">
              <svg className="w-5 h-5 text-brand-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/>
              </svg>
              <span className="font-bold text-brand-700 text-sm tracking-wide uppercase">Schedule</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-5 tracking-tight">
              {t('home.mass_schedule_title')}
            </h2>
            <div className="w-24 h-1.5 bg-brand-500 mx-auto rounded-full"></div>
          </div>
          
          <div className="grid gap-8 lg:grid-cols-2 max-w-6xl mx-auto">
            {/* Mass Times */}
            <div className="bg-white rounded-[2rem] p-10 shadow-xl shadow-slate-200/50 border border-slate-100 hover:border-brand-200 transition-all duration-300 hover:-translate-y-1 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-50 rounded-bl-[4rem] -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
              
              <div className="flex items-center gap-6 mb-10 relative">
                <div className="p-5 bg-gradient-to-br from-brand-500 to-brand-600 rounded-2xl shadow-lg shadow-brand-500/20 text-white">
                  <span className="text-3xl">📅</span>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-900">{t('home.mass_schedule_subtitle')}</h3>
                  <p className="text-slate-500 mt-1">Weekly Worship Services</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-5 p-5 bg-slate-50/80 rounded-2xl border border-slate-100 hover:bg-white hover:shadow-md transition-all duration-300 group/item">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-2xl shadow-sm group-hover/item:scale-110 transition-transform">⛪</div>
                  <div>
                    <p className="font-bold text-lg text-slate-900">{t('home.sunday')}</p>
                    <p className="text-brand-600 font-bold">{t('home.sunday_time')}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-5 p-5 bg-slate-50/80 rounded-2xl border border-slate-100 hover:bg-white hover:shadow-md transition-all duration-300 group/item">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-2xl shadow-sm group-hover/item:scale-110 transition-transform">🎉</div>
                  <div>
                    <p className="font-bold text-lg text-slate-900">{t('home.special_days')}</p>
                    <p className="text-slate-600 font-medium">{t('home.special_days_desc')}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-5 p-5 bg-slate-50/80 rounded-2xl border border-slate-100 hover:bg-white hover:shadow-md transition-all duration-300 group/item">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-2xl shadow-sm group-hover/item:scale-110 transition-transform">🙏</div>
                  <div>
                    <p className="font-bold text-lg text-slate-900">{t('home.confession')}</p>
                    <p className="text-slate-600 font-medium">{t('home.confession_time')}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div className="bg-white rounded-[2rem] p-10 shadow-xl shadow-slate-200/50 border border-slate-100 hover:border-brand-200 transition-all duration-300 hover:-translate-y-1 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-[4rem] -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
              
              <div className="flex items-center gap-6 mb-10 relative">
                <div className="p-5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg shadow-blue-500/20 text-white">
                  <span className="text-3xl">📍</span>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-900">{t('home.info_title')}</h3>
                  <p className="text-slate-500 mt-1">{t('home.visit_contact')}</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-5 p-5 bg-slate-50/80 rounded-2xl border border-slate-100 hover:bg-white hover:shadow-md transition-all duration-300 group/item">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-2xl shadow-sm group-hover/item:scale-110 transition-transform">🏠</div>
                  <div>
                    <p className="font-bold text-lg text-slate-900">{t('home.address_label')}</p>
                    <p className="text-slate-600 font-medium">{t('home.address_value')}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-5 p-5 bg-slate-50/80 rounded-2xl border border-slate-100 hover:bg-white hover:shadow-md transition-all duration-300 group/item">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-2xl shadow-sm group-hover/item:scale-110 transition-transform">🚗</div>
                  <div>
                    <p className="font-bold text-lg text-slate-900">{t('home.parking_label')}</p>
                    <p className="text-slate-600 font-medium">{t('home.parking_desc')}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-5 p-5 bg-slate-50/80 rounded-2xl border border-slate-100 hover:bg-white hover:shadow-md transition-all duration-300 group/item">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-2xl shadow-sm group-hover/item:scale-110 transition-transform">📞</div>
                  <div>
                    <p className="font-bold text-lg text-slate-900">{t('home.contact_label')}</p>
                    <a href="tel:0422-400-116" className="text-brand-600 hover:underline font-bold text-lg block">
                      0422-400-116
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      </LazyLoadSection>

      {/* Upcoming Events */}
      <LazyLoadSection placeholderHeight="600px">
      <section className="py-24 bg-white">
        <div className="container-xl">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-brand-50 border border-brand-100 rounded-full px-4 py-2 mb-6">
              <svg className="w-5 h-5 text-brand-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/>
              </svg>
              <span className="font-bold text-brand-700 text-sm tracking-wide uppercase">{t('home.upcoming_events')}</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 tracking-tight">
              {t('home.important_event')}
            </h2>
            <div className="w-24 h-1.5 bg-brand-500 mx-auto rounded-full"></div>
          </div>

          {eventsLoading ? (
            <div className="text-center py-12 px-6 bg-white rounded-xl border border-slate-200 min-h-[400px] flex flex-col justify-center items-center">
              <div className="animate-pulse">
                <div className="w-16 h-16 bg-slate-200 rounded-full mx-auto mb-4"></div>
                <div className="h-6 w-48 bg-slate-200 rounded-md mx-auto mb-2"></div>
                <div className="h-4 w-64 bg-slate-200 rounded-md mx-auto"></div>
              </div>
            </div>
          ) : upcomingEvents.length > 0 ? (
            <Link to={`/events/${upcomingEvents[0].id}`} className="block mb-16 transform hover:scale-[1.01] transition-transform duration-300">
              <div className="max-w-5xl mx-auto bg-white rounded-[2rem] shadow-2xl shadow-slate-200 overflow-hidden border border-slate-100">
                <div className="grid md:grid-cols-2 gap-0">
                  <div className="relative h-64 md:h-full min-h-[350px] overflow-hidden group">
                    {upcomingEvents[0].thumbnail && (
                      <>
                        <img 
                          src={upcomingEvents[0].thumbnail} 
                          alt={upcomingEvents[0].name[language] || upcomingEvents[0].name.vi}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60"></div>
                      </>
                    )}
                    {/* Date Badge Overlay */}
                    <div className="absolute top-6 left-6 bg-white/95 backdrop-blur-md text-brand-700 px-4 py-3 rounded-2xl shadow-xl font-bold border border-white/50 flex flex-col items-center min-w-[80px]">
                      <span className="text-sm uppercase tracking-wider font-bold text-slate-500">{parseEventDate(upcomingEvents[0].date).toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US', { month: 'short' })}</span>
                      <span className="text-3xl leading-none text-slate-900">{parseEventDate(upcomingEvents[0].date).getDate()}</span>
                    </div>
                  </div>
                  
                  <div className="p-8 md:p-12 flex flex-col justify-center bg-gradient-to-br from-white to-brand-50/30">
                    <div className="inline-flex items-center gap-2 text-brand-600 font-bold mb-6 bg-brand-50 w-fit px-4 py-1.5 rounded-full text-xs uppercase tracking-wider border border-brand-100">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500"></span>
                      </span>
                      {t('home.featured_event')}
                    </div>
                    
                    <h3 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6 leading-tight">
                      {upcomingEvents[0].name[language] || upcomingEvents[0].name.vi}
                    </h3>
                    
                    <div className="space-y-4 mb-8">
                      <div className="flex items-center gap-4 group/item">
                        <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0 group-hover/item:bg-blue-100 transition-colors">
                          <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">{t('events.date')}</p>
                          <p className="text-lg font-bold text-slate-900">
                            {parseEventDate(upcomingEvents[0].date).toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US', { 
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 group/item">
                        <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center flex-shrink-0 group-hover/item:bg-purple-100 transition-colors">
                          <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">{t('events.time')}</p>
                          <p className="text-lg font-bold text-slate-900">{upcomingEvents[0].time}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 group/item">
                        <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center flex-shrink-0 group-hover/item:bg-emerald-100 transition-colors">
                          <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">{t('events.location')}</p>
                          <p className="text-lg font-bold text-slate-900">{upcomingEvents[0].location}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-auto">
                      <EventCountdown 
                        eventDate={upcomingEvents[0].date} 
                        eventTime={upcomingEvents[0].time}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ) : (
            <div className="text-center py-12">
              <p className="text-slate-500">{t('home.no_events')}</p>
            </div>
          )}

          {upcomingEvents.length > 1 && (
            <>
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-slate-900 text-center">{t('home.other_events')}</h3>
              </div>
              <div className="grid gap-6 md:grid-cols-2 max-w-5xl mx-auto">
                {upcomingEvents.slice(1).map(event => (
                  <Link
                    key={event.id}
                    to={`/events/${event.id}`}
                    className="group bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-slate-200 hover:-translate-y-1"
                  >
                    {event.thumbnail && (
                      <div className="relative overflow-hidden">
                        <img 
                          src={event.thumbnail} 
                          alt={event.name[language] || event.name.vi}
                          className="w-full aspect-video object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                      </div>
                    )}
                    <div className="p-6">
                      <h4 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-brand-600 transition-colors">
                        {event.name[language] || event.name.vi}
                      </h4>
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span>{parseEventDate(event.date).toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US', { 
                            weekday: 'short', 
                            month: 'short', 
                            day: 'numeric'
                          })}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>{event.time}</span>
                        </div>
                      </div>
                      
                      {event.content && (
                        <p className="text-slate-600 text-sm line-clamp-2 mb-4">
                          {stripHtml(event.content[language] || event.content.vi)}
                        </p>
                      )}
                      
                      <span className="inline-flex items-center gap-2 text-brand-600 font-semibold text-sm group-hover:gap-3 transition-all">
                        {t('home.details')}
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
              <div className="text-center mt-8">
                <Link to="/events" className="inline-flex items-center gap-2 px-8 py-3 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300">
                  {t('home.view_all_events')}
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </div>
            </>
          )}
        </div>
      </section>
      </LazyLoadSection>

      {/* Ministries */}
      <LazyLoadSection placeholderHeight="500px">
      <section className="py-20 bg-gradient-to-b from-slate-50 to-white">
        <div className="container-xl">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-brand-100 rounded-full px-4 py-2 mb-4">
              <svg className="w-5 h-5 text-brand-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z"/>
              </svg>
              <span className="font-medium text-brand-700">{t('home.ministries_title')}</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
              {t('ministries.serving_together')}
            </h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto">
            {[
              { icon: '👨‍👩‍👧‍👦', title: t('home.family_ministry'), desc: t('home.family_desc'), color: 'blue' as const },
              { icon: '🙋', title: t('home.youth_ministry'), desc: t('home.youth_desc'), color: 'purple' as const },
              { icon: '⛪', title: t('ministries.liturgy'), desc: t('ministries.liturgy_desc'), color: 'rose' as const },
              { icon: '🎵', title: t('home.choir_ministry'), desc: t('home.choir_desc'), color: 'amber' as const }
            ].map((ministry, idx) => {
              const colorMap = {
                blue: { border: 'border-blue-600', bg: 'bg-blue-100', text: 'text-blue-600' },
                purple: { border: 'border-purple-600', bg: 'bg-purple-100', text: 'text-purple-600' },
                rose: { border: 'border-rose-600', bg: 'bg-rose-100', text: 'text-rose-600' },
                amber: { border: 'border-amber-600', bg: 'bg-amber-100', text: 'text-amber-600' }
              };
              const colors = colorMap[ministry.color];
              
              return (
                <div key={idx} className={`group bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 border-t-4 ${colors.border}`}>
                  <div className={`w-14 h-14 ${colors.bg} ${colors.text} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform text-2xl`}>
                    {ministry.icon}
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{ministry.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{ministry.desc}</p>
                </div>
              );
            })}
          </div>

          <div className="text-center mt-8">
            <Link to="/ministries" className="inline-flex items-center gap-2 px-8 py-3 bg-transparent border-2 border-brand-600 text-brand-600 hover:bg-brand-600 hover:text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300">
              {t('home.learn_more_about')}
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>
      </LazyLoadSection>

      {/* Latest Content */}
      <LazyLoadSection placeholderHeight="600px">
      <section className={`${UI_CONSTANTS.SECTION_PADDING} bg-white`}>
        <div className="container-xl">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-brand-100 rounded-full px-4 py-2 mb-4">
              <svg className="w-5 h-5 text-brand-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z"/>
              </svg>
              <span className="font-medium text-brand-700">{t('home.latest_content')}</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
              {t('home.gospel')}
            </h2>
          </div>

          <div className="grid gap-8 md:grid-cols-2 max-w-5xl mx-auto">
            {/* Gospel Reflections */}
            <div className="space-y-6">
              {latestReflections.slice(0, 2).map((reflection, index) => {
                const isExpanded = expandedReflectionId === reflection.id;
                const content = stripHtml(reflection.content[language] || reflection.content.vi);
                
                return (
                  <div
                    key={index}
                    className="group block bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 border border-slate-200"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <span className="inline-flex items-center gap-1.5 bg-brand-100 text-brand-700 rounded-full px-3 py-1 text-xs font-semibold">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z"/>
                        </svg>
                        {t('reflections.gospel')}
                      </span>
                    </div>
                    <Link to={`/reflections/${reflection.id}`} className="block">
                      <h4 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-brand-600 transition-colors line-clamp-2">
                        {reflection.title[language] || reflection.title.vi}
                      </h4>
                    </Link>
                    <div className={`text-slate-600 text-sm leading-relaxed mb-4 transition-all duration-300 ${isExpanded ? '' : 'line-clamp-3'}`}>
                      {content}
                    </div>
                    <button 
                      onClick={(e) => {
                        e.preventDefault();
                        if (reflection.id) {
                          setExpandedReflectionId(isExpanded ? null : reflection.id);
                        }
                      }}
                      className="inline-flex items-center gap-2 text-brand-600 font-semibold text-sm hover:gap-3 transition-all"
                    >
                      {isExpanded ? (language === 'vi' ? 'Thu gọn' : 'Read less') : t('home.read_more')}
                      <svg className={`w-4 h-4 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>
                );
              })}
              <div className="text-center">
                <Link to="/reflections" className="inline-flex items-center gap-2 px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300">
                  {t('home.view_all_gospel')}
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </div>
            </div>

            {/* Connect Section */}
            <div>
              <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl shadow-xl p-8 border border-slate-200">
                <h3 className="text-2xl font-bold text-slate-900 mb-6">{t('home.connect')}</h3>
                <p className="text-slate-600 mb-6">{t('home.follow_us')}</p>
                <div className="space-y-4">
                  <a 
                    href={CHURCH_INFO.FACEBOOK_URL} 
                    className="flex items-center gap-4 p-4 bg-white rounded-lg hover:bg-blue-50 border border-slate-200 hover:border-blue-300 transition-all duration-300 group"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-slate-900">Facebook</p>
                      <p className="text-sm text-slate-600">{CHURCH_INFO.FACEBOOK_DISPLAY}</p>
                    </div>
                    <svg className="w-5 h-5 text-slate-400 group-hover:text-blue-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </a>

                  <a 
                    href={`mailto:${CHURCH_INFO.EMAIL}`}
                    className="flex items-center gap-4 p-4 bg-white rounded-lg hover:bg-red-50 border border-slate-200 hover:border-red-300 transition-all duration-300 group"
                  >
                    <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-slate-900">Email</p>
                      <p className="text-sm text-slate-600 break-all">{CHURCH_INFO.EMAIL}</p>
                    </div>
                    <svg className="w-5 h-5 text-slate-400 group-hover:text-red-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </a>

                  <Link 
                    to="/contact"
                    className="flex items-center gap-4 p-4 bg-white rounded-lg hover:bg-brand-50 border border-slate-200 hover:border-brand-300 transition-all duration-300 group"
                  >
                    <div className="w-12 h-12 bg-brand-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-slate-900">{t('home.contact_direct')}</p>
                      <p className="text-sm text-slate-600">{CHURCH_INFO.PHONE}</p>
                    </div>
                    <svg className="w-5 h-5 text-slate-400 group-hover:text-brand-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      </LazyLoadSection>

      {/* Call to Action */}
      {/* CTA */}
      <LazyLoadSection placeholderHeight="400px">
      <section className={`relative ${UI_CONSTANTS.SECTION_PADDING} bg-gradient-to-br from-brand-600 to-brand-800 overflow-hidden`}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent)] pointer-events-none"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(255,255,255,0.05),transparent)] pointer-events-none"></div>
        <div className="container-xl text-center relative z-10">
          <div className="max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z"/>
              </svg>
              <span className="font-medium text-white">{t('home.join_us_title')}</span>
            </div>
            
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
              {t('home.join_us_title')}
            </h2>
            <p className="text-xl text-white/90 mb-8 leading-relaxed">
              {t('home.join_us_desc')}
            </p>
            
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <Link 
                        to="/contact" 
                        className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-brand-600 font-bold rounded-xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        {t('home.contact_now')}
                      </Link>
                      <Link 
                        to="/about" 
                        className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-sm text-white border border-white/30 font-bold rounded-xl hover:bg-white hover:text-brand-600 hover:scale-105 transition-all duration-300"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {t('home.learn_more_about')}
                      </Link>
                    </div>
          </div>
        </div>
      </section>
      </LazyLoadSection>
    </>
  );
};

export default memo(Home);
