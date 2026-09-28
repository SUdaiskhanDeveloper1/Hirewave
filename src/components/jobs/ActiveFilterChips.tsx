'use client';

import type { DatePosted, JobsQuery } from '@/lib/api/contracts';
import type { FilterDimension } from '@/hooks/use-job-search';
import { Icon } from '@/components/ui/Icon';
import {
  EMPLOYMENT_TYPE_LABELS,
  EXPERIENCE_LEVEL_LABELS,
  ROLE_LABELS,
  WORK_MODE_LABELS,
} from '@/lib/labels';
import type { EmploymentType, ExperienceLevel, RoleFamily, WorkMode } from '@/types/domain';

const DATE_POSTED_LABELS: Record<DatePosted, string> = {
  '24h': 'Last 24 hours',
  '3d': 'Last 3 days',
  '7d': 'Last week',
  '14d': 'Last 2 weeks',
  '30d': 'Last month',
};

interface Chip {
  readonly key: string;
  readonly label: string;
  readonly remove: () => void;
}

interface ActiveFilterChipsProps {
  readonly query: JobsQuery;
  readonly onToggleFilter: (dimension: FilterDimension, value: string) => void;
  readonly onLocationChange: (value: string | undefined) => void;
  readonly onIndustryChange: (value: string | undefined) => void;
  readonly onPostedChange: (value: DatePosted | undefined) => void;
  readonly onSalaryChange: (value: number | undefined) => void;
  readonly onClear: () => void;
}

/**
 * Removable summary of what is currently filtering the list.
 *
 * Without this the only record of an active filter is a checkbox in a panel that is
 * collapsed on mobile and scrolled away on desktop, which is how people end up
 * staring at an empty result set wondering why.
 */
export function ActiveFilterChips({
  query,
  onToggleFilter,
  onLocationChange,
  onIndustryChange,
  onPostedChange,
  onSalaryChange,
  onClear,
}: ActiveFilterChipsProps) {
  const chips: Chip[] = [];

  for (const value of query.role ?? []) {
    chips.push({
      key: `role-${value}`,
      label: ROLE_LABELS[value as RoleFamily],
      remove: () => onToggleFilter('role', value),
    });
  }
  for (const value of query.mode ?? []) {
    chips.push({
      key: `mode-${value}`,
      label: WORK_MODE_LABELS[value as WorkMode],
      remove: () => onToggleFilter('mode', value),
    });
  }
  for (const value of query.level ?? []) {
    chips.push({
      key: `level-${value}`,
      label: EXPERIENCE_LEVEL_LABELS[value as ExperienceLevel],
      remove: () => onToggleFilter('level', value),
    });
  }
  for (const value of query.type ?? []) {
    chips.push({
      key: `type-${value}`,
      label: EMPLOYMENT_TYPE_LABELS[value as EmploymentType],
      remove: () => onToggleFilter('type', value),
    });
  }
  if (query.location) {
    chips.push({
      key: 'location',
      label: query.location,
      remove: () => onLocationChange(undefined),
    });
  }
  if (query.industry) {
    chips.push({
      key: 'industry',
      label: query.industry,
      remove: () => onIndustryChange(undefined),
    });
  }
  if (query.posted) {
    chips.push({
      key: 'posted',
      label: DATE_POSTED_LABELS[query.posted],
      remove: () => onPostedChange(undefined),
    });
  }
  if (query.salaryMin) {
    chips.push({
      key: 'salary',
      label: `$${query.salaryMin / 1000}k and above`,
      remove: () => onSalaryChange(undefined),
    });
  }

  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {chips.map((chip) => (
        <button
          key={chip.key}
          type="button"
          onClick={chip.remove}
          className="group inline-flex items-center gap-1.5 rounded-full bg-brand-50 py-1 pr-1.5 pl-3 text-sm font-medium text-brand-700 transition-colors hover:bg-brand-100"
        >
          {chip.label}
          <span
            aria-hidden="true"
            className="flex size-4 items-center justify-center rounded-full bg-brand-100 text-brand-700 transition-colors group-hover:bg-brand-200"
          >
            <Icon name="close" size={10} strokeWidth={2.5} />
          </span>
          <span className="sr-only">Remove filter</span>
        </button>
      ))}

      {chips.length > 1 ? (
        <button
          type="button"
          onClick={onClear}
          className="ml-1 text-sm font-medium text-ink-secondary underline-offset-4 transition-colors hover:text-ink hover:underline"
        >
          Clear all
        </button>
      ) : null}
    </div>
  );
}
