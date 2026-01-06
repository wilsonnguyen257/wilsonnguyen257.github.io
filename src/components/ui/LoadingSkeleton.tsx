import React from 'react';

interface LoadingSkeletonProps {
  className?: string;
  variant?: 'text' | 'rectangular' | 'circular';
  width?: string | number;
  height?: string | number;
  lines?: number;
}

export function LoadingSkeleton({
  className = '',
  variant = 'text',
  width,
  height,
  lines = 1,
}: LoadingSkeletonProps) {
  const getSkeletonClass = () => {
    const base = 'animate-pulse bg-slate-200 rounded';
    switch (variant) {
      case 'text':
        return `${base} h-4`;
      case 'rectangular':
        return `${base}`;
      case 'circular':
        return `${base} rounded-full`;
      default:
        return base;
    }
  };

  const style: React.CSSProperties = {
    width: width || (variant === 'text' ? '100%' : '40px'),
    height: height || (variant === 'text' ? '1rem' : '40px'),
  };

  if (variant === 'text' && lines > 1) {
    return (
      <div className={`space-y-2 ${className}`}>
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={getSkeletonClass()}
            style={{
              ...style,
              width: i === lines - 1 ? '70%' : '100%',
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={`${getSkeletonClass()} ${className}`}
      style={style}
    />
  );
}

// Specialized skeleton components
export function CardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <div className="animate-pulse">
        <div className="flex items-start gap-4">
          <LoadingSkeleton variant="circular" width={48} height={48} />
          <div className="flex-1 space-y-2">
            <LoadingSkeleton width="60%" />
            <LoadingSkeleton width="40%" />
          </div>
        </div>
        <div className="mt-4 space-y-2">
          <LoadingSkeleton lines={3} />
        </div>
      </div>
    </div>
  );
}

export function GallerySkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <LoadingSkeleton variant="rectangular" height={200} className="w-full" />
      <div className="p-4 space-y-2">
        <LoadingSkeleton width="80%" />
        <LoadingSkeleton width="60%" />
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              {Array.from({ length: columns }).map((_, i) => (
                <th key={i} className="px-6 py-3 text-left">
                  <LoadingSkeleton height={20} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {Array.from({ length: rows }).map((_, rowIndex) => (
              <tr key={rowIndex}>
                {Array.from({ length: columns }).map((_, colIndex) => (
                  <td key={colIndex} className="px-6 py-4">
                    <LoadingSkeleton height={16} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function EventCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg transition-shadow">
      <div className="animate-pulse space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <LoadingSkeleton width="70%" height={24} />
            <LoadingSkeleton width="50%" className="mt-2" />
          </div>
          <LoadingSkeleton variant="rectangular" width={80} height={32} />
        </div>
        
        <div className="space-y-2">
          <LoadingSkeleton width="40%" />
          <LoadingSkeleton width="35%" />
        </div>
        
        <LoadingSkeleton lines={2} />
        
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <LoadingSkeleton variant="circular" width={32} height={32} />
          <LoadingSkeleton width={100} height={36} />
        </div>
      </div>
    </div>
  );
}

export function AlbumCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg transition-all">
      <div className="animate-pulse">
        <LoadingSkeleton variant="rectangular" height={160} className="w-full" />
        <div className="p-4 space-y-3">
          <LoadingSkeleton width="80%" height={20} />
          <LoadingSkeleton lines={2} />
          <div className="flex items-center justify-between pt-2">
            <LoadingSkeleton width={60} height={16} />
            <LoadingSkeleton width={40} height={16} />
          </div>
        </div>
      </div>
    </div>
  );
}

export function ReflectionCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg transition-shadow">
      <div className="animate-pulse space-y-4">
        <div className="flex items-start gap-4">
          <LoadingSkeleton variant="circular" width={64} height={64} />
          <div className="flex-1">
            <LoadingSkeleton width="85%" height={24} />
            <LoadingSkeleton width="65%" className="mt-2" />
          </div>
        </div>
        
        <LoadingSkeleton lines={4} />
        
        <div className="flex items-center gap-4 pt-4 border-t border-slate-100">
          <LoadingSkeleton variant="circular" width={32} height={32} />
          <LoadingSkeleton variant="circular" width={32} height={32} />
          <LoadingSkeleton variant="circular" width={32} height={32} />
          <div className="flex-1" />
          <LoadingSkeleton width={120} height={32} />
        </div>
      </div>
    </div>
  );
}

export function FormSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <LoadingSkeleton width={120} height={20} />
        <LoadingSkeleton height={48} />
      </div>
      
      <div className="space-y-2">
        <LoadingSkeleton width={100} height={20} />
        <LoadingSkeleton height={48} />
      </div>
      
      <div className="space-y-2">
        <LoadingSkeleton width={140} height={20} />
        <LoadingSkeleton variant="rectangular" height={120} />
      </div>
      
      <div className="flex gap-4 pt-4">
        <LoadingSkeleton width={100} height={40} />
        <LoadingSkeleton width={100} height={40} />
      </div>
    </div>
  );
}

export function StatsCard({ 
  title, 
  value, 
  change, 
  changeLabel, 
  icon, 
  color = 'brand' 
}: {
  title: string;
  value: number;
  change?: number;
  changeLabel?: string;
  icon?: React.ReactNode;
  color?: 'brand' | 'blue' | 'green' | 'purple';
}) {
  const colorClasses = {
    brand: 'bg-brand-50 text-brand-600',
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-slate-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-slate-900">{value.toLocaleString()}</p>
          {change !== undefined && (
            <p className="text-sm text-slate-500 mt-1">
              {change} {changeLabel}
            </p>
          )}
        </div>
        {icon && (
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorClasses[color]}`}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}

export function PageHeaderSkeleton() {
  return (
    <div className="mb-8">
      <div className="animate-pulse space-y-4">
        <LoadingSkeleton width="30%" height={40} />
        <LoadingSkeleton width="60%" height={24} />
      </div>
    </div>
  );
}

export function SidebarSkeleton() {
  return (
    <nav className="space-y-1">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="animate-pulse flex items-center gap-3 px-3 py-2">
          <LoadingSkeleton variant="circular" width={20} height={20} />
          <LoadingSkeleton width={120} height={16} />
        </div>
      ))}
    </nav>
  );
}

export function StatsCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <div className="animate-pulse space-y-4">
        <div className="flex items-center justify-between">
          <LoadingSkeleton variant="circular" width={48} height={48} />
          <LoadingSkeleton width={80} height={24} />
        </div>
        <LoadingSkeleton width="60%" height={32} />
        <LoadingSkeleton width="40%" height={16} />
      </div>
    </div>
  );
}

export function ImageGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <LoadingSkeleton variant="rectangular" height="100%" className="aspect-square" />
        </div>
      ))}
    </div>
  );
}

export function CalendarSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <div className="animate-pulse space-y-4">
        <div className="flex items-center justify-between mb-6">
          <LoadingSkeleton width={150} height={32} />
          <div className="flex gap-2">
            <LoadingSkeleton width={32} height={32} />
            <LoadingSkeleton width={32} height={32} />
          </div>
        </div>
        
        <div className="grid grid-cols-7 gap-2 mb-2">
          {Array.from({ length: 7 }).map((_, i) => (
            <LoadingSkeleton key={i} height={32} />
          ))}
        </div>
        
        {Array.from({ length: 5 }).map((_, weekIndex) => (
          <div key={weekIndex} className="grid grid-cols-7 gap-2 mb-2">
            {Array.from({ length: 7 }).map((_, dayIndex) => (
              <LoadingSkeleton key={dayIndex} height={80} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
