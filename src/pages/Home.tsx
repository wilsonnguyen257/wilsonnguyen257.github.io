import { Link } from 'react-router-dom';
import type { Event } from '../types/content';
import { useEffect, useState } from 'react';
import EventCountdown from '../components/EventCountdown';
import { useLanguage } from '../contexts/LanguageContext';
import { subscribeJson } from '../lib/storage';
import { hasEventPassed } from '../lib/timezone';

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

// Reflections now come from Firebase Storage JSON

// Helper function to strip HTML tags for preview text
const stripHtml = (html: string): string => {
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
};

export default function Home() {
  const { t, language } = useLanguage();

  const [events, setEvents] = useState<Event[]>([]);

  // Find index of the current event: first event that hasn't passed yet (using Melbourne timezone)
  const currentIndex = events.findIndex(ev => !hasEventPassed(ev.date, ev.time || '11:59 PM'));
  const startIndex = currentIndex === -1 ? events.length : currentIndex;
  const upcomingEvents = events.slice(startIndex, startIndex + 3);
  const [latestReflections, setLatestReflections] = useState<Reflection[]>([]);

  useEffect(() => {
    // Live reflections
    type RawReflection = Reflection & { id?: string };
    const unsubRefl = subscribeJson<RawReflection[]>(
      'reflections',
      (items) => {
        const mapped: Reflection[] = (items || []).map((it) => ({
          title: { vi: it.title?.vi || '', en: it.title?.en || it.title?.vi || '' },
          content: { vi: it.content?.vi || '', en: it.content?.en || it.content?.vi || '' },
          date: it.date,
          author: it.author,
        }));
        setLatestReflections(mapped.slice(0, 2));
      },
      () => setLatestReflections([])
    );

    // Live events from cloud database
    type RawEvent = Event;
    const unsubEvents = subscribeJson<RawEvent[]>(
      'events',
      (eventsData) => {
        const mapped: Event[] = (eventsData || []).map((d) => ({
          id: d.id,
          name: { vi: d.name?.vi || '', en: d.name?.en || d.name?.vi || '' },
          date: d.date,
          time: d.time,
          location: d.location,
          content: d.content ? { vi: d.content.vi || '', en: d.content.en || d.content.vi || '' } : undefined,
          thumbnail: d.thumbnail,
          thumbnailPath: d.thumbnailPath,
        })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        setEvents(mapped);
      },
      () => setEvents([])
    );

    return () => { unsubRefl(); unsubEvents(); };
  }, []);

  return (
    <>
      {/* Hero - Modern Gradient Design */}
      <section className="relative bg-gradient-to-br from-brand-600 via-brand-700 to-brand-800 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 py-20 md:py-24 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }}></div>
        </div>
        
        <div className="container-xl relative z-10">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            {/* Content */}
            <div className="text-white">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                {t('home.title')}
              </h1>
              <p className="text-lg md:text-xl text-brand-100 mb-4 leading-relaxed">
                {t('home.subtitle')}
              </p>
              <p className="text-base text-brand-200 mb-6">
                {t('home.description')}
              </p>
              <div className="flex items-center gap-3 mb-8 p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                <span className="text-2xl">⛪</span>
                <div>
                  <p className="font-semibold text-brand-100">{t('home.mass')}</p>
                  <p className="text-brand-200">{t('home.mass_time')}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-4">
                <Link to="/about" className="px-6 py-3 bg-white text-brand-700 font-semibold rounded-xl hover:bg-brand-50 transition-colors shadow-lg">
                  {t('home.learn_more')}
                </Link>
                <Link to="/contact" className="px-6 py-3 bg-transparent text-white font-semibold rounded-xl border-2 border-white hover:bg-white/10 transition-colors">
                  {t('home.contact_us')}
                </Link>
              </div>
            </div>

            {/* Map Card */}
            <div className="relative">
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700">
                <iframe 
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3151.9741339657257!2d145.19334571531906!3d-37.83350797974801!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6ad63bfb7b1e1b75%3A0x27d1a68aa5308e0!2s17%20Stevens%20Rd%2C%20Vermont%20VIC%203133!5e0!3m2!1sen!2sau!4v1629185943012!5m2!1sen!2sau"
                  className="w-full h-80"
                  style={{ border: 0 }}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Welcome Message - Elevated Cards */}
      <section className="py-20 bg-white dark:bg-slate-900">
        <div className="container-xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              {t('home.welcome_title')}
            </h2>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              { icon: '🙏', title: t('home.faith_title'), desc: t('home.faith_desc'), color: 'from-blue-500 to-blue-600' },
              { icon: '❤️', title: t('home.community_title'), desc: t('home.community_desc'), color: 'from-red-500 to-red-600' },
              { icon: '✨', title: t('home.service_title'), desc: t('home.service_desc'), color: 'from-amber-500 to-amber-600' }
            ].map((item, idx) => (
              <div key={idx} className="group relative bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-slate-200 dark:border-slate-700">
                <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${item.color} rounded-t-2xl`}></div>
                <div className="text-5xl mb-6 group-hover:scale-110 transition-transform duration-300">{item.icon}</div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{item.title}</h3>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mass Times & Location - Modern Information Cards */}
      <section className="py-20 bg-gradient-to-b from-slate-50 to-white dark:from-slate-800 dark:to-slate-900">
        <div className="container-xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              {t('home.mass_schedule_title')}
            </h2>
          </div>
          <div className="grid gap-8 lg:grid-cols-2 max-w-5xl mx-auto">
            {/* Mass Times */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-lg border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-brand-100 dark:bg-brand-900 rounded-xl">
                  <span className="text-2xl">📅</span>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{t('home.mass_schedule_subtitle')}</h3>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                  <span className="text-xl">⛪</span>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">{t('home.sunday')}</p>
                    <p className="text-slate-600 dark:text-slate-300">{t('home.sunday_time')}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                  <span className="text-xl">🎉</span>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">{t('home.special_days')}</p>
                    <p className="text-slate-600 dark:text-slate-300">{t('home.special_days_desc')}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                  <span className="text-xl">🙏</span>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">{t('home.confession')}</p>
                    <p className="text-slate-600 dark:text-slate-300">{t('home.confession_time')}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-lg border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-brand-100 dark:bg-brand-900 rounded-xl">
                  <span className="text-2xl">📍</span>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{t('home.info_title')}</h3>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                  <span className="text-xl">🏠</span>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">{t('home.address_label')}</p>
                    <p className="text-slate-600 dark:text-slate-300">{t('home.address_value')}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                  <span className="text-xl">🚗</span>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">{t('home.parking_label')}</p>
                    <p className="text-slate-600 dark:text-slate-300">{t('home.parking_desc')}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                  <span className="text-xl">📞</span>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">{t('home.contact_label')}</p>
                    <a href="tel:0422-400-116" className="text-brand-600 dark:text-brand-400 hover:underline font-medium">
                      0422-400-116
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Upcoming Events */}
      <section className="py-20 bg-white dark:bg-slate-900">
        <div className="container-xl">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-brand-100 dark:bg-brand-900/30 rounded-full px-4 py-2 mb-4">
              <svg className="w-5 h-5 text-brand-600 dark:text-brand-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/>
              </svg>
              <span className="font-medium text-brand-700 dark:text-brand-300">{t('home.upcoming_events')}</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">
              {t('home.important_event')}
            </h2>
          </div>

          {upcomingEvents.length > 0 && (
            <div className="mb-12">
              <div className="max-w-4xl mx-auto bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-700 rounded-2xl shadow-xl overflow-hidden border border-slate-200 dark:border-slate-600">
                {upcomingEvents[0].thumbnail && (
                  <div className="relative">
                    <img 
                      src={upcomingEvents[0].thumbnail} 
                      alt={upcomingEvents[0].name[language] || upcomingEvents[0].name.vi}
                      className="w-full aspect-video object-cover"
                      loading="eager"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  </div>
                )}
                <div className="p-8">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="inline-flex items-center gap-1.5 bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 rounded-full px-3 py-1 text-sm font-semibold">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                      </svg>
                      {t('home.featured_event')}
                    </span>
                  </div>
                  
                  <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
                    {upcomingEvents[0].name[language] || upcomingEvents[0].name.vi}
                  </h3>
                  
                  <div className="grid sm:grid-cols-3 gap-4 mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{t('events.date')}</p>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">
                          {new Date(upcomingEvents[0].date).toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US', { 
                            month: 'short', 
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{t('events.time')}</p>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">{upcomingEvents[0].time}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{t('events.location')}</p>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">{upcomingEvents[0].location}</p>
                      </div>
                    </div>
                  </div>
                  
                  {upcomingEvents[0].content && (
                    <p className="text-slate-600 dark:text-slate-300 mb-6 leading-relaxed line-clamp-3">
                      {stripHtml(upcomingEvents[0].content[language] || upcomingEvents[0].content.vi)}
                    </p>
                  )}
                  
                  <EventCountdown 
                    eventDate={upcomingEvents[0].date} 
                    eventTime={upcomingEvents[0].time}
                  />
                </div>
              </div>
            </div>
          )}

          {upcomingEvents.length > 1 && (
            <>
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white text-center">{t('home.other_events')}</h3>
              </div>
              <div className="grid gap-6 md:grid-cols-2 max-w-5xl mx-auto">
                {upcomingEvents.slice(1).map(event => (
                  <Link
                    key={event.id}
                    to="/events"
                    className="group bg-white dark:bg-slate-800 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-slate-200 dark:border-slate-700 hover:-translate-y-1"
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
                      <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-3 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                        {event.name[language] || event.name.vi}
                      </h4>
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span>{new Date(event.date).toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US', { 
                            weekday: 'short', 
                            month: 'short', 
                            day: 'numeric'
                          })}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>{event.time}</span>
                        </div>
                      </div>
                      
                      {event.content && (
                        <p className="text-slate-600 dark:text-slate-300 text-sm line-clamp-2 mb-4">
                          {stripHtml(event.content[language] || event.content.vi)}
                        </p>
                      )}
                      
                      <span className="inline-flex items-center gap-2 text-brand-600 dark:text-brand-400 font-semibold text-sm group-hover:gap-3 transition-all">
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

      {/* Ministries */}
      <section className="py-20 bg-gradient-to-b from-slate-50 to-white dark:from-slate-800 dark:to-slate-900">
        <div className="container-xl">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-brand-100 dark:bg-brand-900/30 rounded-full px-4 py-2 mb-4">
              <svg className="w-5 h-5 text-brand-600 dark:text-brand-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z"/>
              </svg>
              <span className="font-medium text-brand-700 dark:text-brand-300">{t('home.ministries_title')}</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">
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
                blue: { border: 'border-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-600 dark:text-blue-400' },
                purple: { border: 'border-purple-600', bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-600 dark:text-purple-400' },
                rose: { border: 'border-rose-600', bg: 'bg-rose-100 dark:bg-rose-900/30', text: 'text-rose-600 dark:text-rose-400' },
                amber: { border: 'border-amber-600', bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-600 dark:text-amber-400' }
              };
              const colors = colorMap[ministry.color];
              
              return (
                <div key={idx} className={`group bg-white dark:bg-slate-800 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 border-t-4 ${colors.border}`}>
                  <div className={`w-14 h-14 ${colors.bg} ${colors.text} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform text-2xl`}>
                    {ministry.icon}
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{ministry.title}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{ministry.desc}</p>
                </div>
              );
            })}
          </div>

          <div className="text-center mt-8">
            <Link to="/ministries" className="inline-flex items-center gap-2 px-8 py-3 bg-transparent border-2 border-brand-600 text-brand-600 dark:text-brand-400 hover:bg-brand-600 hover:text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300">
              {t('home.learn_more_about')}
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Latest Content */}
      <section className="py-20 bg-white dark:bg-slate-900">
        <div className="container-xl">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-brand-100 dark:bg-brand-900/30 rounded-full px-4 py-2 mb-4">
              <svg className="w-5 h-5 text-brand-600 dark:text-brand-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z"/>
              </svg>
              <span className="font-medium text-brand-700 dark:text-brand-300">{t('home.latest_content')}</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">
              {t('home.gospel')}
            </h2>
          </div>

          <div className="grid gap-8 md:grid-cols-2 max-w-5xl mx-auto">
            {/* Gospel Reflections */}
            <div className="space-y-6">
              {latestReflections.slice(0, 2).map((reflection, index) => (
                <Link
                  key={index}
                  to={`/reflections`}
                  className="group block bg-white dark:bg-slate-800 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 border border-slate-200 dark:border-slate-700 hover:-translate-y-1"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <span className="inline-flex items-center gap-1.5 bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 rounded-full px-3 py-1 text-xs font-semibold">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z"/>
                      </svg>
                      {t('reflections.gospel')}
                    </span>
                  </div>
                  <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors line-clamp-2">
                    {reflection.title[language] || reflection.title.vi}
                  </h4>
                  <p className="text-slate-600 dark:text-slate-300 text-sm line-clamp-3 leading-relaxed mb-4">
                    {stripHtml(reflection.content[language] || reflection.content.vi)}
                  </p>
                  <span className="inline-flex items-center gap-2 text-brand-600 dark:text-brand-400 font-semibold text-sm group-hover:gap-3 transition-all">
                    {t('home.read_more')}
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </Link>
              ))}
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
              <div className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-700 rounded-2xl shadow-xl p-8 border border-slate-200 dark:border-slate-600">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">{t('home.connect')}</h3>
                <p className="text-slate-600 dark:text-slate-300 mb-6">{t('home.follow_us')}</p>
                <div className="space-y-4">
                  <a 
                    href="https://www.facebook.com/sttimvn" 
                    className="flex items-center gap-4 p-4 bg-white dark:bg-slate-700/50 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 border border-slate-200 dark:border-slate-600 hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-300 group"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-slate-900 dark:text-white">Facebook</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">facebook.com/sttimvn</p>
                    </div>
                    <svg className="w-5 h-5 text-slate-400 group-hover:text-blue-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </a>

                  <a 
                    href="mailto:sttimvn2013@gmail.com"
                    className="flex items-center gap-4 p-4 bg-white dark:bg-slate-700/50 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 border border-slate-200 dark:border-slate-600 hover:border-red-300 dark:hover:border-red-700 transition-all duration-300 group"
                  >
                    <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-slate-900 dark:text-white">Email</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400 break-all">sttimvn2013@gmail.com</p>
                    </div>
                    <svg className="w-5 h-5 text-slate-400 group-hover:text-red-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </a>

                  <Link 
                    to="/contact"
                    className="flex items-center gap-4 p-4 bg-white dark:bg-slate-700/50 rounded-lg hover:bg-brand-50 dark:hover:bg-brand-900/20 border border-slate-200 dark:border-slate-600 hover:border-brand-300 dark:hover:border-brand-700 transition-all duration-300 group"
                  >
                    <div className="w-12 h-12 bg-brand-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-slate-900 dark:text-white">{t('home.contact_direct')}</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">0422-400-116</p>
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

      {/* Call to Action */}
      {/* CTA */}
      <section className="relative py-20 bg-gradient-to-br from-brand-600 to-brand-800 overflow-hidden">
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
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-brand-600 font-bold rounded-lg shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {t('home.contact_now')}
              </Link>
              <Link 
                to="/about" 
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-sm text-white border-2 border-white font-bold rounded-lg hover:bg-white hover:text-brand-600 hover:scale-105 transition-all duration-300"
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
    </>
  );
}
