import { useEffect, useState } from "react";
import type { Event } from "../types/content";
import { subscribeJson } from "../lib/storage";
import EventCountdown from "../components/EventCountdown";
import { useLanguage } from "../contexts/LanguageContext";

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
  const [activeTab, setActiveTab] = useState<'upcoming' | 'all'>('upcoming');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  
  useEffect(() => {
    const unsub = subscribeJson<Event[]>(
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
      }
    );
    return () => { unsub(); };
  }, []);

  const now = new Date();
  const upcomingEvents = events.filter(e => new Date(e.date) >= now);
  const displayEvents = activeTab === 'upcoming' ? upcomingEvents : events;
  const groupedEvents = groupEventsByMonth(displayEvents, language);

  return (
    <div className="bg-slate-50 dark:bg-slate-900">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-brand-600 to-brand-800 text-white py-20">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30"></div>
        <div className="container-xl relative">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/>
              </svg>
              <span className="font-medium">{t('events.upcoming')}</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{t('events.title')}</h1>
            <p className="text-xl text-white/90 leading-relaxed">
              {t('events.subtitle')}
            </p>
          </div>
        </div>
      </section>

      {/* Next Event Section */}
      {upcomingEvents.length > 0 && (
        <section className="py-20 bg-white dark:bg-slate-900">
          <div className="container-xl">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-brand-100 dark:bg-brand-900/30 rounded-full px-4 py-2 mb-4">
                <svg className="w-5 h-5 text-brand-600 dark:text-brand-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                </svg>
                <span className="font-medium text-brand-700 dark:text-brand-300">{t('events.latest_event')}</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">{t('events.next_event')}</h2>
            </div>
            <div 
              className="max-w-4xl mx-auto bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-700 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden cursor-pointer group border border-slate-200 dark:border-slate-600"
              onClick={() => setSelectedEvent(upcomingEvents[0])}
            >
              {/* Featured Event Banner */}
              <div className="bg-gradient-to-r from-brand-600 to-brand-700 px-6 py-3 text-white">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold uppercase tracking-wide">{t('events.latest_event')}</span>
                  <span className="text-xs bg-white/20 px-3 py-1 rounded-full">{t('events.upcoming')}</span>
                </div>
              </div>

              {/* Event Content */}
              <div className="p-6 md:p-8">
                {/* Countdown Timer */}
                <div className="mb-6">
                  <EventCountdown 
                    eventDate={upcomingEvents[0].date} 
                    eventTime={upcomingEvents[0].time.replace(' PM', ':00')}
                  />
                </div>

                {/* Main Content: Image + Details */}
                <div className="grid md:grid-cols-[2fr,3fr] gap-6">
                  {/* Thumbnail */}
                  {upcomingEvents[0].thumbnail && (
                    <div className="relative rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-700 aspect-video">
                      <img 
                        src={upcomingEvents[0].thumbnail} 
                        alt={upcomingEvents[0].name[language] || upcomingEvents[0].name.vi}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                    </div>
                  )}

                  {/* Event Details */}
                  <div className="flex flex-col justify-center">
                    <h3 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-4 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                      {upcomingEvents[0].name[language] || upcomingEvents[0].name.vi}
                    </h3>
                    
                    {/* Event Info Grid */}
                    <div className="space-y-3 mb-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                          <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{t('events.date')}</p>
                          <p className="font-semibold text-slate-900 dark:text-white">
                            {new Date(upcomingEvents[0].date).toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                          <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{t('events.time')}</p>
                          <p className="font-semibold text-slate-900 dark:text-white">{upcomingEvents[0].time}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                          <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{t('events.location')}</p>
                          <p className="font-semibold text-slate-900 dark:text-white">{upcomingEvents[0].location}</p>
                        </div>
                      </div>
                    </div>

                    {upcomingEvents[0].content && (
                      <p className="text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-3 mb-4">
                        {upcomingEvents[0].content[language] || upcomingEvents[0].content.vi}
                      </p>
                    )}

                    {/* CTA */}
                    <div className="flex items-center text-brand-600 dark:text-brand-400 font-semibold group-hover:gap-2 transition-all">
                      <span>{t('events.view_details')}</span>
                      <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Events List Section */}
      <section className="py-20 bg-gradient-to-b from-slate-50 to-white dark:from-slate-800 dark:to-slate-900">
        <div className="container-xl">
          <div className="flex justify-center gap-4 mb-12">
            <button
              className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                activeTab === 'upcoming' 
                  ? 'bg-brand-600 text-white shadow-lg hover:bg-brand-700' 
                  : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border-2 border-slate-200 dark:border-slate-600 hover:border-brand-600 dark:hover:border-brand-400'
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
                  : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border-2 border-slate-200 dark:border-slate-600 hover:border-brand-600 dark:hover:border-brand-400'
              }`}
              onClick={() => setActiveTab('all')}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
              {t('events.all')}
            </button>
          </div>

          <div className="space-y-12">
            {Object.entries(groupedEvents).map(([monthYear, monthEvents]) => (
              <div key={monthYear}>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-brand-100 dark:bg-brand-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-brand-600 dark:text-brand-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{monthYear}</h3>
                  <div className="flex-1 h-px bg-gradient-to-r from-slate-300 to-transparent dark:from-slate-600"></div>
                </div>
                <div className="grid gap-6 md:grid-cols-2">
                  {monthEvents.map((event) => (
                    <div 
                      key={event.id} 
                      className="group bg-white dark:bg-slate-800 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden cursor-pointer border border-slate-200 dark:border-slate-700 hover:-translate-y-1"
                      onClick={() => setSelectedEvent(event)}
                    >
                      <div className="grid md:grid-cols-[200px,1fr] gap-0">
                        {/* Thumbnail */}
                        {event.thumbnail ? (
                          <div className="relative aspect-video md:aspect-square overflow-hidden bg-slate-100 dark:bg-slate-700">
                            <img 
                              src={event.thumbnail} 
                              alt={event.name[language] || event.name.vi}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                              loading="lazy"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.parentElement!.style.display = 'none';
                              }}
                            />
                            {/* Status Badge on Image */}
                            <div className="absolute top-3 right-3">
                              {new Date(event.date) >= now ? (
                                <div className="bg-green-500 text-white rounded-lg px-3 py-1.5 text-xs font-bold shadow-lg backdrop-blur-sm">
                                  {t('events.upcoming')}
                                </div>
                              ) : (
                                <div className="bg-slate-500 text-white rounded-lg px-3 py-1.5 text-xs font-bold shadow-lg backdrop-blur-sm">
                                  {t('events.past')}
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="hidden md:block bg-gradient-to-br from-brand-100 to-brand-200 dark:from-brand-900 dark:to-brand-800"></div>
                        )}

                        {/* Content */}
                        <div className="p-5 md:p-6 flex flex-col justify-between">
                          <div>
                            {/* Status Badge (for no thumbnail) */}
                            {!event.thumbnail && (
                              <div className="mb-3">
                                {new Date(event.date) >= now ? (
                                  <span className="inline-block bg-green-100 text-green-700 rounded-lg px-3 py-1 text-xs font-bold dark:bg-green-900 dark:text-green-100">
                                    {t('events.upcoming')}
                                  </span>
                                ) : (
                                  <span className="inline-block bg-slate-100 text-slate-600 rounded-lg px-3 py-1 text-xs font-bold dark:bg-slate-700 dark:text-slate-300">
                                    {t('events.past')}
                                  </span>
                                )}
                              </div>
                            )}

                            {/* Title */}
                            <h4 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white mb-3 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors line-clamp-2">
                              {event.name[language] || event.name.vi}
                            </h4>

                            {/* Event Details */}
                            <div className="space-y-2 mb-3">
                              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <span className="font-medium">
                                  {new Date(event.date).toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US', {
                                    weekday: 'long',
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric'
                                  })}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="font-medium">{event.time}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <span className="font-medium line-clamp-1">{event.location}</span>
                              </div>
                            </div>

                            {/* Content */}
                            {event.content && (
                              <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                                {event.content[language] || event.content.vi}
                              </p>
                            )}
                          </div>

                          {/* View Details CTA */}
                          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
                            <span className="text-sm font-semibold text-brand-600 dark:text-brand-400 group-hover:gap-2 flex items-center transition-all">
                              {t('events.view_details')}
                              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {Object.keys(groupedEvents).length === 0 && (
            <div className="text-center p-muted">
              {activeTab === 'upcoming' 
                ? t('events.no_upcoming')
                : t('events.no_events')}
            </div>
          )}
        </div>
      </section>

      {/* Event Detail Modal */}
      {selectedEvent && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setSelectedEvent(null)}
        >
          <div 
            className="bg-white dark:bg-slate-900 rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-in slide-in-from-bottom duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {selectedEvent.thumbnail && (
              <div className="relative overflow-hidden rounded-t-lg aspect-video bg-slate-100 dark:bg-slate-800">
                <img 
                  src={selectedEvent.thumbnail} 
                  alt={selectedEvent.name[language] || selectedEvent.name.vi}
                  className="w-full h-full object-contain"
                  loading="eager"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.parentElement!.style.display = 'none';
                  }}
                />
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="absolute top-4 right-4 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm text-slate-700 dark:text-slate-200 rounded-full p-2 hover:bg-white dark:hover:bg-slate-800 transition-colors shadow-lg"
                  aria-label="Close"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
            <div className="p-6 md:p-8">
              {!selectedEvent.thumbnail && (
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="absolute top-4 right-4 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-full p-2 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  aria-label="Close"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
              {new Date(selectedEvent.date) >= now && (
                <div className="mb-6">
                  <EventCountdown 
                    eventDate={selectedEvent.date} 
                    eventTime={selectedEvent.time.replace(' PM', ':00')}
                  />
                </div>
              )}
              <div className="mb-4">
                {new Date(selectedEvent.date) >= now ? (
                  <span className="inline-block bg-brand-100 text-brand-700 rounded-full px-3 py-1 text-sm font-medium dark:bg-brand-900 dark:text-brand-100">
                    {t('events.upcoming')}
                  </span>
                ) : (
                  <span className="inline-block bg-slate-100 text-slate-600 rounded-full px-3 py-1 text-sm font-medium dark:bg-slate-700 dark:text-slate-300">
                    {t('events.past')}
                  </span>
                )}
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-brand-600 dark:text-brand-400 mb-6">
                {selectedEvent.name[language] || selectedEvent.name.vi}
              </h2>
              <div className="grid gap-4 mb-6">
                <div className="flex items-start">
                  <span className="text-2xl mr-3">📅</span>
                  <div>
                    <div className="font-medium text-slate-900 dark:text-slate-100">
                      {new Date(selectedEvent.date).toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                  </div>
                </div>
                <div className="flex items-center">
                  <span className="text-2xl mr-3">⏰</span>
                  <span className="font-medium text-slate-900 dark:text-slate-100">{selectedEvent.time}</span>
                </div>
                <div className="flex items-center">
                  <span className="text-2xl mr-3">📍</span>
                  <span className="font-medium text-slate-900 dark:text-slate-100">{selectedEvent.location}</span>
                </div>
              </div>
              {selectedEvent.content && (
                <div className="prose dark:prose-invert max-w-none">
                  <p className="text-slate-600 dark:text-slate-300 text-lg leading-relaxed whitespace-pre-wrap">
                    {selectedEvent.content[language] || selectedEvent.content.vi}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
