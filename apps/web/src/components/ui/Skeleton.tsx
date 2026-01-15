import React from 'react';
import { cn } from '@/lib/utils';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'card' | 'avatar' | 'button';
}

export const Skeleton: React.FC<SkeletonProps> = ({ variant = 'text', className, ...props }) => {
  const variants = {
    text: 'h-4 w-full rounded',
    card: 'h-32 w-full rounded-lg',
    avatar: 'h-12 w-12 rounded-full',
    button: 'h-10 w-24 rounded-md',
  };

  return (
    <div className={cn('animate-shimmer bg-bg-card', variants[variant], className)} {...props} />
  );
};

// Composite Skeleton patterns
export const SkeletonCard: React.FC = () => (
  <div className="bg-bg-card border border-border-subtle rounded-lg p-4 space-y-3">
    <div className="flex items-center gap-3">
      <Skeleton variant="avatar" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
    <Skeleton className="h-20" />
    <Skeleton className="h-3 w-full" />
    <Skeleton className="h-3 w-5/6" />
  </div>
);

export const SkeletonText: React.FC<{ lines?: number }> = ({ lines = 3 }) => (
  <div className="space-y-2">
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton key={i} className={cn('h-4', i === lines - 1 && 'w-2/3')} />
    ))}
  </div>
);
