'use client';

import { useEffect, useState } from 'react';
import { ButtonLink } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Icon } from '@/components/ui/Icon';
import { Pagination } from '@/components/ui/Pagination';
import { useJobFacets, useJobs, usePrefetchJobs } from '@/hooks/use-jobs';
import { useJobSearch } from '@/hooks/use-job-search';
import { describeJobsQuery } from '@/lib/seo-jobs';
import { formatCompactNumber } from '@/lib/utils/format';
import { ActiveFilterChips } from './ActiveFilterChips';
import { JobFilters } from './JobFilters';
import { JobList } from './JobList';
import { JobListSkeleton } from './JobSkeleton';
import { JobSearchInput } from './JobSearchInput';
import { JobSortSelect } from './JobSortSelect';
import { MobileFilterSheet } from './MobileFilterSheet';

/**
 * Search page orchestrator.
 *
 * One client component owns the URL state and the two queries; everything below it is
 * presentational and receives stable callbacks. The server has already prefetched the
 * first result page and the facets into the React Query cache, so on initial load this
 * renders from cache and issues no request at all.
 */
export function JobResults() {
  const {
    query,
    activeFilterCount,
    setKeyword,
    toggleFilter,
    setLocation,
    setIndustry,
    setPosted,
    setSalaryMin,
    setSort,
    setPage,
    clearFilters,
    hrefForPage,
    queryForPage,
  } = useJobSearch();

  const jobs = useJobs(query);
  const facets = useJobFacets(query);
  const prefetchJobs = usePrefetchJobs();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const meta = jobs.data?.meta;
  const nextPage = meta?.hasNextPage ? meta.page + 1 : undefined;

  // Warm the next page shortly after the current one settles. By the time the user
  // reaches the pagination control the request is usually already cached, and the
  // short delay keeps it off the critical path of the render that just happened.
  useEffect(() => {
    if (nextPage === undefined || jobs.isFetching) return;
    const timer = window.setTimeout(() => prefetchJobs(queryForPage(nextPage)), 300);
    return () => window.clearTimeout(timer);
  }, [nextPage, jobs.isFetching, prefetchJobs, queryForPage]);

  const total = meta?.total ?? facets.data?.total ?? 0;
  // Skeletons only when there is genuinely nothing to show: a refetch keeps the
  // previous page visible (dimmed) rather than collapsing the layout.
  const showSkeleton = jobs.isPending;

  // The heading lives inside the client boundary so it tracks the active filters. It
  // is still in the server-rendered HTML, so crawlers see the same H1 the user does.
  const { heading } = describeJobsQuery(query, total);

  const filterProps = {
    facets: facets.data,
    query,
    activeFilterCount,
    onToggleFilter: toggleFilter,
    onLocationChange: setLocation,
    onIndustryChange: setIndustry,
    onPostedChange: setPosted,
    onSalaryChange: setSalaryMin,
    onClear: clearFilters,
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[17.5rem_minmax(0,1fr)] lg:items-start">
      <header className="lg:col-span-2">
        <h1 className="text-2xl font-semibold tracking-tight text-ink">{heading}</h1>
        <p className="mt-1.5 text-sm text-ink-secondary">
          Filters are stored in the address bar, so this exact search can be shared or
          bookmarked.
        </p>
      </header>

      {/* Desktop sidebar. Sticky so the filters stay reachable while results scroll. */}
      <div className="hidden lg:sticky lg:top-20 lg:block">
        <JobFilters {...filterProps} />
      </div>

      <div className="min-w-0">
        <div className="mb-4 space-y-3">
          <div className="flex gap-2">
            <div className="min-w-0 flex-1">
              <JobSearchInput value={query.q ?? ''} onSearch={setKeyword} />
            </div>
            <button
              type="button"
              onClick={() => setIsSheetOpen(true)}
              className="inline-flex h-11 shrink-0 items-center gap-2 rounded-lg bg-raised px-3.5 text-sm font-medium text-ink ring-1 ring-inset ring-line-strong transition-colors hover:bg-sunken lg:hidden"
            >
              <Icon name="filter" size={15} />
              Filters
              {activeFilterCount > 0 ? (
                <span className="rounded-full bg-brand-600 px-1.5 text-xs text-white tabular-nums">
                  {activeFilterCount}
                </span>
              ) : null}
            </button>
          </div>

          <ActiveFilterChips
            query={query}
            onToggleFilter={toggleFilter}
            onLocationChange={setLocation}
            onIndustryChange={setIndustry}
            onPostedChange={setPosted}
            onSalaryChange={setSalaryMin}
            onClear={clearFilters}
          />

          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-ink-secondary" aria-live="polite">
              {showSkeleton ? (
                'Searching...'
              ) : (
                <>
                  <span className="font-semibold text-ink">{formatCompactNumber(total)}</span>
                  {total === 1 ? ' job' : ' jobs'}
                  {query.q ? (
                    <>
                      {' matching '}
                      <span className="font-medium text-ink">{query.q}</span>
                    </>
                  ) : null}
                </>
              )}
            </p>
            <JobSortSelect value={query.sort ?? 'relevance'} onChange={setSort} />
          </div>
        </div>

        {jobs.isError ? (
          <ErrorState
            title="Could not load jobs"
            description="The search service did not respond. Your filters are preserved in the URL, so retrying will run the same search."
            onRetry={() => void jobs.refetch()}
          />
        ) : showSkeleton ? (
          <JobListSkeleton count={6} />
        ) : jobs.data && jobs.data.data.length > 0 ? (
          <>
            <JobList jobs={jobs.data.data} isRefreshing={jobs.isFetching} />
            {meta ? (
              <div className="mt-8">
                <Pagination
                  meta={meta}
                  onPageChange={setPage}
                  hrefForPage={hrefForPage}
                  onPrefetchPage={(page) => prefetchJobs(queryForPage(page))}
                />
              </div>
            ) : null}
          </>
        ) : (
          <EmptyState
            title="No jobs found"
            description="Try changing your search or removing a filter. Broadening the location or clearing the salary minimum usually helps most."
            action={
              activeFilterCount > 0 ? (
                <ButtonLink href="/jobs" variant="secondary" size="sm">
                  Clear all filters
                </ButtonLink>
              ) : null
            }
          />
        )}
      </div>

      <MobileFilterSheet
        {...filterProps}
        open={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        resultCount={total}
      />
    </div>
  );
}
