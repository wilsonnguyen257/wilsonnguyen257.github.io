import { useOffline } from '../../contexts/OfflineContext';
import { useLanguage } from '../../contexts/LanguageContext';

export function OfflineStatus() {
  const { isOnline } = useOffline();
  const { language } = useLanguage();

  const t = (en: string, vi: string) => language === 'vi' ? vi : en;

  if (isOnline) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 z-50 px-4 py-2 bg-yellow-100 border border-yellow-200 rounded-lg flex items-center gap-2">
      <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
      </svg>
      <span className="text-sm text-yellow-800">
        {t('Offline Mode', 'Chế độ ngoại tuyến')}
      </span>
    </div>
  );
}
