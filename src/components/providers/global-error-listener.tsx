'use client';

import { useEffect } from 'react';

export function GlobalErrorListener() {
  useEffect(() => {
    const handleGlobalError = (event: ErrorEvent) => {
      filterAndLogError(event.error || event.message, 'App Error');
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      filterAndLogError(event.reason, 'Network/Promise Error');
    };

    const filterAndLogError = (error: any, defaultCategory: string) => {
      if (!error) return;

      const errorMessage = typeof error === 'string' ? error : (error.message || '');
      const errorStack = error.stack || '';
      
      // Ignore extension-related errors
      if (
        errorMessage.includes('VM') ||
        errorStack.includes('VM') ||
        errorMessage.includes('isolated.js') ||
        errorStack.includes('isolated.js') ||
        errorMessage.includes('chrome-extension://') ||
        errorStack.includes('chrome-extension://') ||
        errorMessage.includes('moz-extension://') ||
        errorStack.includes('moz-extension://')
      ) {
        return;
      }

      // Categorize
      let category = defaultCategory;
      if (errorMessage.toLowerCase().includes('network') || errorMessage.toLowerCase().includes('fetch')) {
        category = 'Network Error';
      } else if (errorMessage.toLowerCase().includes('api') || (error.status && error.status >= 400)) {
        category = 'API Error';
      }

      // Log genuine application errors cleanly
       
      console.log(`[${category}]`, error);
    };

    window.addEventListener('error', handleGlobalError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleGlobalError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  return null;
}
