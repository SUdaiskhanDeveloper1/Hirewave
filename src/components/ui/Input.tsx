import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils/cn';

const SIZES = {
  sm: 'h-9 text-sm',
  md: 'h-10 text-sm',
  lg: 'h-12 text-[15px]',
} as const;

export interface InputProps extends Omit<ComponentProps<'input'>, 'size'> {
  readonly inputSize?: keyof typeof SIZES;
  readonly invalid?: boolean;
  /** Reserves room for an icon rendered by the caller inside a relative wrapper. */
  readonly hasLeadingIcon?: boolean;
  /** Drops the ring so the field can sit inside an already-bordered container. */
  readonly bare?: boolean;
}

/**
 * The single text input in the app. Collecting it here is what stopped the same
 * fourteen Tailwind classes being retyped (and drifting) in seven places.
 */
export function Input({
  inputSize = 'md',
  invalid = false,
  hasLeadingIcon = false,
  bare = false,
  className,
  ...props
}: InputProps) {
  return (
    <input
      aria-invalid={invalid || undefined}
      className={cn(
        'w-full rounded-lg bg-raised text-ink transition-colors placeholder:text-ink-muted',
        'disabled:cursor-not-allowed disabled:bg-sunken disabled:text-ink-muted',
        bare
          ? 'ring-0 focus:outline-none'
          : cn(
              'ring-1 ring-inset focus:ring-2 focus:outline-none',
              invalid ? 'ring-danger focus:ring-danger' : 'ring-line-strong focus:ring-brand-600',
            ),
        hasLeadingIcon ? 'pl-10 pr-3' : 'px-3',
        SIZES[inputSize],
        className,
      )}
      {...props}
    />
  );
}

export function Textarea({
  invalid = false,
  className,
  ...props
}: ComponentProps<'textarea'> & { readonly invalid?: boolean }) {
  return (
    <textarea
      aria-invalid={invalid || undefined}
      className={cn(
        'w-full rounded-lg bg-raised px-3 py-2.5 text-sm text-ink transition-colors',
        'ring-1 ring-inset placeholder:text-ink-muted',
        'focus:ring-2 focus:outline-none',
        'disabled:cursor-not-allowed disabled:bg-sunken',
        invalid ? 'ring-danger focus:ring-danger' : 'ring-line-strong focus:ring-brand-600',
        className,
      )}
      {...props}
    />
  );
}
