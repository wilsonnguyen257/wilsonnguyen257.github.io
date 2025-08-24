import { useLanguage } from '../contexts/LanguageContext';

export default function Give() {
  const { t } = useLanguage();
  
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      {/* Hero Section */}
      <section className="bg-brand-50 dark:bg-slate-800 py-16">
        <div className="container-xl">
          <h1 className="h1 text-center mb-8">{t('give.title')}</h1>
          <p className="mt-6 p-muted max-w-3xl mx-auto text-center text-lg">
            {t('give.subtitle')}
          </p>
        </div>
      </section>

      {/* Donation Methods */}
      <section className="py-16">
        <div className="container-xl">
          <div className="max-w-4xl mx-auto grid gap-8 md:grid-cols-2">
            <div className="card">
              <div className="mb-4">
                <div className="inline-block bg-brand-100 text-brand-700 rounded-full px-4 py-2 text-sm font-medium dark:bg-brand-900 dark:text-brand-100">
                  💳 {t('give.bank_transfer')}
                </div>
              </div>
              <h3 className="text-xl font-semibold text-brand-600 dark:text-brand-400 mb-4">{t('give.bank_transfer_title')}</h3>
              <div className="space-y-2 text-sm">
                <p><strong>{t('give.account_name')}</strong> Cộng Đoàn Công Giáo Việt Nam St. Timothy</p>
                <p><strong>{t('give.bsb')}</strong> 123-456</p>
                <p><strong>{t('give.account_number')}</strong> 12345678</p>
                <p><strong>{t('give.reference')}</strong> {t('give.reference_note')}</p>
              </div>
            </div>
            
            <div className="card">
              <div className="mb-4">
                <div className="inline-block bg-brand-100 text-brand-700 rounded-full px-4 py-2 text-sm font-medium dark:bg-brand-900 dark:text-brand-100">
                  💰 {t('give.cash_donation')}
                </div>
              </div>
              <h3 className="text-xl font-semibold text-brand-600 dark:text-brand-400 mb-4">{t('give.cash_donation_title')}</h3>
              <div className="space-y-3">
                <p className="p-muted">{t('give.cash_description')}</p>
                <ul className="list-disc list-inside space-y-1 text-sm p-muted">
                  <li>{t('give.sunday_mass')}</li>
                  <li>{t('give.special_occasions')}</li>
                  <li>{t('give.meet_committee')}</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="mt-12 text-center">
            <div className="card max-w-2xl mx-auto">
              <h3 className="text-lg font-semibold mb-3">📞 {t('give.contact_title')}</h3>
              <p className="p-muted">
                {t('give.contact_description')}
                <a href="tel:0422-400-116" className="text-brand-600 dark:text-brand-400 font-medium"> 0422-400-116</a>
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
