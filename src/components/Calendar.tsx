import { useState, useMemo } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import type { EnhancedEvent } from '../types/event';

interface CalendarProps {
  events: EnhancedEvent[];
  onDateClick?: (date: Date) => void;
  onEventClick?: (event: EnhancedEvent) => void;
  selectedDate?: Date;
}

export default function Calendar({ events, onDateClick, onEventClick, selectedDate }: CalendarProps) {
  const { language } = useLanguage();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  const t = (en: string, vi: string) => language === 'vi' ? vi : en;

  // Get days in month
  const daysInMonth = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  }, [currentMonth]);

  // Get events for a specific date
  const getEventsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return events.filter(event => {
      if (event.date === dateStr) return true;
      
      // Check recurring events
      if (event.isRecurring && event.recurrence) {
        const eventStart = new Date(event.date);
        const eventEnd = event.recurrence.endDate ? new Date(event.recurrence.endDate) : null;
        
        if (date >= eventStart && (!eventEnd || date <= eventEnd)) {
          // Check if this date matches the recurrence pattern
          switch (event.recurrence.type) {
            case 'weekly':
              if (!event.recurrence.daysOfWeek || event.recurrence.daysOfWeek.includes(date.getDay())) {
                return true;
              }
              break;
            case 'monthly':
              if (!event.recurrence.dayOfMonth || date.getDate() === event.recurrence.dayOfMonth) {
                return true;
              }
              break;
            case 'yearly':
              if (date.getMonth() === eventStart.getMonth() && date.getDate() === eventStart.getDate()) {
                return true;
              }
              break;
          }
        }
      }
      
      return false;
    });
  };

  // Navigate months
  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  // Week day names
  const weekDays = [
    t('Sun', 'CN'),
    t('Mon', 'T2'),
    t('Tue', 'T3'),
    t('Wed', 'T4'),
    t('Thu', 'T5'),
    t('Fri', 'T6'),
    t('Sat', 'T7'),
  ];

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date: Date) => {
    return selectedDate && date.toDateString() === selectedDate.toDateString();
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200">
        <button
          onClick={previousMonth}
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <h2 className="text-lg font-semibold text-slate-900">
          {currentMonth.toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US', {
            month: 'long',
            year: 'numeric',
          })}
        </h2>

        <button
          onClick={nextMonth}
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Week days */}
      <div className="grid grid-cols-7 border-b border-slate-200">
        {weekDays.map((day) => (
          <div
            key={day}
            className="p-3 text-center text-sm font-medium text-slate-700"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Days */}
      <div className="grid grid-cols-7">
        {daysInMonth.map((date, index) => {
          if (!date) {
            return <div key={`empty-${index}`} className="p-2" />;
          }

          const dayEvents = getEventsForDate(date);
          const isCurrentDay = isToday(date);
          const isCurrentSelected = isSelected(date);

          return (
            <div
              key={date.toISOString()}
              onClick={() => onDateClick?.(date)}
              className={`min-h-[100px] p-2 border-t border-slate-100 cursor-pointer transition-colors ${
                isCurrentDay ? 'bg-brand-50' : ''
              } ${isCurrentSelected ? 'bg-brand-100' : ''} hover:bg-slate-50`}
            >
              <div className={`text-sm font-medium mb-1 ${
                isCurrentDay ? 'text-brand-600' : 'text-slate-900'
              }`}>
                {date.getDate()}
              </div>

              {/* Events */}
              <div className="space-y-1">
                {dayEvents.slice(0, 3).map((event) => (
                  <div
                    key={event.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEventClick?.(event);
                    }}
                    className="text-xs p-1 rounded truncate cursor-pointer hover:opacity-80"
                    style={{
                      backgroundColor: event.category === 'mass' ? '#3b82f6' :
                                      event.category === 'meeting' ? '#10b981' :
                                      event.category === 'social' ? '#f59e0b' :
                                      event.category === 'fundraiser' ? '#ef4444' :
                                      '#6b7280',
                      color: 'white',
                    }}
                  >
                    {event.name[language] || event.name[language === 'vi' ? 'en' : 'vi'] || ''}
                  </div>
                ))}
                {dayEvents.length > 3 && (
                  <div className="text-xs text-slate-500">
                    +{dayEvents.length - 3} {t('more', 'thêm')}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="p-4 border-t border-slate-200">
        <div className="flex flex-wrap gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-blue-500"></div>
            <span className="text-slate-600">{t('Mass', 'Thánh lễ')}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-green-500"></div>
            <span className="text-slate-600">{t('Meeting', 'Họp')}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-amber-500"></div>
            <span className="text-slate-600">{t('Social', 'Xã hội')}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-red-500"></div>
            <span className="text-slate-600">{t('Fundraiser', 'Gây quỹ')}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-slate-500"></div>
            <span className="text-slate-600">{t('Other', 'Khác')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
