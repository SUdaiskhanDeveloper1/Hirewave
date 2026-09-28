import { Skeleton } from '@/components/ui/Skeleton';

/** Mirrors JobCard's box model exactly, so replacing it shifts nothing. */
export function JobCardSkeleton() {
  return (
    <div className="rounded-card bg-raised p-4 ring-1 ring-line sm:p-5">
      <div className="flex items-start gap-3.5">
        <Skeleton className="size-11 rounded-xl" />
        <div className="flex-1 space-y-3">
          <div className="space-y-2">
            <Skeleton className="h-4 w-[58%]" />
            <Skeleton className="h-3.5 w-[38%]" />
          </div>
          <Skeleton className="h-3.5 w-[46%]" />
          <div className="flex gap-1.5 pt-0.5">
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-5 w-20 rounded-full" />
            <Skeleton className="h-5 w-14 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function JobListSkeleton({ count = 6 }: { readonly count?: number }) {
  return (
    <div className="grid gap-3" aria-hidden="true">
      {Array.from({ length: count }, (_, index) => (
        <JobCardSkeleton key={index} />
      ))}
    </div>
  );
}

export function JobFiltersSkeleton() {
  return (
    <div className="space-y-6 rounded-card bg-raised p-5 ring-1 ring-line" aria-hidden="true">
      {Array.from({ length: 3 }, (_, group) => (
        <div key={group} className="space-y-2.5">
          <Skeleton className="h-3.5 w-24" />
          {Array.from({ length: 4 }, (_, row) => (
            <Skeleton key={row} className="h-4 w-full" />
          ))}
        </div>
      ))}
    </div>
  );
}
