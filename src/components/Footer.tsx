import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';

export default function Footer() {
  const { t } = useLanguage();
  
  return (
    <footer className="bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950 border-t-2 border-slate-200 dark:border-slate-800">
      <div className="container-xl py-16">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4 mb-12">
          {/* About Section */}
          <div className="animate-fadeIn">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 bg-gradient-to-br from-brand-500 to-brand-700 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-2xl">⛪</span>
              </div>
              <h3 className="font-bold text-xl text-slate-900 dark:text-white">St. Timothy</h3>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
              {t('footer.description')}
            </p>
            <div className="flex gap-3">
              <a 
                href="https://www.facebook.com/sttimvn" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-11 h-11 rounded-xl bg-slate-200 dark:bg-slate-800 flex items-center justify-center hover:bg-brand-600 hover:text-white transition-all duration-300 hover:scale-110 hover:shadow-lg"
                aria-label="Facebook"
              >
                <span className="text-xl">📱</span>
              </a>
              <a 
                href="mailto:sttimvn2013@gmail.com"
                className="w-11 h-11 rounded-xl bg-slate-200 dark:bg-slate-800 flex items-center justify-center hover:bg-brand-600 hover:text-white transition-all duration-300 hover:scale-110 hover:shadow-lg"
                aria-label="Email"
              >
                <span className="text-xl">📧</span>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="animate-fadeIn delay-100">
            <h3 className="font-bold text-sm uppercase tracking-wider text-slate-900 dark:text-white mb-5 flex items-center gap-2">
              <div className="w-1 h-6 bg-brand-600 rounded-full"></div>
              {t('footer.quick_links')}
            </h3>
            <ul className="space-y-3">
              <li>
                <Link to="/about" className="text-sm text-slate-600 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors inline-flex items-center gap-2 group">
                  <span className="w-1.5 h-1.5 bg-brand-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  {t('footer.about')}
                </Link>
              </li>
              <li>
                <Link to="/events" className="text-sm text-slate-600 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors inline-flex items-center gap-2 group">
                  <span className="w-1.5 h-1.5 bg-brand-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  {t('nav.events')}
                </Link>
              </li>
              <li>
                <Link to="/ministries" className="text-sm text-slate-600 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors inline-flex items-center gap-2 group">
                  <span className="w-1.5 h-1.5 bg-brand-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  {t('nav.ministries')}
                </Link>
              </li>
              <li>
                <Link to="/reflections" className="text-sm text-slate-600 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors inline-flex items-center gap-2 group">
                  <span className="w-1.5 h-1.5 bg-brand-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  {t('nav.reflections')}
                </Link>
              </li>
              <li>
                <Link to="/gallery" className="text-sm text-slate-600 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors inline-flex items-center gap-2 group">
                  <span className="w-1.5 h-1.5 bg-brand-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  {t('nav.gallery')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="animate-fadeIn delay-200">
            <h3 className="font-bold text-sm uppercase tracking-wider text-slate-900 dark:text-white mb-5 flex items-center gap-2">
              <div className="w-1 h-6 bg-brand-600 rounded-full"></div>
              {t('footer.contact_us')}
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-400 group">
                <span className="text-lg group-hover:scale-110 transition-transform">📍</span>
                <span>17 Stevens Rd, Vermont VIC 3133</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-400 group">
                <span className="text-lg group-hover:scale-110 transition-transform">📞</span>
                <a href="tel:0422-400-116" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors font-medium">
                  0422-400-116
                </a>
              </li>
              <li className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-400 group">
                <span className="text-lg group-hover:scale-110 transition-transform">📧</span>
                <a href="mailto:sttimvn2013@gmail.com" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors break-all font-medium">
                  sttimvn2013@gmail.com
                </a>
              </li>
            </ul>
          </div>

          {/* Mass Times */}
          <div className="animate-fadeIn delay-300">
            <h3 className="font-bold text-sm uppercase tracking-wider text-slate-900 dark:text-white mb-5 flex items-center gap-2">
              <div className="w-1 h-6 bg-brand-600 rounded-full"></div>
              {t('footer.mass_times')}
            </h3>
            <ul className="space-y-4">
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
        <div className="pt-8 border-t-2 border-slate-200 dark:border-slate-800">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-slate-600 dark:text-slate-400 text-center md:text-left font-medium">
              © {new Date().getFullYear()} {t('footer.copyright')}
            </p>
            <div className="flex gap-6 text-sm">
              <Link to="/contact" className="text-slate-600 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition-all duration-200 font-medium hover:scale-105">
                {t('footer.contact')}
              </Link>
              <Link to="/give" className="text-slate-600 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition-all duration-200 font-medium hover:scale-105">
                {t('nav.give')}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Back to Top Button */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-8 right-8 w-14 h-14 bg-gradient-to-br from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 text-white rounded-2xl shadow-2xl hover:shadow-brand-600/50 transition-all duration-300 flex items-center justify-center group z-40 hover:scale-110 border-2 border-white dark:border-slate-900"
        aria-label="Back to top"
      >
        <svg className="w-6 h-6 group-hover:-translate-y-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
      </button>
    </footer>
  );
}
