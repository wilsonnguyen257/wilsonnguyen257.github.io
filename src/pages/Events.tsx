import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import SEO from "../components/SEO";
import type { Event } from "../types/content";
import { subscribeJson } from "../lib/storage";
import { useLanguage } from "../contexts/LanguageContext";
import { hasEventPassed } from "../lib/timezone";
import { CardSkeleton } from "../components/Skeleton";

function groupEventsByMonth(events: Event[], language: string): Record<string, Event[]> {
  return events.reduce((groups: Record<string, Event[]>, event) => {
    const date = new Date(event.date);
    const locale = language === 'vi' ? 'vi-VN' : 'en-US';
    const monthYear = date.toLocaleString(locale, { month: 'long', year: 'numeric' });
    if (!groups[monthYear]) {
      groups[monthYear] = [];
    }
    groups[monthYear].push(event);
    return groups;
  }, {});
}

export default function Events() {
  const { t, language } = useLanguage();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'all'>('upcoming');
  
  useEffect(() => {
    const unsub = subscribeJson<Event[]>(
      'events',
      (eventsData) => {
        setLoading(false);
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
        }).filter(e => e.status === 'published').sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        setEvents(mapped);
      }
    );
    return () => { unsub(); };
  }, []);

  const now = useMemo(() => new Date(), []);
  
  const upcomingEvents = useMemo(() => events.filter(e => {
    try {
      return !hasEventPassed(e.date, e.time || '11:59 PM');
    } catch {
      return new Date(e.date) >= now;
    }
  }), [events, now]);
  
  const displayEvents = activeTab === 'upcoming' ? upcomingEvents : events;
  const groupedEvents = useMemo(
    () => groupEventsByMonth(displayEvents, language),
    [displayEvents, language]
  );

  return (
    <div className="bg-slate-50">
      <SEO 
        title={t('events.title')} 
        description={t('events.subtitle')} 
      />
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-brand-600 to-brand-800 text-white py-12 md:py-16 overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-20"></div>
        
        {/* Decorative circles */}
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/3 w-96 h-96 bg-brand-500/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/3 w-64 h-64 bg-brand-400/20 rounded-full blur-3xl"></div>

        <div className="container-xl relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 mb-6 shadow-sm hover:bg-white/20 transition-colors">
              <svg className="w-4 h-4 text-brand-100" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/>
              </svg>
              <span className="font-medium text-sm md:text-base">{t('events.upcoming')}</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight">{t('events.title')}</h1>
            <p className="text-lg md:text-xl text-brand-100 max-w-2xl mx-auto leading-relaxed">
              {t('events.subtitle')}
            </p>
          </div>
        </div>
      </section>

      {/* Next Event Section */}
      {upcomingEvents.length > 0 && (
        <section className="py-20 bg-white">
          <div className="container-xl">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-brand-100 rounded-full px-4 py-2 mb-4">
                <svg className="w-5 h-5 text-brand-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                </svg>
                <span className="font-medium text-brand-700">{t('events.latest_event')}</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900">{t('events.next_event')}</h2>
            </div>
            <Link 
              to={`/events/${upcomingEvents[0].id}`}
              className="block max-w-4xl mx-auto bg-gradient-to-br from-white to-slate-50 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden group border border-slate-200"
            >
              <div className="grid md:grid-cols-2 gap-0">
                <div className="relative h-64 md:h-full min-h-[300px] overflow-hidden group">
                  <img 
                    src={upcomingEvents[0].thumbnail || upcomingEvents[0].thumbnailPath} 
                    alt={upcomingEvents[0].name[language] || upcomingEvents[0].name.vi} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80 md:opacity-40"></div>
                  <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm text-brand-700 px-4 py-2 rounded-xl shadow-lg font-bold border border-brand-100 flex flex-col items-center min-w-[70px]">
                    <span className="text-sm uppercase tracking-wider">{new Date(upcomingEvents[0].date).toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US', { month: 'short' })}</span>
                    <span className="text-2xl leading-none">{new Date(upcomingEvents[0].date).getDate()}</span>
                  </div>
                </div>
                <div className="p-8 md:p-10 flex flex-col justify-center bg-gradient-to-br from-white to-brand-50/30">
                  <div className="inline-flex items-center gap-2 text-brand-600 font-semibold mb-4 bg-brand-50 w-fit px-3 py-1 rounded-full text-sm">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500"></span>
                    </span>
                    {language === 'vi' ? 'Sắp diễn ra' : 'Next Event'}
                  </div>
                  <h2 className="text-2xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
                    {upcomingEvents[0].name[language] || upcomingEvents[0].name.vi}
                  </h2>
                  <div className="space-y-4 mb-8 text-gray-600">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-brand-50 flex items-center justify-center text-brand-600 flex-shrink-0">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <span className="text-lg font-medium">{upcomingEvents[0].time}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-brand-50 flex items-center justify-center text-brand-600 flex-shrink-0">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <span className="text-lg">{upcomingEvents[0].location}</span>
                    </div>
                  </div>
                  <span 
                    className="w-full md:w-auto bg-brand-600 text-white px-8 py-3.5 rounded-xl font-medium hover:bg-brand-700 transition-all shadow-lg hover:shadow-brand-500/30 flex items-center justify-center gap-2"
                  >
                    {language === 'vi' ? 'Xem chi tiết' : 'View Details'}
                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </span>
                </div>
              </div>
            </Link>
          </div>
        </section>
      )}

      {/* Events List Section */}
      <section className="py-20 bg-gradient-to-b from-slate-50 to-white">
        <div className="container-xl">
          <div className="flex justify-center gap-4 mb-12">
            <button
              className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                activeTab === 'upcoming' 
                  ? 'bg-brand-600 text-white shadow-lg hover:bg-brand-700' 
                  : 'bg-white text-slate-700 border-2 border-slate-200 hover:border-brand-600'
              }`}
              onClick={() => setActiveTab('upcoming')}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              {t('events.upcoming')}
            </button>
            <button
              className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                activeTab === 'all' 
                  ? 'bg-brand-600 text-white shadow-lg hover:bg-brand-700' 
                  : 'bg-white text-slate-700 border-2 border-slate-200 hover:border-brand-600'
              }`}
              onClick={() => setActiveTab('all')}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
              {t('events.all')}
            </button>
          </div>

          <div className="space-y-16">
            {loading ? (
              // Skeleton Loading State
              <div className="grid gap-6 md:grid-cols-2">
                {[1, 2, 3, 4].map(i => (
                  <CardSkeleton key={i} />
                ))}
              </div>
            ) : (
              Object.entries(groupedEvents).map(([monthYear, monthEvents]) => (
                <div key={monthYear} className="relative">
                  <div className="flex items-center gap-4 mb-8 sticky top-20 bg-white/95 backdrop-blur-sm z-10 py-4 -mx-4 px-4 rounded-xl border border-transparent shadow-sm">
                    <div className="w-12 h-12 bg-brand-100 rounded-xl flex items-center justify-center flex-shrink-0 shadow-inner">
                      <svg className="w-6 h-6 text-brand-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/>
                      </svg>
                    </div>
                    <h3 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight">{monthYear}</h3>
                    <div className="flex-1 h-px bg-gradient-to-r from-slate-200 to-transparent"></div>
                  </div>
                  <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {monthEvents.map((event) => (
                      <Link 
                        key={event.id}
                        to={`/events/${event.id}`}
                        className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-slate-100 hover:border-brand-200 hover:-translate-y-1 flex flex-col h-full"
                      >
                        {/* Thumbnail */}
                        <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                          {event.thumbnail ? (
                            <img 
                              src={event.thumbnail} 
                              alt={event.name[language] || event.name.vi}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              loading="lazy"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                              }}
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-brand-50 to-brand-100 flex items-center justify-center">
                              <svg className="w-12 h-12 text-brand-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}
                          
                          {/* Status Badge */}
                          <div className="absolute top-3 right-3">
                            {!hasEventPassed(event.date, event.time || '11:59 PM') ? (
                              <div className="bg-white/95 backdrop-blur text-brand-700 rounded-lg px-3 py-1 text-xs font-bold shadow-sm border border-brand-100 flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                {t('events.upcoming')}
                              </div>
                            ) : (
                              <div className="bg-slate-900/80 backdrop-blur text-white rounded-lg px-3 py-1 text-xs font-bold shadow-sm">
                                {t('events.past')}
                              </div>
                            )}
                          </div>

                          {/* Date Overlay (Bottom Left) */}
                          <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur px-3 py-1.5 rounded-lg shadow-sm border border-slate-100 flex flex-col items-center min-w-[50px]">
                            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                              {new Date(event.date).toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US', { month: 'short' })}
                            </span>
                            <span className="text-lg font-bold text-slate-900 leading-none">
                              {new Date(event.date).getDate()}
                            </span>
                          </div>
                        </div>

                        {/* Content */}
                        <div className="p-5 flex flex-col flex-1">
                          <h4 className="text-lg font-bold text-slate-900 mb-3 group-hover:text-brand-600 transition-colors line-clamp-2 leading-tight">
                            {event.name[language] || event.name.vi}
                          </h4>

                          <div className="space-y-2.5 mb-4 flex-1">
                            <div className="flex items-center gap-2.5 text-sm text-slate-600">
                              <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 flex-shrink-0">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              </div>
                              <span className="font-medium">{event.time}</span>
                            </div>
                            <div className="flex items-center gap-2.5 text-sm text-slate-600">
                              <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 flex-shrink-0">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                              </div>
                              <span className="font-medium line-clamp-1">{event.location}</span>
                            </div>
                          </div>

                          <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-auto">
                            <span className="text-sm font-semibold text-brand-600 group-hover:text-brand-700 flex items-center gap-1 group-hover:gap-2 transition-all">
                              {t('events.view_details')}
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                              </svg>
                            </span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>

          {!loading && Object.keys(groupedEvents).length === 0 && (
            <div className="text-center p-muted">
              {activeTab === 'upcoming' 
                ? t('events.no_upcoming')
                : t('events.no_events')}
            </div>
          )}
        </div>
      </section>

    </div>
  );
}
