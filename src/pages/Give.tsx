import { useLanguage } from '../contexts/LanguageContext';

export default function Give() {
  const { t } = useLanguage();
  
  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      {/* Hero Section */}
      <section className="bg-brand-50 dark:bg-slate-800 py-16">
        <div className="container-xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-center text-gray-900 dark:text-white mb-8">
            {t('give.title')}
          </h1>
          <p className="mt-6 max-w-3xl mx-auto text-center text-lg text-gray-600 dark:text-slate-300">
            {t('give.subtitle')}
          </p>
        </div>
      </section>

      {/* Donation Methods */}
      <section className="py-16 bg-white dark:bg-slate-900">
        <div className="container-xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto grid gap-8 md:grid-cols-2"> 
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-slate-700">
              <div className="mb-4">
                <div className="inline-block bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 rounded-full px-4 py-2 text-sm font-medium">
                  💰 {t('give.cash_donation')}
                </div>
              </div>
              <h3 className="text-xl font-semibold text-brand-600 dark:text-brand-400 mb-4">
                {t('give.cash_donation_title')}
              </h3>
              <div className="space-y-3">
                <p className="text-gray-600 dark:text-slate-300">
                  {t('give.cash_description')}
                </p>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 dark:text-slate-300">
                  <li>{t('give.sunday_mass')}</li>
                  <li>{t('give.special_occasions')}</li>
                  <li>{t('give.meet_committee')}</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="mt-12 text-center">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-slate-700 max-w-2xl mx-auto">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                📞 {t('give.contact_title')}
              </h3>
              <p className="text-gray-600 dark:text-slate-300">
                {t('give.contact_description')}
                <a 
                  href="tel:0422-400-116" 
                  className="text-brand-600 dark:text-brand-400 font-medium hover:underline"
                >
                  {' '}0422-400-116
                </a>
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
