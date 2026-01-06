import { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import type { RecurrenceRule } from '../../types/event';

interface EventRecurrenceFormProps {
  value?: RecurrenceRule;
  onChange: (rule: RecurrenceRule | undefined) => void;
}

export default function EventRecurrenceForm({ value, onChange }: EventRecurrenceFormProps) {
  const { language } = useLanguage();
  const [enabled, setEnabled] = useState(!!value);

  const t = (en: string, vi: string) => language === 'vi' ? vi : en;

  const weekDays = [
    { value: 0, label: t('Sun', 'CN') },
    { value: 1, label: t('Mon', 'T2') },
    { value: 2, label: t('Tue', 'T3') },
    { value: 3, label: t('Wed', 'T4') },
    { value: 4, label: t('Thu', 'T5') },
    { value: 5, label: t('Fri', 'T6') },
    { value: 6, label: t('Sat', 'T7') },
  ];

  const handleToggle = () => {
    if (enabled) {
      setEnabled(false);
      onChange(undefined);
    } else {
      setEnabled(true);
      onChange({
        type: 'weekly',
        interval: 1,
        daysOfWeek: [new Date().getDay()],
      });
    }
  };

  const updateRule = (updates: Partial<RecurrenceRule>) => {
    if (!enabled) return;
    
    const currentRule = value || { type: 'weekly' as const };
    onChange({ ...currentRule, ...updates });
  };

  const handleDayToggle = (day: number) => {
    if (!enabled || !value) return;
    
    const currentDays = value.daysOfWeek || [];
    const newDays = currentDays.includes(day)
      ? currentDays.filter(d => d !== day)
      : [...currentDays, day];
    
    updateRule({ daysOfWeek: newDays });
  };

  if (!enabled) {
    return (
      <div className="space-y-3">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={false}
            onChange={handleToggle}
            className="w-4 h-4 text-brand-600 border-slate-300 rounded focus:ring-brand-500"
          />
          <span className="text-sm font-medium text-slate-700">
            {t('Repeat event', 'Lặp lại sự kiện')}
          </span>
        </label>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4 bg-slate-50 rounded-lg">
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={true}
            onChange={handleToggle}
            className="w-4 h-4 text-brand-600 border-slate-300 rounded focus:ring-brand-500"
          />
          <span className="text-sm font-medium text-slate-700">
            {t('Repeat event', 'Lặp lại sự kiện')}
          </span>
        </label>
      </div>

      {/* Recurrence Type */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          {t('Repeats', 'Lặp lại')}
        </label>
        <select
          value={value?.type || 'weekly'}
          onChange={(e) => updateRule({ type: e.target.value as RecurrenceRule['type'] })}
          className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
        >
          <option value="weekly">{t('Weekly', 'Hàng tuần')}</option>
          <option value="monthly">{t('Monthly', 'Hàng tháng')}</option>
          <option value="yearly">{t('Yearly', 'Hàng năm')}</option>
        </select>
      </div>

      {/* Interval */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          {t('Every', 'Mỗi')}
        </label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min="1"
            max="52"
            value={value?.interval || 1}
            onChange={(e) => updateRule({ interval: parseInt(e.target.value) || 1 })}
            className="w-20 px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
          />
          <span className="text-sm text-slate-600">
            {value?.type === 'weekly' && t('week(s)', 'tuần')}
            {value?.type === 'monthly' && t('month(s)', 'tháng')}
            {value?.type === 'yearly' && t('year(s)', 'năm')}
          </span>
        </div>
      </div>

      {/* Days of Week (for weekly) */}
      {value?.type === 'weekly' && (
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            {t('On days', 'Vào các ngày')}
          </label>
          <div className="flex gap-2">
            {weekDays.map((day) => (
              <button
                key={day.value}
                type="button"
                onClick={() => handleDayToggle(day.value)}
                className={`w-10 h-10 rounded-lg font-medium text-sm transition-colors ${
                  value?.daysOfWeek?.includes(day.value)
                    ? 'bg-brand-600 text-white'
                    : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
                }`}
              >
                {day.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Day of Month (for monthly) */}
      {value?.type === 'monthly' && (
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            {t('On day', 'Vào ngày')}
          </label>
          <select
            value={value?.dayOfMonth || 1}
            onChange={(e) => updateRule({ dayOfMonth: parseInt(e.target.value) })}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
          >
            {Array.from({ length: 31 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                {i + 1}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* End Date */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          {t('Ends', 'Kết thúc')}
        </label>
        <div className="space-y-2">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="endType"
              checked={!value?.endDate}
              onChange={() => updateRule({ endDate: undefined })}
              className="text-brand-600 border-slate-300 focus:ring-brand-500"
            />
            <span className="text-sm text-slate-700">
              {t('Never', 'Không bao giờ')}
            </span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="endType"
              checked={!!value?.endDate}
              onChange={() => {
                const futureDate = new Date();
                futureDate.setMonth(futureDate.getMonth() + 3);
                updateRule({ endDate: futureDate.toISOString().split('T')[0] });
              }}
              className="text-brand-600 border-slate-300 focus:ring-brand-500"
            />
            <span className="text-sm text-slate-700">
              {t('On', 'Vào ngày')}
            </span>
          </label>
          {value?.endDate && (
            <input
              type="date"
              value={value.endDate}
              onChange={(e) => updateRule({ endDate: e.target.value || undefined })}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
            />
          )}
        </div>
      </div>

      {/* Preview */}
      <div className="pt-3 border-t border-slate-200">
        <p className="text-sm text-slate-600">
          {t('Summary: ', 'Tóm tắt: ')}
          <span className="font-medium text-slate-900">
            {value && getRecurrenceDescription(value, language)}
          </span>
        </p>
      </div>
    </div>
  );
}

// Import the function from recurrence lib
function getRecurrenceDescription(rule: RecurrenceRule, language: 'vi' | 'en'): string {
  const interval = rule.interval || 1;
  const t = (en: string, vi: string) => language === 'vi' ? vi : en;
  
  switch (rule.type) {
    case 'weekly':
      if (interval === 1 && (!rule.daysOfWeek || rule.daysOfWeek.length === 7)) {
        return t('Weekly', 'Hàng tuần');
      }
      if (interval === 1 && rule.daysOfWeek) {
        const days = rule.daysOfWeek.map(d => {
          const dayNames = {
            vi: ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'],
            en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
          };
          return dayNames[language][d];
        }).join(', ');
        return t(`Weekly on ${days}`, `Hàng tuần vào ${days}`);
      }
      return t(`Every ${interval} weeks`, `Mỗi ${interval} tuần`);
    
    case 'monthly':
      if (interval === 1) {
        return t('Monthly', 'Hàng tháng');
      }
      return t(`Every ${interval} months`, `Mỗi ${interval} tháng`);
    
    case 'yearly':
      if (interval === 1) {
        return t('Yearly', 'Hàng năm');
      }
      return t(`Every ${interval} years`, `Mỗi ${interval} năm`);
    
    default:
      return '';
  }
}
