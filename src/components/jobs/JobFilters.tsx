'use client';

import type { DatePosted, JobFacets, JobsQuery } from '@/lib/api/contracts';
import { DATE_POSTED_OPTIONS } from '@/lib/api/contracts';
import type { FilterDimension } from '@/hooks/use-job-search';
import { Icon } from '@/components/ui/Icon';
import { Select } from '@/components/ui/Select';
import { Skeleton } from '@/components/ui/Skeleton';
import { cn } from '@/lib/utils/cn';
import { JobFilterGroup } from './JobFilterGroup';

const SALARY_STEPS = [60_000, 90_000, 120_000, 150_000, 180_000] as const;

const DATE_POSTED_LABELS: Record<DatePosted, string> = {
  '24h': 'Last 24 hours',
  '3d': 'Last 3 days',
  '7d': 'Last week',
  '14d': 'Last 2 weeks',
  '30d': 'Last month',
};

export interface JobFiltersProps {
  readonly facets: JobFacets | undefined;
  readonly query: JobsQuery;
  readonly activeFilterCount: number;
  readonly onToggleFilter: (dimension: FilterDimension, value: string) => void;
  readonly onLocationChange: (value: string | undefined) => void;
  readonly onIndustryChange: (value: string | undefined) => void;
  readonly onPostedChange: (value: DatePosted | undefined) => void;
  readonly onSalaryChange: (value: number | undefined) => void;
  readonly onClear: () => void;
  /** Hides the panel chrome when the filters are already inside a sheet header. */
  readonly bare?: boolean;
}

const EMPTY_SELECTION: readonly string[] = [];

function FiltersSkeleton() {
  return (
    <div className="space-y-6 p-5" aria-hidden="true">
      {Array.from({ length: 3 }, (_, group) => (
        <div key={group} className="space-y-2.5">
          <Skeleton className="h-3 w-20" />
          {Array.from({ length: 4 }, (_, row) => (
            <Skeleton key={row} className="h-4 w-full" />
          ))}
        </div>
      ))}
    </div>
  );
}

/**
 * The filter panel.
 *
 * Rendered in the desktop sidebar and, unchanged, inside the mobile filter sheet -
 * one implementation, so the two can never offer different filters. Counts come from
 * the facets endpoint, so an option that would return nothing is visibly dimmed
 * before it is clicked.
 */
export function JobFilters({
  facets,
  query,
  activeFilterCount,
  onToggleFilter,
  onLocationChange,
  onIndustryChange,
  onPostedChange,
  onSalaryChange,
  onClear,
  bare = false,
}: JobFiltersProps) {
  const body = !facets ? (
    <FiltersSkeleton />
  ) : (
    <div className="space-y-5 p-5">
      <div>
        <label
          htmlFor="filter-posted"
          className="mb-2 block text-xs font-semibold tracking-wide text-ink-muted uppercase"
        >
          Date posted
        </label>
        <Select
          id="filter-posted"
          selectSize="sm"
          value={query.posted ?? ''}
          onChange={(event) => onPostedChange((event.target.value || undefined) as DatePosted)}
        >
          <option value="">Any time</option>
          {DATE_POSTED_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {DATE_POSTED_LABELS[option]}
            </option>
          ))}
        </Select>
      </div>

      <div>
        <label
          htmlFor="filter-location"
          className="mb-2 block text-xs font-semibold tracking-wide text-ink-muted uppercase"
        >
          Location
        </label>
        <Select
          id="filter-location"
          selectSize="sm"
          value={query.location ?? ''}
          onChange={(event) => onLocationChange(event.target.value || undefined)}
        >
          <option value="">Anywhere</option>
          {facets.locations.map((bucket) => (
            <option key={bucket.value} value={bucket.value}>
              {bucket.label} ({bucket.count})
            </option>
          ))}
        </Select>
      </div>

      <JobFilterGroup
        label="Work arrangement"
        dimension="mode"
        buckets={facets.modes}
        selected={query.mode ?? EMPTY_SELECTION}
        onToggle={onToggleFilter}
      />

      <JobFilterGroup
        label="Role"
        dimension="role"
        buckets={facets.roles}
        selected={query.role ?? EMPTY_SELECTION}
        onToggle={onToggleFilter}
      />

      <JobFilterGroup
        label="Experience level"
        dimension="level"
        buckets={facets.levels}
        selected={query.level ?? EMPTY_SELECTION}
        onToggle={onToggleFilter}
      />

      <JobFilterGroup
        label="Employment type"
        dimension="type"
        buckets={facets.types}
        selected={query.type ?? EMPTY_SELECTION}
        onToggle={onToggleFilter}
      />

      <div>
        <label
          htmlFor="filter-industry"
          className="mb-2 block text-xs font-semibold tracking-wide text-ink-muted uppercase"
        >
          Industry
        </label>
        <Select
          id="filter-industry"
          selectSize="sm"
          value={query.industry ?? ''}
          onChange={(event) => onIndustryChange(event.target.value || undefined)}
        >
          <option value="">All industries</option>
          {facets.industries.map((bucket) => (
            <option key={bucket.value} value={bucket.value}>
              {bucket.label} ({bucket.count})
            </option>
          ))}
        </Select>
      </div>

      <div>
        <label
          htmlFor="filter-salary"
          className="mb-2 block text-xs font-semibold tracking-wide text-ink-muted uppercase"
        >
          Minimum salary
        </label>
        <Select
          id="filter-salary"
          selectSize="sm"
          value={query.salaryMin ?? ''}
          onChange={(event) =>
            onSalaryChange(event.target.value ? Number(event.target.value) : undefined)
          }
        >
          <option value="">Any salary</option>
          {SALARY_STEPS.map((step) => (
            <option key={step} value={step}>
              {`$${step / 1000}k and above`}
            </option>
          ))}
        </Select>
      </div>
    </div>
  );

  if (bare) return body;

  return (
    <div className={cn('rounded-card bg-raised ring-1 ring-line')}>
      <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-ink">
          <Icon name="filter" size={15} className="text-ink-muted" />
          Filters
        </h2>
        {activeFilterCount > 0 ? (
          <button
            type="button"
            onClick={onClear}
            className="text-xs font-medium text-brand-600 transition-colors hover:text-brand-700"
          >
            Clear all ({activeFilterCount})
          </button>
        ) : null}
      </div>
      {body}
    </div>
  );
}
