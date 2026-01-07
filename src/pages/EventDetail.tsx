import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import SEO from '../components/SEO';
import type { Event } from '../types/content';
import { subscribeJson } from '../lib/storage';
import EventCountdown from '../components/EventCountdown';
import { useLanguage } from '../contexts/LanguageContext';
import { hasEventPassed } from '../lib/timezone';

export default function EventDetail() {
  const { id } = useParams<{ id: string }>();
  const { t, language } = useLanguage();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const unsub = subscribeJson<Event[]>(
      'events',
      (eventsData) => {
        const foundEvent = (eventsData || []).find((e) => e.id === id);
        if (foundEvent) {
          setEvent({
            id: foundEvent.id,
            name: { vi: foundEvent.name?.vi || '', en: foundEvent.name?.en || '' },
            date: foundEvent.date,
            time: foundEvent.time,
            location: foundEvent.location,
            content: foundEvent.content,
            thumbnail: foundEvent.thumbnail,
            thumbnailPath: foundEvent.thumbnailPath,
            facebookLink: foundEvent.facebookLink,
            youtubeLink: foundEvent.youtubeLink,
            driveLink: foundEvent.driveLink,
            status: foundEvent.status || 'published',
          });
          setNotFound(false);
        } else {
          setNotFound(true);
        }
        setLoading(false);
      },
      () => {
        setNotFound(true);
        setLoading(false);
      }
    );
    return () => unsub();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-pulse text-center">
          <div className="w-16 h-16 bg-slate-200 rounded-full mx-auto mb-4"></div>
          <div className="h-6 w-48 bg-slate-200 rounded-md mx-auto mb-2"></div>
          <div className="h-4 w-64 bg-slate-200 rounded-md mx-auto"></div>
        </div>
      </div>
    );
  }

  if (notFound || !event) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4"></div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">{t('events.not_found')}</h1>
          <p className="text-slate-600 mb-6">{t('events.not_found_desc')}</p>
          <Link to="/events" className="inline-flex items-center gap-2 bg-brand-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-brand-700 transition-colors">
            {t('events.back_to_events')}
          </Link>
        </div>
      </div>
    );
  }

  const isPast = hasEventPassed(event.date, event.time || '11:59 PM');

  return (
    <div className="bg-slate-50 min-h-screen">
      <SEO title={event.name[language] || event.name.vi} description={event.name[language] || event.name.vi} />
      <section className="relative bg-gradient-to-br from-brand-600 to-brand-800 text-white overflow-hidden">
        <div className="container-xl relative z-10 py-16 md:py-24">
          <Link to="/events" className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-8 transition-colors">
            {t('events.back_to_events')}
          </Link>
          <div className="max-w-4xl">
            <div className="mb-6">
              {!isPast ? (
                <span className="inline-flex items-center gap-2 bg-white/20 text-white rounded-full px-4 py-2 text-sm font-medium">
                  {t('events.upcoming')}
                </span>
              ) : (
                <span className="inline-flex items-center gap-2 bg-slate-900/50 text-white/80 rounded-full px-4 py-2 text-sm font-medium">
                  {t('events.past')}
                </span>
              )}
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">{event.name[language] || event.name.vi}</h1>
            <div className="flex flex-wrap gap-6 text-lg">
              <div><p className="text-white/70 text-sm">{t('events.date')}</p><p className="font-semibold">{new Date(event.date).toLocaleDateString()}</p></div>
              <div><p className="text-white/70 text-sm">{t('events.time')}</p><p className="font-semibold">{event.time}</p></div>
              <div><p className="text-white/70 text-sm">{t('events.location')}</p><p className="font-semibold">{event.location}</p></div>
            </div>
          </div>
        </div>
      </section>
      <section className="py-16 md:py-20">
        <div className="container-xl">
          <div className="max-w-4xl mx-auto">
            {!isPast && <div className="mb-12"><EventCountdown eventDate={event.date} eventTime={event.time} /></div>}
            {event.thumbnail && <div className="mb-12 rounded-2xl overflow-hidden shadow-xl"><img src={event.thumbnail} alt={event.name[language] || event.name.vi} className="w-full h-auto" /></div>}
            {event.content && (
              <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 mb-12">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">{t('events.details')}</h2>
                <div className="prose prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: event.content[language] || event.content.vi }} />
              </div>
            )}
            <div className="text-center">
              <Link to="/events" className="inline-flex items-center gap-2 bg-brand-600 text-white px-8 py-4 rounded-xl font-medium hover:bg-brand-700 transition-colors shadow-lg">
                {t('events.back_to_events')}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
