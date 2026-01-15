import React from 'react';
import { cn } from '@/lib/utils';

export type StatusType =
  | 'live'
  | 'upcoming'
  | 'ended'
  | 'pending'
  | 'verified'
  | 'rejected'
  | 'active'
  | 'inactive'
  | 'success'
  | 'failed'
  | 'warning'
  | 'finalizing';

export interface StatusBadgeProps {
  status: StatusType;
  label?: string;
  showDot?: boolean;
  className?: string;
}

const statusConfig: Record<
  StatusType,
  { bg: string; text: string; border: string; label: string }
> = {
  live: {
    bg: 'bg-status-success-bg/50',
    text: 'text-status-success-text',
    border: 'border-status-success-text/30',
    label: 'LIVE',
  },
  success: {
    bg: 'bg-status-success-bg/50',
    text: 'text-status-success-text',
    border: 'border-status-success-text/30',
    label: 'SUCCESS',
  },
  verified: {
    bg: 'bg-status-success-bg/50',
    text: 'text-status-success-text',
    border: 'border-status-success-text/30',
    label: 'VERIFIED',
  },
  active: {
    bg: 'bg-status-info-bg/50',
    text: 'text-status-info-text',
    border: 'border-status-info-text/30',
    label: 'ACTIVE',
  },
  upcoming: {
    bg: 'bg-status-info-bg/50',
    text: 'text-status-info-text',
    border: 'border-status-info-text/30',
    label: 'UPCOMING',
  },
  pending: {
    bg: 'bg-status-warning-bg/50',
    text: 'text-status-warning-text',
    border: 'border-status-warning-text/30',
    label: 'PENDING',
  },
  warning: {
    bg: 'bg-status-warning-bg/50',
    text: 'text-status-warning-text',
    border: 'border-status-warning-text/30',
    label: 'WARNING',
  },
  finalizing: {
    bg: 'bg-status-warning-bg/50',
    text: 'text-status-warning-text',
    border: 'border-status-warning-text/30',
    label: 'FINALIZING',
  },
  rejected: {
    bg: 'bg-status-error-bg/50',
    text: 'text-status-error-text',
    border: 'border-status-error-text/30',
    label: 'REJECTED',
  },
  failed: {
    bg: 'bg-status-error-bg/50',
    text: 'text-status-error-text',
    border: 'border-status-error-text/30',
    label: 'FAILED',
  },
  ended: {
    bg: 'bg-bg-elevated',
    text: 'text-text-secondary',
    border: 'border-border-subtle',
    label: 'ENDED',
  },
  inactive: {
    bg: 'bg-bg-elevated',
    text: 'text-text-secondary',
    border: 'border-border-subtle',
    label: 'INACTIVE',
  },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  label,
  showDot = true,
  className,
}) => {
  const config = statusConfig[status];
  const displayLabel = label || config.label;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wide border',
        config.bg,
        config.text,
        config.border,
        className
      )}
    >
      {showDot && (
        <span className={cn('w-1.5 h-1.5 rounded-full', config.text.replace('text-', 'bg-'))} />
      )}
      {displayLabel}
    </span>
  );
};
