'use client';

import { useEffect } from 'react';
import { Card, CardContent, Button } from '@/components/ui';
import { PageContainer } from '@/components/layout';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to error reporting service (e.g., Sentry)
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-page px-4">
      <Card className="max-w-md">
        <CardContent className="text-center space-y-4 py-8">
          {/* Error Icon */}
          <div className="w-16 h-16 mx-auto bg-status-error-bg rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-status-error-text"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>

          {/* Error Message */}
          <div>
            <h2 className="text-heading-lg mb-2">Something went wrong</h2>
            <p className="text-body-sm text-text-secondary">
              An unexpected error occurred. Please try again.
            </p>

            {/* Show error message in development */}
            {process.env.NODE_ENV === 'development' && error.message && (
              <p className="mt-3 text-caption text-status-error-text font-mono bg-status-error-bg/30 p-2 rounded">
                {error.message}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2">
            <Button onClick={reset} className="w-full">
              Try Again
            </Button>
            <button
              onClick={() => (window.location.href = '/')}
              className="text-caption text-text-secondary hover:text-primary-main transition-colors"
            >
              Go to Home
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
