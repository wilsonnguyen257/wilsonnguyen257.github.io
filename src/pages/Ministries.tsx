import { useLanguage } from '../contexts/LanguageContext';

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
    <div className="bg-slate-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-brand-600 to-brand-800 text-white py-20">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30"></div>
        <div className="container-xl relative">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z"/>
              </svg>
              <span className="font-medium">{t('ministries.serving_together')}</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{t('ministries.title')}</h1>
            <p className="text-xl text-white/90 leading-relaxed">{t('ministries.description')}</p>
          </div>
        </div>
      </section>

      {/* Call to Service Section */}
      <section className="py-12 bg-white">
        <div className="container-xl">
          <div className="max-w-4xl mx-auto text-center">
            <div className="bg-gradient-to-br from-slate-50 to-white rounded-2xl shadow-xl p-8 border-l-4 border-brand-600">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">{t('ministries.join_title')}</h2>
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
                  className={`group bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8 border-t-4 ${colors.border} ${colors.hover}`}
                >
                  <div className={`w-16 h-16 ${colors.bg} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform ${colors.text}`}>
                    {ministry.icon}
                  </div>
                  
                  <h3 className="text-2xl font-bold text-slate-900 mb-4">
                    {t(`ministries.${ministry.key}`)}
                  </h3>
                  
                  <p className="text-slate-600 leading-relaxed mb-6">
                    {t(`ministries.${ministry.key}_desc`)}
                  </p>

                  {/* Activities List */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-3">
                      {t('ministries.activities')}
                    </h4>
                    <ul className="space-y-2">
                      {[1, 2, 3].map((num) => (
                        <li key={num} className="flex items-start gap-2 text-sm text-slate-600">
                          <svg className={`w-5 h-5 flex-shrink-0 mt-0.5 ${colors.text}`} fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                          </svg>
                          <span>{t(`ministries.${ministry.key}_activity_${num}`)}</span>
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

      {/* Contact CTA Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-600 to-brand-800"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30"></div>
        <div className="container-xl relative text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{t('ministries.get_involved')}</h2>
          <p className="text-xl text-white/90 max-w-2xl mx-auto mb-8 leading-relaxed">
            {t('ministries.get_involved_desc')}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a 
              href="tel:0422-400-116" 
              className="group inline-flex items-center gap-2 px-8 py-3 bg-white text-brand-700 font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
            >
              <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              {t('ministries.call_us')}
            </a>
            <a 
              href="mailto:sttimvn2013@gmail.com" 
              className="group inline-flex items-center gap-2 px-8 py-3 bg-transparent border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-brand-700 transition-all duration-300 transform hover:-translate-y-0.5"
            >
              <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              {t('ministries.email_us')}
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
