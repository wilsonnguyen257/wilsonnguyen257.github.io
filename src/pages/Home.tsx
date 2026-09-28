import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import type { Event } from '../types/content';
import { useEffect, useMemo, useState, memo } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { subscribeJson } from '../lib/storage';
import { getMelbourneNow, hasEventPassed, parseEventDate } from '../lib/timezone';
import { db } from '../lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { CHURCH_INFO } from '../lib/constants';
import { nextMassSunday, SEASON_NAME } from '../lib/liturgical';

// The bundled hero photo: drop `hero.jpg` (or .jpeg/.webp/.png) into
// src/assets and it's picked up at build time. An admin-set photo
// (site-settings/homepage) overrides it; with neither, the hero is text-only.
const bundledHero = Object.values(
  import.meta.glob<string>('../assets/hero.{jpg,jpeg,webp,png}', { eager: true, import: 'default' })
)[0] ?? '';

type Reflection = {
  id?: string;
  title: { vi: string; en: string };
  content: { vi: string; en: string };
  // True when there is no real English version — the English fields are
  // empty, a copy of the Vietnamese, or Vietnamese text pasted in.
  enMissing: boolean;
  date?: string;
  author?: string;
};

// Helper function to strip HTML tags for preview text
const stripHtml = (html: string): string => {
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
};

// Letters that only occur in Vietnamese (not in French/Spanish loanwords).
const VIETNAMESE_ONLY = /[ăđơưạảấầẩẫậắằẳẵặẹẻẽếềểễệỉịọỏốồổỗộớờởỡợụủứừửữựỳỵỷỹ]/i;
const isRealEnglish = (en: string | undefined, vi: string | undefined) =>
  !!en?.trim() && en.trim() !== vi?.trim() && !VIETNAMESE_ONLY.test(stripHtml(en));

// Posts often open with the Sunday's readings ("Is 55,6-9; Pl 1,20c-24,27a;
// Mt 20,1-16a"). Split them off so the teaser starts with prose and the
// readings get their own line.
const READINGS = /^((?:\d\s?)?[A-ZĐ][\p{L}]{0,3}\.?\s\d+[,:][\d\w,.:\-–]+;?\s*)+/u;

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const DAY = 86_400_000;
const toIsoDate = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const icsStamp = (d: Date, hour: number) => `${toIsoDate(d).replace(/-/g, '')}T${String(hour).padStart(2, '0')}0000`;

const Home: React.FC = () => {
  const { t, language } = useLanguage();
  const locale = language === 'vi' ? 'vi-VN' : 'en-AU';

  const [events, setEvents] = useState<Event[]>([]);
  const [eventsState, setEventsState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [reflection, setReflection] = useState<Reflection | null>(null);
  const [reflectionState, setReflectionState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [attempt, setAttempt] = useState(0);

  const [adminPhoto, setAdminPhoto] = useState<string>(() => localStorage.getItem('heroBackgroundImageUrl') || '');
  const heroPhoto = adminPhoto || bundledHero;

  useEffect(() => {
    if (!db) return;
    const settingsRef = doc(db, 'site-settings', 'homepage');
    const unsubscribe = onSnapshot(settingsRef, (docSnap) => {
      if (!docSnap.exists()) return;
      const imageUrl: string = docSnap.data().heroBackgroundImageUrl || '';
      setAdminPhoto(imageUrl);
      if (imageUrl) localStorage.setItem('heroBackgroundImageUrl', imageUrl);
      else localStorage.removeItem('heroBackgroundImageUrl');
    }, (error) => {
      console.error('Error loading settings:', error);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    type RawReflection = Omit<Reflection, 'enMissing'> & { status?: 'draft' | 'published' | 'deleted' };
    const unsubRefl = subscribeJson<RawReflection[]>(
      'reflections',
      (items) => {
        const dated = (r: { date?: string }) => {
          const time = r.date ? new Date(r.date).getTime() : NaN;
          return Number.isNaN(time) ? 0 : time;
        };
        const latest = (items || [])
          .filter((it) => (it.status || 'published') === 'published')
          .sort((a, b) => dated(b) - dated(a))[0];
        setReflection(latest ? {
          id: latest.id,
          title: { vi: latest.title?.vi || latest.title?.en || '', en: latest.title?.en || latest.title?.vi || '' },
          content: { vi: latest.content?.vi || latest.content?.en || '', en: latest.content?.en || latest.content?.vi || '' },
          enMissing: !isRealEnglish(latest.content?.en, latest.content?.vi),
          date: latest.date,
          author: latest.author,
        } : null);
        setReflectionState('ready');
      },
      () => setReflectionState('error')
    );

    const unsubEvents = subscribeJson<Event[]>(
      'events',
      (eventsData) => {
        const mapped: Event[] = (eventsData || []).map((d) => ({
          ...d,
          name: { vi: d.name?.vi || d.name?.en || '', en: d.name?.en || d.name?.vi || '' },
          content: d.content ? { vi: d.content.vi || d.content.en || '', en: d.content.en || d.content.vi || '' } : undefined,
          status: d.status || 'published',
        }))
          .filter(e => e.status === 'published')
          .sort((a, b) => parseEventDate(a.date).getTime() - parseEventDate(b.date).getTime());
        setEvents(mapped);
        setEventsState('ready');
      },
      () => setEventsState('error')
    );

    return () => { unsubRefl(); unsubEvents(); };
  }, [attempt]);

  const retry = () => {
    setReflectionState('loading');
    setEventsState('loading');
    setAttempt((n) => n + 1);
  };

  // "Now" in Melbourne, refreshed when the tab comes back into view and every
  // few minutes — so a tab left open over Sunday evening rolls on to next week.
  const [now, setNow] = useState(getMelbourneNow);
  useEffect(() => {
    const refresh = () => { if (document.visibilityState === 'visible') setNow(getMelbourneNow()); };
    const timer = window.setInterval(refresh, 5 * 60_000);
    document.addEventListener('visibilitychange', refresh);
    return () => { window.clearInterval(timer); document.removeEventListener('visibilitychange', refresh); };
  }, []);

  // This Sunday, named from the liturgical calendar. If the admin has posted
  // an event for that same day, the hero links to it and the events list
  // skips it, so Sunday Mass isn't listed twice.
  const sunday = useMemo(() => nextMassSunday(CHURCH_INFO.MASS_END_HOUR, now), [now]);
  const sundayIso = toIsoDate(sunday.date);
  const isToday = sundayIso === toIsoDate(now);
  const isEnglishMass = Math.ceil(sunday.date.getDate() / 7) === CHURCH_INFO.ENGLISH_MASS_WEEK_OF_MONTH;
  const sundayEvent = events.find(ev => ev.date === sundayIso);
  const upcomingEvents = events
    .filter(ev => ev.id !== sundayEvent?.id && !hasEventPassed(ev.date, ev.time || '11:59 PM'))
    .slice(0, 3);

  // The season chip drops the season name when the Sunday's own name already
  // says it ("Chúa Nhật XXVI Thường Niên") so it isn't read twice.
  const seasonName = SEASON_NAME[sunday.season][language];
  const seasonInName = sunday.name[language].includes(seasonName.replace(/^Mùa /, ''));
  const seasonChip = seasonInName
    ? `${t('home.cycle')} ${sunday.cycle}`
    : `${seasonName} · ${t('home.cycle')} ${sunday.cycle}`;

  // A weekly calendar entry, so "Add to calendar" is a standing reminder.
  const addToCalendar = () => {
    const ics = [
      'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Ane Thanh//Sunday Mass//EN', 'BEGIN:VEVENT',
      `UID:sunday-mass-${sundayIso}@anethanh`,
      `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '')}`,
      `DTSTART;TZID=Australia/Melbourne:${icsStamp(sunday.date, CHURCH_INFO.MASS_START_HOUR)}`,
      `DTEND;TZID=Australia/Melbourne:${icsStamp(sunday.date, CHURCH_INFO.MASS_END_HOUR)}`,
      'RRULE:FREQ=WEEKLY;BYDAY=SU',
      `SUMMARY:${t('home.calendar_event_title')}`,
      `LOCATION:${CHURCH_INFO.ADDRESS.replace(/,/g, '\\,')}`,
      `DESCRIPTION:${t('home.mass_language_note').replace(/,/g, '\\,')}`,
      'END:VEVENT', 'END:VCALENDAR',
    ].join('\r\n');
    const url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'thanh-le-chua-nhat.ics';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Is the latest reflection this week's? It counts if it's dated within
  // the six days before this Sunday (or on it).
  const reflectionAge = reflection?.date && ISO_DATE.test(reflection.date)
    ? Math.round((sunday.date.getTime() - parseEventDate(reflection.date).getTime()) / DAY)
    : null;
  const reflectionCurrent = reflectionAge !== null && reflectionAge <= 6;
  const reflectionHeading = !reflection || reflectionCurrent
    ? t('home.reflection_this_week')
    : reflectionAge !== null && reflectionAge <= 13
      ? t('home.reflection_last_sunday')
      : t('home.reflection_latest');

  const reflectionFallsBack = language === 'en' && !!reflection?.enMissing;
  const reflectionTitle = reflection ? reflection.title[language] : '';
  const { readings, excerpt } = useMemo(() => {
    if (!reflection) return { readings: '', excerpt: '' };
    let text = stripHtml(reflection.content[language]).trim();
    // Many posts open with a header line that repeats their own title
    // ("Chia Sẻ Lời Chúa. Chúa Nhật XXV Thường Niên. …") — skip past it.
    const bareTitle = reflectionTitle.replace(/\s+[ABC]$/, '');
    const at = bareTitle ? text.indexOf(bareTitle) : -1;
    if (at >= 0 && at < 120) text = text.slice(at + bareTitle.length).replace(/^[\s.:–-]+/, '');
    const match = text.match(READINGS);
    return match
      ? { readings: match[0].trim().replace(/;$/, '').split(/;\s*/).join(' · '), excerpt: text.slice(match[0].length).trim() }
      : { readings: '', excerpt: text };
  }, [reflection, reflectionTitle, language]);

  const loadError = (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-slate-900" role="alert">
      <p>{t('home.load_error')}</p>
      <button type="button" onClick={retry} className="btn btn-outline !py-2 !px-4 text-sm">
        {t('home.retry')}
      </button>
    </div>
  );

  return (
    <>
      <SEO
        title={t('home.title')}
        description={t('home.description')}
      />

      {/* Hero — who we are, then the answer most visitors came for: when and
          where this Sunday's Mass is, and in which language. Centered, per
          DESIGN.md's devotional register, and closed by the page's one
          signature rule. */}
      <section className="bg-surface px-4 pt-8 sm:pt-16 pb-4">
        <div className="max-w-[820px] mx-auto flex flex-col items-center text-center">
          <h1 className="h1 text-balance">{t('home.hero_title')}</h1>
          <p className="mt-2 sm:mt-4 text-[15px] sm:text-[19px] text-slate-900 max-w-[600px] leading-relaxed text-pretty">
            {t('home.hero_subtitle')}
          </p>

          <section
            aria-labelledby="next-mass-heading"
            className="mt-5 sm:mt-10 w-full max-w-[640px] border-y border-slate-200 py-5 sm:py-8 flex flex-col items-center gap-2.5 sm:gap-3"
          >
            <h2 id="next-mass-heading" className="text-[15px] font-semibold text-slate-700">
              {isToday ? t('home.next_mass_today') : t('home.next_mass')}
            </h2>
            <p className="font-serif font-bold text-slate-900 text-[38px] sm:text-5xl leading-[1.1] nums-lining text-balance">
              {/* Date and time never split mid-phrase: stacked on phones,
                  one line with a separator from sm up. */}
              <time dateTime={`${sundayIso}T${String(CHURCH_INFO.MASS_START_HOUR).padStart(2, '0')}:00`}>
                <span className="block sm:inline whitespace-nowrap">
                  {sunday.date.toLocaleDateString(locale, { day: 'numeric', month: 'long' })}
                </span>
                <span className="hidden sm:inline text-slate-400 font-sans font-normal mx-3" aria-hidden="true">·</span>
                <span className="block sm:inline whitespace-nowrap">{CHURCH_INFO.MASS_START[language]}</span>
              </time>
            </p>
            <p className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-slate-900">
              <span className="font-semibold">{sunday.name[language]}</span>
              <span className="badge-season">{seasonChip}</span>
            </p>
            <p className="text-slate-900 text-balance">
              {isEnglishMass ? t('home.mass_youth_english') : t('home.mass_in_vietnamese')}
              {' · '}
              {t('home.venue')}, {t('home.location_short')}
            </p>
            <div className="flex flex-wrap gap-3 justify-center mt-2">
              <a href={CHURCH_INFO.MAPS_LINK} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                </svg>
                {t('home.directions')}
              </a>
              <button type="button" onClick={addToCalendar} className="btn btn-outline">
                <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                </svg>
                {t('home.add_to_calendar')}
              </button>
              <a href={`tel:${CHURCH_INFO.PHONE}`} className="btn btn-outline">
                <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
                </svg>
                {t('home.call')}
              </a>
            </div>
            {sundayEvent && (
              <Link to={`/events/${sundayEvent.id}`} className="link font-semibold inline-flex items-center min-h-11 px-2">
                {t('home.mass_details')} <span aria-hidden="true" className="ml-1">→</span>
              </Link>
            )}
          </section>

          {heroPhoto && (
            <img
              src={heroPhoto}
              alt={t('home.hero_photo_alt')}
              width={1600}
              height={990}
              // The group stands in the lower half of the frame: anchor the
              // crop low so the wide desktop band keeps the front row.
              className="mt-8 sm:mt-10 w-full aspect-[16/10] sm:aspect-[21/9] rounded-2xl object-cover object-[50%_75%] border border-slate-200"
            />
          )}

          <div className="rule-signature mt-10" />
        </div>
      </section>

      {/* Everything below shares one centered reading column. */}

      {/* First visit — the practical answers a newcomer is too shy to ask. */}
      <section aria-labelledby="first-visit-heading" className="px-4 pt-10 pb-16">
        <div className="max-w-3xl mx-auto">
          <h2 id="first-visit-heading" className="h2">{t('home.first_visit_title')}</h2>
          <p className="mt-3 text-slate-900 leading-relaxed max-w-[60ch]">{t('home.first_visit_desc')}</p>
          <dl className="mt-8 grid gap-x-8 gap-y-6 sm:grid-cols-2">
            <div className="border-t border-slate-200 pt-4">
              <dt className="font-semibold text-slate-900">{t('home.fact_language')}</dt>
              <dd className="mt-1 text-slate-900 leading-relaxed">{t('home.mass_language_note')}</dd>
            </div>
            <div className="border-t border-slate-200 pt-4">
              <dt className="font-semibold text-slate-900">{t('home.fact_confession')}</dt>
              <dd className="mt-1 text-slate-900 leading-relaxed">{CHURCH_INFO.CONFESSION_TIME[language]}</dd>
            </div>
            <div className="border-t border-slate-200 pt-4">
              <dt className="font-semibold text-slate-900">{t('home.fact_parking')}</dt>
              <dd className="mt-1 text-slate-900 leading-relaxed">{t('home.parking_desc')}</dd>
            </div>
            <div className="border-t border-slate-200 pt-4">
              <dt className="font-semibold text-slate-900">{t('home.fact_questions')}</dt>
              <dd className="mt-1">
                <a href={`tel:${CHURCH_INFO.PHONE}`} className="link inline-flex items-center min-h-11 text-lg font-semibold nums-lining">
                  {CHURCH_INFO.PHONE_DISPLAY}
                </a>
              </dd>
            </div>
          </dl>
          <Link to="/about" className="link inline-flex items-center min-h-11 mt-4 font-semibold">
            {t('home.about_link')} <span aria-hidden="true" className="ml-1">→</span>
          </Link>
        </div>
      </section>

      {/* The latest gospel reflection — a neutral band, prose at measure.
          Labelled honestly: "this week" only when it's for this Sunday. */}
      <section aria-labelledby="reflection-heading" className="bg-slate-100 border-y border-slate-200 px-4 py-16">
        <div className="max-w-3xl mx-auto">
          <h2 id="reflection-heading" className="h2">{reflectionHeading}</h2>
          <div className="mt-6 measure-prose" aria-busy={reflectionState === 'loading'}>
            {reflectionState === 'loading' ? (
              <div className="space-y-3 animate-pulse" aria-hidden="true">
                <div className="h-7 w-2/3 bg-slate-200 rounded-lg" />
                <div className="h-4 w-full bg-slate-200 rounded" />
                <div className="h-4 w-5/6 bg-slate-200 rounded" />
              </div>
            ) : reflectionState === 'error' ? (
              loadError
            ) : reflection ? (
              <article lang={reflectionFallsBack ? 'vi' : language}>
                <h3 className="font-serif text-2xl sm:text-[26px] font-bold text-slate-900 leading-snug text-balance">
                  {reflectionTitle}
                </h3>
                <div className="mt-2 text-sm text-slate-600 space-y-1" lang={language}>
                  {reflectionAge !== null && reflection.date && (
                    <p>
                      {t('home.posted_on')}{' '}
                      <time dateTime={reflection.date} className="nums-lining">
                        {parseEventDate(reflection.date).toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' })}
                      </time>
                    </p>
                  )}
                  {readings && (
                    <p>{t('home.readings')}: <span lang="vi" className="nums-lining">{readings}</span></p>
                  )}
                  {reflectionFallsBack && <p className="italic">{t('home.reflection_vi_only')}</p>}
                </div>
                <p className="mt-4 text-slate-900 leading-relaxed line-clamp-4">{excerpt}</p>
                <div className="mt-4 flex flex-wrap gap-x-6" lang={language}>
                  <Link to={reflection.id ? `/reflections/${reflection.id}` : '/reflections'} className="link inline-flex items-center min-h-11 font-semibold">
                    {t('home.read_more')} <span aria-hidden="true" className="ml-1">→</span>
                  </Link>
                  <Link to="/reflections" className="link inline-flex items-center min-h-11 text-slate-900">
                    {t('home.view_all_gospel')}
                  </Link>
                </div>
                {!reflectionCurrent && (
                  <p className="mt-4 border-t border-slate-200 pt-4 text-slate-900" lang={language}>{t('home.reflection_coming')}</p>
                )}
              </article>
            ) : (
              <p className="text-slate-900 leading-relaxed">{t('home.no_reflection')}</p>
            )}
          </div>
        </div>
      </section>

      {/* Upcoming events — a dated list, not a card grid. */}
      <section aria-labelledby="events-heading" className="px-4 py-16">
        <div className="max-w-3xl mx-auto">
          <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 mb-6">
            <h2 id="events-heading" className="h2">{t('home.upcoming_events')}</h2>
            <Link to="/events" className="link inline-flex items-center min-h-11 font-semibold">
              {t('home.view_all_events')} <span aria-hidden="true" className="ml-1">→</span>
            </Link>
          </div>
          {eventsState === 'loading' ? (
            <div className="space-y-3 animate-pulse py-4" aria-hidden="true">
              <div className="h-5 w-3/4 bg-slate-200 rounded" />
              <div className="h-5 w-1/2 bg-slate-200 rounded" />
            </div>
          ) : eventsState === 'error' ? (
            <div className="border-t border-slate-200 pt-5">{loadError}</div>
          ) : upcomingEvents.length > 0 ? (
            <ul className="border-b border-slate-200">
              {upcomingEvents.map((event) => {
                const date = parseEventDate(event.date);
                return (
                  <li key={event.id} className="border-t border-slate-200">
                    <Link
                      to={`/events/${event.id}`}
                      className="grid grid-cols-[4.5rem_1fr] sm:grid-cols-[6rem_1fr] gap-x-5 py-5 group"
                    >
                      <time dateTime={event.date} className="nums-lining leading-tight">
                        <span className="block text-sm text-slate-600">{date.toLocaleDateString(locale, { weekday: 'short' })}</span>
                        <span className="block text-lg font-semibold text-slate-900">{date.toLocaleDateString(locale, { day: 'numeric', month: 'short' })}</span>
                      </time>
                      <div className="min-w-0">
                        <p className="text-[19px] font-semibold text-slate-900 leading-snug line-clamp-2 group-hover:text-brand-600 transition-colors">
                          {event.name[language]}
                        </p>
                        <p className="mt-1 text-sm text-slate-600 nums-lining">
                          {[event.time, event.location].filter(Boolean).join(' · ')}
                        </p>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="border-t border-slate-200 pt-5 text-slate-900 leading-relaxed">{t('home.no_events')}</p>
          )}
        </div>
      </section>

      {/* Closing word — the community's motto (unity, love, service) in the
          Gospel's own words, so the page ends on a blessing, not the footer. */}
      <figure className="px-4 pt-4 pb-20 text-center">
        <blockquote className="max-w-[640px] mx-auto font-serif font-bold text-2xl sm:text-3xl leading-snug text-slate-900 text-balance">
          “{t('home.blessing')}”
        </blockquote>
        <figcaption className="mt-4 text-sm font-semibold text-slate-600">{t('home.blessing_ref')}</figcaption>
      </figure>
    </>
  );
};

export default memo(Home);
