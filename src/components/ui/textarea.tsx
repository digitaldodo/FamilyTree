import * as React from 'react';
import { cn } from '@/lib/utils';

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          'flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm transition-colors resize-y leading-relaxed',
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
Textarea.displayName = 'Textarea';

export { Textarea };
