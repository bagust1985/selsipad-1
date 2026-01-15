'use client';

import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

export interface MenuItem {
  id: string;
  label: string;
  onClick: () => void;
  variant?: 'default' | 'danger';
  disabled?: boolean;
}

export interface ActionMenuProps {
  items: MenuItem[];
  trigger?: React.ReactNode;
  className?: string;
}

export const ActionMenu: React.FC<ActionMenuProps> = ({ items, trigger, className }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const defaultTrigger = (
    <button
      className="p-2 text-text-secondary hover:text-text-primary hover:bg-bg-elevated rounded-md transition-colors"
      aria-label="More options"
    >
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
      </svg>
    </button>
  );

  return (
    <div className={cn('relative', className)} ref={menuRef}>
      <div onClick={() => setIsOpen(!isOpen)}>{trigger || defaultTrigger}</div>

      {isOpen && (
        <div
          className={cn(
            'absolute right-0 mt-2 w-48 py-1',
            'bg-bg-elevated border border-border-active rounded-lg shadow-xl',
            'z-50 animate-in fade-in slide-in-from-top-2'
          )}
        >
          {items.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                if (!item.disabled) {
                  item.onClick();
                  setIsOpen(false);
                }
              }}
              disabled={item.disabled}
              className={cn(
                'w-full px-4 py-2.5 text-left text-body-sm',
                'hover:bg-bg-card transition-colors',
                item.variant === 'danger' ? 'text-status-error-text' : 'text-text-primary',
                item.disabled && 'opacity-50 cursor-not-allowed'
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
