'use client';

import Link from 'next/link';
import { Avatar } from '@/components/ui/Avatar';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { useApplicants } from '@/hooks/use-applicants';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { APPLICANT_STAGE_LABELS, APPLICANT_STAGE_TONE } from '@/lib/labels';
import { formatRelativeDays } from '@/lib/utils/format';

const RECENT_QUERY = { perPage: 6 } as const;

/**
 * Latest applications. Reads the page the server already prefetched into the cache,
 * so it renders from memory on first paint and only refetches when it goes stale.
 */
export function RecentApplicants() {
  const { data, isPending } = useApplicants(RECENT_QUERY);

  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
        <h2 className="text-sm font-semibold text-ink">Latest applications</h2>
        <Link
          href="/recruiter/applicants"
          className="text-xs font-medium text-brand-600 hover:text-brand-700"
        >
          View pipeline
        </Link>
      </div>

      <ul className="divide-y divide-line">
        {isPending || !data
          ? Array.from({ length: 6 }, (_, index) => (
              <li key={index} className="flex items-center gap-3 px-5 py-3">
                <Skeleton className="size-8 rounded-xl" />
                <Skeleton className="h-4 w-36" />
                <Skeleton className="ml-auto h-4 w-16" />
              </li>
            ))
          : data.data.map((applicant) => (
              <li key={applicant.id} className="flex items-center gap-3 px-5 py-3">
                <Avatar name={applicant.name} hue={applicant.brandHue} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink">{applicant.name}</p>
                  <p className="truncate text-xs text-ink-muted">{applicant.jobTitle}</p>
                </div>
                <StatusBadge tone={APPLICANT_STAGE_TONE[applicant.stage]}>
                  {APPLICANT_STAGE_LABELS[applicant.stage]}
                </StatusBadge>
                <span className="w-20 shrink-0 text-right text-xs text-ink-muted">
                  <time dateTime={applicant.appliedAt} suppressHydrationWarning>
                    {formatRelativeDays(applicant.appliedAt)}
                  </time>
                </span>
              </li>
            ))}
      </ul>
    </Card>
  );
}
