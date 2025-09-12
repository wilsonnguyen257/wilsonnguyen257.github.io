import { useLanguage } from '../contexts/LanguageContext';

export default function Contact() {
  const { t } = useLanguage();
  
  return (
    <div className="bg-white dark:bg-slate-900">
      <section className="container-xl py-12">
        <h1 className="h1">{t('contact.title')}</h1>
        <p className="mt-3 p-muted max-w-prose">
          {t('contact.description')}
        </p>
        <div className="card mt-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white">
          <ul className="space-y-2 p-muted text-slate-600 dark:text-slate-300">
            <li>{t('contact.address')} {t('contact.address_value')}</li>
            <li>{t('contact.mass')} {t('contact.mass_time')}</li>
            <li>{t('contact.phone')} <a href="tel:0422-400-116" className="underline text-brand-600 dark:text-brand-400">0422-400-116</a></li>
            <li>{t('contact.email')} <a href="mailto:sttimvn2013@gmail.com" className="underline text-brand-600 dark:text-brand-400">sttimvn2013@gmail.com</a></li>
            <li>{t('contact.facebook')} <a href="https://www.facebook.com/sttimvn" className="underline text-brand-600 dark:text-brand-400" target="_blank" rel="noopener noreferrer">facebook.com/sttimvn</a></li>
          </ul>
        </div>
      </section>
    </div>
  );
}
