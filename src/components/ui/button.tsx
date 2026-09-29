'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | 'default'
    | 'primary'
    | 'secondary'
    | 'outline'
    | 'ghost'
    | 'icon'
    | 'destructive';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'md', ...props }, ref) => {
    const variants = {
      default:
        'bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs border border-transparent',
      primary:
        'bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs border border-transparent',
      secondary:
        'bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-transparent',
      outline:
        'border border-border bg-background hover:bg-accent hover:text-accent-foreground',
      ghost:
        'border border-transparent hover:bg-accent hover:text-accent-foreground',
      icon: 'border border-transparent hover:bg-accent hover:text-accent-foreground',
      destructive:
        'bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-xs border border-transparent',
    };

    const sizes = {
      sm: 'h-8 px-3 text-xs gap-1.5 rounded-md',
      md: 'h-9 px-3.5 py-2 text-sm gap-2 rounded-md',
      lg: 'h-10 px-5 text-sm font-medium gap-2.5 rounded-md',
      icon: 'h-9 w-9 p-0 flex items-center justify-center shrink-0 rounded-md',
    };

    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center whitespace-nowrap font-medium transition-all duration-150',
          'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 ring-offset-background',
          'active:scale-[0.99] disabled:pointer-events-none disabled:opacity-50 disabled:active:scale-100 cursor-pointer',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export interface IconButtonProps extends ButtonProps {
  'aria-label': string;
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, size = 'icon', variant = 'ghost', ...props }, ref) => {
    return (
      <Button
        ref={ref}
        size={size}
        variant={variant}
        className={cn('shrink-0', className)}
        {...props}
      />
    );
  }
);
IconButton.displayName = 'IconButton';
