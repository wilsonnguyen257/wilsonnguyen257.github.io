import { useLanguage } from '../contexts/LanguageContext';

export default function Contact() {
  const { t } = useLanguage();
  
  return (
    <section className="container-xl py-12">
      <h1 className="h1">{t('contact.title')}</h1>
      <p className="mt-3 p-muted max-w-prose">
        {t('contact.description')}
      </p>
      <div className="card mt-6" style={{background: 'var(--color-card)', color: 'var(--color-text-main)', borderColor: 'var(--color-border)'}}>
        <ul className="space-y-2 p-muted" style={{color: 'var(--color-text-muted)'}}>
          <li>{t('contact.address')} {t('contact.address_value')}</li>
          <li>{t('contact.mass')} {t('contact.mass_time')}</li>
          <li>{t('contact.phone')} <a href="tel:0422-400-116" className="underline" style={{color: 'var(--color-accent)'}}>0422-400-116</a></li>
          <li>{t('contact.email')} <a href="mailto:sttimvn2013@gmail.com" className="underline" style={{color: 'var(--color-accent)'}}>sttimvn2013@gmail.com</a></li>
          <li>{t('contact.facebook')} <a href="https://www.facebook.com/sttimvn" className="underline" style={{color: 'var(--color-accent)'}} target="_blank" rel="noopener noreferrer">facebook.com/sttimvn</a></li>
        </ul>
      </div>
    </section>
  );
}
