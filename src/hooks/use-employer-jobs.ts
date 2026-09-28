'use client';

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { JobDraftInput } from '@/lib/api/employer';
import { employerApi } from '@/lib/api/employer';
import { queryKeys } from '@/lib/query/keys';
import type { JobPostStatus } from '@/types/domain';

export function useEmployerJobs(status?: JobPostStatus) {
  return useQuery({
    queryKey: queryKeys.employer.jobs(status),
    queryFn: ({ signal }) => employerApi.listJobs(status, signal),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}

export function useSaveJobDraft() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: JobDraftInput) => employerApi.saveDraft(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.employer.root });
    },
  });
}
