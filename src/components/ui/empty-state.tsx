import { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { fadeUp } from '@/utils/animations';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <motion.div
      variants={fadeUp}
      initial="initial"
      animate="animate"
      className="flex flex-col items-center justify-center p-8 text-center max-w-md mx-auto w-full bg-card border rounded-lg shadow-sm"
    >
      <div className="w-12 h-12 mb-4 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-lg font-medium text-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground mb-6">{description}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="px-4 py-2 text-sm font-medium text-primary-foreground bg-primary rounded-md hover:bg-primary/90 transition-colors shadow-sm w-full sm:w-auto"
        >
          {actionLabel}
        </button>
      )}
    </motion.div>
  );
}
