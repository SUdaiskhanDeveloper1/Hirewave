'use client';

import { keepPreviousData, useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import type { ApplicantsQuery, ApplicantsResponse } from '@/lib/api/contracts';
import { applicantsApi } from '@/lib/api/endpoints';
import { queryKeys } from '@/lib/query/keys';
import type { Applicant } from '@/types/domain';

const APPLICANTS_STALE_TIME = 30_000;

/** A single page of applicants, used by the dashboard "latest applications" card. */
export function useApplicants(query: ApplicantsQuery, initialData?: ApplicantsResponse) {
  return useQuery({
    queryKey: queryKeys.applicants.list(query),
    queryFn: ({ signal }) => applicantsApi.list(query, { signal }),
    placeholderData: keepPreviousData,
    staleTime: APPLICANTS_STALE_TIME,
    ...(initialData ? { initialData } : {}),
  });
}

/**
 * Incrementally loaded applicant list for the pipeline table.
 *
 * Pages are fetched on demand and rendered through a windowed list, so a 1,400-row
 * pipeline costs one page of JSON and a few dozen DOM nodes rather than the lot.
 */
export function useInfiniteApplicants(query: ApplicantsQuery) {
  const result = useInfiniteQuery({
    queryKey: [...queryKeys.applicants.list(query), 'infinite'] as const,
    queryFn: ({ pageParam, signal }) =>
      applicantsApi.list({ ...query, page: pageParam }, { signal }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.meta.hasNextPage ? lastPage.meta.page + 1 : undefined,
    staleTime: APPLICANTS_STALE_TIME,
  });

  // Flattened once per data change rather than on every render of the table.
  const applicants = useMemo<readonly Applicant[]>(
    () => result.data?.pages.flatMap((page) => page.data) ?? [],
    [result.data],
  );

  return { ...result, applicants, total: result.data?.pages[0]?.meta.total ?? 0 };
}
