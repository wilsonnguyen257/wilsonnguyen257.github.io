import { useState, useEffect } from 'react';

type CountdownProps = {
  eventDate: string;
  eventTime: string;
};

export default function EventCountdown({ eventDate, eventTime }: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const [hours, minutes] = eventTime.split(':').map(num => parseInt(num));
      const eventDateTime = new Date(eventDate);
      eventDateTime.setHours(hours, minutes, 0);
      
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
    };

    const timer = setInterval(calculateTimeLeft, 1000);
    calculateTimeLeft();

    return () => clearInterval(timer);
  }, [eventDate, eventTime]);

  const timeBlocks = [
    { label: 'Ngày', value: timeLeft.days },
    { label: 'Giờ', value: timeLeft.hours },
    { label: 'Phút', value: timeLeft.minutes },
    { label: 'Giây', value: timeLeft.seconds }
  ];

  const allZeros = Object.values(timeLeft).every(value => value === 0);

  if (allZeros) {
    return (
      <div className="mt-4 text-center">
        <div className="bg-brand-50 rounded-lg p-4 dark:bg-slate-800">
          <p className="text-lg text-brand-600 dark:text-brand-400">
            Sự kiện đã bắt đầu!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4">
      <p className="text-center mb-3 p-muted">Thời gian còn lại:</p>
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
