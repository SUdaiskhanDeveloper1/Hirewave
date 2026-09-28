import type { Metadata } from 'next';
import { Suspense } from 'react';
import { ApplicationsList } from '@/components/candidate/ApplicationsList';
import { Skeleton } from '@/components/ui/Skeleton';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Your applications',
  description: 'Track every role you have applied for and where it has got to.',
  path: '/applications',
  noIndex: true,
});

export default function ApplicationsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-ink">Your applications</h1>
        <p className="mt-1.5 text-sm text-ink-secondary">
          Every role you have applied for, grouped by where it has got to.
        </p>
      </header>

      {/* useSearchParams suspends during the static render of this shell. */}
      <Suspense fallback={<Skeleton className="h-11 w-full rounded-lg" />}>
        <ApplicationsList />
      </Suspense>
    </div>
  );
}
