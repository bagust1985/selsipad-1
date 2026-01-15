import React from 'react';
import { cn } from '@/lib/utils';

export interface AvatarProps {
  src?: string;
  alt?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  fallback?: string;
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt = '',
  size = 'md',
  fallback,
  className,
}) => {
  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-12 h-12 text-sm',
    lg: 'w-16 h-16 text-base',
    xl: 'w-24 h-24 text-xl',
  };

  const [imageError, setImageError] = React.useState(false);

  const showFallback = !src || imageError;
  const initials = fallback
    ? fallback.slice(0, 2).toUpperCase()
    : alt.slice(0, 2).toUpperCase() || '?';

  return (
    <div
      className={cn(
        'relative inline-flex items-center justify-center rounded-full overflow-hidden',
        'bg-bg-elevated border border-border-subtle',
        sizes[size],
        className
      )}
    >
      {showFallback ? (
        <span className="font-semibold text-text-secondary">{initials}</span>
      ) : (
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover"
          onError={() => setImageError(true)}
        />
      )}
    </div>
  );
};
