import { useLanguage } from '../contexts/LanguageContext';
import SEO from '../components/SEO';
import { CHURCH_INFO, UI_CONSTANTS } from '../lib/constants';

export default function Contact() {
  const { t } = useLanguage();
  
  return (
    <div className="bg-gradient-to-b from-slate-50 to-white">
      <SEO 
        title={t('contact.title')} 
        description={t('contact.description')} 
      />
      {/* Hero Section */}
      <section className={`relative bg-gradient-to-br from-brand-600 via-brand-700 to-brand-800 text-white ${UI_CONSTANTS.SECTION_PADDING} overflow-hidden`}>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-20"></div>
        <div className="container-xl relative">
          <div className="max-w-3xl animate-fadeIn">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-5 py-2.5 mb-6">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
              </svg>
              <span className="font-bold">{t('contact.get_in_touch')}</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">{t('contact.title')}</h1>
            <p className="text-xl text-brand-100 leading-relaxed">{t('contact.description')}</p>
          </div>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className={`container-xl ${UI_CONSTANTS.SECTION_PADDING}`}>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {/* Address Card */}
          <div className="group bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 p-8 border-t-4 border-brand-600 hover:-translate-y-2 animate-fadeIn">
            <div className="w-14 h-14 bg-gradient-to-br from-brand-500 to-brand-700 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">{t('contact.address')}</h3>
            <p className="text-slate-600 leading-relaxed">{CHURCH_INFO.ADDRESS}</p>
          </div>

          {/* Phone Card */}
          <div className="group bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 p-8 border-t-4 border-green-600 hover:-translate-y-2 animate-fadeIn delay-100">
            <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-700 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">{t('contact.phone')}</h3>
            <a href={`tel:${CHURCH_INFO.PHONE}`} className="text-green-600 hover:underline font-bold text-lg">{CHURCH_INFO.PHONE}</a>
          </div>

          {/* Email Card */}
          <div className="group bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 p-8 border-t-4 border-blue-600 hover:-translate-y-2 animate-fadeIn delay-200">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">{t('contact.email')}</h3>
            <a href={`mailto:${CHURCH_INFO.EMAIL}`} className="text-blue-600 hover:underline font-semibold break-all">{CHURCH_INFO.EMAIL}</a>
          </div>

          {/* Mass Time Card */}
          <div className="group bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 p-8 border-t-4 border-purple-600 hover:-translate-y-2 animate-fadeIn delay-300">
            <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-700 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">{t('contact.mass')}</h3>
            <p className="text-slate-700 font-bold text-lg">{CHURCH_INFO.MASS_SCHEDULE_SHORT}</p>
          </div>
        </div>

        {/* Social Media and Map */}
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8">
          {/* Social Media */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h3 className="text-xl font-bold text-slate-900 mb-6">{t('contact.connect_with_us')}</h3>
            <div className="space-y-4">
              <a
                href={CHURCH_INFO.FACEBOOK_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-4 rounded-lg bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 transition-all duration-300 group"
              >
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Facebook</p>
                  <p className="text-sm text-slate-600">{CHURCH_INFO.FACEBOOK_DISPLAY}</p>
                </div>
              </a>

              <a
                href={`mailto:${CHURCH_INFO.EMAIL}`}
                className="flex items-center gap-4 p-4 rounded-lg bg-slate-50 hover:bg-red-50 border border-slate-200 hover:border-red-300 transition-all duration-300 group"
              >
                <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Email</p>
                  <p className="text-sm text-slate-600 break-all">{CHURCH_INFO.EMAIL}</p>
                </div>
              </a>
            </div>
          </div>

          {/* Map */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h3 className="text-xl font-bold text-slate-900 mb-4">{t('contact.find_us')}</h3>
            <div className="aspect-square bg-slate-100 rounded-lg overflow-hidden">
              <a
                href={CHURCH_INFO.MAPS_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full h-full items-center justify-center hover:bg-slate-200 transition-colors group"
              >
                <div className="text-center">
                  <svg className="w-16 h-16 text-brand-600 mx-auto mb-2 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <p className="text-slate-700 font-medium">{t('contact.open_map')}</p>
                </div>
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
