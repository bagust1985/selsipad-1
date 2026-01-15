import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from './Button';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  className,
}) => {
  return (
    <div className={cn('flex flex-col items-center justify-center p-8 text-center', className)}>
      {icon && <div className="mb-4 text-text-tertiary">{icon}</div>}

      <h3 className="text-heading-md text-text-primary mb-2">{title}</h3>

      {description && (
        <p className="text-body-sm text-text-secondary mb-6 max-w-sm">{description}</p>
      )}

      {action && <Button onClick={action.onClick}>{action.label}</Button>}
    </div>
  );
};

// Default empty state icon
export const EmptyIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={cn('w-16 h-16', className)} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
    />
  </svg>
);
