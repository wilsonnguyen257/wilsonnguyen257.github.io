import { useLanguage } from '../contexts/LanguageContext';
import SEO from '../components/SEO';
import PageHero from '../components/PageHero';
import { CHURCH_INFO, UI_CONSTANTS } from '../lib/constants';

export default function Contact() {
  const { t } = useLanguage();
  
  return (
    <div className="bg-white">
      <SEO
        title={t('contact.title')}
        description={t('contact.description')}
      />
      <PageHero
        title={t('contact.title')}
        subtitle={t('contact.description')}
        badgeLabel={t('contact.get_in_touch')}
        align="left"
        badgeIcon={
          <svg className="w-5 h-5 text-brand-100" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
            <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
          </svg>
        }
      />

      {/* Contact Info Cards */}
      <section className={`container-xl ${UI_CONSTANTS.SECTION_PADDING}`}>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {/* Address Card */}
          <div className="card">
            <div className="w-12 h-12 rounded-full bg-brand-50 flex items-center justify-center mb-5 text-brand-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="text-base font-semibold text-slate-900 mb-2">{t('contact.address')}</h3>
            <p className="text-sm text-slate-500 leading-relaxed">{CHURCH_INFO.ADDRESS}</p>
          </div>

          {/* Phone Card */}
          <div className="card">
            <div className="w-12 h-12 rounded-full bg-brand-50 flex items-center justify-center mb-5 text-brand-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
            <h3 className="text-base font-semibold text-slate-900 mb-2">{t('contact.phone')}</h3>
            <a href={`tel:${CHURCH_INFO.PHONE}`} className="text-brand-600 hover:underline font-semibold">{CHURCH_INFO.PHONE}</a>
          </div>

          {/* Email Card */}
          <div className="card">
            <div className="w-12 h-12 rounded-full bg-brand-50 flex items-center justify-center mb-5 text-brand-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-base font-semibold text-slate-900 mb-2">{t('contact.email')}</h3>
            <a href={`mailto:${CHURCH_INFO.EMAIL}`} className="text-brand-600 hover:underline font-semibold break-all">{CHURCH_INFO.EMAIL}</a>
          </div>

          {/* Mass Time Card */}
          <div className="card">
            <div className="w-12 h-12 rounded-full bg-brand-50 flex items-center justify-center mb-5 text-brand-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-base font-semibold text-slate-900 mb-2">{t('contact.mass')}</h3>
            <p className="text-slate-900 font-semibold">{CHURCH_INFO.MASS_SCHEDULE_SHORT}</p>
          </div>
        </div>

        {/* Social Media and Map */}
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-6">
          {/* Social Media */}
          <div className="card">
            <h3 className="text-lg font-semibold text-slate-900 mb-5">{t('contact.connect_with_us')}</h3>
            <div className="space-y-1">
              <a
                href={CHURCH_INFO.FACEBOOK_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 py-4 border-t border-slate-100"
              >
                <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-500 shrink-0">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-slate-900 text-sm">Facebook</p>
                  <p className="text-sm text-slate-500">{CHURCH_INFO.FACEBOOK_DISPLAY}</p>
                </div>
              </a>

              <a
                href={`mailto:${CHURCH_INFO.EMAIL}`}
                className="flex items-center gap-4 py-4 border-t border-b border-slate-100"
              >
                <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-500 shrink-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-slate-900 text-sm">Email</p>
                  <p className="text-sm text-slate-500 break-all">{CHURCH_INFO.EMAIL}</p>
                </div>
              </a>
            </div>
          </div>

          {/* Map */}
          <div className="card !p-0 overflow-hidden">
            <h3 className="text-lg font-semibold text-slate-900 px-8 pt-8">{t('contact.find_us')}</h3>
            <div className="aspect-square bg-slate-50 mt-5">
              <a
                href={CHURCH_INFO.MAPS_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full h-full items-center justify-center hover:bg-slate-100 transition-colors"
              >
                <div className="text-center">
                  <svg className="w-12 h-12 text-brand-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <p className="text-slate-600 font-medium text-sm">{t('contact.open_map')}</p>
                </div>
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
