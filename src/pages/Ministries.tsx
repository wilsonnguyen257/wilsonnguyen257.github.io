import { useLanguage } from '../contexts/LanguageContext';
import PageHero from '../components/PageHero';

const ministries = [
  {
    key: 'family',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    color: 'blue',
  },
  {
    key: 'liturgy',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
    color: 'purple',
  },
  {
    key: 'music',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
      </svg>
    ),
    color: 'rose',
  },
  {
    key: 'charity',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
    color: 'emerald',
  },
  {
    key: 'youth',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
    color: 'amber',
  },
  {
    key: 'evangelization',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
      </svg>
    ),
    color: 'indigo',
  },
];

const colorClasses = {
  blue: {
    border: 'border-blue-600',
    bg: 'bg-blue-100',
    text: 'text-blue-600',
    hover: 'hover:border-blue-700',
  },
  purple: {
    border: 'border-purple-600',
    bg: 'bg-purple-100',
    text: 'text-purple-600',
    hover: 'hover:border-purple-700',
  },
  rose: {
    border: 'border-rose-600',
    bg: 'bg-rose-100',
    text: 'text-rose-600',
    hover: 'hover:border-rose-700',
  },
  emerald: {
    border: 'border-emerald-600',
    bg: 'bg-emerald-100',
    text: 'text-emerald-600',
    hover: 'hover:border-emerald-700',
  },
  amber: {
    border: 'border-amber-600',
    bg: 'bg-amber-100',
    text: 'text-amber-600',
    hover: 'hover:border-amber-700',
  },
  indigo: {
    border: 'border-indigo-600',
    bg: 'bg-indigo-100',
    text: 'text-indigo-600',
    hover: 'hover:border-indigo-700',
  },
};

export default function Ministries() {
  const { t } = useLanguage();
  
  return (
    <div className="bg-surface">
      <PageHero
        title={t('ministries.title')}
        subtitle={t('ministries.description')}
        badgeLabel={t('ministries.serving_together')}
        badgeIcon={
          <svg className="w-5 h-5 text-brand-100" fill="currentColor" viewBox="0 0 20 20">
            <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z"/>
          </svg>
        }
      />

      {/* Call to Service Section */}
      <section className="relative -mt-16 z-20 pb-12">
        <div className="container-xl">
          <div className="max-w-4xl mx-auto text-center">
            <div className="card !p-8 md:!p-10">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">{t('ministries.join_title')}</h2>
              <p className="text-lg text-slate-600 leading-relaxed">
                {t('ministries.join_desc')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Ministries Grid */}
      <section className="py-20">
        <div className="container-xl">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {ministries.map((ministry) => {
              const colors = colorClasses[ministry.color as keyof typeof colorClasses];
              return (
                <div
                  key={ministry.key}
                  className="group card !p-8"
                >
                  <div className={`w-14 h-14 rounded-full ${colors.bg} flex items-center justify-center mb-6 ${colors.text}`}>
                    {ministry.icon}
                  </div>
                  
                  <h3 className="text-xl font-semibold text-slate-900 mb-3">
                    {t(`ministries.${ministry.key}`)}
                  </h3>
                  
                  <p className="text-slate-600 leading-relaxed mb-6">
                    {t(`ministries.${ministry.key}_desc`)}
                  </p>

                  {/* Activities List */}
                  <div className="space-y-2 pt-6 border-t border-slate-50">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
                      {t('ministries.activities')}
                    </h4>
                    <ul className="space-y-3">
                      {[1, 2, 3].map((num) => (
                        <li key={num} className="flex items-start gap-3 text-sm text-slate-600 group/item">
                          <span className={`flex-shrink-0 mt-0.5 w-5 h-5 rounded-full ${colors.bg} flex items-center justify-center`}>
                            <svg className={`w-3 h-3 ${colors.text}`} fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                            </svg>
                          </span>
                          <span className="group-hover/item:text-slate-900 transition-colors">{t(`ministries.${ministry.key}_activity_${num}`)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Safeguarding Policy Section */}
      <section className="py-12 bg-slate-50 border-t border-slate-200">
        <div className="container-xl">
          <div className="card !p-8 md:!p-12 flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 rounded-full px-4 py-2 mb-4">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span className="font-medium">{t('ministries.safeguarding_title')}</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-semibold text-slate-900 mb-4">
                {t('ministries.safeguarding_heading')}
              </h2>
              <p className="text-lg text-slate-600 mb-6 leading-relaxed">
                {t('ministries.safeguarding_desc')}
              </p>
              <a 
                href="/documents/Safeguarding-and-Wellbeing-of-Children-and-Young-People-SWCYP-Policy-v2.0.pdf" 
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                {t('ministries.download_policy')}
              </a>
            </div>
            <div className="w-full md:w-1/3 flex justify-center">
              <a 
                href="/documents/Safeguarding-and-Wellbeing-of-Children-and-Young-People-SWCYP-Policy-v2.0.pdf" 
                target="_blank"
                rel="noopener noreferrer"
                className="relative w-48 h-64 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-center group cursor-pointer"
              >
                <svg className="w-20 h-20 text-slate-300 group-hover:text-brand-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/5 rounded-lg">
                  <span className="bg-white/90 px-3 py-1 rounded text-xs font-bold shadow-sm text-slate-700">PDF</span>
                </div>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Contact CTA Section */}
      <section className="py-24 bg-slate-900">
        <div className="container-xl text-center">
          <h2 className="text-3xl md:text-4xl font-semibold text-white mb-4 tracking-tight">{t('ministries.get_involved')}</h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            {t('ministries.get_involved_desc')}
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <a href="tel:0422-400-116" className="btn bg-white text-slate-900 hover:bg-slate-100">
              {t('ministries.call_us')}
            </a>
            <a href="mailto:anethanhvn@gmail.com" className="btn border border-white/20 text-white hover:bg-white/10">
              {t('ministries.email_us')}
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
