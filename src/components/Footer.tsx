import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { CHURCH_INFO } from '../lib/constants';

export default function Footer() {
  const { t, language } = useLanguage();

  return (
    <footer className="bg-surface border-t border-slate-200">
      <div className="container-xl py-16">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4 mb-12">
          {/* About Section */}
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-full bg-white border border-slate-200 flex items-center justify-center text-brand-600">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" />
                </svg>
              </div>
              <h3 className="font-semibold text-lg text-slate-900">Anê Thành</h3>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed mb-6">
              {t('footer.description')}
            </p>
            <div className="flex gap-2">
              <a
                href="https://www.facebook.com/anethanhvn"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-brand-600 hover:border-brand-200 transition-colors"
                aria-label="Facebook"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="w-4 h-4">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a
                href="mailto:anethanhvn@gmail.com"
                className="w-9 h-9 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-brand-600 hover:border-brand-200 transition-colors"
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
              <li><Link to="/about" className="text-sm text-slate-500 hover:text-slate-900 transition-colors">{t('footer.about')}</Link></li>
              <li><Link to="/events" className="text-sm text-slate-500 hover:text-slate-900 transition-colors">{t('nav.events')}</Link></li>
              <li><Link to="/ministries" className="text-sm text-slate-500 hover:text-slate-900 transition-colors">{t('nav.ministries')}</Link></li>
              <li><Link to="/reflections" className="text-sm text-slate-500 hover:text-slate-900 transition-colors">{t('nav.reflections')}</Link></li>
              <li><Link to="/gallery" className="text-sm text-slate-500 hover:text-slate-900 transition-colors">{t('nav.gallery')}</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-semibold text-sm text-slate-900 mb-4">
              {t('footer.contact_us')}
            </h3>
            <ul className="space-y-3">
              <li className="text-sm text-slate-500 leading-relaxed">{CHURCH_INFO.ADDRESS}</li>
              <li>
                <a href={`tel:${CHURCH_INFO.PHONE}`} className="text-sm text-slate-500 hover:text-slate-900 transition-colors">
                  {CHURCH_INFO.PHONE}
                </a>
              </li>
              <li>
                <a href={`mailto:${CHURCH_INFO.EMAIL}`} className="text-sm text-slate-500 hover:text-slate-900 transition-colors break-all">
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
                <p className="font-medium text-slate-900">{t('home.sunday')}</p>
                <p className="text-slate-500">{CHURCH_INFO.MASS_TIME[language]}</p>
              </li>
              <li className="text-sm">
                <p className="font-medium text-slate-900">{t('home.confession')}</p>
                <p className="text-slate-500">{CHURCH_INFO.CONFESSION_TIME[language]}</p>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-200">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-slate-500 text-center md:text-left">
              © {new Date().getFullYear()} {t('footer.copyright')}
            </p>
            <div className="flex gap-6 text-sm">
              <Link to="/contact" className="text-slate-500 hover:text-slate-900 transition-colors">
                {t('footer.contact')}
              </Link>
              <Link to="/give" className="text-slate-500 hover:text-slate-900 transition-colors">
                {t('nav.give')}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Back to Top Button */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-8 right-8 w-11 h-11 bg-white border border-slate-200 text-slate-500 rounded-full shadow-sm hover:shadow-md hover:text-slate-900 transition-all duration-200 flex items-center justify-center z-40"
        aria-label="Back to top"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
      </button>
    </footer>
  );
}
