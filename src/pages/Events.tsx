import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import SEO from "../components/SEO";
import PageHero from "../components/PageHero";
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
        }).filter(e => e.status === 'published').sort((a, b) => {
          // Sort descending: newest events first (highest date to lowest date)
          return parseEventDate(b.date).getTime() - parseEventDate(a.date).getTime();
        });
        setEvents(mapped);
      }
    );
    return () => { unsub(); };
  }, []);

  const now = useMemo(() => new Date(), []);
  
  const upcomingEvents = useMemo(() => {
    return events.filter(e => {
      try {
        return !hasEventPassed(e.date, e.time || '11:59 PM');
      } catch {
        return parseEventDate(e.date) >= now;
      }
    }).sort((a, b) => {
      // Sort upcoming events ascending: nearest event first
      return parseEventDate(a.date).getTime() - parseEventDate(b.date).getTime();
    });
  }, [events, now]);

  const pastEvents = useMemo(() => {
    return events.filter(e => {
      try {
        return hasEventPassed(e.date, e.time || '11:59 PM');
      } catch {
        return parseEventDate(e.date) < now;
      }
    }).sort((a, b) => {
      // Sort past events descending: most recent past event first
      return parseEventDate(b.date).getTime() - parseEventDate(a.date).getTime();
    });
  }, [events, now]);

  return (
    <div className="bg-white">
      <SEO 
        title={t('events.title')} 
        description={t('events.subtitle')} 
      />
      <PageHero
        title={t('events.title')}
        subtitle={t('events.subtitle')}
        badgeLabel={t('events.upcoming')}
        badgeIcon={
          <svg className="w-4 h-4 text-brand-100" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/>
          </svg>
        }
      />

      {/* Next Event Section */}
      {upcomingEvents.length > 0 && (
        <section className="relative -mt-16 z-20 pb-12">
          <div className="container-xl">
            <Link 
              to={`/events/${upcomingEvents[0].id}`}
              className="block max-w-5xl mx-auto bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:shadow-[0_8px_40px_rgb(0,0,0,0.1)] transition-shadow duration-300 overflow-hidden group border border-slate-100"
            >
              <div className="grid md:grid-cols-2 gap-0">
                <div className="relative h-64 md:h-full min-h-[350px] overflow-hidden group">
                  <img 
                    src={upcomingEvents[0].thumbnail || upcomingEvents[0].thumbnailPath} 
                    alt={upcomingEvents[0].name[language] || upcomingEvents[0].name.vi} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60"></div>
                  <div className="absolute top-6 left-6 bg-white/95 backdrop-blur-md text-brand-700 px-4 py-3 rounded-2xl shadow-sm font-semibold flex flex-col items-center min-w-[76px]">
                    <span className="text-sm uppercase tracking-wider font-bold text-slate-500">{parseEventDate(upcomingEvents[0].date).toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US', { month: 'short' })}</span>
                    <span className="text-3xl leading-none text-slate-900">{parseEventDate(upcomingEvents[0].date).getDate()}</span>
                  </div>
                </div>
                <div className="p-8 md:p-12 flex flex-col justify-center bg-white relative">
                  <p className="eyebrow mb-6">{t('events.next_event')}</p>
                  <h2 className="text-2xl md:text-3xl font-semibold text-slate-900 mb-6 leading-tight tracking-tight group-hover:text-brand-700 transition-colors">
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
                    className="btn btn-primary w-full md:w-auto"
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

      {/* Upcoming Events List */}
      {upcomingEvents.length > 1 && (
        <section className="py-20 bg-surface">
          <div className="container-xl">
            <div className="flex items-center gap-3 mb-12">
              <div className="h-px bg-slate-200 flex-1"></div>
              <h2 className="text-lg font-semibold text-slate-900 uppercase tracking-widest">{t('events.upcoming')}</h2>
              <div className="h-px bg-slate-200 flex-1"></div>
            </div>
            
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {upcomingEvents.slice(1).map((event) => (
                <Link 
                  key={event.id}
                  to={`/events/${event.id}`}
                  className="group card !p-0 overflow-hidden flex flex-col"
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
                    <h3 className="text-lg font-semibold text-slate-900 mb-3 group-hover:text-brand-600 transition-colors line-clamp-2">
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
          </div>
        </section>
      )}

      {/* Past Events List */}
      <section className="py-20 bg-surface">
        <div className="container-xl">
          <div className="flex items-center gap-3 mb-12">
            <div className="h-px bg-slate-300 flex-1"></div>
            <h2 className="text-lg font-semibold text-slate-900 uppercase tracking-widest">{t('events.past_events')}</h2>
            <div className="h-px bg-slate-300 flex-1"></div>
          </div>
          
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {pastEvents.map((event) => (
              <Link 
                key={event.id}
                to={`/events/${event.id}`}
                className="group card !p-0 overflow-hidden flex flex-col opacity-80 hover:opacity-100"
              >
                <div className="relative h-48 overflow-hidden grayscale group-hover:grayscale-0 transition-all duration-500">
                  <img 
                    src={event.thumbnail || event.thumbnailPath} 
                    alt={event.name[language] || event.name.vi} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute top-4 right-4 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-lg shadow-sm text-center min-w-[60px] border border-slate-700">
                    <p className="text-xs font-bold text-slate-300 uppercase tracking-wider">{parseEventDate(event.date).toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US', { month: 'short' })}</p>
                    <p className="text-xl font-bold text-white leading-none">{parseEventDate(event.date).getDate()}</p>
                  </div>
                </div>
                
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="text-lg font-semibold text-slate-700 mb-3 group-hover:text-brand-600 transition-colors line-clamp-2">
                    {event.name[language] || event.name.vi}
                  </h3>
                  
                  <div className="space-y-3 mt-auto">
                    <div className="flex items-center gap-3 text-slate-500 text-sm">
                      <svg className="w-5 h-5 text-slate-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="font-medium">{event.time}</span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-500 text-sm">
                      <svg className="w-5 h-5 text-slate-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

          {pastEvents.length === 0 && (
            <div className="text-center py-12">
              <p className="text-slate-500">{t('events.no_events')}</p>
            </div>
          )}
        </div>
      </section>

    </div>
  );
}
