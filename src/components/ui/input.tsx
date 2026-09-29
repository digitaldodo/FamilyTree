import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-9 w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm transition-colors',
          'placeholder:text-muted-foreground/70',
          'focus-visible:outline-none focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 ring-offset-background',
          'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-muted/40',
          'aria-invalid:border-destructive aria-invalid:ring-destructive/20',
          error && 'border-destructive focus-visible:border-destructive focus-visible:ring-destructive/30',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export { Input };
