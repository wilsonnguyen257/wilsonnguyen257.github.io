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

  const navItem = (to: string, key: string) => {
    // 'Give' stays a filled pill in the secondary accent — everything else
    // is plain text with no chrome, so the one colored button reads clearly.
    if (key === 'nav.give') {
      return (
        <NavLink
          key={to}
          to={to}
          className="rounded-full bg-accent-500 px-5 py-2 text-sm font-semibold text-white transition-colors duration-200 hover:bg-accent-600"
          onClick={() => setOpen(false)}
        >
          {t(key)}
        </NavLink>
      );
    }

    return (
      <NavLink
        key={to}
        to={to}
        className={({ isActive }) =>
          `rounded-full px-3.5 py-2 text-[15px] font-medium transition-colors duration-200 ${
            isActive
              ? "text-slate-900 font-semibold"
              : "text-slate-500 hover:text-slate-900"
          }`
        }
        onClick={() => setOpen(false)}
      >
        {t(key)}
      </NavLink>
    );
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-xl">
      <div className="container-xl flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-3 h-full group">
          <img src={logo} alt="Logo" className="h-9 w-9 rounded-full object-cover" />
        </Link>

        <nav className="hidden items-center gap-0.5 xl:flex">
          {links.map((link) => navItem(link.to, link.key))}

          {/* Admin link (only shown when user is signed in) */}
          {IS_FIREBASE_CONFIGURED && user && (
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                `rounded-full px-3.5 py-2 text-[15px] font-medium transition-colors duration-200 ${
                  isActive ? "text-slate-900 font-semibold" : "text-slate-500 hover:text-slate-900"
                }`
              }
            >
              Admin
            </NavLink>
          )}

          {/* Language Toggle */}
          <div className="ml-3 pl-3 border-l border-slate-200">
            <button
              onClick={() => setLanguage(language === 'vi' ? 'en' : 'vi')}
              className="rounded-full px-3 py-2 text-sm font-medium text-slate-500 transition-colors duration-200 hover:text-slate-900"
              aria-label="Toggle language"
            >
              {language === 'vi' ? '🇺🇸 EN' : '🇻🇳 VI'}
            </button>
          </div>

          {/* Sign out button (only shown when user is signed in) */}
          {IS_FIREBASE_CONFIGURED && user && (
            <button
              onClick={() => void logout()}
              className="rounded-full px-3 py-2 text-sm font-medium text-slate-500 transition-colors duration-200 hover:text-red-600"
            >
              Sign out
            </button>
          )}
        </nav>

        <button
          className="xl:hidden rounded-full p-2.5 min-w-[44px] min-h-[44px] hover:bg-slate-100 transition-colors duration-200"
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
          className="xl:hidden border-t border-slate-200 bg-white animate-fadeIn"
        >
          <div className="container-xl flex flex-col gap-1 py-4">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                className={({ isActive }) =>
                  `rounded-xl px-3 py-2.5 text-[15px] font-medium ${
                    isActive ? "bg-slate-100 text-slate-900 font-semibold" : "text-slate-600 hover:bg-slate-50"
                  } ${l.key === 'nav.give' ? '!text-accent-600 font-semibold' : ''}`
                }
                onClick={() => setOpen(false)}
              >
                {t(l.key)}
              </NavLink>
            ))}

            {/* Admin link for mobile (only shown when user is signed in) */}
            {IS_FIREBASE_CONFIGURED && user && (
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  `rounded-xl px-3 py-2.5 text-[15px] font-medium ${
                    isActive ? "bg-slate-100 text-slate-900 font-semibold" : "text-slate-600 hover:bg-slate-50"
                  }`
                }
                onClick={() => setOpen(false)}
              >
                Admin
              </NavLink>
            )}

            <div className="mt-2 pt-2 border-t border-slate-100 space-y-1">
              <button
                onClick={() => setLanguage(language === 'vi' ? 'en' : 'vi')}
                className="w-full text-left px-3 py-2.5 rounded-xl text-[15px] font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                aria-label="Toggle language"
              >
                {language === 'vi' ? '🇺🇸 EN' : '🇻🇳 VI'}
              </button>
              {IS_FIREBASE_CONFIGURED && user && (
                <button
                  onClick={() => void logout()}
                  className="w-full text-left px-3 py-2.5 rounded-xl text-[15px] font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors"
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
