import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import SEO from '../components/SEO';
import type { Event } from '../types/content';
import { subscribeJson } from '../lib/storage';
import EventCountdown from '../components/EventCountdown';
import { useLanguage } from '../contexts/LanguageContext';
import { hasEventPassed, parseEventDate } from '../lib/timezone';
import { sanitizeRichHtml } from '../lib/sanitizeHtml';
import { getGoogleDriveEmbedUrl, getYouTubeEmbedUrl, validateOptionalExternalUrl } from '../lib/validation';

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
      <div className="bg-white min-h-screen">
        <div className="border-b border-slate-100 py-16 md:py-24">
          <div className="container-xl">
            <div className="animate-pulse">
              <div className="h-8 w-32 bg-slate-100 rounded-full mb-6"></div>
              <div className="h-12 w-3/4 bg-slate-100 rounded-lg mb-6"></div>
              <div className="flex gap-6">
                <div className="h-14 w-40 bg-slate-100 rounded-xl"></div>
                <div className="h-14 w-32 bg-slate-100 rounded-xl"></div>
                <div className="h-14 w-48 bg-slate-100 rounded-xl"></div>
              </div>
            </div>
          </div>
        </div>
        <div className="container-xl py-16">
          <div className="max-w-4xl mx-auto animate-pulse">
            <div className="h-64 bg-slate-200 rounded-2xl mb-12"></div>
            <div className="bg-white rounded-2xl p-8 mb-12">
              <div className="h-8 w-48 bg-slate-200 rounded mb-6"></div>
              <div className="space-y-4">
                <div className="h-4 bg-slate-200 rounded w-full"></div>
                <div className="h-4 bg-slate-200 rounded w-5/6"></div>
                <div className="h-4 bg-slate-200 rounded w-4/6"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (notFound || !event) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center px-4">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold text-slate-900 mb-2">{t('events.not_found')}</h1>
          <p className="text-slate-500 mb-8 max-w-md">{t('events.not_found_desc')}</p>
          <Link to="/events" className="btn btn-primary">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            {t('events.back_to_events')}
          </Link>
        </div>
      </div>
    );
  }

  const isPast = hasEventPassed(event.date, event.time || '11:59 PM');
  const eventName = event.name[language] || event.name.vi;
  const eventContent = sanitizeRichHtml(event.content?.[language] || event.content?.vi || '');
  const facebookLink = validateOptionalExternalUrl(event.facebookLink || '', 'facebook').normalized;
  const youtubeLink = validateOptionalExternalUrl(event.youtubeLink || '', 'youtube').normalized;
  const driveLink = validateOptionalExternalUrl(event.driveLink || '', 'drive').normalized;
  const youtubeEmbedUrl = getYouTubeEmbedUrl(youtubeLink);
  const driveEmbedUrl = getGoogleDriveEmbedUrl(driveLink);
  const formattedDate = parseEventDate(event.date).toLocaleDateString(
    language === 'vi' ? 'vi-VN' : 'en-US',
    { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
  );

  return (
    <div className="bg-white min-h-screen">
      <SEO
        title={eventName}
        description={eventName + ' - ' + formattedDate}
      />

      {/* Hero Section */}
      <section className="border-b border-slate-100">
        <div className="container-xl py-16 md:py-20">
          {/* Back Button */}
          <Link
            to="/events"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors mb-8 group"
          >
            <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            {t('events.back_to_events')}
          </Link>

          <div className="max-w-4xl">
            {/* Status Badge */}
            <div className="mb-5">
              {!isPast ? (
                <span className="eyebrow">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  {t('events.upcoming')}
                </span>
              ) : (
                <span className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                  {t('events.past')}
                </span>
              )}
            </div>

            {/* Event Title */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-slate-900 mb-8 leading-tight tracking-tight">
              {eventName}
            </h1>

            {/* Event Meta */}
            <div className="flex flex-wrap gap-x-10 gap-y-4 text-sm">
              <div>
                <p className="text-slate-400 font-medium mb-0.5">{t('events.date')}</p>
                <p className="font-semibold text-slate-900">{formattedDate}</p>
              </div>
              <div>
                <p className="text-slate-400 font-medium mb-0.5">{t('events.time')}</p>
                <p className="font-semibold text-slate-900">{event.time}</p>
              </div>
              <div>
                <p className="text-slate-400 font-medium mb-0.5">{t('events.location')}</p>
                <p className="font-semibold text-slate-900">{event.location}</p>
              </div>
            </div>

            {/* Social Links in Hero */}
            {(facebookLink || youtubeLink || driveLink) && (
              <div className="flex flex-wrap gap-3 mt-8">
                {facebookLink && (
                  <a
                    href={facebookLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-white bg-[#1877F2] hover:opacity-90 rounded-full px-4 py-2 text-sm font-medium transition-opacity"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    Facebook
                  </a>
                )}
                {youtubeLink && (
                  <a
                    href={youtubeLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-white bg-[#FF0000] hover:opacity-90 rounded-full px-4 py-2 text-sm font-medium transition-opacity"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                    </svg>
                    YouTube
                  </a>
                )}
                {driveLink && (
                  <a
                    href={driveLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-white bg-[#1FA463] hover:opacity-90 rounded-full px-4 py-2 text-sm font-medium transition-opacity"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8.333 3.667h7.334l5.5 9.166-3.667 6.334H6.5L2.833 12.833l5.5-9.166zm0 0l-3.666 6.333 5.5 9.167h7.333M12 8.667L8.667 14.5h6.666L12 8.667z" />
                    </svg>
                    Drive
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-12 md:py-16">
        <div className="container-xl">
          <div className="max-w-4xl mx-auto">
            {/* Countdown Timer for Upcoming Events */}
            {!isPast && (
              <div className="mb-10">
                <EventCountdown eventDate={event.date} eventTime={event.time} />
              </div>
            )}

            {/* Event Thumbnail */}
            {event.thumbnail && (
              <div className="mb-10 rounded-2xl overflow-hidden border border-slate-100 bg-white">
                <img
                  src={event.thumbnail}
                  alt={eventName}
                  className="w-full h-auto"
                  loading="lazy"
                />
              </div>
            )}

            {/* Event Description */}
            {eventContent && (
              <div className="card !p-6 md:!p-10 mb-8">
                <h2 className="text-xl font-semibold text-slate-900 mb-6">
                  {t('events.details')}
                </h2>
                <div
                  className="prose prose-lg max-w-none prose-p:text-slate-600 prose-headings:text-slate-900 prose-a:text-brand-600 prose-strong:text-slate-900"
                  dangerouslySetInnerHTML={{ __html: eventContent }}
                />
              </div>
            )}

            {/* YouTube Video Embed */}
            {youtubeEmbedUrl && (
              <div className="card !p-6 md:!p-10 mb-8">
                <h2 className="text-xl font-semibold text-slate-900 mb-6">
                  {t('events.video')}
                </h2>
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

            {/* Google Drive Video Embed */}
            {driveEmbedUrl && (
              <div className="card !p-6 md:!p-10 mb-8">
                <h2 className="text-xl font-semibold text-slate-900 mb-6">
                  {t('events.video')}
                </h2>
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

            {/* Back to Events Button */}
            <div className="text-center pt-4">
              <Link to="/events" className="btn btn-primary">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                {t('events.back_to_events')}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
