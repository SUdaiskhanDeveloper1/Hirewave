import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';

export function MetricCardSkeleton() {
  return (
    <Card className="p-5">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="mt-3 h-7 w-20" />
      <Skeleton className="mt-3 h-3 w-28" />
    </Card>
  );
}

export function ChartSkeleton({ height = 'h-52' }: { readonly height?: string }) {
  return (
    <div className={`${height} w-full animate-pulse rounded-lg bg-sunken`} aria-hidden="true" />
  );
}
