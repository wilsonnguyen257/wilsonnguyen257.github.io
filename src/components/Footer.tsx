import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { CHURCH_INFO } from '../lib/constants';

export default function Footer() {
  const { t, language } = useLanguage();
  
  return (
    <footer className="bg-gradient-to-b from-slate-50 to-slate-100 border-t-2 border-slate-200">
      <div className="container-xl py-16">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4 mb-12">
          {/* About Section */}
          <div className="animate-fadeIn">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 bg-gradient-to-br from-brand-500 to-brand-700 rounded-xl flex items-center justify-center shadow-lg text-white">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" />
                </svg>
              </div>
              <h3 className="font-bold text-xl text-slate-900 font-serif">Anê Thành</h3>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed mb-6">
              {t('footer.description')}
            </p>
            <div className="flex gap-3">
              <a 
                href="https://www.facebook.com/sttimvn" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-11 h-11 rounded-xl bg-slate-200 flex items-center justify-center hover:bg-brand-600 hover:text-white transition-all duration-300 hover:scale-110 hover:shadow-lg text-slate-600"
                aria-label="Facebook"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="w-5 h-5">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a
                href="mailto:anethanhvn@gmail.com"
                className="w-11 h-11 rounded-xl bg-slate-200 flex items-center justify-center hover:bg-brand-600 hover:text-white transition-all duration-300 hover:scale-110 hover:shadow-lg text-slate-600"
                aria-label="Email"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="animate-fadeIn delay-100">
            <h3 className="font-bold text-sm uppercase tracking-wider text-slate-900 mb-5 flex items-center gap-2">
              <div className="w-1 h-6 bg-brand-600 rounded-full"></div>
              {t('footer.quick_links')}
            </h3>
            <ul className="space-y-3">
              <li>
                <Link to="/about" className="text-sm text-slate-600 hover:text-brand-600 transition-colors inline-flex items-center gap-2 group">
                  <span className="w-1.5 h-1.5 bg-brand-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  {t('footer.about')}
                </Link>
              </li>
              <li>
                <Link to="/events" className="text-sm text-slate-600 hover:text-brand-600 transition-colors inline-flex items-center gap-2 group">
                  <span className="w-1.5 h-1.5 bg-brand-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  {t('nav.events')}
                </Link>
              </li>
              <li>
                <Link to="/ministries" className="text-sm text-slate-600 hover:text-brand-600 transition-colors inline-flex items-center gap-2 group">
                  <span className="w-1.5 h-1.5 bg-brand-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  {t('nav.ministries')}
                </Link>
              </li>
              <li>
                <Link to="/reflections" className="text-sm text-slate-600 hover:text-brand-600 transition-colors inline-flex items-center gap-2 group">
                  <span className="w-1.5 h-1.5 bg-brand-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  {t('nav.reflections')}
                </Link>
              </li>
              <li>
                <Link to="/gallery" className="text-sm text-slate-600 hover:text-brand-600 transition-colors inline-flex items-center gap-2 group">
                  <span className="w-1.5 h-1.5 bg-brand-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  {t('nav.gallery')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="animate-fadeIn delay-200">
            <h3 className="font-bold text-sm uppercase tracking-wider text-slate-900 mb-5 flex items-center gap-2">
              <div className="w-1 h-6 bg-brand-600 rounded-full"></div>
              {t('footer.contact_us')}
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-sm text-slate-600 group">
                <span className="group-hover:scale-110 transition-transform text-brand-600">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                  </svg>
                </span>
                <span>{CHURCH_INFO.ADDRESS}</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-slate-600 group">
                <span className="group-hover:scale-110 transition-transform text-brand-600">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                  </svg>
                </span>
                <a href={`tel:${CHURCH_INFO.PHONE}`} className="hover:text-brand-600 transition-colors font-medium">
                  {CHURCH_INFO.PHONE}
                </a>
              </li>
              <li className="flex items-start gap-3 text-sm text-slate-600 group">
                <span className="group-hover:scale-110 transition-transform text-brand-600">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                  </svg>
                </span>
                <a href={`mailto:${CHURCH_INFO.EMAIL}`} className="hover:text-brand-600 transition-colors break-all font-medium">
                  {CHURCH_INFO.EMAIL}
                </a>
              </li>
            </ul>
          </div>

          {/* Mass Times */}
          <div className="animate-fadeIn delay-300">
            <h3 className="font-bold text-sm uppercase tracking-wider text-slate-900 mb-5 flex items-center gap-2">
              <div className="w-1 h-6 bg-brand-600 rounded-full"></div>
              {t('footer.mass_times')}
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-2 text-sm text-slate-600">
                <span className="text-brand-600">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" />
                  </svg>
                </span>
                <div>
                  <p className="font-semibold text-slate-900">{t('home.sunday')}</p>
                  <p>{CHURCH_INFO.MASS_TIME[language]}</p>
                </div>
              </li>
              <li className="flex items-start gap-2 text-sm text-slate-600">
                <span className="text-brand-600">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
                  </svg>
                </span>
                <div>
                  <p className="font-semibold text-slate-900">{t('home.confession')}</p>
                  <p>{CHURCH_INFO.CONFESSION_TIME[language]}</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t-2 border-slate-200">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-slate-600 text-center md:text-left font-medium">
              © {new Date().getFullYear()} {t('footer.copyright')}
            </p>
            <div className="flex gap-6 text-sm">
              <Link to="/contact" className="text-slate-600 hover:text-brand-600 transition-all duration-200 font-medium hover:scale-105">
                {t('footer.contact')}
              </Link>
              <Link to="/give" className="text-slate-600 hover:text-brand-600 transition-all duration-200 font-medium hover:scale-105">
                {t('nav.give')}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Back to Top Button */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-8 right-8 w-14 h-14 bg-gradient-to-br from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 text-white rounded-2xl shadow-2xl hover:shadow-brand-600/50 transition-all duration-300 flex items-center justify-center group z-40 hover:scale-110 border-2 border-white"
        aria-label="Back to top"
      >
        <svg className="w-6 h-6 group-hover:-translate-y-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
      </button>
    </footer>
  );
}
