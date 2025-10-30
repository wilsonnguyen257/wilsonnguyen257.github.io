import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';

export default function Footer() {
  const { t } = useLanguage();
  
  return (
    <footer className="bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950 border-t border-slate-200 dark:border-slate-800">
      <div className="container-xl py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 mb-8">
          {/* About Section */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">⛪</span>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">St. Timothy</h3>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
              {t('footer.description')}
            </p>
            <div className="flex gap-3">
              <a 
                href="https://www.facebook.com/sttimvn" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg bg-slate-200 dark:bg-slate-800 flex items-center justify-center hover:bg-brand-600 hover:text-white transition-colors"
                aria-label="Facebook"
              >
                <span className="text-xl">📱</span>
              </a>
              <a 
                href="mailto:sttimvn2013@gmail.com"
                className="w-10 h-10 rounded-lg bg-slate-200 dark:bg-slate-800 flex items-center justify-center hover:bg-brand-600 hover:text-white transition-colors"
                aria-label="Email"
              >
                <span className="text-xl">📧</span>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-sm uppercase tracking-wider text-slate-900 dark:text-white mb-4">
              {t('footer.quick_links')}
            </h3>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="text-sm text-slate-600 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                  {t('footer.about')}
                </Link>
              </li>
              <li>
                <Link to="/events" className="text-sm text-slate-600 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                  {t('nav.events')}
                </Link>
              </li>
              <li>
                <Link to="/ministries" className="text-sm text-slate-600 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                  {t('nav.ministries')}
                </Link>
              </li>
              <li>
                <Link to="/reflections" className="text-sm text-slate-600 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                  {t('nav.reflections')}
                </Link>
              </li>
              <li>
                <Link to="/gallery" className="text-sm text-slate-600 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                  {t('nav.gallery')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-bold text-sm uppercase tracking-wider text-slate-900 dark:text-white mb-4">
              {t('footer.contact_us')}
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                <span className="text-lg">📍</span>
                <span>17 Stevens Rd, Vermont VIC 3133</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                <span className="text-lg">📞</span>
                <a href="tel:0422-400-116" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                  0422-400-116
                </a>
              </li>
              <li className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                <span className="text-lg">📧</span>
                <a href="mailto:sttimvn2013@gmail.com" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors break-all">
                  sttimvn2013@gmail.com
                </a>
              </li>
            </ul>
          </div>

          {/* Mass Times */}
          <div>
            <h3 className="font-bold text-sm uppercase tracking-wider text-slate-900 dark:text-white mb-4">
              {t('footer.mass_times')}
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                <span className="text-lg">⛪</span>
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">{t('home.sunday')}</p>
                  <p>{t('home.sunday_time')}</p>
                </div>
              </li>
              <li className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                <span className="text-lg">🙏</span>
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">{t('home.confession')}</p>
                  <p>{t('home.confession_time')}</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-200 dark:border-slate-800">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-slate-600 dark:text-slate-400 text-center md:text-left">
              © {new Date().getFullYear()} {t('footer.copyright')}
            </p>
            <div className="flex gap-6 text-sm">
              <Link to="/contact" className="text-slate-600 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                {t('footer.contact')}
              </Link>
              <Link to="/give" className="text-slate-600 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                {t('nav.give')}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Back to Top Button */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-8 right-8 w-12 h-12 bg-brand-600 hover:bg-brand-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group"
        aria-label="Back to top"
      >
        <svg className="w-6 h-6 group-hover:-translate-y-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
      </button>
    </footer>
  );
}
