'use client';

import { useQuery } from '@tanstack/react-query';
import { recruiterApi } from '@/lib/api/endpoints';
import type { RecruiterOverview } from '@/types/domain';
import { STALE_TIME } from '@/lib/query/client';
import { queryKeys } from '@/lib/query/keys';

/**
 * Dashboard aggregates. Cached for the whole recruiter session so navigating between
 * dashboard tabs never re-runs the aggregation.
 */
export function useRecruiterOverview(initialData?: RecruiterOverview) {
  return useQuery({
    queryKey: queryKeys.recruiter.overview,
    queryFn: ({ signal }) => recruiterApi.overview({ signal }),
    select: (response) => response.data,
    staleTime: STALE_TIME.analytics,
    ...(initialData ? { initialData: { data: initialData } } : {}),
  });
}
