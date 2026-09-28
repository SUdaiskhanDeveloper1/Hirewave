import type { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';
import type { IconName } from './Icon';
import { Icon } from './Icon';

const TONES = {
  info: { box: 'bg-brand-50 text-brand-700 ring-brand-100', icon: 'info' },
  success: { box: 'bg-success-bg text-success ring-success/20', icon: 'check' },
  warning: { box: 'bg-warning-bg text-warning ring-warning/25', icon: 'alert' },
  danger: { box: 'bg-danger-bg text-danger ring-danger/20', icon: 'alert' },
} as const;

interface AlertProps {
  readonly tone?: keyof typeof TONES;
  readonly title?: string;
  readonly children: ReactNode;
  readonly className?: string;
}

/** Inline, non-dismissable message. For transient feedback use a toast instead. */
export function Alert({ tone = 'info', title, children, className }: AlertProps) {
  const config = TONES[tone];

  return (
    <div
      role={tone === 'danger' ? 'alert' : 'status'}
      className={cn('flex gap-3 rounded-lg p-3.5 text-sm ring-1 ring-inset', config.box, className)}
    >
      <Icon name={config.icon as IconName} size={17} className="mt-px shrink-0" />
      <div className="min-w-0">
        {title ? <p className="font-semibold">{title}</p> : null}
        <div className={cn(title && 'mt-0.5', 'opacity-90')}>{children}</div>
      </div>
    </div>
  );
}
