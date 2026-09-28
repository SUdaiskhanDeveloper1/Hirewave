import { JobFiltersSkeleton, JobListSkeleton } from '@/components/jobs/JobSkeleton';
import { Skeleton } from '@/components/ui/Skeleton';

/**
 * Route-level loading UI. Next.js streams this immediately while the server render
 * completes, so navigation to a search never leaves the viewport empty.
 */
export default function JobsLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>
      <div className="grid gap-6 lg:grid-cols-[17rem_minmax(0,1fr)] lg:items-start">
        <JobFiltersSkeleton />
        <div className="space-y-4">
          <Skeleton className="h-11 w-full rounded-lg" />
          <JobListSkeleton count={6} />
        </div>
      </div>
    </div>
  );
}
