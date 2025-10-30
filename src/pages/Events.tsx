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
          description: d.description ? { vi: d.description.vi || '', en: d.description.en || d.description.vi || '' } : undefined,
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
    <div className="bg-white dark:bg-slate-900">
      {/* Hero Section */}
      <section className="bg-brand-50 dark:bg-slate-800 py-16">
        <div className="container-xl">
          <h1 className="h1 text-center">{t('events.title')}</h1>
          <p className="mt-6 p-muted max-w-3xl mx-auto text-center text-lg">
            {t('events.subtitle')}
          </p>
        </div>
      </section>

      {/* Next Event Section */}
      {upcomingEvents.length > 0 && (
        <section className="py-16">
          <div className="container-xl">
            <h2 className="h2 text-center mb-8">{t('events.next_event')}</h2>
            <div className="card max-w-3xl mx-auto">
              {upcomingEvents[0].thumbnail && (
                <img 
                  src={upcomingEvents[0].thumbnail} 
                  alt={upcomingEvents[0].name[language] || upcomingEvents[0].name.vi}
                  className="w-full h-64 object-cover rounded-xl mb-6"
                />
              )}
              <div className="inline-block bg-brand-100 text-brand-700 rounded-full px-4 py-1 text-sm font-medium dark:bg-brand-900 dark:text-brand-100">
                {t('events.latest_event')}
              </div>
              <h3 className="text-2xl font-bold text-brand-600 dark:text-brand-400 mt-4">
                {upcomingEvents[0].name[language] || upcomingEvents[0].name.vi}
              </h3>
              <div className="flex flex-col md:flex-row items-center gap-4 mt-4">
                <div className="flex items-center">
                  <span className="text-xl mr-2">📅</span>
                  <span>{new Date(upcomingEvents[0].date).toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}</span>
                </div>
                <div className="hidden md:block text-slate-400">·</div>
                <div className="flex items-center">
                  <span className="text-xl mr-2">⏰</span>
                  <span>{upcomingEvents[0].time}</span>
                </div>
                <div className="hidden md:block text-slate-400">·</div>
                <div className="flex items-center">
                  <span className="text-xl mr-2">📍</span>
                  <span>{upcomingEvents[0].location}</span>
                </div>
              </div>
              {upcomingEvents[0].description && (
                <p className="mt-4 p-muted text-lg line-clamp-3">{upcomingEvents[0].description[language] || upcomingEvents[0].description.vi}</p>
              )}
              <EventCountdown 
                eventDate={upcomingEvents[0].date} 
                eventTime={upcomingEvents[0].time.replace(' PM', ':00')}
              />
            </div>
          </div>
        </section>
      )}

      {/* Events List Section */}
      <section className="py-16 bg-brand-50 dark:bg-slate-800">
        <div className="container-xl">
          <div className="flex justify-center gap-4 mb-8">
            <button
              className={`btn ${activeTab === 'upcoming' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setActiveTab('upcoming')}
            >
              {t('events.upcoming')}
            </button>
            <button
              className={`btn ${activeTab === 'all' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setActiveTab('all')}
            >
              {t('events.all')}
            </button>
          </div>

          <div className="space-y-12">
            {Object.entries(groupedEvents).map(([monthYear, monthEvents]) => (
              <div key={monthYear}>
                <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                  <span className="text-2xl">📅</span> {monthYear}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {monthEvents.map((event) => (
                    <div 
                      key={event.id} 
                      className="card hover:shadow-lg transition-all cursor-pointer group"
                      onClick={() => setSelectedEvent(event)}
                    >
                      {event.thumbnail && (
                        <div className="relative overflow-hidden rounded-t-lg -m-6 mb-4">
                          <img 
                            src={event.thumbnail} 
                            alt={event.name[language] || event.name.vi}
                            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute top-3 right-3">
                            {new Date(event.date) >= now ? (
                              <div className="bg-brand-600 text-white rounded-full px-3 py-1 text-xs font-medium shadow-lg">
                                {t('events.upcoming')}
                              </div>
                            ) : (
                              <div className="bg-slate-600 text-white rounded-full px-3 py-1 text-xs font-medium shadow-lg">
                                {t('events.past')}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      {!event.thumbnail && (
                        <div className="absolute top-3 right-3">
                          {new Date(event.date) >= now ? (
                            <div className="bg-brand-100 text-brand-700 rounded-full px-3 py-1 text-xs font-medium dark:bg-brand-900 dark:text-brand-100">
                              {t('events.upcoming')}
                            </div>
                          ) : (
                            <div className="bg-slate-100 text-slate-600 rounded-full px-3 py-1 text-xs font-medium dark:bg-slate-700 dark:text-slate-300">
                              {t('events.past')}
                            </div>
                          )}
                        </div>
                      )}
                      <h4 className="text-lg font-semibold text-brand-600 dark:text-brand-400 mb-3 group-hover:text-brand-700 dark:group-hover:text-brand-300 transition-colors">
                        {event.name[language] || event.name.vi}
                      </h4>
                      <div className="space-y-2 text-sm mb-3">
                        <div className="flex items-center text-slate-600 dark:text-slate-300">
                          <span className="mr-2">�</span>
                          <span>{new Date(event.date).toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US', {
                            weekday: 'long',
                            day: 'numeric',
                            month: 'long'
                          })}</span>
                        </div>
                        <div className="flex items-center text-slate-600 dark:text-slate-300">
                          <span className="mr-2">⏰</span>
                          <span>{event.time}</span>
                        </div>
                        <div className="flex items-center text-slate-600 dark:text-slate-300">
                          <span className="mr-2">📍</span>
                          <span>{event.location}</span>
                        </div>
                      </div>
                      {event.description && (
                        <p className="p-muted text-sm line-clamp-3">
                          {event.description[language] || event.description.vi}
                        </p>
                      )}
                      <div className="mt-4 text-brand-600 dark:text-brand-400 text-sm font-medium flex items-center group-hover:translate-x-1 transition-transform">
                        {t('events.view_details') || 'View Details'} →
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
              <div className="relative h-64 md:h-80 overflow-hidden rounded-t-lg">
                <img 
                  src={selectedEvent.thumbnail} 
                  alt={selectedEvent.name[language] || selectedEvent.name.vi}
                  className="w-full h-full object-cover"
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
              {selectedEvent.description && (
                <div className="prose dark:prose-invert max-w-none">
                  <p className="text-slate-600 dark:text-slate-300 text-lg leading-relaxed whitespace-pre-wrap">
                    {selectedEvent.description[language] || selectedEvent.description.vi}
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
