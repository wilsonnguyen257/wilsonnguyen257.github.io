
import { useLanguage } from '../contexts/LanguageContext';

export default function Give() {
  const { t } = useLanguage();

  return (
    <section className="container-xl py-12">
  <h1 className="h1 text-center">{t('give.title')}</h1>
      <p className="mt-3 p-muted max-w-prose mx-auto text-center">{t('give.subtitle')}</p>
      <div className="grid gap-6 mt-8 md:grid-cols-2">
        {/* Cash Donation Card */}
        <div className="card flex flex-col items-center">
          <div className="w-16 h-16 flex items-center justify-center rounded-full bg-brand-200 dark:bg-brand-900/40 mb-4">
            <span className="text-3xl">💰</span>
          </div>
          <h3 className="h2 mb-2">{t('give.cash_donation_title')}</h3>
          <p className="p-muted mb-3 text-center">{t('give.cash_description')}</p>
          <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 dark:text-slate-400 text-left w-full">
            <li>{t('give.sunday_mass')}</li>
            <li>{t('give.special_occasions')}</li>
            <li>{t('give.meet_committee')}</li>
          </ul>
        </div>
        {/* Contact Card */}
        <div className="card flex flex-col items-center">
          <div className="w-16 h-16 flex items-center justify-center rounded-full bg-brand-200 dark:bg-brand-900/40 mb-4">
            <span className="text-3xl">📞</span>
          </div>
          <h3 className="h2 mb-2">{t('give.contact_title')}</h3>
          <p className="p-muted mb-3 text-center">
            {t('give.contact_description')}
            <a
              href="tel:0422-400-116"
              className="text-brand-600 dark:text-brand-400 font-medium hover:underline ml-1"
            >
              0422-400-116
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
