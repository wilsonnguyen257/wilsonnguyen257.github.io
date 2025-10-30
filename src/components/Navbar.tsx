import { useEffect, useState } from "react";
import { NavLink, Link } from "react-router-dom";
import { useLanguage } from "../contexts/LanguageContext";
import { useTheme } from "../contexts/ThemeContext";
import { IS_FIREBASE_CONFIGURED, onAuthStateChanged, logout, type User } from "../lib/firebase";

const links = [
  { to: "/", key: "nav.home" },
  { to: "/about", key: "nav.about" },
  { to: "/ministries", key: "nav.ministries" },
  { to: "/events", key: "nav.events" },
  { to: "/gallery", key: "nav.gallery" },
  { to: "/reflections", key: "nav.reflections" },
  { to: "/give", key: "nav.give" },
  { to: "/contact", key: "nav.contact" },
];

export default function Navbar() {
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (!IS_FIREBASE_CONFIGURED) return;
    const unsub = onAuthStateChanged((u) => setUser(u));
    return () => {
      try {
        if (unsub && typeof unsub === 'function') {
          unsub();
        }
      } catch {
        /* noop */
      }
    };
  }, []);

  const navItem = (to: string, key: string) => (
    <NavLink
      key={to}
      to={to}
      className={({ isActive }) =>
        `rounded-xl px-3 py-2 text-sm font-medium ${
          isActive
            ? "bg-brand-600 text-white"
            : "text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
        }`
      }
      onClick={() => setOpen(false)}
    >
      {t(key)}
    </NavLink>
  );

  return (
    <header className="sticky top-0 z-40 border-b border-brand-200 bg-[var(--color-bg)] backdrop-blur">
      <div className="container-xl flex h-[86px] items-center justify-between">
        <Link to="/" className="flex items-center gap-3 h-full">
          <img src="/logo.png" alt="Logo" className="bg-white border border-[var(--color-border)] shadow-md max-h-full max-w-[90px] p-1.5 rounded-full" />
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((link) => navItem(link.to, link.key))}

          {/* Admin link (only shown when user is signed in) */}
          {IS_FIREBASE_CONFIGURED && user && (
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                `rounded-xl px-3 py-2 text-sm font-medium ${
                  isActive
                    ? "bg-brand-600 text-white"
                    : "text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                }`
              }
            >
              Admin
            </NavLink>
          )}
          
          {/* Theme Toggle */}
          <div className="ml-4">
            <button
              onClick={toggleTheme}
              className="px-3 py-2 rounded-xl border border-slate-300 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 shadow-sm transition hover:bg-slate-50 dark:hover:bg-slate-700 dark:border-slate-600"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
          </div>
          
          {/* Language Toggle */}
          <div className="ml-2">
            <button
              onClick={() => setLanguage(language === 'vi' ? 'en' : 'vi')}
              className="px-3 py-2 rounded-xl border border-slate-300 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 shadow-sm transition hover:bg-slate-50 dark:hover:bg-slate-700 dark:border-slate-600"
              aria-label="Toggle language"
            >
              {language === 'vi' ? '🇺🇸 EN' : '🇻🇳 VI'}
            </button>
          </div>

          {/* Sign out button (only shown when user is signed in) */}
          {IS_FIREBASE_CONFIGURED && user && (
            <div className="ml-2 flex items-center gap-2">
              <span className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[160px]" title={user.email || ''}>
                {user.email}
              </span>
              <button
                onClick={() => void logout()}
                className="px-3 py-2 rounded-xl border border-slate-300 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 shadow-sm transition hover:bg-slate-50 dark:hover:bg-slate-700 dark:border-slate-600"
              >
                Sign out
              </button>
            </div>
          )}
        </nav>

        <button
          className="md:hidden rounded-xl border border-[var(--color-border)] p-3 min-w-[44px] min-h-[44px]"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle Menu"
          aria-expanded={open}
          aria-controls="mobile-menu"
        >
          {open ? (
            // X (close) icon
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="h-6 w-6 text-slate-700 dark:text-slate-200"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            // Hamburger icon
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="h-6 w-6 text-slate-700 dark:text-slate-200"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          )}
        </button>
      </div>
      {open && (
        <div 
          id="mobile-menu" 
          className="md:hidden border-t border-slate-200 dark:border-slate-800 animate-in slide-in-from-top duration-200"
        >
          <div className="container-xl flex flex-col gap-1 py-2">
            {links.map((l) => navItem(l.to, l.key))}
            
            {/* Admin link for mobile (only shown when user is signed in) */}
            {IS_FIREBASE_CONFIGURED && user && (
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  `rounded-xl px-3 py-2 text-sm font-medium ${
                    isActive
                      ? "bg-brand-600 text-white"
                      : "text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                  }`
                }
                onClick={() => setOpen(false)}
              >
                Admin
              </NavLink>
            )}
            
            <div className="mt-2 space-y-2">
              <button
                onClick={toggleTheme}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 shadow-sm transition hover:bg-slate-50 dark:hover:bg-slate-700 dark:border-slate-600"
                aria-label="Toggle theme"
              >
                {theme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode'}
              </button>
              <button
                onClick={() => setLanguage(language === 'vi' ? 'en' : 'vi')}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 shadow-sm transition hover:bg-slate-50 dark:hover:bg-slate-700 dark:border-slate-600"
                aria-label="Toggle language"
              >
                {language === 'vi' ? '🇺🇸 EN' : '🇻🇳 VI'}
              </button>
              {IS_FIREBASE_CONFIGURED && user && (
                <button
                  onClick={() => void logout()}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 shadow-sm transition hover:bg-slate-50 dark:hover:bg-slate-700 dark:border-slate-600"
                >
                  Sign out
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
