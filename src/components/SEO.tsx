import { Helmet } from 'react-helmet-async';
import { useLanguage } from '../contexts/LanguageContext';

interface SEOProps {
  title: string;
  description?: string;
}

export default function SEO({ title, description }: SEOProps) {
  const { language } = useLanguage();
  
  // Default values can be adjusted based on actual site name
  const siteName = language === 'vi' ? 'Cộng Đoàn Vinh Sơn Liêm' : 'Vinh Son Liem Community';
  const defaultDesc = language === 'vi' 
    ? 'Chào mừng đến với Cộng Đoàn Công Giáo Việt Nam Vinh Sơn Liêm.' 
    : 'Welcome to the Vinh Son Liem Vietnamese Catholic Community.';

  const fullTitle = `${title} | ${siteName}`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description || defaultDesc} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description || defaultDesc} />
      <meta property="og:type" content="website" />
    </Helmet>
  );
}
