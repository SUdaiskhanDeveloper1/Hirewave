'use client';

import { useEffect } from 'react';
import { ErrorState } from '@/components/ui/ErrorState';

/**
 * Application error boundary. Keeps a failure in one route from blanking the app, and
 * gives the user a retry that re-renders the segment rather than reloading the page.
 */
export default function GlobalError({
  error,
  reset,
}: {
  readonly error: Error & { readonly digest?: string };
  readonly reset: () => void;
}) {
  useEffect(() => {
    // Swap for your error reporter. The digest correlates with the server-side log.
    console.error('Unhandled application error', error.digest ?? error.message);
  }, [error]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-24 sm:px-6 lg:px-8">
      <ErrorState onRetry={reset} />
    </div>
  );
}
