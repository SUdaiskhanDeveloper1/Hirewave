import { cn } from '@/lib/utils/cn';

interface SkeletonProps {
  readonly className?: string;
}

/**
 * A single shimmering block. Skeletons are composed from these in the shape of the
 * real content, so the swap does not move anything and contributes nothing to CLS.
 */
export function Skeleton({ className }: SkeletonProps) {
  return <div className={cn('shimmer rounded-md bg-sunken', className)} aria-hidden="true" />;
}
