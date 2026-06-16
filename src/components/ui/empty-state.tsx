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

export function EmptyState({ icon: Icon, title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <motion.div
      variants={fadeUp}
      initial="initial"
      animate="animate"
      className="flex flex-col items-center justify-center p-8 text-center max-w-md mx-auto w-full glass-warm rounded-3xl"
    >
      <div className="w-16 h-16 mb-5 rounded-full bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center text-amber-500 dark:text-amber-400 shadow-sm border border-amber-100 dark:border-amber-900/30">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
        {title}
      </h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
        {description}
      </p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="px-6 py-2.5 text-sm font-medium text-white bg-primary rounded-full hover:bg-primary/90 transition-colors shadow-md w-full sm:w-auto"
        >
          {actionLabel}
        </button>
      )}
    </motion.div>
  );
}
