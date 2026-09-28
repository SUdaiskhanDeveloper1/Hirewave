import { cn } from '@/lib/utils/cn';

const TONES = {
  neutral: 'bg-sunken text-ink-secondary ring-line',
  info: 'bg-brand-50 text-brand-700 ring-brand-100',
  success: 'bg-success-bg text-success ring-success/20',
  warning: 'bg-warning-bg text-warning ring-warning/25',
  danger: 'bg-danger-bg text-danger ring-danger/20',
} as const;

export type StatusTone = keyof typeof TONES;

interface StatusBadgeProps {
  readonly children: string;
  readonly tone?: StatusTone;
  readonly className?: string;
}

/**
 * Status pill for application and job lifecycle states. Separate from `Badge` because
 * status colour carries meaning here and must stay tied to the semantic tokens.
 */
export function StatusBadge({ children, tone = 'neutral', className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap ring-1 ring-inset',
        TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
