import { useLanguage } from '../contexts/LanguageContext';

export default function Ministries() {
  const { t } = useLanguage();
  
  return (
    <section className="container-xl py-12">
      <h1 className="h1">{t('ministries.title')}</h1>
      <p className="mt-3 p-muted max-w-prose">
        {t('ministries.description')}
      </p>
      
      <div className="grid gap-6 mt-8 md:grid-cols-2">
        <div className="card">
          <h2 className="h2">{t('ministries.youth')}</h2>
          <p className="mt-2 p-muted">
            {t('ministries.youth_desc')}
          </p>
        </div>
        
        <div className="card">
          <h2 className="h2">{t('ministries.liturgy')}</h2>
          <p className="mt-2 p-muted">
            {t('ministries.liturgy_desc')}
          </p>
        </div>
        
        <div className="card">
          <h2 className="h2">{t('ministries.music')}</h2>
          <p className="mt-2 p-muted">
            {t('ministries.music_desc')}
          </p>
        </div>
        
        <div className="card">
          <h2 className="h2">{t('ministries.charity')}</h2>
          <p className="mt-2 p-muted">
            {t('ministries.charity_desc')}
          </p>
        </div>
      </div>
    </section>
  );
}
