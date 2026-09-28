'use client';

import { cn } from '@/lib/utils/cn';

export interface TabItem<T extends string> {
  readonly value: T;
  readonly label: string;
  readonly count?: number;
}

interface TabsProps<T extends string> {
  readonly items: readonly TabItem<T>[];
  readonly value: T;
  readonly onChange: (value: T) => void;
  readonly label: string;
  readonly className?: string;
}

/**
 * Underlined tab bar with roving selection.
 *
 * Uses the real tablist roles and arrow-key semantics browsers expect, and scrolls
 * horizontally rather than wrapping on narrow screens so a six-stage pipeline stays
 * usable on a phone.
 */
export function Tabs<T extends string>({ items, value, onChange, label, className }: TabsProps<T>) {
  const activeIndex = items.findIndex((item) => item.value === value);

  return (
    <div
      role="tablist"
      aria-label={label}
      className={cn('no-scrollbar -mb-px flex gap-1 overflow-x-auto border-b border-line', className)}
      onKeyDown={(event) => {
        if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
        event.preventDefault();
        const delta = event.key === 'ArrowRight' ? 1 : -1;
        const next = items[(activeIndex + delta + items.length) % items.length];
        if (next) onChange(next.value);
      }}
    >
      {items.map((item) => {
        const isActive = item.value === value;
        return (
          <button
            key={item.value}
            type="button"
            role="tab"
            aria-selected={isActive}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onChange(item.value)}
            className={cn(
              'flex shrink-0 items-center gap-1.5 border-b-2 px-3 py-2.5 text-sm font-medium whitespace-nowrap transition-colors',
              isActive
                ? 'border-brand-600 text-ink'
                : 'border-transparent text-ink-secondary hover:text-ink',
            )}
          >
            {item.label}
            {item.count === undefined ? null : (
              <span
                className={cn(
                  'rounded-full px-1.5 py-px text-xs tabular-nums',
                  isActive ? 'bg-brand-50 text-brand-700' : 'bg-sunken text-ink-muted',
                )}
              >
                {item.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
