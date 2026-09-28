'use client';

import type { JobSort } from '@/lib/api/contracts';
import { JOB_SORTS } from '@/lib/api/contracts';
import { Icon } from '@/components/ui/Icon';

const LABELS: Record<JobSort, string> = {
  relevance: 'Most relevant',
  newest: 'Newest first',
  salary: 'Highest salary',
};

interface JobSortSelectProps {
  readonly value: JobSort;
  readonly onChange: (value: JobSort) => void;
}

/**
 * A native `<select>` rather than a custom listbox: it is keyboard accessible and
 * screen-reader correct for free, uses the platform picker on mobile, and adds no
 * JavaScript beyond the change handler.
 */
export function JobSortSelect({ value, onChange }: JobSortSelectProps) {
  return (
    <div className="relative">
      <select
        value={value}
        aria-label="Sort results"
        onChange={(event) => onChange(event.target.value as JobSort)}
        className="h-9 appearance-none rounded-lg bg-raised pl-3 pr-8 text-sm font-medium text-ink ring-1 ring-inset ring-line-strong hover:bg-sunken"
      >
        {JOB_SORTS.map((sort) => (
          <option key={sort} value={sort}>
            {LABELS[sort]}
          </option>
        ))}
      </select>
      <Icon
        name="chevronDown"
        size={14}
        className="pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 text-ink-muted"
      />
    </div>
  );
}
