import { Link } from 'react-router-dom';
import { EVENTS } from '../data/events';
import { useEffect, useState } from 'react';
import EventCountdown from '../components/EventCountdown';
import { useLanguage } from '../contexts/LanguageContext';

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

function getReflections(): Reflection[] {
  const data = localStorage.getItem("reflections");
  return data ? JSON.parse(data) : [];
}

export default function Home() {
  const { t, language } = useLanguage();
  // Helpers to parse/compare dates
  const parseEventStart = (dateISO: string, timeStr: string) => {
    // timeStr like '5:00 PM' or '10:30 AM'
    const match = timeStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    let hours = 0, minutes = 0;
    if (match) {
      hours = parseInt(match[1], 10);
      minutes = parseInt(match[2], 10);
      const meridiem = match[3].toUpperCase();
      if (meridiem === 'PM' && hours !== 12) hours += 12;
      if (meridiem === 'AM' && hours === 12) hours = 0;
    }
    const d = new Date(dateISO);
    d.setHours(hours, minutes, 0, 0);
    return d;
  };

  const endOfEventDay = (dateISO: string) => {
    const d = new Date(dateISO);
    d.setHours(23, 59, 59, 999);
    return d;
  };

  // Sort events by date ascending to be safe
  const sortedEvents = [...EVENTS].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const now = new Date();

  // Find index of the current event: first event whose day hasn't ended yet
  const currentIndex = sortedEvents.findIndex(ev => now.getTime() <= endOfEventDay(ev.date).getTime());
  const startIndex = currentIndex === -1 ? sortedEvents.length : currentIndex;
  const upcomingEvents = sortedEvents.slice(startIndex, startIndex + 3);
  const [latestReflections, setLatestReflections] = useState<Reflection[]>([]);

  useEffect(() => {
    const reflections = getReflections();
    setLatestReflections(reflections.slice(0, 2));
  }, []);

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-b from-brand-50 to-white py-16 dark:from-slate-900 dark:to-slate-950">
        <div className="container-xl grid items-center gap-10 md:grid-cols-2">
          <div>
            <h1 className="h1">{t('home.title')}</h1>
            <p className="mt-3 p-muted max-w-prose">
              {t('home.subtitle')}<br />
              {t('home.description')}<br />
              {t('home.mass_time')}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/about" className="btn btn-primary">{t('home.learn_more')}</Link>
              <Link to="/contact" className="btn btn-outline">{t('home.contact_us')}</Link>
            </div>
          </div>
          <div className="card">
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3151.9741339657257!2d145.19334571531906!3d-37.83350797974801!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6ad63bfb7b1e1b75%3A0x27d1a68aa5308e0!2s17%20Stevens%20Rd%2C%20Vermont%20VIC%203133!5e0!3m2!1sen!2sau!4v1629185943012!5m2!1sen!2sau"
              className="w-full h-64 rounded-xl"
              style={{ border: 0 }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>
      </section>

      {/* Welcome Message */}
      <section className="py-16 bg-white dark:bg-slate-900">
        <div className="container-xl">
          <h2 className="h2 text-center mb-8">{t('home.welcome_title')}</h2>
          <div className="grid gap-8 md:grid-cols-3">
            <div className="card text-center">
              <div className="text-4xl mb-4">🙏</div>
              <h3 className="font-semibold mb-2">{t('home.faith_title')}</h3>
              <p className="p-muted">{t('home.faith_desc')}</p>
            </div>
            <div className="card text-center">
              <div className="text-4xl mb-4">❤️</div>
              <h3 className="font-semibold mb-2">{t('home.community_title')}</h3>
              <p className="p-muted">{t('home.community_desc')}</p>
            </div>
            <div className="card text-center">
              <div className="text-4xl mb-4">✨</div>
              <h3 className="font-semibold mb-2">{t('home.service_title')}</h3>
              <p className="p-muted">{t('home.service_desc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Mass Times & Location */}
      <section className="py-16 bg-brand-50 dark:bg-slate-800">
        <div className="container-xl">
          <h2 className="h2 text-center mb-8">{t('home.mass_schedule_title')}</h2>
          <div className="grid gap-8 md:grid-cols-2">
            <div className="card">
              <h3 className="font-semibold mb-4">{t('home.mass_schedule_subtitle')}</h3>
              <ul className="space-y-3 p-muted">
                <li>
                  <strong>{t('home.sunday')}</strong> {t('home.sunday_time')}
                </li>
                <li>
                  <strong>{t('home.special_days')}</strong> {t('home.special_days_desc')}
                </li>
                <li>
                  <strong>{t('home.confession')}</strong> {t('home.confession_time')}
                </li>
              </ul>
            </div>
            <div className="card">
              <h3 className="font-semibold mb-4">{t('home.info_title')}</h3>
              <ul className="space-y-3 p-muted">
                <li>
                  <strong>{t('home.address_label')}</strong><br />
                  {t('home.address_value')}
                </li>
                <li>
                  <strong>{t('home.parking_label')}</strong><br />
                  {t('home.parking_desc')}
                </li>
                <li>
                  <strong>{t('home.contact_label')}</strong><br />
                  <a href="tel:0422-400-116" className="text-brand-600 hover:underline">0422-400-116</a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Upcoming Events */}
      <section className="py-16 bg-white dark:bg-slate-900">
        <div className="container-xl">
          <h2 className="h2 text-center mb-8">{t('home.upcoming_events')}</h2>
          {upcomingEvents.length > 0 && (
            <div className="mb-8">
              <div className="card text-center">
                <div className="inline-block bg-brand-100 text-brand-700 rounded-full px-4 py-1 text-sm font-medium dark:bg-brand-900 dark:text-brand-100 mb-3">
                  {t('home.important_event')}
                </div>
                <h3 className="text-2xl font-bold text-brand-600 dark:text-brand-400 mb-2">
                  {upcomingEvents[0].name[language] || upcomingEvents[0].name.vi}
                </h3>
                <div className="flex flex-col md:flex-row items-center justify-center gap-2 text-lg mb-4">
                  <div className="flex items-center">
                    <span className="mr-2">📅</span>
                    <span>{new Date(upcomingEvents[0].date).toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}</span>
                  </div>
                  <div className="hidden md:block text-slate-400">·</div>
                  <div className="flex items-center">
                    <span className="mr-2">⏰</span>
                    <span>{upcomingEvents[0].time}</span>
                  </div>
                  <div className="hidden md:block text-slate-400">·</div>
                  <div className="flex items-center">
                    <span className="mr-2">📍</span>
                    <span>{upcomingEvents[0].location}</span>
                  </div>
                </div>
                {upcomingEvents[0].description && (
                  <p className="p-muted mb-4 text-lg">{upcomingEvents[0].description[language] || upcomingEvents[0].description.vi}</p>
                )}
                <EventCountdown 
                  eventDate={upcomingEvents[0].date} 
                  eventTime={`${String(parseEventStart(upcomingEvents[0].date, upcomingEvents[0].time).getHours()).padStart(2, '0')}:${String(parseEventStart(upcomingEvents[0].date, upcomingEvents[0].time).getMinutes()).padStart(2, '0')}`}
                />
              </div>
            </div>
          )}
          {upcomingEvents.length > 1 && (
            <>
              <div className="mt-12 mb-6">
                <h3 className="text-xl font-semibold text-center">{t('home.other_events')}</h3>
              </div>
              <div className="grid gap-6">
                {upcomingEvents.slice(1).map(event => (
                  <div key={event.id} className="card hover:shadow-md transition-shadow">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div>
                        <h3 className="font-semibold">{event.name[language] || event.name.vi}</h3>
                        <div className="flex flex-col md:flex-row gap-2 md:items-center mt-2">
                          <div className="flex items-center">
                            <span className="mr-2 text-brand-600">📅</span>
                            <span className="p-muted">{new Date(event.date).toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US', { 
                              weekday: 'long', 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })}</span>
                          </div>
                          <div className="hidden md:block text-slate-400">·</div>
                          <div className="flex items-center">
                            <span className="mr-2 text-brand-600">⏰</span>
                            <span className="p-muted">{event.time}</span>
                          </div>
                        </div>
                        {event.description && (
                          <p className="p-muted mt-2">{event.description[language] || event.description.vi}</p>
                        )}
                      </div>
                      <Link to="/events" className="btn btn-outline whitespace-nowrap">
                        {t('home.details')}
                      </Link>
                    </div>
                  </div>
                ))}
                <div className="text-center mt-4">
                  <Link to="/events" className="btn btn-primary">
                    {t('home.view_all_events')}
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Ministries */}
      <section className="py-16 bg-brand-50 dark:bg-slate-800">
        <div className="container-xl">
          <h2 className="h2 text-center mb-8">{t('home.ministries_title')}</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="card text-center">
              <div className="text-4xl mb-4">👶</div>
              <h3 className="font-semibold mb-2">{t('home.children_ministry')}</h3>
              <p className="p-muted">{t('home.children_desc')}</p>
            </div>
            <div className="card text-center">
              <div className="text-4xl mb-4">🙋</div>
              <h3 className="font-semibold mb-2">{t('home.youth_ministry')}</h3>
              <p className="p-muted">{t('home.youth_desc')}</p>
            </div>
            <div className="card text-center">
              <div className="text-4xl mb-4">👨‍👩‍👦</div>
              <h3 className="font-semibold mb-2">{t('home.family_ministry')}</h3>
              <p className="p-muted">{t('home.family_desc')}</p>
            </div>
            <div className="card text-center">
              <div className="text-4xl mb-4">🎵</div>
              <h3 className="font-semibold mb-2">{t('home.choir_ministry')}</h3>
              <p className="p-muted">{t('home.choir_desc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Latest Content */}
      <section className="py-16 bg-white dark:bg-slate-900">
        <div className="container-xl">
          <h2 className="h2 text-center mb-8">{t('home.latest_content')}</h2>
          <div className="grid gap-8 md:grid-cols-2">
            <div className="space-y-6">
              <h3 className="font-semibold">{t('home.gospel')}</h3>
              {latestReflections.map((reflection, index) => (
                <div key={index} className="card">
                  <h4 className="font-semibold">{reflection.title[language] || reflection.title.vi}</h4>
                  <p className="p-muted line-clamp-3">{reflection.content[language] || reflection.content.vi}</p>
                  <div className="mt-3">
                    <Link to={`/reflections/${index}`} className="btn btn-outline">
                      {t('home.read_more')}
                    </Link>
                  </div>
                </div>
              ))}
              <div className="text-center">
                <Link to="/reflections" className="btn btn-primary">
                  {t('home.view_all_gospel')}
                </Link>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-6">{t('home.connect')}</h3>
              <div className="card">
                <h4 className="font-semibold mb-4">{t('home.follow_us')}</h4>
                <div className="space-y-4">
                  <a 
                    href="https://www.facebook.com/sttimvn" 
                    className="flex items-center gap-3 p-muted hover:text-brand-600"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <span className="text-2xl">📱</span>
                    {t('home.facebook')}
                  </a>
                  <a 
                    href="mailto:sttimvn2013@gmail.com"
                    className="flex items-center gap-3 p-muted hover:text-brand-600"
                  >
                    <span className="text-2xl">📧</span>
                    {t('home.email')}
                  </a>
                  <Link 
                    to="/contact"
                    className="flex items-center gap-3 p-muted hover:text-brand-600"
                  >
                    <span className="text-2xl">📞</span>
                    {t('home.contact_direct')}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-brand-50 dark:bg-slate-800">
        <div className="container-xl text-center">
          <h2 className="h2 mb-4">{t('home.join_us_title')}</h2>
          <p className="p-muted max-w-2xl mx-auto mb-8">
            {t('home.join_us_desc')}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/contact" className="btn btn-primary">
              {t('home.contact_now')}
            </Link>
            <Link to="/about" className="btn btn-outline">
              {t('home.learn_more_about')}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
