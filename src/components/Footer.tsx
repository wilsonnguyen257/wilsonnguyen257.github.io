import { useLanguage } from '../contexts/LanguageContext';

export default function Footer() {
  const { t } = useLanguage();
  
  return (
    <footer className="border-t border-[var(--color-border)] py-8" style={{background: 'var(--color-bg)'}}>
      <div className="container-xl flex flex-col items-center justify-between gap-4 sm:flex-row">
        <p className="p-muted" style={{color: 'var(--color-text-muted)'}}>
          © {new Date().getFullYear()} {t('footer.copyright')}
        </p>
        <div className="flex gap-4 text-sm">
          <a className="hover:underline" href="/about" style={{color: 'var(--color-accent)'}}>
            {t('footer.about')}
          </a>
          <a className="hover:underline" href="/contact" style={{color: 'var(--color-accent)'}}>
            {t('footer.contact')}
          </a>
        </div>
      </div>
    </footer>
  );
}
