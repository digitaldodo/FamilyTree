import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCcw } from 'lucide-react';
import { motion } from 'motion/react';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  fullScreen?: boolean;
}

export function ErrorState({
  title = 'Something went wrong',
  message = 'We encountered an unexpected error. Please try again.',
  onRetry,
  fullScreen = false,
}: ErrorStateProps) {
  const Container = fullScreen ? 'div' : 'div';
  const containerClasses = fullScreen
    ? 'flex min-h-screen flex-col items-center justify-center p-6 text-center'
    : 'flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-border bg-card/50';

  return (
    <Container className={containerClasses}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="max-w-md w-full"
      >
        <div className="w-16 h-16 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="w-8 h-8" />
        </div>
        
        <h2 className="text-2xl font-bold tracking-tight mb-2">{title}</h2>
        <p className="text-muted-foreground mb-8">{message}</p>
        
        {onRetry && (
          <Button onClick={onRetry} size="lg" className="gap-2">
            <RefreshCcw className="w-4 h-4" />
            Try Again
          </Button>
        )}
      </motion.div>
    </Container>
  );
}
