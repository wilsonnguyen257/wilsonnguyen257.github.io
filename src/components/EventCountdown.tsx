import { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

type CountdownProps = {
  eventDate: string;
  eventTime: string;
};

export default function EventCountdown({ eventDate, eventTime }: CountdownProps) {
  const { t } = useLanguage();
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  const [startedToday, setStartedToday] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      // Parse time, support formats like "5:00 PM" or "17:00"
      let hours = 0;
      let minutes = 0;
      const ampmMatch = eventTime.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
      if (ampmMatch) {
        hours = parseInt(ampmMatch[1], 10);
        minutes = parseInt(ampmMatch[2], 10);
        const meridiem = ampmMatch[3]?.toUpperCase();
        if (meridiem === 'PM' && hours < 12) hours += 12;
        if (meridiem === 'AM' && hours === 12) hours = 0;
      } else {
        // Fallback: try simple HH:MM 24-hour format split
        const parts = eventTime.split(':');
        hours = parseInt(parts[0] || '0', 10);
        minutes = parseInt(parts[1] || '0', 10);
      }

      const eventStart = new Date(eventDate);
      eventStart.setHours(hours, minutes, 0, 0);
      const eventEndOfDay = new Date(eventDate);
      eventEndOfDay.setHours(23, 59, 59, 999);
      
      const now = new Date();
      // Determine state: before start -> countdown; between start and end-of-day -> show started status; after day -> zero
      const isStartedToday = now >= eventStart && now <= eventEndOfDay;
      setStartedToday(isStartedToday);

      const target = now < eventStart ? eventStart : now; // after start, we won't countdown further
      const difference = target.getTime() - now.getTime();
      
      if (!isStartedToday && difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    const timer = setInterval(calculateTimeLeft, 1000);
    calculateTimeLeft();

    return () => clearInterval(timer);
  }, [eventDate, eventTime]);

  const timeBlocks = [
    { label: t('countdown.days'), value: timeLeft.days },
    { label: t('countdown.hours'), value: timeLeft.hours },
    { label: t('countdown.minutes'), value: timeLeft.minutes },
    { label: t('countdown.seconds'), value: timeLeft.seconds }
  ];

  const allZeros = Object.values(timeLeft).every(value => value === 0);

  if (startedToday || allZeros) {
    return (
      <div className="mt-4 text-center">
        <div className="bg-brand-50 rounded-lg p-4 dark:bg-slate-800">
          <p className="text-lg text-brand-600 dark:text-brand-400">
            {t('countdown.started')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4">
      <p className="text-center mb-3 p-muted">{t('countdown.time_left')}</p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {timeBlocks.map(({ label, value }) => (
          <div key={label} className="text-center">
            <div className="bg-brand-50 rounded-xl p-3 dark:bg-slate-800 shadow-sm hover:shadow-md transition-shadow">
              <div className="text-3xl font-bold text-brand-600 dark:text-brand-400">
                {value.toString().padStart(2, '0')}
              </div>
              <div className="text-sm font-medium text-slate-600 dark:text-slate-300">{label}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
