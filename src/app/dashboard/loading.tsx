import { Skeleton } from '@/components/ui/Skeleton';
import { JobListSkeleton } from '@/components/jobs/JobSkeleton';

export default function DashboardLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Skeleton className="h-8 w-72 max-w-full" />
      <Skeleton className="mt-2 h-4 w-96 max-w-full" />

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} className="h-[74px] rounded-card" />
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
        <div className="space-y-4">
          <Skeleton className="h-6 w-52" />
          <JobListSkeleton count={3} />
        </div>
        <Skeleton className="h-64 rounded-card" />
      </div>
    </div>
  );
}
