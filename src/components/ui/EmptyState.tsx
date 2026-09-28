import type { ReactNode } from 'react';
import type { IconName } from './Icon';
import { Icon } from './Icon';

interface EmptyStateProps {
  readonly icon?: IconName;
  readonly title: string;
  readonly description: string;
  readonly action?: ReactNode;
}

export function EmptyState({ icon = 'search', title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-card bg-raised px-6 py-16 text-center ring-1 ring-line">
      <span className="mb-4 flex size-12 items-center justify-center rounded-full bg-sunken text-ink-muted">
        <Icon name={icon} size={22} />
      </span>
      <h3 className="text-base font-semibold text-ink">{title}</h3>
      <p className="mt-1.5 max-w-sm text-sm text-ink-secondary">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
