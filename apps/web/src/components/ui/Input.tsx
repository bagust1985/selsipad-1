import React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helper?: string;
  error?: string;
  showMax?: boolean;
  maxValue?: number;
  onMaxClick?: () => void;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, helper, error, showMax, maxValue, onMaxClick, ...props }, ref) => {
    const inputBaseStyles =
      'w-full bg-bg-input border rounded-md px-4 py-2 text-text-primary placeholder:text-text-tertiary transition-all';
    const inputStateStyles = error
      ? 'border-status-error-text focus:border-status-error-text focus:ring-2 focus:ring-status-error-text/20'
      : 'border-border-subtle focus:border-primary-main focus:ring-2 focus:ring-primary-main/20';

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-semibold text-text-primary mb-2">{label}</label>
        )}

        <div className="relative">
          <input
            ref={ref}
            className={cn(inputBaseStyles, inputStateStyles, showMax && 'pr-16', className)}
            {...props}
          />

          {showMax && (
            <button
              type="button"
              onClick={onMaxClick}
              className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 text-sm font-medium text-primary-main hover:bg-primary-soft/10 rounded active:scale-95 transition-all"
            >
              MAX
            </button>
          )}
        </div>

        {(helper || error) && (
          <p
            className={cn('mt-2 text-xs', error ? 'text-status-error-text' : 'text-text-tertiary')}
          >
            {error || helper}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

// Amount Input variant for large money inputs
export interface AmountInputProps extends InputProps {
  currency?: string;
  balance?: number;
}

export const AmountInput = React.forwardRef<HTMLInputElement, AmountInputProps>(
  ({ currency = 'SOL', balance, helper, ...props }, ref) => {
    return (
      <div className="bg-bg-card border border-border-subtle rounded-lg p-4 overflow-hidden">
        <div className="flex items-center gap-2">
          <div className="flex-1 min-w-0">
            <Input
              ref={ref}
              type="number"
              step="any"
              className="text-4xl font-semibold border-0 bg-transparent p-0 focus:ring-0 tabular-nums w-full [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              showMax={!!props.onMaxClick}
              {...props}
            />
          </div>
          <span className="text-sm font-semibold text-text-secondary bg-white/5 border border-white/10 rounded-md px-2.5 py-1.5 whitespace-nowrap flex-shrink-0">
            {currency}
          </span>
        </div>
        {balance !== undefined && (
          <p className="mt-2 text-xs text-text-tertiary truncate">
            Saldo: {balance} {currency}
          </p>
        )}
        {balance === undefined && helper && (
          <p className="mt-2 text-xs text-text-tertiary truncate">{helper}</p>
        )}
      </div>
    );
  }
);

AmountInput.displayName = 'AmountInput';
