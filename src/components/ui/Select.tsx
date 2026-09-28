import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils/cn';
import { Icon } from './Icon';

const SIZES = {
  sm: 'h-9 text-sm',
  md: 'h-10 text-sm',
  lg: 'h-12 text-[15px]',
} as const;

export interface SelectProps extends ComponentProps<'select'> {
  readonly selectSize?: keyof typeof SIZES;
  readonly invalid?: boolean;
  readonly bare?: boolean;
}

/**
 * A native select with a custom chevron.
 *
 * Native rather than a custom listbox on purpose: it is keyboard accessible and
 * screen-reader correct for free, opens the platform picker on mobile, and adds no
 * JavaScript beyond the caller's change handler.
 */
export function Select({
  selectSize = 'md',
  invalid = false,
  bare = false,
  className,
  children,
  ...props
}: SelectProps) {
  return (
    <div className="relative">
      <select
        aria-invalid={invalid || undefined}
        className={cn(
          'w-full appearance-none rounded-lg bg-raised pl-3 pr-9 text-ink transition-colors',
          'disabled:cursor-not-allowed disabled:bg-sunken disabled:text-ink-muted',
          bare
            ? 'ring-0 focus:outline-none'
            : cn(
                'ring-1 ring-inset focus:ring-2 focus:outline-none',
                invalid ? 'ring-danger focus:ring-danger' : 'ring-line-strong focus:ring-brand-600',
              ),
          SIZES[selectSize],
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <Icon
        name="chevronDown"
        size={15}
        className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-ink-muted"
      />
    </div>
  );
}
