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

  return (
    <div className="p-8 text-red-500 font-mono">
      <h2 className="text-2xl mb-4 font-bold">Something went wrong</h2>
      <p className="mb-2 text-gray-700 dark:text-gray-300">We've encountered an unexpected error. Our team has been notified.</p>
      
      {isDev && (
        <div className="mt-6 border-t pt-4">
          <p className="mb-2"><strong>Error:</strong> {error.name}: {error.message}</p>
          {error.digest && <p className="mb-2"><strong>Digest:</strong> {error.digest}</p>}
          <pre className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded overflow-x-auto text-sm">
            {error.stack}
          </pre>
        </div>
      )}

      <button 
        onClick={reset}
        className="mt-6 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
      >
        Try again
      </button>
    </div>
  );
}
