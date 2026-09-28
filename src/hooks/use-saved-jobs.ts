'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import type { SavedJobsResponse } from '@/lib/api/contracts';
import { savedJobsApi } from '@/lib/api/saved-jobs';
import { STALE_TIME } from '@/lib/query/client';
import { queryKeys } from '@/lib/query/keys';

const EMPTY: readonly string[] = [];

/** The full saved list. Used by the saved-jobs page and the header counter. */
export function useSavedJobs() {
  return useQuery({
    queryKey: queryKeys.savedJobs,
    queryFn: () => savedJobsApi.list(),
    select: (response) => response.data.jobIds,
    staleTime: STALE_TIME.local,
  });
}

/**
 * Membership test for one job.
 *
 * `select` narrows the cache entry to a boolean, so a save elsewhere on the page
 * only re-renders the buttons whose answer actually changed, rather than every
 * card subscribed to the list.
 */
export function useIsJobSaved(jobId: string): boolean {
  const { data } = useQuery({
    queryKey: queryKeys.savedJobs,
    queryFn: () => savedJobsApi.list(),
    select: (response) => response.data.jobIds.includes(jobId),
    staleTime: STALE_TIME.local,
  });

  return data ?? false;
}

export interface SaveJobVariables {
  readonly jobId: string;
  readonly nextSaved: boolean;
}

/**
 * Optimistic save/unsave.
 *
 * The cache is written before the request starts, so the button flips in the same
 * frame as the click. A failure restores the exact snapshot taken in `onMutate`.
 */
export function useSaveJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ jobId, nextSaved }: SaveJobVariables) =>
      nextSaved ? savedJobsApi.add(jobId) : savedJobsApi.remove(jobId),

    onMutate: async ({ jobId, nextSaved }) => {
      // Stop an in-flight read from landing after the optimistic write.
      await queryClient.cancelQueries({ queryKey: queryKeys.savedJobs });
      const previous = queryClient.getQueryData<SavedJobsResponse>(queryKeys.savedJobs);

      queryClient.setQueryData<SavedJobsResponse>(queryKeys.savedJobs, (current) => {
        const jobIds = current?.data.jobIds ?? EMPTY;
        return {
          data: {
            jobIds: nextSaved
              ? [jobId, ...jobIds.filter((id) => id !== jobId)]
              : jobIds.filter((id) => id !== jobId),
          },
        };
      });

      return { previous };
    },

    onError: (_error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.savedJobs, context.previous);
      }
    },

    // The adapter returns the authoritative list, so adopt it instead of
    // invalidating and paying for another read.
    onSuccess: (response) => {
      queryClient.setQueryData(queryKeys.savedJobs, response);
    },
  });
}

/** Ergonomic wrapper: one stable callback per job id. */
export function useToggleSavedJob(jobId: string): {
  readonly isSaved: boolean;
  readonly isPending: boolean;
  readonly toggle: () => void;
} {
  const isSaved = useIsJobSaved(jobId);
  const { mutate, isPending } = useSaveJob();

  const toggle = useCallback(() => {
    mutate({ jobId, nextSaved: !isSaved });
  }, [mutate, jobId, isSaved]);

  return { isSaved, isPending, toggle };
}
