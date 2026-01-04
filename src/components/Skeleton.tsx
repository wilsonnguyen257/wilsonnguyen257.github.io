import React from 'react';

interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = "" }) => {
  return (
    <div className={`animate-pulse bg-slate-200 rounded ${className}`}></div>
  );
};

export const CardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
      <Skeleton className="aspect-video w-full rounded-none" />
      <div className="p-6">
        <Skeleton className="h-6 w-3/4 mb-4" />
        <div className="space-y-2 mb-4">
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-1/3" />
        </div>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full mt-2" />
      </div>
    </div>
  );
};

export const ListSkeleton: React.FC = () => {
  return (
    <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-slate-100">
      <Skeleton className="w-12 h-12 rounded-lg flex-shrink-0" />
      <div className="flex-1">
        <Skeleton className="h-5 w-1/3 mb-2" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </div>
  );
};

export const GallerySkeleton: React.FC = () => {
  return (
    <div className="aspect-[4/3] rounded-xl overflow-hidden border border-slate-100">
      <Skeleton className="w-full h-full rounded-none" />
    </div>
  );
};
