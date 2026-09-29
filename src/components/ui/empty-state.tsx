import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './button';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-8 text-center max-w-sm mx-auto w-full',
        className
      )}
    >
      <div className="w-11 h-11 mb-4 rounded-lg bg-muted border border-border/60 flex items-center justify-center text-muted-foreground shrink-0 shadow-xs">
        <Icon className="w-5 h-5" />
      </div>
      <h3 className="text-base font-medium text-foreground tracking-tight mb-1.5">
        {title}
      </h3>
      <p className="text-sm text-muted-foreground leading-relaxed mb-5">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button
          onClick={onAction}
          size="sm"
          variant="secondary"
          className="w-full sm:w-auto"
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
