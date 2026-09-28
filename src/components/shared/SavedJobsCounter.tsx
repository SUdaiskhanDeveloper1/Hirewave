'use client';

import Link from 'next/link';
import { Icon } from '@/components/ui/Icon';
import { useSavedJobs } from '@/hooks/use-saved-jobs';

/**
 * Reads the same cache entry the save buttons write to, so the count updates
 * optimistically with the click that caused it.
 */
export function SavedJobsCounter() {
  const { data } = useSavedJobs();
  const count = data?.length ?? 0;

  return (
    <Link
      href="/saved"
      aria-label={`Saved jobs (${count})`}
      className="relative inline-flex size-9 items-center justify-center rounded-lg text-ink-secondary transition-colors hover:bg-sunken hover:text-ink"
    >
      <Icon name="bookmark" size={17} />
      {count > 0 ? (
        <span className="absolute -top-0.5 -right-0.5 flex min-w-4 items-center justify-center rounded-full bg-brand-600 px-1 text-[10px] font-semibold text-white tabular-nums">
          {count > 99 ? '99+' : count}
        </span>
      ) : null}
    </Link>
  );
}
