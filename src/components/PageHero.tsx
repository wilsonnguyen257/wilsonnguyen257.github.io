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
    <section className={`relative bg-gradient-to-br from-brand-600 via-brand-700 to-brand-800 text-white overflow-hidden ${compact ? 'py-20 md:py-24' : 'py-20 md:py-28'}`}>
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-20"></div>
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/3 w-96 h-96 bg-brand-500/30 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/3 w-64 h-64 bg-brand-400/20 rounded-full blur-3xl"></div>

      <div className="container-xl relative z-10">
        <div className={`max-w-3xl ${isCenter ? 'mx-auto text-center' : ''}`}>
          {badgeLabel && (
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 mb-6 shadow-sm hover:bg-white/20 transition-colors">
              {badgeIcon}
              <span className="font-medium text-brand-50">{badgeLabel}</span>
            </div>
          )}
          <h1 className="text-4xl md:text-6xl font-bold mb-6 font-serif tracking-tight">{title}</h1>
          {subtitle && (
            <p className="text-xl text-brand-100 leading-relaxed max-w-2xl mx-auto">{subtitle}</p>
          )}
        </div>
      </div>
    </section>
  );
}
