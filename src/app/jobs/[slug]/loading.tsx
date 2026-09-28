import { Skeleton } from '@/components/ui/Skeleton';

export default function JobDetailLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <Skeleton className="mb-5 h-4 w-56" />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
        <div className="space-y-6">
          <div className="rounded-card bg-raised p-5 ring-1 ring-line sm:p-7">
            <div className="flex gap-4">
              <Skeleton className="size-14 rounded-xl" />
              <div className="flex-1 space-y-2.5">
                <Skeleton className="h-7 w-[60%]" />
                <Skeleton className="h-4 w-[35%]" />
              </div>
            </div>
            <div className="mt-6 flex gap-1.5">
              <Skeleton className="h-5 w-20 rounded-full" />
              <Skeleton className="h-5 w-24 rounded-full" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
            <div className="mt-6 grid gap-4 border-t border-line pt-5 sm:grid-cols-3">
              {Array.from({ length: 3 }, (_, index) => (
                <div key={index} className="space-y-1.5">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-4 w-24" />
                </div>
              ))}
            </div>
            <Skeleton className="mt-6 h-12 w-52 rounded-lg" />
          </div>
          <div className="space-y-3 rounded-card bg-raised p-5 ring-1 ring-line sm:p-7">
            <Skeleton className="h-5 w-36" />
            {Array.from({ length: 6 }, (_, index) => (
              <Skeleton key={index} className="h-4 w-full" />
            ))}
          </div>
        </div>
        <div className="space-y-3 rounded-card bg-raised p-5 ring-1 ring-line">
          <Skeleton className="h-4 w-28" />
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} className="h-4 w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}
