import { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { createMelbourneEventDate } from '../lib/timezone';

type CountdownProps = {
  eventDate: string;
  eventTime: string;
};

export default function EventCountdown({ eventDate, eventTime }: CountdownProps) {
  const { language } = useLanguage();
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      try {
        // Use Melbourne timezone utilities to create proper event date
        const eventDateTime = createMelbourneEventDate(eventDate, eventTime);
        const now = new Date();
        const difference = eventDateTime.getTime() - now.getTime();
        
        if (difference > 0) {
          setTimeLeft({
            days: Math.floor(difference / (1000 * 60 * 60 * 24)),
            hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
            minutes: Math.floor((difference / 1000 / 60) % 60),
            seconds: Math.floor((difference / 1000) % 60)
          });
        } else {
          setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        }
      } catch (error) {
        console.error('Error calculating event countdown:', error);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    const timer = setInterval(calculateTimeLeft, 1000);
    calculateTimeLeft();

    return () => clearInterval(timer);
  }, [eventDate, eventTime]);

  const timeBlocks = [
    { label: language === 'en' ? 'Days' : 'Ngày', value: timeLeft.days },
    { label: language === 'en' ? 'Hours' : 'Giờ', value: timeLeft.hours },
    { label: language === 'en' ? 'Minutes' : 'Phút', value: timeLeft.minutes },
    { label: language === 'en' ? 'Seconds' : 'Giây', value: timeLeft.seconds }
  ];

  const allZeros = Object.values(timeLeft).every(value => value === 0);

  if (allZeros) {
    return (
      <div className="mt-4 text-center">
        <div className="bg-brand-50 rounded-lg p-4">
          <p className="text-lg text-brand-600">
            {language === 'en' ? 'The event has started!' : 'Sự kiện đã bắt đầu!'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4">
      <p className="text-center mb-3 p-muted">{language === 'en' ? 'Time remaining:' : 'Thời gian còn lại:'}</p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {timeBlocks.map(({ label, value }) => (
          <div key={label} className="text-center">
            <div className="bg-brand-50 rounded-xl p-3 shadow-sm hover:shadow-md transition-shadow">
              <div className="text-3xl font-bold text-brand-600">
                {value.toString().padStart(2, '0')}
              </div>
              <div className="text-sm font-medium text-slate-600">{label}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
