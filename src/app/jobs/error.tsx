'use client';

import { ErrorState } from '@/components/ui/ErrorState';

/**
 * Route error boundary. Scoped to /jobs so a failed search does not take down the
 * header, footer or the rest of the app shell.
 */
export default function JobsError({ reset }: { readonly reset: () => void }) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <ErrorState
        title="Job search is unavailable"
        description="Something went wrong while loading these results. Your filters are still in the URL, so retrying will run the same search."
        onRetry={reset}
      />
    </div>
  );
}
