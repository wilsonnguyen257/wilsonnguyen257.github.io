import { useEffect, useState } from "react";
import { NavLink, Link } from "react-router-dom";
import { useLanguage } from "../contexts/LanguageContext";
import { IS_FIREBASE_CONFIGURED, onAuthStateChanged, logout, type User } from "../lib/firebase";
import logo from "../assets/logo.png";

// Primary nav, per the Ba cửa (1d) direction: Giờ lễ is answered by the
// homepage hero (this Sunday's date, time and place), not a separate nav
// item, and "Sự kiện" (Events) leads with that same answer on its own page.
// About and Gallery are back in the primary bar (previously footer-only) —
// Giới thiệu leads as the newcomer's orientation link, Thư viện ảnh sits near
// the end since photos are supplementary to the core parish-business items.
const links = [
  { to: "/about", key: "nav.about" },
  { to: "/events", key: "nav.events" },
  { to: "/reflections", key: "nav.reflections" },
  { to: "/ministries", key: "nav.ministries" },
  { to: "/gallery", key: "nav.gallery" },
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

  // nav-link-active is a paper pill against the neutral header — per
  // DESIGN.md it's allowed to be rounded-full because it functions as a
  // status indicator (which link is current), not a button reverting to
  // the old pill-everything treatment.
  const navItem = (to: string, key: string) => (
    <NavLink
      key={to}
      to={to}
      className={({ isActive }) =>
        `rounded-full px-3.5 py-2 text-[15px] font-sans font-semibold transition-colors duration-200 ${
          isActive
            ? "bg-surface text-brand-600"
            : "text-slate-700 hover:text-slate-900"
        }`
      }
      onClick={() => setOpen(false)}
    >
      {t(key)}
    </NavLink>
  );

  // Two labelled segments, the current one marked — readable at a glance
  // without knowing what "VI | EN" means.
  const languageToggle = (className: string) => (
    <div role="group" aria-label={t('nav.language')} className={`inline-flex rounded-lg border border-slate-300 p-0.5 ${className}`}>
      {(['vi', 'en'] as const).map((lang) => (
        <button
          key={lang}
          type="button"
          lang={lang}
          aria-pressed={language === lang}
          onClick={() => setLanguage(lang)}
          className={`rounded-md px-2.5 py-1.5 text-sm font-semibold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 ${
            language === lang ? "bg-brand-600 text-surface" : "text-slate-700 hover:text-brand-600"
          }`}
        >
          {lang === 'vi' ? 'Tiếng Việt' : 'English'}
        </button>
      ))}
    </div>
  );

  return (
    // Nothing is sticky — the header scrolls away with the page — and it's
    // a flat --color-neutral fill: no transparency or backdrop blur
    // anywhere in this system except the lightbox scrim.
    <header className="border-b border-slate-200 bg-slate-100">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-surface focus:px-4 focus:py-2 focus:font-semibold focus:text-brand-600 focus:ring-2 focus:ring-brand-600"
      >
        {t('common.skip_to_content')}
      </a>
      <div className="container-xl flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 h-full group">
          <img src={logo} alt="" className="h-9 w-9 rounded-full object-cover" />
          <span className="font-serif font-bold text-slate-900 text-[19px]">Anê Thành</span>
          <span className="sr-only">{t('nav.logo_alt')}</span>
        </Link>

        <nav className="hidden items-center gap-0.5 xl:flex">
          {links.map((link) => navItem(link.to, link.key))}

          {/* Admin link (only shown when user is signed in) */}
          {IS_FIREBASE_CONFIGURED && user && (
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                `rounded-full px-3.5 py-2 text-[15px] font-semibold transition-colors duration-200 ${
                  isActive ? "bg-surface text-brand-600" : "text-slate-700 hover:text-slate-900"
                }`
              }
            >
              Admin
            </NavLink>
          )}

          <div className="ml-3 pl-3 border-l border-slate-200">
            {languageToggle('')}
          </div>

          {/* Sign out button (only shown when user is signed in) */}
          {IS_FIREBASE_CONFIGURED && user && (
            <button
              onClick={() => void logout()}
              className="rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 transition-colors duration-200 hover:text-red-600"
            >
              {t('nav.sign_out')}
            </button>
          )}

          {/* Give — the one accent (Dusty Lavender) button on the site, and only ever this one. */}
          <NavLink
            to="/give"
            className="btn-give ml-3 rounded-xl px-5 py-2 text-sm font-semibold"
            onClick={() => setOpen(false)}
          >
            {t('nav.give')}
          </NavLink>
        </nav>

        {/* Below xl, Give stays visible beside the menu button rather than
            hiding inside the menu. */}
        <div className="xl:hidden ml-auto mr-2">
          <NavLink to="/give" className="btn-give inline-flex items-center rounded-xl px-4 min-h-11 text-sm font-semibold">
            {t('nav.give')}
          </NavLink>
        </div>
        <button
          className="xl:hidden rounded-xl p-2.5 min-w-[44px] min-h-[44px] hover:bg-slate-100 transition-colors duration-200"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? t('nav.close_menu') : t('nav.open_menu')}
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
          className="xl:hidden border-t border-slate-200 bg-surface animate-fade"
        >
          <div className="container-xl flex flex-col gap-1 py-4">
            {/* Language first: someone who can't read the current one needs it before anything else. */}
            <div className="px-3 pb-2 mb-1 border-b border-slate-100">{languageToggle('')}</div>
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                className={({ isActive }) =>
                  `rounded-xl px-3 py-2.5 text-[15px] font-semibold ${
                    isActive ? "bg-slate-100 text-brand-600" : "text-slate-600 hover:bg-slate-100"
                  }`
                }
                onClick={() => setOpen(false)}
              >
                {t(l.key)}
              </NavLink>
            ))}

            <NavLink
              to="/give"
              className="btn-give rounded-xl px-3 py-2.5 text-[15px] font-semibold text-center mt-1"
              onClick={() => setOpen(false)}
            >
              {t('nav.give')}
            </NavLink>

            {/* Admin link for mobile (only shown when user is signed in) */}
            {IS_FIREBASE_CONFIGURED && user && (
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  `rounded-xl px-3 py-2.5 text-[15px] font-semibold ${
                    isActive ? "bg-slate-100 text-slate-900 font-semibold" : "text-slate-600 hover:bg-slate-100"
                  }`
                }
                onClick={() => setOpen(false)}
              >
                Admin
              </NavLink>
            )}

            <div className="mt-2 pt-2 border-t border-slate-100 space-y-1">
              {IS_FIREBASE_CONFIGURED && user && (
                <button
                  onClick={() => void logout()}
                  className="w-full text-left px-3 py-2.5 rounded-xl text-[15px] font-semibold text-slate-700 hover:bg-red-50 hover:text-red-700 transition-colors"
                >
                  {t('nav.sign_out')}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
