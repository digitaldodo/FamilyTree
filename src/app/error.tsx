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

  return (
    <ErrorState
      title="Unexpected Error"
      message={error.message || "We've encountered an issue loading this page. Our team has been notified."}
      onRetry={reset}
      fullScreen
    />
  );
}
