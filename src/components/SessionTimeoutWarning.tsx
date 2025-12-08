import { useEffect, useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { extendSession, getTimeRemaining } from '../lib/sessionTimeout';

interface SessionTimeoutWarningProps {
  onDismiss: () => void;
}

export default function SessionTimeoutWarning({ onDismiss }: SessionTimeoutWarningProps) {
  const { language } = useLanguage();
  const [timeLeft, setTimeLeft] = useState(getTimeRemaining());

  useEffect(() => {
    const interval = setInterval(() => {
      const remaining = getTimeRemaining();
      setTimeLeft(remaining);
      
      // Auto-dismiss if time runs out
      if (remaining <= 0) {
        onDismiss();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [onDismiss]);

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleStayLoggedIn = () => {
    extendSession();
    onDismiss();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              {language === 'vi' ? 'Phiên làm việc sắp hết hạn' : 'Session Expiring Soon'}
            </h3>
            <p className="text-slate-600 mb-4">
              {language === 'vi' 
                ? `Bạn sẽ tự động đăng xuất sau ${formatTime(timeLeft)} do không hoạt động.`
                : `You will be automatically logged out in ${formatTime(timeLeft)} due to inactivity.`
              }
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleStayLoggedIn}
                className="flex-1 px-4 py-2 bg-brand-600 text-white rounded-lg font-medium hover:bg-brand-700 transition-colors"
              >
                {language === 'vi' ? 'Tiếp tục đăng nhập' : 'Stay Logged In'}
              </button>
              <button
                onClick={onDismiss}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200 transition-colors"
              >
                {language === 'vi' ? 'Đóng' : 'Dismiss'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
