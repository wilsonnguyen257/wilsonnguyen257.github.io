import { useLanguage } from '../contexts/LanguageContext';

export default function About() {
  const { t } = useLanguage();
  
  return (
    <div className="bg-white dark:bg-slate-900">
      {/* Hero Section */}
      <section className="container-xl py-12">
        <h1 className="h1 text-center" style={{ color: 'var(--color-heading)' }}>
          {t('about.title')}
        </h1>
        <p className="mt-6 p-muted max-w-3xl mx-auto text-center text-lg">
          {t('about.welcome')}
        </p>
      </section>

      {/* History Section */}
      <section className="bg-brand-50 dark:bg-slate-800 py-16">
        <div className="container-xl">
          <h2 className="h2 mb-8 text-center">{t('about.history_title')}</h2>
          <div className="max-w-3xl mx-auto">
            <div className="prose dark:prose-invert mx-auto">
              <p>
                {t('about.history_p1')}
              </p>
              <p>
                {t('about.history_p2')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="py-16">
        <div className="container-xl">
          <h2 className="h2 mb-12 text-center">{t('about.mission_vision')}</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="card">
              <div className="text-4xl mb-4 text-center">🙏</div>
              <h3 className="text-xl font-semibold mb-4 text-center">{t('about.mission')}</h3>
              <ul className="space-y-4 p-muted">
                <li className="flex gap-3">
                  <span className="text-brand-600">✓</span>
                  {t('about.mission_1')}
                </li>
                <li className="flex gap-3">
                  <span className="text-brand-600">✓</span>
                  {t('about.mission_2')}
                </li>
                <li className="flex gap-3">
                  <span className="text-brand-600">✓</span>
                  {t('about.mission_3')}
                </li>
              </ul>
            </div>
            <div className="card">
              <div className="text-4xl mb-4 text-center">🌟</div>
              <h3 className="text-xl font-semibold mb-4 text-center">{t('about.vision')}</h3>
              <ul className="space-y-4 p-muted">
                <li className="flex gap-3">
                  <span className="text-brand-600">✓</span>
                  {t('about.vision_1')}
                </li>
                <li className="flex gap-3">
                  <span className="text-brand-600">✓</span>
                  {t('about.vision_2')}
                </li>
                <li className="flex gap-3">
                  <span className="text-brand-600">✓</span>
                  {t('about.vision_3')}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Activities Section */}
      <section className="bg-brand-50 dark:bg-slate-800 py-16">
        <div className="container-xl">
          <h2 className="h2 mb-12 text-center">{t('about.activities_title')}</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="card">
              <div className="text-4xl mb-4 text-center">⛪</div>
              <h3 className="text-lg font-semibold mb-3">{t('about.liturgy')}</h3>
              <ul className="space-y-2 p-muted">
                <li>• {t('about.liturgy_1')}</li>
                <li>• {t('about.liturgy_2')}</li>
                <li>• {t('about.liturgy_3')}</li>
              </ul>
            </div>
            <div className="card">
              <div className="text-4xl mb-4 text-center">👨‍👩‍👧‍👦</div>
              <h3 className="text-lg font-semibold mb-3">{t('about.education')}</h3>
              <ul className="space-y-2 p-muted">
                <li>• {t('about.education_1')}</li>
                <li>• {t('about.education_2')}</li>
                <li>• {t('about.education_3')}</li>
              </ul>
            </div>
            <div className="card">
              <div className="text-4xl mb-4 text-center">🤝</div>
              <h3 className="text-lg font-semibold mb-3">{t('about.community')}</h3>
              <ul className="space-y-2 p-muted">
                <li>• {t('about.community_1')}</li>
                <li>• {t('about.community_2')}</li>
                <li>• {t('about.community_3')}</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Leadership Section */}
      <section className="py-16">
        <div className="container-xl">
          <h2 className="h2 mb-8 text-center">{t('about.leadership')}</h2>
          <div className="card max-w-3xl mx-auto">
            <div className="prose dark:prose-invert mx-auto">
              <p className="text-center p-muted">
                {t('about.leadership_desc')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact CTA Section */}
      <section className="bg-brand-50 dark:bg-slate-800 py-16">
        <div className="container-xl text-center">
          <h2 className="h2 mb-4">{t('about.join_title')}</h2>
          <p className="p-muted max-w-2xl mx-auto mb-8">
            {t('about.join_desc')}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a href="tel:0422-400-116" className="btn btn-primary">
              {t('about.call')}
            </a>
            <a href="mailto:sttimvn2013@gmail.com" className="btn btn-outline">
              {t('about.email')}
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}