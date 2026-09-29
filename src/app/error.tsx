'use client';

import { useEffect } from 'react';
import { ErrorState } from '@/components/ui/error-state';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service in production
    console.error('Root error boundary caught:', error);
  }, [error]);

  const isDev = process.env.NODE_ENV !== 'production';
  
  const devMessage = isDev 
    ? `Error: ${error.name}: ${error.message}`
    : 'We encountered an unexpected error. Our team has been notified.';

  return (
    <div className="bg-background">
      <ErrorState 
        fullScreen 
        title="Something went wrong" 
        message={devMessage} 
        onRetry={reset} 
      />
    </div>
  );
}
