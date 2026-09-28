import { Button } from './Button';
import { Icon } from './Icon';

interface ErrorStateProps {
  readonly title?: string;
  readonly description?: string;
  readonly onRetry?: () => void;
}

/**
 * Shared failure surface for query errors and route error boundaries. Always offers
 * a retry, because a transient network error should not require a page reload.
 */
export function ErrorState({
  title = 'Something went wrong',
  description = 'We could not load this content. Please try again.',
  onRetry,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center rounded-card bg-raised px-6 py-14 text-center ring-1 ring-line"
    >
      <span className="mb-4 flex size-12 items-center justify-center rounded-full bg-danger-bg text-danger">
        <Icon name="alert" size={20} />
      </span>
      <h3 className="text-base font-semibold text-ink">{title}</h3>
      <p className="mt-1.5 max-w-sm text-sm text-ink-secondary">{description}</p>
      {onRetry ? (
        <Button variant="secondary" size="sm" className="mt-5" onClick={onRetry}>
          Try again
        </Button>
      ) : null}
    </div>
  );
}
