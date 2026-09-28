import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { CHURCH_INFO } from '../lib/constants';
import logo from '../assets/logo.png';

export default function Footer() {
  const { t, language } = useLanguage();

  // Back-to-top only appears once there's somewhere to go back to.
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 600);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <footer className="bg-slate-100 border-t border-slate-200">
      <h2 className="sr-only">{t('footer.heading')}</h2>
      <div className="container-xl py-16">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4 mb-12">
          {/* About Section */}
          <div>
            <div className="flex items-center gap-3 mb-5">
              <img src={logo} alt="" className="w-10 h-10 rounded-full object-cover" />
              <p className="font-serif font-bold text-lg text-slate-900">Anê Thành</p>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed mb-6">
              {t('footer.description')}
            </p>
            <div className="flex gap-2">
              <a
                href="https://www.facebook.com/anethanhvn"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-surface border border-slate-200 flex items-center justify-center text-slate-600 hover:text-brand-600 hover:border-brand-200 transition-colors"
                aria-label="Facebook"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="w-4 h-4">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a
                href="mailto:anethanhvn@gmail.com"
                className="w-9 h-9 rounded-full bg-surface border border-slate-200 flex items-center justify-center text-slate-600 hover:text-brand-600 hover:border-brand-200 transition-colors"
                aria-label="Email"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-sm text-slate-900 mb-4">
              {t('footer.quick_links')}
            </h3>
            <ul className="space-y-3">
              <li><Link to="/about" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">{t('footer.about')}</Link></li>
              <li><Link to="/events" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">{t('nav.events')}</Link></li>
              <li><Link to="/ministries" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">{t('nav.ministries')}</Link></li>
              <li><Link to="/reflections" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">{t('nav.reflections')}</Link></li>
              <li><Link to="/gallery" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">{t('nav.gallery')}</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-semibold text-sm text-slate-900 mb-4">
              {t('footer.contact_us')}
            </h3>
            <ul className="space-y-3">
              <li className="text-sm leading-relaxed">
                <a href={CHURCH_INFO.MAPS_LINK} target="_blank" rel="noopener noreferrer" className="text-slate-600 hover:text-slate-900 transition-colors">
                  {CHURCH_INFO.ADDRESS}
                </a>
              </li>
              <li>
                <a href={`tel:${CHURCH_INFO.PHONE}`} className="text-sm text-slate-600 hover:text-slate-900 transition-colors">
                  {CHURCH_INFO.PHONE_DISPLAY}
                </a>
              </li>
              <li>
                <a href={`mailto:${CHURCH_INFO.EMAIL}`} className="text-sm text-slate-600 hover:text-slate-900 transition-colors break-all">
                  {CHURCH_INFO.EMAIL}
                </a>
              </li>
            </ul>
          </div>

          {/* Mass Times */}
          <div>
            <h3 className="font-semibold text-sm text-slate-900 mb-4">
              {t('footer.mass_times')}
            </h3>
            <ul className="space-y-4">
              <li className="text-sm">
                <p className="font-semibold text-slate-900">{t('home.sunday')}</p>
                <p className="text-slate-600 nums-lining">{CHURCH_INFO.MASS_RANGE[language]}</p>
              </li>
              <li className="text-sm">
                <p className="font-semibold text-slate-900">{t('home.confession')}</p>
                <p className="text-slate-600">{CHURCH_INFO.CONFESSION_TIME[language]}</p>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-200">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-slate-600 text-center md:text-left">
              © {new Date().getFullYear()} {t('footer.copyright')}
            </p>
            <div className="flex gap-6 text-sm">
              <Link to="/contact" className="text-slate-600 hover:text-slate-900 transition-colors">
                {t('footer.contact')}
              </Link>
              <Link to="/give" className="text-slate-600 hover:text-slate-900 transition-colors">
                {t('nav.give')}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Back to Top Button */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className={`fixed bottom-6 right-6 sm:bottom-8 sm:right-8 z-40 w-11 h-11 bg-slate-100 border border-slate-200 text-slate-600 rounded-full shadow-[0_2px_6px_rgba(2,2,2,0.14),0_12px_32px_rgba(2,2,2,0.10)] hover:text-brand-600 flex items-center justify-center transition-[opacity,color] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 ${scrolled ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        tabIndex={scrolled ? 0 : -1}
        aria-hidden={!scrolled}
        aria-label={t('footer.back_to_top')}
      >
        <svg aria-hidden="true" className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
      </button>
    </footer>
  );
}
