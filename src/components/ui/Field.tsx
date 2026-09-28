import type { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

interface FieldProps {
  readonly id: string;
  readonly label: string;
  readonly children: ReactNode;
  readonly hint?: string;
  readonly error?: string;
  readonly required?: boolean;
  readonly className?: string;
}

/**
 * Label + control + hint/error, wired together for screen readers.
 *
 * Every form control in the app goes through this, which is what keeps labels,
 * required markers, hint text and error messaging consistent - and means an error is
 * announced rather than only coloured red.
 */
export function Field({ id, label, children, hint, error, required, className }: FieldProps) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <label htmlFor={id} className="block text-sm font-medium text-ink">
        {label}
        {required ? (
          <span className="ml-0.5 text-danger" aria-hidden="true">
            *
          </span>
        ) : null}
      </label>

      {children}

      {error ? (
        <p id={`${id}-error`} role="alert" className="text-xs font-medium text-danger">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-xs text-ink-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

/** Ties a control to its hint/error nodes. Used by Input, Select and Textarea. */
export function describedBy(id: string, hint?: string, error?: string): string | undefined {
  if (error) return `${id}-error`;
  if (hint) return `${id}-hint`;
  return undefined;
}
