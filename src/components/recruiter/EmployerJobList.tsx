'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ButtonLink } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Icon } from '@/components/ui/Icon';
import { Skeleton } from '@/components/ui/Skeleton';
import { StatusBadge } from '@/components/ui/StatusBadge';
import type { StatusTone } from '@/components/ui/StatusBadge';
import { Tabs } from '@/components/ui/Tabs';
import { useEmployerJobs } from '@/hooks/use-employer-jobs';
import { EMPLOYMENT_TYPE_LABELS, WORK_MODE_LABELS } from '@/lib/labels';
import { formatCompactNumber, formatRelativeDays } from '@/lib/utils/format';
import type { EmployerJob, JobPostStatus } from '@/types/domain';

type StatusFilter = JobPostStatus | 'all';

const STATUS_LABELS: Record<JobPostStatus, string> = {
  active: 'Active',
  draft: 'Draft',
  closed: 'Closed',
};

const STATUS_TONES: Record<JobPostStatus, StatusTone> = {
  active: 'success',
  draft: 'warning',
  closed: 'neutral',
};

const EMPTY_COPY: Record<StatusFilter, { readonly title: string; readonly description: string }> = {
  all: {
    title: 'No postings yet',
    description: 'Create your first job posting and it will appear here.',
  },
  active: {
    title: 'No active postings',
    description: 'Published roles that are open to applications will be listed here.',
  },
  draft: {
    title: 'No drafts',
    description: 'Postings you have started but not published are kept here.',
  },
  closed: {
    title: 'No closed postings',
    description: 'Roles you have filled or withdrawn will be archived here.',
  },
};

function PostingRow({ posting }: { readonly posting: EmployerJob }) {
  const title = posting.job?.title ?? posting.draftTitle ?? 'Untitled posting';

  return (
    <li className="flex flex-wrap items-center gap-4 border-b border-line px-4 py-4 last:border-b-0 sm:px-5">
      <div className="min-w-56 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          {posting.job ? (
            <Link
              href={`/jobs/${posting.job.slug}`}
              className="text-[15px] font-semibold text-ink transition-colors hover:text-brand-600"
            >
              {title}
            </Link>
          ) : (
            <span className="text-[15px] font-semibold text-ink">{title}</span>
          )}
          <StatusBadge tone={STATUS_TONES[posting.status]}>
            {STATUS_LABELS[posting.status]}
          </StatusBadge>
          {posting.newApplicantCount > 0 ? (
            <StatusBadge tone="info">{`${posting.newApplicantCount} new`}</StatusBadge>
          ) : null}
        </div>

        <p className="mt-1 text-sm text-ink-muted">
          {posting.job ? (
            <>
              {posting.job.location} · {WORK_MODE_LABELS[posting.job.workMode]} ·{' '}
              {EMPLOYMENT_TYPE_LABELS[posting.job.employmentType]}
            </>
          ) : (
            'Not published - finish this draft to make it visible'
          )}
        </p>
      </div>

      <dl className="flex items-center gap-6 text-sm">
        <div className="text-right">
          <dt className="text-xs text-ink-muted">Views</dt>
          <dd className="font-medium text-ink tabular-nums">
            {formatCompactNumber(posting.views)}
          </dd>
        </div>
        <div className="text-right">
          <dt className="text-xs text-ink-muted">Applicants</dt>
          <dd className="font-medium text-ink tabular-nums">{posting.applicantCount}</dd>
        </div>
        <div className="hidden text-right sm:block">
          <dt className="text-xs text-ink-muted">Updated</dt>
          <dd className="font-medium text-ink">
            <time dateTime={posting.updatedAt} suppressHydrationWarning>
              {formatRelativeDays(posting.updatedAt)}
            </time>
          </dd>
        </div>
      </dl>

      <ButtonLink
        href={posting.job ? `/recruiter/applicants?jobId=${posting.jobId}` : '/recruiter/jobs/new'}
        variant="secondary"
        size="sm"
      >
        {posting.job ? 'View candidates' : 'Continue draft'}
      </ButtonLink>
    </li>
  );
}

/**
 * Posting management.
 *
 * Deliberately a table-like list rather than cards: an employer scanning twenty
 * postings is comparing numbers down a column, which cards make harder.
 */
export function EmployerJobList() {
  const [status, setStatus] = useState<StatusFilter>('all');
  const { data, isPending, isError, refetch } = useEmployerJobs();

  const postings = data?.data ?? [];
  const counts = {
    all: postings.length,
    active: postings.filter((posting) => posting.status === 'active').length,
    draft: postings.filter((posting) => posting.status === 'draft').length,
    closed: postings.filter((posting) => posting.status === 'closed').length,
  };

  const visible =
    status === 'all' ? postings : postings.filter((posting) => posting.status === status);

  return (
    <>
      <Tabs
        label="Filter postings by status"
        value={status}
        onChange={setStatus}
        items={[
          { value: 'all', label: 'All postings', count: counts.all },
          { value: 'active', label: 'Active', count: counts.active },
          { value: 'draft', label: 'Drafts', count: counts.draft },
          { value: 'closed', label: 'Closed', count: counts.closed },
        ]}
      />

      <div className="mt-6">
        {isError ? (
          <ErrorState
            title="Could not load your postings"
            description="The employer service did not respond."
            onRetry={() => void refetch()}
          />
        ) : isPending ? (
          <Card className="overflow-hidden">
            {Array.from({ length: 5 }, (_, index) => (
              <div key={index} className="flex items-center gap-4 border-b border-line px-5 py-4 last:border-b-0">
                <Skeleton className="h-5 flex-1" />
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-8 w-28 rounded-lg" />
              </div>
            ))}
          </Card>
        ) : visible.length === 0 ? (
          <EmptyState
            icon="briefcase"
            title={EMPTY_COPY[status].title}
            description={EMPTY_COPY[status].description}
            action={
              <ButtonLink href="/recruiter/jobs/new">
                <Icon name="plus" size={15} />
                Post a job
              </ButtonLink>
            }
          />
        ) : (
          <Card className="overflow-hidden">
            <ul>
              {visible.map((posting) => (
                <PostingRow key={posting.id} posting={posting} />
              ))}
            </ul>
          </Card>
        )}
      </div>
    </>
  );
}
