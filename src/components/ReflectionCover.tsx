import { useLanguage } from '../contexts/LanguageContext';
import { describeLiturgicalSunday, SEASON_NAME } from '../lib/liturgical';

// The cover a gospel reflection gets when its author didn't upload a
// picture: a missal-page card set from the post itself. The Gospel
// reference it opens with becomes the headline, and the liturgical season
// comes from its date. The title is never repeated here, since it's always
// printed right beside or below the cover.

const GOSPELS: Record<string, { en: string; vi: string; en_name: string; vi_name: string }> = {
  Mt: { en: 'Mt', vi: 'Mt', en_name: 'Gospel of Matthew', vi_name: 'Tin Mừng theo thánh Mát-thêu' },
  Mc: { en: 'Mk', vi: 'Mc', en_name: 'Gospel of Mark', vi_name: 'Tin Mừng theo thánh Mác-cô' },
  Lc: { en: 'Lk', vi: 'Lc', en_name: 'Gospel of Luke', vi_name: 'Tin Mừng theo thánh Lu-ca' },
  Ga: { en: 'Jn', vi: 'Ga', en_name: 'Gospel of John', vi_name: 'Tin Mừng theo thánh Gio-an' },
};
const ALIASES: Record<string, keyof typeof GOSPELS> = { Mt: 'Mt', Mc: 'Mc', Mk: 'Mc', Lc: 'Lc', Lk: 'Lc', Ga: 'Ga', Jn: 'Ga' };
// Book, chapter, then verses: numbers with an optional a–e half-verse,
// joined by - – . or , (e.g. "20,1-16a", "21,28-32", "4,5-15.19b-26").
const GOSPEL_REF = /\b(Mt|Mc|Mk|Lc|Lk|Ga|Jn)\s?(\d+)\s?[,:]\s?(\d+[a-e]?(?:\s?[-–.,]\s?\d+[a-e]?)*)/;

const stripHtml = (html: string) => {
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return tmp.textContent || '';
};

// A reflection is written for a Sunday; its date may be the day it was
// posted, so snap to the nearest Sunday (Thu–Sat forward, Mon–Wed back).
const nearestSunday = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const dow = date.getDay();
  return new Date(y, m - 1, d + (dow === 0 ? 0 : dow <= 3 ? -dow : 7 - dow));
};

interface Props {
  content: string;
  date?: string;
  size?: 'card' | 'banner';
  className?: string;
}

export default function ReflectionCover({ content, date, size = 'card', className = '' }: Props) {
  const { language } = useLanguage();

  const match = stripHtml(content).slice(0, 600).match(GOSPEL_REF);
  const gospel = match ? GOSPELS[ALIASES[match[1]]] : null;
  const reference = match && gospel
    ? language === 'en'
      ? `${gospel.en} ${match[2]}:${match[3].replace(/\s/g, '')}`
      : `${gospel.vi} ${match[2]},${match[3].replace(/\s/g, '')}`
    : '';

  const sunday = date && /^\d{4}-\d{2}-\d{2}$/.test(date) ? describeLiturgicalSunday(nearestSunday(date)) : null;
  const season = sunday ? SEASON_NAME[sunday.season][language] : '';
  const cycle = sunday ? (language === 'vi' ? `Năm ${sunday.cycle}` : `Year ${sunday.cycle}`) : '';

  const headline = reference || season || (language === 'vi' ? 'Lời Chúa' : 'The Word of God');
  const subline = gospel ? gospel[language === 'vi' ? 'vi_name' : 'en_name'] : '';
  const chip = reference ? [season, cycle].filter(Boolean).join(' · ') : cycle;

  const banner = size === 'banner';

  return (
    <div
      aria-hidden="true"
      className={`relative overflow-hidden bg-brand-600 text-surface ${className}`}
    >
      {/* A fine-line Latin cross outline, oversized at the right edge. */}
      <svg
        viewBox="0 0 60 100"
        preserveAspectRatio="xMidYMid meet"
        className={`absolute text-brand-400/50 ${banner ? 'h-[150%] -top-[12%] right-[6%]' : 'h-[150%] -top-[18%] right-[4%]'}`}
        fill="none"
        stroke="currentColor"
      >
        <path d="M24 0.5H36V26H59.5V38H36V99.5H24V38H0.5V26H24Z" strokeWidth="1" vectorEffect="non-scaling-stroke" />
      </svg>

      <div className={`relative h-full flex flex-col justify-end ${banner ? 'p-8 sm:p-10 gap-3' : 'p-5 gap-2'}`}>
        {chip && <span className="badge-season self-start">{chip}</span>}
        <p className={`font-serif font-bold leading-tight nums-lining ${banner ? 'text-4xl sm:text-5xl' : 'text-[26px]'}`}>
          {headline}
        </p>
        {subline && (
          <p className={`text-brand-200 ${banner ? 'text-base' : 'text-sm'}`}>{subline}</p>
        )}
      </div>
    </div>
  );
}
