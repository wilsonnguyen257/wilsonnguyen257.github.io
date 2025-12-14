import { useEffect, useState } from "react";
import { NavLink, Link } from "react-router-dom";
import { useLanguage } from "../contexts/LanguageContext";
import { IS_FIREBASE_CONFIGURED, onAuthStateChanged, logout, type User } from "../lib/firebase";
import logo from "../assets/logo.png";

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
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  // Get initials from email (e.g., "admin@gmail.com" -> "AD")
  const getInitials = (email: string | null | undefined): string => {
    if (!email) return 'AD';
    const username = email.split('@')[0];
    if (username.length <= 2) return username.toUpperCase();
    return username.substring(0, 2).toUpperCase();
  };

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
        `rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 ${
          isActive
            ? "bg-brand-600 text-white shadow-md shadow-brand-600/30"
            : "text-slate-700 hover:bg-slate-100 hover:text-brand-600"
        }`
      }
      onClick={() => setOpen(false)}
    >
      {t(key)}
    </NavLink>
  );

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur-md shadow-sm transition-all duration-300">
      <div className="container-xl flex h-20 items-center justify-between">
        <Link to="/" className="flex items-center gap-3 h-full group">
          <img src={logo} alt="Logo" className="bg-white border-2 border-brand-200 shadow-lg max-h-16 max-w-[80px] p-1.5 rounded-full transition-transform duration-300 group-hover:scale-105 group-hover:shadow-xl" />
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((link) => navItem(link.to, link.key))}

          {/* Admin link (only shown when user is signed in) */}
          {IS_FIREBASE_CONFIGURED && user && (
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                `rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? "bg-brand-600 text-white shadow-md shadow-brand-600/30"
                    : "text-slate-700 hover:bg-slate-100 hover:text-brand-600"
                }`
              }
            >
              Admin
            </NavLink>
          )}
          
          {/* Language Toggle */}
          <div className="ml-4">
            <button
              onClick={() => setLanguage(language === 'vi' ? 'en' : 'vi')}
              className="px-3 py-2.5 rounded-xl border-2 border-slate-200 bg-white text-slate-700 shadow-sm transition-all duration-200 hover:bg-slate-50 hover:border-brand-300 hover:shadow-md font-medium"
              aria-label="Toggle language"
            >
              {language === 'vi' ? '🇺🇸 EN' : '🇻🇳 VI'}
            </button>
          </div>

          {/* Sign out button (only shown when user is signed in) */}
          {IS_FIREBASE_CONFIGURED && user && (
            <div className="ml-2 flex items-center gap-2">
              <span 
                className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-white text-xs font-bold shadow-lg" 
                title={user.email || ''}
              >
                {getInitials(user.email)}
              </span>
              <button
                onClick={() => void logout()}
                className="px-3 py-2.5 rounded-xl border-2 border-slate-200 bg-white text-slate-700 shadow-sm transition-all duration-200 hover:bg-red-50 hover:border-red-300 hover:text-red-600 hover:shadow-md font-medium"
              >
                Sign out
              </button>
            </div>
          )}
        </nav>

        <button
          className="md:hidden rounded-xl border-2 border-slate-200 p-3 min-w-[44px] min-h-[44px] hover:bg-slate-100 transition-colors duration-200"
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
              strokeWidth="2"
              className="h-6 w-6 text-slate-700"
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
              className="h-6 w-6 text-slate-700"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          )}
        </button>
      </div>
      {open && (
        <div 
          id="mobile-menu" 
          className="md:hidden border-t border-slate-200 bg-white/95 backdrop-blur-md shadow-lg animate-fadeIn"
        >
          <div className="container-xl flex flex-col gap-2 py-4">
            {links.map((l) => navItem(l.to, l.key))}
            
            {/* Admin link for mobile (only shown when user is signed in) */}
            {IS_FIREBASE_CONFIGURED && user && (
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  `rounded-xl px-3 py-2 text-sm font-medium ${
                    isActive
                      ? "bg-brand-600 text-white"
                      : "text-slate-700 hover:bg-slate-100"
                  }`
                }
                onClick={() => setOpen(false)}
              >
                Admin
              </NavLink>
            )}
            
            <div className="mt-2 space-y-2">
              <button
                onClick={() => setLanguage(language === 'vi' ? 'en' : 'vi')}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50"
                aria-label="Toggle language"
              >
                {language === 'vi' ? '🇺🇸 EN' : '🇻🇳 VI'}
              </button>
              {IS_FIREBASE_CONFIGURED && user && (
                <button
                  onClick={() => void logout()}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50"
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
