import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import type { Metadata } from 'next';
import { Suspense } from 'react';
import { CompanyDirectory } from '@/components/company/CompanyDirectory';
import { Skeleton } from '@/components/ui/Skeleton';
import { makeQueryClient } from '@/lib/query/client';
import { queryKeys } from '@/lib/query/keys';
import { buildMetadata } from '@/lib/seo';
import { getCompaniesPage } from '@/lib/server/queries';

export const metadata: Metadata = buildMetadata({
  title: 'Companies hiring',
  description:
    'Browse every company hiring on HireWave, with open role counts, team sizes and locations.',
  path: '/companies',
});

const INITIAL_QUERY = { perPage: 48 } as const;

export default async function CompaniesPage() {
  const { meta } = await getCompaniesPage(INITIAL_QUERY);

  // Same prefetch-and-hydrate pattern as the job search: the first paint comes from
  // the cache, and the client only fetches once the visitor actually searches.
  const queryClient = makeQueryClient();
  queryClient.setQueryData(queryKeys.companies.list(INITIAL_QUERY), await getCompaniesPage(INITIAL_QUERY));

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-ink">Companies hiring</h1>
        <p className="mt-1.5 text-sm text-ink-secondary">
          {meta.total} teams with open roles right now.
        </p>
      </header>

      <HydrationBoundary state={dehydrate(queryClient)}>
        <Suspense fallback={<Skeleton className="h-11 w-full max-w-md rounded-lg" />}>
          <CompanyDirectory />
        </Suspense>
      </HydrationBoundary>
    </div>
  );
}
