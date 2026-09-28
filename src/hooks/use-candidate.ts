'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { candidateApi } from '@/lib/api/candidate';
import type { CandidateProfile } from '@/types/domain';
import { STALE_TIME } from '@/lib/query/client';
import { queryKeys } from '@/lib/query/keys';

/** The signed-in candidate. One account until auth exists. */
export function useCandidateProfile() {
  return useQuery({
    queryKey: queryKeys.candidate.profile,
    queryFn: () => candidateApi.profile(),
    select: (response) => response.data,
    staleTime: STALE_TIME.local,
  });
}

export function useApplications() {
  return useQuery({
    queryKey: queryKeys.candidate.applications,
    queryFn: ({ signal }) => candidateApi.applications(signal),
    select: (response) => response.data,
    staleTime: 30_000,
  });
}

/**
 * Submits an application and refreshes the list.
 *
 * Not optimistic on purpose: unlike saving a job, applying is a commitment the user
 * should see confirmed rather than assumed. The button stays in a pending state until
 * the call resolves.
 */
export function useApplyToJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (jobId: string) => candidateApi.apply(jobId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.candidate.applications });
    },
  });
}

/**
 * Saves profile edits and writes the response straight into the cache, so every
 * screen showing the profile updates without a second read.
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (changes: Partial<CandidateProfile>) => candidateApi.updateProfile(changes),
    onSuccess: (response) => {
      queryClient.setQueryData(queryKeys.candidate.profile, response);
    },
  });
}

/**
 * Share of the profile a hiring team would consider filled in.
 *
 * Deliberately a plain function of the profile rather than stored state: it cannot
 * drift out of date, and the list of what is missing comes from the same source as
 * the percentage.
 */
export function profileCompletion(profile: CandidateProfile): {
  readonly percent: number;
  readonly missing: readonly string[];
} {
  const checks: readonly (readonly [string, boolean])[] = [
    ['Professional headline', profile.headline.trim().length > 0],
    ['About section', profile.about.trim().length >= 80],
    ['Work experience', profile.experience.length > 0],
    ['Education', profile.education.length > 0],
    ['At least five skills', profile.skills.length >= 5],
    ['CV or resume', profile.resumeFileName !== null],
    ['A portfolio or profile link', profile.links.length > 0],
    ['Location', profile.location.trim().length > 0],
  ];

  const complete = checks.filter(([, done]) => done).length;

  return {
    percent: Math.round((complete / checks.length) * 100),
    missing: checks.filter(([, done]) => !done).map(([label]) => label),
  };
}
