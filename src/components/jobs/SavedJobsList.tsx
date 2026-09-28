'use client';

import { ButtonLink } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { useJobs } from '@/hooks/use-jobs';
import { useSavedJobs } from '@/hooks/use-saved-jobs';
import { JobList } from './JobList';
import { JobListSkeleton } from './JobSkeleton';

/**
 * Saved jobs.
 *
 * The identifiers live on the device, so this view has to be client-rendered; the
 * job *records* still come from the API, keyed by id. One batched request rather than
 * one per saved job, and the query is disabled entirely when nothing is saved.
 */
export function SavedJobsList() {
  const saved = useSavedJobs();
  const jobIds = saved.data ?? [];

  const jobs = useJobs(
    { ids: jobIds, perPage: 50 },
    { enabled: jobIds.length > 0 },
  );

  if (saved.isPending) return <JobListSkeleton count={3} />;

  if (jobIds.length === 0) {
    return (
      <EmptyState
        icon="bookmark"
        title="Nothing saved yet"
        description="Save a role from any listing and it will show up here, stored on this device."
        action={<ButtonLink href="/jobs">Browse open roles</ButtonLink>}
      />
    );
  }

  if (jobs.isError) {
    return <ErrorState onRetry={() => void jobs.refetch()} />;
  }

  if (jobs.isPending) return <JobListSkeleton count={jobIds.length} />;

  return (
    <>
      <p className="mb-4 text-sm text-ink-secondary">
        <span className="font-semibold text-ink">{jobs.data.data.length}</span> saved
        {jobs.data.data.length === 1 ? ' role' : ' roles'}
      </p>
      <JobList jobs={jobs.data.data} isRefreshing={jobs.isFetching} />
    </>
  );
}
