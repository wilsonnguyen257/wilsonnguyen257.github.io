import type { ReactNode } from 'react';

interface PageHeroProps {
  title: string;
  subtitle?: string;
  badgeIcon?: ReactNode;
  badgeLabel?: string;
  align?: 'center' | 'left';
  compact?: boolean;
}

export default function PageHero({ title, subtitle, badgeIcon, badgeLabel, align = 'center', compact = false }: PageHeroProps) {
  const isCenter = align === 'center';

  return (
    <section className={`relative bg-white border-b border-slate-100 ${compact ? 'pt-16 pb-14 md:pt-20 md:pb-16' : 'pt-20 pb-16 md:pt-28 md:pb-20'}`}>
      <div className="container-xl">
        <div className={`max-w-3xl ${isCenter ? 'mx-auto text-center' : ''}`}>
          {badgeLabel && (
            <div className={`eyebrow mb-4 ${isCenter ? 'justify-center' : ''}`}>
              {badgeIcon}
              <span>{badgeLabel}</span>
            </div>
          )}
          <h1 className="text-4xl md:text-6xl font-semibold tracking-tight text-slate-900">{title}</h1>
          {subtitle && (
            <p className="mt-5 text-lg md:text-xl text-slate-500 leading-relaxed max-w-2xl mx-auto">{subtitle}</p>
          )}
        </div>
      </div>
    </section>
  );
}
