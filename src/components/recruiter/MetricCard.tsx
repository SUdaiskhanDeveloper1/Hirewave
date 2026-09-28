import { Card } from '@/components/ui/Card';
import { Icon } from '@/components/ui/Icon';
import { cn } from '@/lib/utils/cn';

interface MetricCardProps {
  readonly label: string;
  readonly value: string;
  /** Percentage change against the previous period. Omitted when not meaningful. */
  readonly delta?: number;
  readonly hint?: string;
}

export function MetricCard({ label, value, delta, hint }: MetricCardProps) {
  const isPositive = (delta ?? 0) >= 0;

  return (
    <Card className="p-5">
      <p className="text-xs font-semibold tracking-wide text-ink-muted uppercase">{label}</p>
      <p className="mt-2 text-[26px] leading-none font-semibold tracking-tight text-ink tabular-nums">
        {value}
      </p>
      <p className="mt-2.5 flex items-center gap-1.5 text-xs">
        {delta === undefined ? (
          <span className="text-ink-muted">{hint}</span>
        ) : (
          <>
            <span
              className={cn(
                'inline-flex items-center gap-0.5 font-medium',
                isPositive ? 'text-success' : 'text-danger',
              )}
            >
              <Icon
                name="trending"
                size={13}
                className={isPositive ? undefined : '-scale-y-100'}
              />
              {isPositive ? '+' : ''}
              {delta}%
            </span>
            <span className="text-ink-muted">vs last quarter</span>
          </>
        )}
      </p>
    </Card>
  );
}
