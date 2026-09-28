'use client';

import { memo } from 'react';
import type { FacetBucket } from '@/lib/api/contracts';
import type { FilterDimension } from '@/hooks/use-job-search';
import { Icon } from '@/components/ui/Icon';
import { cn } from '@/lib/utils/cn';

interface JobFilterGroupProps {
  readonly label: string;
  readonly dimension: FilterDimension;
  readonly buckets: readonly FacetBucket[];
  readonly selected: readonly string[];
  readonly onToggle: (dimension: FilterDimension, value: string) => void;
}

/**
 * One facet group.
 *
 * Memoised deliberately rather than reflexively: the parent re-renders on every
 * keystroke of the search box, and without this each of the four groups would
 * re-render its full option list for a change that cannot affect them. `onToggle`
 * is a stable `useCallback` from the search-state hook, so the memo actually holds.
 */
export const JobFilterGroup = memo(function JobFilterGroup({
  label,
  dimension,
  buckets,
  selected,
  onToggle,
}: JobFilterGroupProps) {
  return (
    <fieldset>
      <legend className="mb-2 text-xs font-semibold tracking-wide text-ink-muted uppercase">
        {label}
      </legend>
      <div className="space-y-0.5">
        {buckets.map((bucket) => {
          const isChecked = selected.includes(bucket.value);
          const isEmpty = bucket.count === 0 && !isChecked;

          return (
            <label
              key={bucket.value}
              className={cn(
                'flex cursor-pointer items-center gap-2.5 rounded-md px-1.5 py-1.5 text-sm transition-colors',
                isEmpty ? 'cursor-default opacity-45' : 'hover:bg-sunken',
              )}
            >
              <input
                type="checkbox"
                className="sr-only"
                checked={isChecked}
                disabled={isEmpty}
                onChange={() => onToggle(dimension, bucket.value)}
              />
              <span
                aria-hidden="true"
                className={cn(
                  'flex size-4 shrink-0 items-center justify-center rounded border transition-colors',
                  isChecked
                    ? 'border-brand-600 bg-brand-600 text-white'
                    : 'border-line-strong bg-raised',
                )}
              >
                {isChecked ? <Icon name="check" size={11} strokeWidth={3} /> : null}
              </span>
              <span className={cn('flex-1 truncate', isChecked ? 'text-ink' : 'text-ink-secondary')}>
                {bucket.label}
              </span>
              <span className="text-xs tabular-nums text-ink-muted">{bucket.count}</span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
});
