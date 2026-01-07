import { useState, useEffect } from "react";
import { useLanguage } from "../contexts/LanguageContext";
import { onAuthStateChanged, type User } from "../lib/firebase";
import { startSessionTimeout, stopSessionTimeout } from "../lib/sessionTimeout";
import { logAuditAction } from "../lib/audit";
import SessionTimeoutWarning from "../components/SessionTimeoutWarning";
import { Outlet, NavLink } from "react-router-dom";

export default function AdminDashboard() {
  const { t, language } = useLanguage();
  const [user, setUser] = useState<User | null>(null);
  const [showTimeoutWarning, setShowTimeoutWarning] = useState(false);

  // Track auth state and session timeout
  useEffect(() => {
    const unsub = onAuthStateChanged((u) => {
      setUser(u);
      if (u) {
        // User logged in - start session timeout tracking
        startSessionTimeout({
          onWarning: () => setShowTimeoutWarning(true),
          onTimeout: () => {
            void logAuditAction('auth.logout', { reason: 'session_timeout' });
          }
        });
      } else {
        // User logged out - stop tracking
        stopSessionTimeout();
      }
    });

    return () => {
      unsub();
      stopSessionTimeout();
    };
  }, []);

  const getInitials = (email: string | null | undefined): string => {
    if (!email) return 'AD';
    const username = email.split('@')[0];
    if (username.length <= 2) return username.toUpperCase();
    return username.substring(0, 2).toUpperCase();
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Session Timeout Warning Modal */}
      {showTimeoutWarning && (
        <SessionTimeoutWarning onDismiss={() => setShowTimeoutWarning(false)} />
      )}

      {/* Header */}
      <section className="relative bg-gradient-to-br from-brand-600 to-brand-800 text-white py-12">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30"></div>
        <div className="container-xl relative">
          <div className="flex justify-between items-start mb-4">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="font-medium">Admin Panel</span>
            </div>
            
            {/* User Info & Logout */}
            {user && (
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                <div className="flex items-center gap-2">
                  <span 
                    className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-white/30 text-white text-xs font-bold" 
                    title={user.email || ''}
                  >
                    {getInitials(user.email)}
                  </span>
                  <div className="hidden sm:block">
                    <div className="text-xs text-white/80">{language === 'vi' ? 'Đăng nhập với' : 'Signed in as'}</div>
                    <div className="text-sm font-medium">{user.email}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold">{t('admin.dashboard')}</h1>
        </div>
      </section>

      {/* Navigation Tabs */}
      <section className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="container-xl">
          <div className="flex gap-2 overflow-x-auto py-4">
            <NavLink
              to="/admin/reflections"
              className={({ isActive }) =>
                `inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold whitespace-nowrap transition-all duration-300 ${
                  isActive
                    ? 'bg-brand-600 text-white shadow-lg'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`
              }
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z"/>
              </svg>
              {t('admin.manage_reflections')}
            </NavLink>
            <NavLink
              to="/admin/events"
              className={({ isActive }) =>
                `inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold whitespace-nowrap transition-all duration-300 ${
                  isActive
                    ? 'bg-brand-600 text-white shadow-lg'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`
              }
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/>
              </svg>
              {t('admin.manage_events')}
            </NavLink>
            <NavLink
              to="/admin/gallery"
              className={({ isActive }) =>
                `inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold whitespace-nowrap transition-all duration-300 ${
                  isActive
                    ? 'bg-brand-600 text-white shadow-lg'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`
              }
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {t('admin.manage_gallery')}
            </NavLink>
          </div>
        </div>
      </section>

      {/* Content Area */}
      <section className="py-8">
        <Outlet />
      </section>
    </div>
  );
}
