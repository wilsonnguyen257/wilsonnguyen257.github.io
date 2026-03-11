import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import SEO from "../components/SEO";
import type { Event } from "../types/content";
import { subscribeJson } from "../lib/storage";
import { useLanguage } from "../contexts/LanguageContext";
import { hasEventPassed, parseEventDate } from "../lib/timezone";

export default function Events() {
  const { t, language } = useLanguage();
  const [events, setEvents] = useState<Event[]>([]);
  
  useEffect(() => {
    const unsub = subscribeJson<Event[]>(
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
      }
    );
    return () => { unsub(); };
  }, []);

  const now = useMemo(() => new Date(), []);
  
  const upcomingEvents = useMemo(() => events.filter(e => {
    try {
      return !hasEventPassed(e.date, e.time || '11:59 PM');
    } catch {
      return parseEventDate(e.date) >= now;
    }
  }), [events, now]);
  
  return (
    <div className="bg-slate-50">
      <SEO 
        title={t('events.title')} 
        description={t('events.subtitle')} 
      />
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-brand-600 via-brand-700 to-brand-800 text-white py-20 md:py-28 overflow-hidden">
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
              <span className="font-medium text-sm md:text-base text-brand-50">{t('events.upcoming')}</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight font-serif">{t('events.title')}</h1>
            <p className="text-lg md:text-xl text-brand-100 max-w-2xl mx-auto leading-relaxed">
              {t('events.subtitle')}
            </p>
          </div>
        </div>
      </section>

      {/* Next Event Section */}
      {upcomingEvents.length > 0 && (
        <section className="relative -mt-16 z-20 pb-12">
          <div className="container-xl">
            <Link 
              to={`/events/${upcomingEvents[0].id}`}
              className="block max-w-5xl mx-auto bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden group border border-slate-100 hover:-translate-y-1"
            >
              <div className="grid md:grid-cols-2 gap-0">
                <div className="relative h-64 md:h-full min-h-[350px] overflow-hidden group">
                  <img 
                    src={upcomingEvents[0].thumbnail || upcomingEvents[0].thumbnailPath} 
                    alt={upcomingEvents[0].name[language] || upcomingEvents[0].name.vi} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60"></div>
                  <div className="absolute top-6 left-6 bg-white/95 backdrop-blur-md text-brand-700 px-4 py-3 rounded-2xl shadow-xl font-bold border border-white/50 flex flex-col items-center min-w-[80px]">
                    <span className="text-sm uppercase tracking-wider font-bold text-slate-500">{parseEventDate(upcomingEvents[0].date).toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US', { month: 'short' })}</span>
                    <span className="text-3xl leading-none text-slate-900">{parseEventDate(upcomingEvents[0].date).getDate()}</span>
                  </div>
                </div>
                <div className="p-8 md:p-12 flex flex-col justify-center bg-white relative">
                  <div className="inline-flex items-center gap-2 text-brand-600 font-bold mb-6 bg-brand-50 w-fit px-4 py-1.5 rounded-full text-xs uppercase tracking-wider border border-brand-100">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500"></span>
                    </span>
                    {t('events.next_event')}
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6 leading-tight font-serif group-hover:text-brand-700 transition-colors">
                    {upcomingEvents[0].name[language] || upcomingEvents[0].name.vi}
                  </h2>
                  <div className="space-y-4 mb-8 text-slate-600">
                    <div className="flex items-center gap-4 group/item">
                      <div className="w-12 h-12 rounded-xl bg-brand-50 flex items-center justify-center text-brand-600 flex-shrink-0 group-hover/item:bg-brand-100 transition-colors">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t('events.time')}</p>
                        <p className="text-lg font-medium text-slate-900">{upcomingEvents[0].time}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 group/item">
                      <div className="w-12 h-12 rounded-xl bg-brand-50 flex items-center justify-center text-brand-600 flex-shrink-0 group-hover/item:bg-brand-100 transition-colors">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t('events.location')}</p>
                        <p className="text-lg font-medium text-slate-900">{upcomingEvents[0].location}</p>
                      </div>
                    </div>
                  </div>
                  <span 
                    className="inline-flex items-center justify-center gap-2 w-full md:w-auto bg-brand-600 text-white px-8 py-3.5 rounded-xl font-bold hover:bg-brand-700 transition-all shadow-lg hover:shadow-brand-500/30 hover:-translate-y-0.5"
                  >
                    {t('events.view_details')}
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </span>
                </div>
              </div>
            </Link>
          </div>
        </section>
      )}

      {/* All Events List */}
      <section className="py-20 bg-slate-50">
        <div className="container-xl">
          <div className="flex items-center gap-3 mb-12">
            <div className="h-px bg-slate-200 flex-1"></div>
            <h2 className="text-2xl font-bold text-slate-900 uppercase tracking-widest font-serif">{t('events.all_events')}</h2>
            <div className="h-px bg-slate-200 flex-1"></div>
          </div>
          
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <Link 
                key={event.id}
                to={`/events/${event.id}`}
                className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 hover:border-brand-200 hover:-translate-y-1 flex flex-col overflow-hidden"
              >
                <div className="relative h-56 overflow-hidden">
                  <img 
                    src={event.thumbnail || event.thumbnailPath} 
                    alt={event.name[language] || event.name.vi} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-lg shadow-sm text-center min-w-[60px] border border-slate-100">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{parseEventDate(event.date).toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US', { month: 'short' })}</p>
                    <p className="text-xl font-bold text-brand-600 leading-none">{parseEventDate(event.date).getDate()}</p>
                  </div>
                </div>
                
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-brand-600 transition-colors line-clamp-2 font-serif">
                    {event.name[language] || event.name.vi}
                  </h3>
                  
                  <div className="space-y-3 mt-auto">
                    <div className="flex items-center gap-3 text-slate-600 text-sm">
                      <svg className="w-5 h-5 text-brand-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="font-medium">{event.time}</span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-600 text-sm">
                      <svg className="w-5 h-5 text-brand-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="font-medium line-clamp-1">{event.location}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {events.length === 0 && (
            <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-xl font-medium text-slate-900">{t('events.no_events')}</p>
              <p className="text-slate-500 mt-2">{t('events.check_back')}</p>
            </div>
          )}
        </div>
      </section>

    </div>
  );
}
