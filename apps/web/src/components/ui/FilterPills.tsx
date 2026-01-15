'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface FilterPill {
  id: string;
  label: string;
}

export interface FilterPillsProps {
  filters: FilterPill[];
  onRemove: (id: string) => void;
  onClearAll?: () => void;
  className?: string;
}

export const FilterPills: React.FC<FilterPillsProps> = ({
  filters,
  onRemove,
  onClearAll,
  className,
}) => {
  if (filters.length === 0) return null;

  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      {filters.map((filter) => (
        <button
          key={filter.id}
          onClick={() => onRemove(filter.id)}
          className={cn(
            'inline-flex items-center gap-2 px-3 py-1.5 rounded-full',
            'bg-primary-soft/20 border border-primary-main/30',
            'text-caption font-medium text-text-primary',
            'hover:bg-primary-soft/30 active:scale-95 transition-all'
          )}
        >
          {filter.label}
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      ))}

      {onClearAll && filters.length > 1 && (
        <button
          onClick={onClearAll}
          className="text-caption font-medium text-text-secondary hover:text-text-primary transition-colors"
        >
          Reset Filter
        </button>
      )}
    </div>
  );
};
