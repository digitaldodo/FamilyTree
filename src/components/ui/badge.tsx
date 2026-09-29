import * as React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?:
    | 'default'
    | 'secondary'
    | 'outline'
    | 'destructive'
    | 'muted'
    | 'success';
}

function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  const variants = {
    default:
      'border-transparent bg-primary text-primary-foreground shadow-xs',
    secondary:
      'border-transparent bg-secondary text-secondary-foreground',
    outline:
      'border-border text-foreground',
    muted:
      'border-transparent bg-muted text-muted-foreground',
    destructive:
      'border-transparent bg-destructive/10 text-destructive',
    success:
      'border-transparent bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium tracking-tight transition-colors focus:outline-none focus:ring-1 focus:ring-ring',
        variants[variant],
        className
      )}
      {...props}
    />
  );
}

export { Badge };
