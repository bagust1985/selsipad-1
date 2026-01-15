'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

interface ToastContextType {
  toasts: Toast[];
  showToast: (type: ToastType, message: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((type: ToastType, message: string, duration = 3000) => {
    const id = Math.random().toString(36).substring(7);
    const toast: Toast = { id, type, message, duration };

    setToasts((prev) => [...prev, toast]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, showToast }}>
      {children}
      <ToastContainer toasts={toasts} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}

function ToastContainer({ toasts }: { toasts: Toast[] }) {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  );
}

function ToastItem({ toast }: { toast: Toast }) {
  const config = {
    success: {
      bg: 'bg-status-success-bg',
      border: 'border-status-success-text',
      text: 'text-status-success-text',
      icon: '✓',
    },
    error: {
      bg: 'bg-status-error-bg',
      border: 'border-status-error-text',
      text: 'text-status-error-text',
      icon: '✗',
    },
    info: {
      bg: 'bg-status-info-bg',
      border: 'border-status-info-text',
      text: 'text-status-info-text',
      icon: 'ⓘ',
    },
  };

  const style = config[toast.type];

  return (
    <div
      className={cn(
        'pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-lg border shadow-xl',
        'animate-in slide-in-from-right-5 fade-in',
        style.bg,
        style.border
      )}
    >
      <span className={cn('text-lg', style.text)}>{style.icon}</span>
      <p className={cn('text-body-sm font-medium', style.text)}>{toast.message}</p>
    </div>
  );
}
