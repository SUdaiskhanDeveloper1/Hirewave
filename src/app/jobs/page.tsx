import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import type { Metadata } from 'next';
import { Suspense } from 'react';
import { JobResults } from '@/components/jobs/JobResults';
import { JobFiltersSkeleton, JobListSkeleton } from '@/components/jobs/JobSkeleton';
import { Skeleton } from '@/components/ui/Skeleton';
import type { RawSearchParams } from '@/lib/api/query-params';
import { parseJobsQuery } from '@/lib/api/query-params';
import { makeQueryClient } from '@/lib/query/client';
import { queryKeys } from '@/lib/query/keys';
import { buildMetadata } from '@/lib/seo';
import { describeJobsQuery, jobsIndexingPolicy } from '@/lib/seo-jobs';
import { getJobFacets, getJobsPage } from '@/lib/server/queries';

interface JobsPageProps {
  readonly searchParams: Promise<RawSearchParams>;
}

/**
 * Server-rendered per request because results depend on the query string. This is the
 * SEO-critical listing surface, so the markup must contain the actual jobs rather
 * than an empty shell waiting for a client fetch.
 */
export async function generateMetadata({ searchParams }: JobsPageProps): Promise<Metadata> {
  const query = parseJobsQuery(await searchParams);
  const { meta } = await getJobsPage({ ...query, perPage: 1 });
  const { title, description } = describeJobsQuery(query, meta.total);
  const { noIndex, canonicalPath } = jobsIndexingPolicy(query);

  return buildMetadata({ title, description, path: canonicalPath, noIndex });
}

/** Mirrors JobResults' layout, including its heading, so nothing jumps on swap. */
function JobsPageSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-[17rem_minmax(0,1fr)] lg:items-start">
      <div className="space-y-2 lg:col-span-2">
        <Skeleton className="h-8 w-72 max-w-full" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>
      <JobFiltersSkeleton />
      <div className="space-y-4">
        <Skeleton className="h-11 w-full rounded-lg" />
        <JobListSkeleton count={6} />
      </div>
    </div>
  );
}

export default async function JobsPage({ searchParams }: JobsPageProps) {
  const query = parseJobsQuery(await searchParams);

  // Seed a request-scoped cache from the active provider. The keys are built by the
  // same factory the client hook uses, so after hydration React Query finds fresh
  // entries and issues zero requests on first load.
  //
  // The two lookups are independent, so they run together, and the cache is seeded
  // with the resolved payloads: handing `setQueryData` a promise would store `{}`.
  const queryClient = makeQueryClient();
  const [jobs, facets] = await Promise.all([getJobsPage(query), getJobFacets(query)]);
  queryClient.setQueryData(queryKeys.jobs.list(query), jobs);
  queryClient.setQueryData(queryKeys.jobs.facets(query), facets);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <HydrationBoundary state={dehydrate(queryClient)}>
        {/* useSearchParams suspends on a static render; the boundary also gives the
            streamed response something to paint before the client takes over. */}
        <Suspense fallback={<JobsPageSkeleton />}>
          <JobResults />
        </Suspense>
      </HydrationBoundary>
    </div>
  );
}
