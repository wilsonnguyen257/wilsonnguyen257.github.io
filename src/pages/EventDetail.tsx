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
      <div className="bg-slate-50 min-h-screen">
        <div className="bg-gradient-to-br from-brand-600 to-brand-800 py-16 md:py-24">
          <div className="container-xl">
            <div className="animate-pulse">
              <div className="h-10 w-40 bg-white/20 rounded-lg mb-8"></div>
              <div className="h-8 w-32 bg-white/20 rounded-full mb-6"></div>
              <div className="h-12 w-3/4 bg-white/20 rounded-lg mb-6"></div>
              <div className="flex gap-6">
                <div className="h-16 w-40 bg-white/20 rounded-xl"></div>
                <div className="h-16 w-32 bg-white/20 rounded-xl"></div>
                <div className="h-16 w-48 bg-white/20 rounded-xl"></div>
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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center px-4">
          <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-12 h-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">{t('events.not_found')}</h1>
          <p className="text-slate-600 mb-8 max-w-md">{t('events.not_found_desc')}</p>
          <Link 
            to="/events" 
            className="inline-flex items-center gap-2 bg-brand-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-brand-700 transition-colors shadow-lg hover:shadow-xl"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
  const formattedDate = new Date(event.date).toLocaleDateString(
    language === 'vi' ? 'vi-VN' : 'en-US',
    { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
  );

  return (
    <div className="bg-slate-50 min-h-screen">
      <SEO 
        title={eventName} 
        description={eventName + ' - ' + formattedDate}
      />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-brand-600 to-brand-800 text-white overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30"></div>
        
        {/* Thumbnail Background */}
        {event.thumbnail && (
          <div className="absolute inset-0">
            <img 
              src={event.thumbnail} 
              alt=""
              className="w-full h-full object-cover opacity-20"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-brand-900/90 via-brand-800/70 to-brand-700/50"></div>
          </div>
        )}

        <div className="container-xl relative z-10 py-16 md:py-24">
          {/* Back Button */}
          <Link 
            to="/events" 
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm hover:bg-white/20 rounded-lg font-semibold transition-all mb-8 group"
          >
            <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            {t('events.back_to_events')}
          </Link>

          <div className="max-w-4xl">
            {/* Status Badge */}
            <div className="mb-6">
              {!isPast ? (
                <span className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white rounded-full px-4 py-2 text-sm font-medium border border-white/30">
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                  {t('events.upcoming')}
                </span>
              ) : (
                <span className="inline-flex items-center gap-2 bg-slate-900/50 backdrop-blur-sm text-white/80 rounded-full px-4 py-2 text-sm font-medium">
                  <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                  {t('events.past')}
                </span>
              )}
            </div>

            {/* Event Title */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-8 leading-tight">
              {eventName}
            </h1>

            {/* Event Meta with Icons */}
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-white/60 text-xs uppercase tracking-wider">{t('events.date')}</p>
                  <p className="font-semibold">{formattedDate}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-white/60 text-xs uppercase tracking-wider">{t('events.time')}</p>
                  <p className="font-semibold">{event.time}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-white/60 text-xs uppercase tracking-wider">{t('events.location')}</p>
                  <p className="font-semibold">{event.location}</p>
                </div>
              </div>
            </div>

            {/* Social Links in Hero */}
            {(event.facebookLink || event.youtubeLink || event.driveLink) && (
              <div className="flex flex-wrap gap-3 mt-6">
                {event.facebookLink && (
                  <a 
                    href={event.facebookLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-[#1877F2]/80 hover:bg-[#1877F2] backdrop-blur-sm rounded-lg px-4 py-2 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    Facebook
                  </a>
                )}
                {event.youtubeLink && (
                  <a 
                    href={event.youtubeLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-[#FF0000]/80 hover:bg-[#FF0000] backdrop-blur-sm rounded-lg px-4 py-2 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                    </svg>
                    YouTube
                  </a>
                )}
                {event.driveLink && (
                  <a 
                    href={event.driveLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-[#1FA463]/80 hover:bg-[#1FA463] backdrop-blur-sm rounded-lg px-4 py-2 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
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
              <div className="mb-10 rounded-2xl overflow-hidden shadow-xl bg-white">
                <img 
                  src={event.thumbnail} 
                  alt={eventName}
                  className="w-full h-auto"
                  loading="lazy"
                />
              </div>
            )}

            {/* Event Description */}
            {event.content && (
              <div className="bg-white rounded-2xl shadow-lg p-6 md:p-10 mb-10">
                <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                  <div className="w-10 h-10 bg-brand-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  {t('events.details')}
                </h2>
                <div 
                  className="prose prose-lg max-w-none prose-p:text-slate-600 prose-headings:text-slate-900 prose-a:text-brand-600 prose-strong:text-slate-900"
                  dangerouslySetInnerHTML={{ __html: event.content[language] || event.content.vi }}
                />
              </div>
            )}

            {/* YouTube Video Embed */}
            {event.youtubeLink && (
              <div className="bg-white rounded-2xl shadow-lg p-6 md:p-10 mb-10">
                <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                    </svg>
                  </div>
                  {t('events.video')}
                </h2>
                <div className="relative pt-[56.25%] rounded-xl overflow-hidden shadow-lg bg-black">
                  <iframe
                    className="absolute inset-0 w-full h-full"
                    src={
                      event.youtubeLink.includes('embed') 
                        ? event.youtubeLink 
                        : 'https://www.youtube.com/embed/' + (
                            event.youtubeLink.includes('v=') 
                              ? event.youtubeLink.split('v=')[1]?.split('&')[0] 
                              : event.youtubeLink.split('/').pop()
                          )
                    }
                    title="YouTube video player"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              </div>
            )}

            {/* Google Drive Video Embed */}
            {event.driveLink && event.driveLink.includes('drive.google.com') && (
              <div className="bg-white rounded-2xl shadow-lg p-6 md:p-10 mb-10">
                <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8.333 3.667h7.334l5.5 9.166-3.667 6.334H6.5L2.833 12.833l5.5-9.166zm0 0l-3.666 6.333 5.5 9.167h7.333M12 8.667L8.667 14.5h6.666L12 8.667z" />
                    </svg>
                  </div>
                  {t('events.video')}
                </h2>
                <div className="relative pt-[56.25%] rounded-xl overflow-hidden shadow-lg bg-black">
                  <iframe 
                    src={event.driveLink.replace('/view', '/preview').replace('/usp=sharing', '')} 
                    className="absolute inset-0 w-full h-full"
                    allow="autoplay"
                    title="Google Drive Video"
                  ></iframe>
                </div>
              </div>
            )}

            {/* Back to Events Button */}
            <div className="text-center pt-4">
              <Link 
                to="/events" 
                className="inline-flex items-center gap-2 bg-brand-600 text-white px-8 py-4 rounded-xl font-medium hover:bg-brand-700 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 group"
              >
                <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
