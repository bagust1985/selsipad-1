import React from 'react';
import { cn } from '@/lib/utils';

export type BannerType = 'info' | 'warning' | 'error' | 'success';

export interface BannerProps {
  type: BannerType;
  message: string;
  submessage?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  onClose?: () => void;
  className?: string;
}

export const Banner: React.FC<BannerProps> = ({
  type,
  message,
  submessage,
  action,
  onClose,
  className,
}) => {
  const config = {
    info: {
      bg: 'bg-status-info-bg/50',
      border: 'border-l-4 border-status-info-text',
      text: 'text-status-info-text',
      icon: 'ⓘ',
    },
    warning: {
      bg: 'bg-status-warning-bg/50',
      border: 'border-l-4 border-status-warning-text',
      text: 'text-status-warning-text',
      icon: '⚠',
    },
    error: {
      bg: 'bg-status-error-bg/50',
      border: 'border-l-4 border-status-error-text',
      text: 'text-status-error-text',
      icon: '✗',
    },
    success: {
      bg: 'bg-status-success-bg/50',
      border: 'border-l-4 border-status-success-text',
      text: 'text-status-success-text',
      icon: '✓',
    },
  };

  const style = config[type];

  return (
    <div className={cn('relative', className)}>
      <div className={cn('p-4 rounded-lg', style.bg, style.border)}>
        <div className="flex items-start gap-3">
          <span className={cn('text-lg', style.text)}>{style.icon}</span>

          <div className="flex-1 min-w-0">
            <p className={cn('text-body-sm font-medium', style.text)}>{message}</p>
            {submessage && <p className="text-caption text-text-secondary mt-1">{submessage}</p>}
          </div>

          {action && (
            <button
              onClick={action.onClick}
              className={cn(
                'px-3 py-1 text-caption font-semibold rounded-md',
                'hover:bg-white/10 active:scale-95 transition-all',
                style.text
              )}
            >
              {action.label}
            </button>
          )}

          {onClose && (
            <button
              onClick={onClose}
              className="text-text-tertiary hover:text-text-secondary transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
