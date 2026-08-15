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

const Home: React.FC = () => {
  const { t, language } = useLanguage();

  const [events, setEvents] = useState<Event[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);

  // Optional admin-set hero background image (site-settings/homepage in Firestore)
  const [heroBackgroundImage, setHeroBackgroundImage] = useState<string>('');
  const debouncedHeroImage = useDebounce(heroBackgroundImage, 300);

  // Load the saved image with real-time updates
  useEffect(() => {
    if (!db) {
      // Fallback to localStorage if Firebase not configured
      const savedImageUrl = localStorage.getItem('heroBackgroundImageUrl');
      if (savedImageUrl) setHeroBackgroundImage(savedImageUrl);
      return;
    }

    // Subscribe to real-time updates from Firestore
    const settingsRef = doc(db, 'site-settings', 'homepage');
    const unsubscribe = onSnapshot(settingsRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
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
        const savedImageUrl = localStorage.getItem('heroBackgroundImageUrl');
        if (savedImageUrl) setHeroBackgroundImage(savedImageUrl);
      }
    }, (error) => {
      console.error('Error loading settings:', error);
      // Fallback to localStorage on error
      const savedImageUrl = localStorage.getItem('heroBackgroundImageUrl');
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
      {/* Hero — plain, bright, and text-led. An admin-set background image
          is still supported, shown quietly behind a light scrim. */}
      <section className="relative bg-white overflow-hidden">
        {debouncedHeroImage && (
          <div className="absolute inset-0">
            <img
              src={debouncedHeroImage}
              alt=""
              className="w-full h-full object-cover opacity-15"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-white via-white/95 to-white"></div>
          </div>
        )}

        <div className="container-xl relative z-10 py-12 sm:py-16 md:py-24 lg:py-28">
          <div className="grid items-center gap-16 lg:grid-cols-2 lg:gap-20">
            {/* Content */}
            <div className="text-center lg:text-left">
              <div className="eyebrow mb-5 justify-center lg:justify-start">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                </span>
                <span>{t('home.welcome_badge') || 'Chào mừng đến với Cộng đoàn'}</span>
              </div>

              <h1 className="text-4xl md:text-6xl lg:text-7xl font-semibold leading-[1.05] mb-6 text-slate-900 tracking-tight">
                {t('home.title')}
              </h1>
              <p className="text-xl md:text-2xl text-slate-600 mb-4 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                {t('home.subtitle')}
              </p>
              <p className="text-base md:text-lg text-slate-500 mb-10 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                {t('home.description')}
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-3 justify-center lg:justify-start mb-12">
                <Link to="/about" className="btn btn-primary w-full sm:w-auto">
                  {t('home.learn_more')}
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
                <Link to="/contact" className="btn btn-outline w-full sm:w-auto">
                  {t('home.contact_us')}
                </Link>
              </div>

              {/* Quick Info Bar */}
              <div className="flex justify-center lg:justify-start pt-8 border-t border-slate-200 w-full">
                <div className="flex items-start sm:items-center gap-3 max-w-full">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-brand-600 shrink-0 mt-1 sm:mt-0">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" />
                  </svg>
                  <div className="text-left flex-1 min-w-0">
                    <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">{t('home.mass')}</p>
                    <p className="font-semibold text-slate-900 text-sm md:text-base leading-snug break-words whitespace-normal">{t('home.mass_time')}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Map Card */}
            <div className="relative">
              <div className="relative bg-white rounded-3xl shadow-[0_8px_40px_rgb(0,0,0,0.08)] border border-slate-100 overflow-hidden">
                <div className="relative h-[360px] md:h-[460px]">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3150.982869339574!2d145.11869731531985!3d-37.81564207974633!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6ad6404f2b6c09f9%3A0x5045675218ce6e0!2s138%20Woodhouse%20Grove%2C%20Box%20Hill%20North%20VIC%203129!5e0!3m2!1sen!2sau!4v1734134400000!5m2!1sen!2sau"
                    title="St Francis Xavier's Catholic Church Location"
                    className="w-full h-full"
                    style={{ border: 0 }}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  ></iframe>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Welcome Message */}
      <LazyLoadSection placeholderHeight="700px">
      <section className="py-24 bg-surface">
        <div className="container-xl">
          <div className="text-center mb-16">
            <p className="eyebrow justify-center mb-4">Welcome</p>
            <h2 className="h2">
              {t('home.welcome_title')}
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                  </svg>
                ),
                title: t('home.faith_title'),
                desc: t('home.faith_desc'),
              },
              {
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                  </svg>
                ),
                title: t('home.community_title'),
                desc: t('home.community_desc'),
              },
              {
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
                  </svg>
                ),
                title: t('home.service_title'),
                desc: t('home.service_desc'),
              }
            ].map((item, idx) => (
              <div key={idx} className="card">
                <div className="w-12 h-12 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center mb-6">
                  {item.icon}
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">{item.title}</h3>
                <p className="text-slate-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      </LazyLoadSection>

      {/* Mass Times & Location */}
      <LazyLoadSection placeholderHeight="700px">
      <section className="py-24 bg-white">
        <div className="container-xl">
          <div className="text-center mb-16">
            <p className="eyebrow justify-center mb-4">Schedule</p>
            <h2 className="h2">
              {t('home.mass_schedule_title')}
            </h2>
          </div>

          <div className="grid gap-6 lg:grid-cols-2 max-w-6xl mx-auto">
            {/* Mass Times */}
            <div className="card !p-8 md:!p-10">
              <div className="flex items-center gap-5 mb-8">
                <div className="w-14 h-14 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0h18M5.25 12h13.5h-13.5zm1.5 6a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5zm6.75-4.5a2.25 2.25 0 100 4.5 2.25 2.25 0 000-4.5zm2.25-9a2.25 2.25 0 012.25-2.25h1.5A2.25 2.25 0 0121 7.5v11.25a2.25 2.25 0 01-2.25 2.25h-1.5a2.25 2.25 0 01-2.25-2.25V7.5z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-slate-900">{t('home.mass_schedule_subtitle')}</h3>
                  <p className="text-slate-500 text-sm mt-0.5">Weekly Worship Services</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between gap-4 py-4 border-t border-slate-100">
                  <p className="font-medium text-slate-900">{t('home.sunday')}</p>
                  <p className="text-brand-600 font-semibold">{t('home.sunday_time')}</p>
                </div>
                <div className="flex items-center justify-between gap-4 py-4 border-t border-slate-100">
                  <p className="font-medium text-slate-900">{t('home.special_days')}</p>
                  <p className="text-slate-500">{t('home.special_days_desc')}</p>
                </div>
                <div className="flex items-center justify-between gap-4 py-4 border-t border-b border-slate-100">
                  <p className="font-medium text-slate-900">{t('home.confession')}</p>
                  <p className="text-slate-500">{t('home.confession_time')}</p>
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div className="card !p-8 md:!p-10">
              <div className="flex items-center gap-5 mb-8">
                <div className="w-14 h-14 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-slate-900">{t('home.info_title')}</h3>
                  <p className="text-slate-500 text-sm mt-0.5">{t('home.visit_contact')}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between gap-4 py-4 border-t border-slate-100">
                  <p className="font-medium text-slate-900">{t('home.address_label')}</p>
                  <p className="text-slate-500 text-right">{t('home.address_value')}</p>
                </div>
                <div className="flex items-center justify-between gap-4 py-4 border-t border-slate-100">
                  <p className="font-medium text-slate-900">{t('home.parking_label')}</p>
                  <p className="text-slate-500 text-right">{t('home.parking_desc')}</p>
                </div>
                <div className="flex items-center justify-between gap-4 py-4 border-t border-b border-slate-100">
                  <p className="font-medium text-slate-900">{t('home.contact_label')}</p>
                  <a href="tel:0422-400-116" className="text-brand-600 hover:underline font-semibold">
                    0422-400-116
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      </LazyLoadSection>

      {/* Upcoming Events */}
      <LazyLoadSection placeholderHeight="600px">
      <section className="py-24 bg-surface">
        <div className="container-xl">
          <div className="text-center mb-16">
            <p className="eyebrow justify-center mb-4">{t('home.upcoming_events')}</p>
            <h2 className="h2">
              {t('home.important_event')}
            </h2>
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
            <Link to={`/events/${upcomingEvents[0].id}`} className="block mb-16 group">
              <div className="max-w-5xl mx-auto bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:shadow-[0_8px_40px_rgb(0,0,0,0.1)] transition-shadow duration-300 overflow-hidden border border-slate-100">
                <div className="grid md:grid-cols-2 gap-0">
                  <div className="relative h-64 md:h-full min-h-[350px] overflow-hidden bg-slate-100">
                    {upcomingEvents[0].thumbnail && (
                      <img
                        src={upcomingEvents[0].thumbnail}
                        alt={upcomingEvents[0].name[language] || upcomingEvents[0].name.vi}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                    )}
                    {/* Date Badge Overlay */}
                    <div className="absolute top-6 left-6 bg-white/95 backdrop-blur-md text-slate-900 px-4 py-3 rounded-2xl shadow-sm font-semibold flex flex-col items-center min-w-[76px]">
                      <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">{parseEventDate(upcomingEvents[0].date).toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US', { month: 'short' })}</span>
                      <span className="text-2xl leading-tight text-slate-900">{parseEventDate(upcomingEvents[0].date).getDate()}</span>
                    </div>
                  </div>

                  <div className="p-8 md:p-12 flex flex-col justify-center">
                    <p className="eyebrow mb-5">{t('home.featured_event')}</p>

                    <h3 className="text-2xl md:text-3xl font-semibold text-slate-900 mb-6 leading-tight">
                      {upcomingEvents[0].name[language] || upcomingEvents[0].name.vi}
                    </h3>

                    <div className="space-y-4 mb-8 text-sm">
                      <div>
                        <p className="text-slate-400 font-medium mb-0.5">{t('events.date')}</p>
                        <p className="font-medium text-slate-900">
                          {parseEventDate(upcomingEvents[0].date).toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-400 font-medium mb-0.5">{t('events.time')}</p>
                        <p className="font-medium text-slate-900">{upcomingEvents[0].time}</p>
                      </div>
                      <div>
                        <p className="text-slate-400 font-medium mb-0.5">{t('events.location')}</p>
                        <p className="font-medium text-slate-900">{upcomingEvents[0].location}</p>
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
                    className="group card !p-0 overflow-hidden"
                  >
                    {event.thumbnail && (
                      <div className="relative overflow-hidden bg-slate-100">
                        <img
                          src={event.thumbnail}
                          alt={event.name[language] || event.name.vi}
                          className="w-full aspect-video object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                      </div>
                    )}
                    <div className="p-6">
                      <h4 className="text-lg font-semibold text-slate-900 mb-2 group-hover:text-brand-600 transition-colors">
                        {event.name[language] || event.name.vi}
                      </h4>

                      <div className="space-y-1 mb-4 text-sm text-slate-500">
                        <div>{parseEventDate(event.date).toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric'
                        })} · {event.time}</div>
                      </div>

                      {event.content && (
                        <p className="text-slate-500 text-sm line-clamp-2 mb-4">
                          {stripHtml(event.content[language] || event.content.vi)}
                        </p>
                      )}

                      <span className="inline-flex items-center gap-1.5 text-brand-600 font-semibold text-sm">
                        {t('home.details')}
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
              <div className="text-center mt-10">
                <Link to="/events" className="btn btn-outline">
                  {t('home.view_all_events')}
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
      <section className="py-24 bg-surface">
        <div className="container-xl">
          <div className="text-center mb-16">
            <p className="eyebrow justify-center mb-4">{t('home.ministries_title')}</p>
            <h2 className="h2">
              {t('ministries.serving_together')}
            </h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto">
            {[
              { 
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                  </svg>
                ), 
                title: t('home.family_ministry'), 
                desc: t('home.family_desc'), 
                color: 'blue' as const 
              },
              { 
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.05 4.575a1.575 1.575 0 10-3.15 0v3m3.15-3v-1.5a1.575 1.575 0 013.15 0v1.5m-3.15 0l.075 5.925m3.075.75V4.575m0 0a1.575 1.575 0 013.15 0V15M6.9 7.575a1.575 1.575 0 10-3.15 0v8.175a6.75 6.75 0 006.75 6.75h2.018a5.25 5.25 0 003.712-1.538l1.732-1.732a5.25 5.25 0 001.538-3.712l.003-2.024a.668.668 0 01.198-.471 1.575 1.575 0 10-2.228-2.228 3.818 3.818 0 00-1.12 2.687M6.9 7.575V12m6.27 4.318A4.49 4.49 0 0116.35 15m.002 0h-.002" />
                  </svg>
                ), 
                title: t('home.youth_ministry'), 
                desc: t('home.youth_desc'), 
                color: 'purple' as const 
              },
              { 
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                  </svg>
                ), 
                title: t('ministries.liturgy'), 
                desc: t('ministries.liturgy_desc'), 
                color: 'rose' as const 
              },
              { 
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 01-.99-3.467l2.31-.66A2.25 2.25 0 009 15.553z" />
                  </svg>
                ), 
                title: t('home.choir_ministry'), 
                desc: t('home.choir_desc'), 
                color: 'amber' as const 
              }
            ].map((ministry, idx) => (
              <div key={idx} className="card">
                <div className="w-12 h-12 rounded-full bg-white border border-slate-200 flex items-center justify-center mb-5 text-brand-600">
                  {ministry.icon}
                </div>
                <h3 className="text-base font-semibold text-slate-900 mb-1.5">{ministry.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{ministry.desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link to="/ministries" className="btn btn-outline">
              {t('home.learn_more_about')}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          <div className="text-center mb-16">
            <p className="eyebrow justify-center mb-4">{t('home.latest_content')}</p>
            <h2 className="h2">
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
                  <div key={index} className="card group">
                    <p className="eyebrow mb-3 text-xs">{t('reflections.gospel')}</p>
                    <Link to={`/reflections/${reflection.id}`} className="block">
                      <h4 className="text-lg font-semibold text-slate-900 mb-2 group-hover:text-brand-600 transition-colors line-clamp-2">
                        {reflection.title[language] || reflection.title.vi}
                      </h4>
                    </Link>
                    <div className={`text-slate-500 text-sm leading-relaxed mb-4 transition-all duration-300 ${isExpanded ? '' : 'line-clamp-3'}`}>
                      {content}
                    </div>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        if (reflection.id) {
                          setExpandedReflectionId(isExpanded ? null : reflection.id);
                        }
                      }}
                      className="inline-flex items-center gap-1.5 text-brand-600 font-semibold text-sm"
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
                <Link to="/reflections" className="btn btn-primary">
                  {t('home.view_all_gospel')}
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </div>
            </div>

            {/* Connect Section */}
            <div className="card">
              <h3 className="text-xl font-semibold text-slate-900 mb-1.5">{t('home.connect')}</h3>
              <p className="text-slate-500 mb-6">{t('home.follow_us')}</p>
              <div className="space-y-1">
                <a
                  href={CHURCH_INFO.FACEBOOK_URL}
                  className="flex items-center gap-4 py-4 border-t border-slate-100 group"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-500 group-hover:text-brand-600 transition-colors shrink-0">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-slate-900 text-sm">Facebook</p>
                    <p className="text-sm text-slate-500">{CHURCH_INFO.FACEBOOK_DISPLAY}</p>
                  </div>
                </a>

                <a
                  href={`mailto:${CHURCH_INFO.EMAIL}`}
                  className="flex items-center gap-4 py-4 border-t border-slate-100 group"
                >
                  <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-500 group-hover:text-brand-600 transition-colors shrink-0">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-slate-900 text-sm">Email</p>
                    <p className="text-sm text-slate-500 break-all">{CHURCH_INFO.EMAIL}</p>
                  </div>
                </a>

                <Link
                  to="/contact"
                  className="flex items-center gap-4 py-4 border-t border-b border-slate-100 group"
                >
                  <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-500 group-hover:text-brand-600 transition-colors shrink-0">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-slate-900 text-sm">{t('home.contact_direct')}</p>
                    <p className="text-sm text-slate-500">{CHURCH_INFO.PHONE}</p>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
      </LazyLoadSection>

      {/* Call to Action */}
      <LazyLoadSection placeholderHeight="400px">
      <section className={`${UI_CONSTANTS.SECTION_PADDING} bg-slate-900`}>
        <div className="container-xl text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-semibold text-white mb-5 tracking-tight">
              {t('home.join_us_title')}
            </h2>
            <p className="text-lg text-slate-400 mb-10 leading-relaxed">
              {t('home.join_us_desc')}
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/contact" className="btn bg-white text-slate-900 hover:bg-slate-100">
                {t('home.contact_now')}
              </Link>
              <Link to="/about" className="btn border border-white/20 text-white hover:bg-white/10">
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
