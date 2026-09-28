import type { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

const TONES = {
  neutral: 'bg-sunken text-ink-secondary ring-line',
  brand: 'bg-brand-50 text-brand-700 ring-brand-100',
  success: 'bg-success-bg text-success ring-success/20',
  warning: 'bg-warning-bg text-warning ring-warning/25',
  outline: 'bg-transparent text-ink-secondary ring-line-strong',
} as const;

export type BadgeTone = keyof typeof TONES;

interface BadgeProps {
  readonly children: ReactNode;
  readonly tone?: BadgeTone;
  readonly className?: string;
}

/** Descriptive metadata chip. For lifecycle state use `StatusBadge` instead. */
export function Badge({ children, tone = 'neutral', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium whitespace-nowrap ring-1 ring-inset',
        TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
