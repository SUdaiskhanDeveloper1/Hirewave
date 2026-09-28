'use client';

import { keepPreviousData, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import type { JobFacets, JobsQuery, JobsResponse } from '@/lib/api/contracts';
import { jobsApi } from '@/lib/api/endpoints';
import { STALE_TIME } from '@/lib/query/client';
import { queryKeys } from '@/lib/query/keys';

export interface UseJobsOptions {
  /** Server-rendered first page; skips a client fetch on initial load. */
  readonly initialData?: JobsResponse;
  readonly enabled?: boolean;
}

/**
 * Paginated job search.
 *
 * `keepPreviousData` is the reason paging and filtering feel instant: the previous
 * result stays on screen (dimmed by the caller) while the next one loads, so the
 * layout never collapses into a skeleton for an already-populated list.
 */
export function useJobs(query: JobsQuery, options: UseJobsOptions = {}) {
  return useQuery({
    queryKey: queryKeys.jobs.list(query),
    // The signal is forwarded to fetch, so a superseded search is aborted rather
    // than left to finish and be discarded.
    queryFn: ({ signal }) => jobsApi.list(query, { signal }),
    placeholderData: keepPreviousData,
    staleTime: STALE_TIME.search,
    ...(options.initialData ? { initialData: options.initialData } : {}),
    ...(options.enabled === undefined ? {} : { enabled: options.enabled }),
  });
}

/** Filter counts. Keyed by the text/location scope only, so checkbox toggles reuse it. */
export function useJobFacets(query: JobsQuery, initialData?: JobFacets) {
  return useQuery({
    queryKey: queryKeys.jobs.facets(query),
    queryFn: ({ signal }) => jobsApi.facets(query, { signal }),
    select: (response) => response.data,
    staleTime: STALE_TIME.search,
    ...(initialData ? { initialData: { data: initialData } } : {}),
  });
}

/**
 * Warms the cache for a page the user is about to ask for (next-page control hover,
 * or idle time after the current page settles). A prefetch that is already cached is
 * a no-op, so calling this liberally is safe.
 */
export function usePrefetchJobs(): (query: JobsQuery) => void {
  const queryClient = useQueryClient();

  return useCallback(
    (query: JobsQuery) => {
      void queryClient.prefetchQuery({
        queryKey: queryKeys.jobs.list(query),
        queryFn: ({ signal }) => jobsApi.list(query, { signal }),
        staleTime: STALE_TIME.search,
      });
    },
    [queryClient],
  );
}
