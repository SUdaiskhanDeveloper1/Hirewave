'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Icon } from '@/components/ui/Icon';
import { Skeleton } from '@/components/ui/Skeleton';
import { useInfiniteApplicants } from '@/hooks/use-applicants';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { useMediaQuery } from '@/hooks/use-media-query';
import { useVirtualRows } from '@/hooks/use-virtual-rows';
import type { ApplicantSort } from '@/lib/api/contracts';
import { APPLICANT_STAGE_LABELS } from '@/lib/labels';
import { cn } from '@/lib/utils/cn';
import { formatCompactNumber } from '@/lib/utils/format';
import type { ApplicantStage } from '@/types/domain';
import { APPLICANT_STAGES } from '@/types/domain';
import {
  APPLICANT_GRID,
  APPLICANT_ROW_HEIGHT,
  APPLICANT_ROW_HEIGHT_COMPACT,
  ApplicantRow,
} from './ApplicantRow';

const VIEWPORT_HEIGHT = 608;
/** Fetch the next page once the window comes within this many rows of the end. */
const PREFETCH_THRESHOLD = 12;

const SORT_LABELS: Record<ApplicantSort, string> = {
  recent: 'Most recent',
  match: 'Best match',
  name: 'Name (A-Z)',
};

/**
 * Recruiter pipeline table.
 *
 * Three techniques keep a 1,400-row pipeline responsive, and each is doing real work:
 *
 *  - the server paginates, so a filter change transfers 25 rows rather than the set;
 *  - pages load on demand as the user scrolls, through an infinite query;
 *  - the loaded rows are windowed, so the DOM holds ~30 nodes no matter how far
 *    down the list you are.
 *
 * Search is debounced so a five-letter name is one request, not five.
 */
export function ApplicantPipeline() {
  const [search, setSearch] = useState('');
  const [stages, setStages] = useState<readonly ApplicantStage[]>([]);
  const [sort, setSort] = useState<ApplicantSort>('recent');

  const debouncedSearch = useDebouncedValue(search, 280);

  // The postings list links here with ?jobId=..., so a recruiter can go straight from
  // a job to the people who applied to it.
  const searchParams = useSearchParams();
  const jobId = searchParams.get('jobId') ?? undefined;

  // A stable query object: without the memo every keystroke would produce a new
  // object identity and a new cache key even when the debounced value has not moved.
  const query = useMemo(
    () => ({
      ...(debouncedSearch ? { q: debouncedSearch } : {}),
      ...(stages.length > 0 ? { stage: stages } : {}),
      ...(jobId ? { jobId } : {}),
      sort,
      perPage: 40,
    }),
    [debouncedSearch, stages, sort, jobId],
  );

  const {
    applicants,
    total,
    isPending,
    isError,
    isFetching,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    refetch,
  } = useInfiniteApplicants(query);

  // Five columns cannot be read on a phone, so narrow screens get a stacked row.
  // The windowing maths needs the height up front, which is the one piece of this
  // that CSS cannot express on its own.
  const isCompact = useMediaQuery('(max-width: 767px)');
  const rowHeight = isCompact ? APPLICANT_ROW_HEIGHT_COMPACT : APPLICANT_ROW_HEIGHT;

  const scrollerRef = useRef<HTMLDivElement>(null);
  const { startIndex, endIndex, paddingTop, paddingBottom, onScroll } = useVirtualRows(
    scrollerRef,
    { rowCount: applicants.length, rowHeight },
  );

  // Load ahead of the scroll position rather than waiting for the user to hit bottom.
  useEffect(() => {
    if (!hasNextPage || isFetchingNextPage) return;
    if (endIndex >= applicants.length - PREFETCH_THRESHOLD) void fetchNextPage();
  }, [endIndex, applicants.length, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const toggleStage = (stage: ApplicantStage): void => {
    setStages((current) =>
      current.includes(stage) ? current.filter((entry) => entry !== stage) : [...current, stage],
    );
  };

  const visible = applicants.slice(startIndex, endIndex);

  return (
    <Card className="overflow-hidden">
      <div className="border-b border-line p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-56 flex-1">
            <Icon
              name="search"
              size={16}
              className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-ink-muted"
            />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search candidates by name, email or role"
              aria-label="Search candidates"
              className="h-9 w-full rounded-lg bg-canvas pl-9 pr-3 text-sm text-ink ring-1 ring-inset ring-line-strong placeholder:text-ink-muted focus:ring-2 focus:ring-brand-600"
            />
          </div>

          <select
            value={sort}
            onChange={(event) => setSort(event.target.value as ApplicantSort)}
            aria-label="Sort candidates"
            className="h-9 rounded-lg bg-canvas px-2.5 text-sm font-medium text-ink ring-1 ring-inset ring-line-strong"
          >
            {(Object.keys(SORT_LABELS) as ApplicantSort[]).map((option) => (
              <option key={option} value={option}>
                {SORT_LABELS[option]}
              </option>
            ))}
          </select>

          <p className="text-sm text-ink-secondary tabular-nums" aria-live="polite">
            {isPending ? 'Loading' : `${formatCompactNumber(total)} candidates`}
          </p>
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {APPLICANT_STAGES.map((stage) => {
            const isActive = stages.includes(stage);
            return (
              <button
                key={stage}
                type="button"
                onClick={() => toggleStage(stage)}
                aria-pressed={isActive}
                className={cn(
                  'rounded-full px-3 py-1 text-xs font-medium ring-1 ring-inset transition-colors',
                  isActive
                    ? 'bg-brand-600 text-white ring-brand-600'
                    : 'bg-canvas text-ink-secondary ring-line hover:text-ink',
                )}
              >
                {APPLICANT_STAGE_LABELS[stage]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Column headings belong to the table layout only; the stacked rows label
          their own values. */}
      <div
        className={`hidden ${APPLICANT_GRID} gap-4 border-b border-line bg-sunken px-4 py-2.5 text-xs font-semibold tracking-wide text-ink-muted uppercase md:grid`}
        role="presentation"
      >
        <span>Candidate</span>
        <span>Applied for</span>
        <span>Stage</span>
        <span className="text-right">Match</span>
        <span className="text-right">Applied</span>
      </div>

      {isError ? (
        <div className="p-6">
          <ErrorState
            title="Could not load candidates"
            description="The applicant service did not respond."
            onRetry={() => void refetch()}
          />
        </div>
      ) : isPending ? (
        <div className="divide-y divide-line">
          {Array.from({ length: 8 }, (_, index) => (
            <div key={index} className="flex items-center gap-4 px-4" style={{ height: rowHeight }}>
              <Skeleton className="size-8 rounded-xl" />
              <Skeleton className="h-4 w-40" />
              <Skeleton className="ml-auto h-4 w-24" />
            </div>
          ))}
        </div>
      ) : applicants.length === 0 ? (
        <div className="p-6">
          <EmptyState
            icon="users"
            title="No candidates match"
            description="Try a different stage or clear the search to see the whole pipeline."
          />
        </div>
      ) : (
        <div
          ref={scrollerRef}
          onScroll={onScroll}
          className="overflow-y-auto"
          style={{ height: VIEWPORT_HEIGHT }}
          // The scroller owns its own layout and paint work.
          aria-busy={isFetching}
        >
          {/* Spacers stand in for the rows outside the window, so the scrollbar
              reflects the full list while the DOM holds only what is visible. */}
          <div style={{ height: paddingTop }} aria-hidden="true" />
          {visible.map((applicant) => (
            <ApplicantRow key={applicant.id} applicant={applicant} compact={isCompact} />
          ))}
          <div style={{ height: paddingBottom }} aria-hidden="true" />
        </div>
      )}

      {isFetchingNextPage ? (
        <p className="border-t border-line px-4 py-2.5 text-center text-xs text-ink-muted">
          Loading more candidates...
        </p>
      ) : null}
    </Card>
  );
}
