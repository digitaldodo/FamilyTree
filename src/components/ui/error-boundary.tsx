'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCcw } from 'lucide-react';
import { Button } from './button';

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
     
    console.error('Uncaught error in ErrorBoundary:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center p-6 text-center space-y-4 rounded-lg border border-red-200 bg-red-50/50 dark:border-red-900/50 dark:bg-red-900/10">
          <div className="rounded-full bg-red-100 p-3 dark:bg-red-900/30">
            <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <div className="space-y-1 text-sm">
            <h3 className="font-semibold text-red-800 dark:text-red-300">
              Something went wrong
            </h3>
            <p className="text-red-600 dark:text-red-400/80 max-w-sm">
              {this.state.error?.message || 'An unexpected error occurred while rendering this component.'}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={this.handleReset}
            className="border-red-200 hover:bg-red-100 hover:text-red-900 dark:border-red-800 dark:hover:bg-red-900/50 dark:hover:text-red-100"
          >
            <RefreshCcw className="mr-2 h-4 w-4" />
            Try again
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
