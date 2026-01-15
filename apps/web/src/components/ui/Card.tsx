import React from 'react';
import { cn } from '@/lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'bordered';
  hover?: boolean;
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  variant = 'default',
  hover = false,
  className,
  children,
  ...props
}) => {
  const baseStyles = 'rounded-lg transition-all';

  const variants = {
    default: 'bg-bg-card border border-border-subtle',
    elevated: 'bg-bg-elevated shadow-md',
    bordered: 'bg-bg-card border-2 border-border-active',
  };

  const hoverStyles = hover
    ? 'hover:border-border-active hover:shadow-md cursor-pointer active:scale-[0.99]'
    : '';

  return (
    <div className={cn(baseStyles, variants[variant], hoverStyles, className)} {...props}>
      {children}
    </div>
  );
};

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  children,
  ...props
}) => (
  <div className={cn('p-4 pb-0', className)} {...props}>
    {children}
  </div>
);

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  children,
  ...props
}) => (
  <div className={cn('p-4', className)} {...props}>
    {children}
  </div>
);

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  children,
  ...props
}) => (
  <div className={cn('p-4 pt-0', className)} {...props}>
    {children}
  </div>
);
