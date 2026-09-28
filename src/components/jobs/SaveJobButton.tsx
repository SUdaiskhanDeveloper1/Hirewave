'use client';

import { useToggleSavedJob } from '@/hooks/use-saved-jobs';
import { cn } from '@/lib/utils/cn';
import { Icon } from '@/components/ui/Icon';

interface SaveJobButtonProps {
  readonly jobId: string;
  readonly jobTitle: string;
  readonly variant?: 'icon' | 'labelled';
}

/**
 * The smallest possible client boundary: one button.
 *
 * Saved state comes from a `select`ed slice of the saved-jobs cache, so this
 * re-renders only when *this* job's saved state changes. The write is optimistic,
 * which is why the icon fills on the same frame as the click.
 */
export function SaveJobButton({ jobId, jobTitle, variant = 'icon' }: SaveJobButtonProps) {
  const { isSaved, isPending, toggle } = useToggleSavedJob(jobId);

  const label = isSaved ? `Remove ${jobTitle} from saved jobs` : `Save ${jobTitle}`;

  if (variant === 'labelled') {
    return (
      <button
        type="button"
        onClick={toggle}
        aria-pressed={isSaved}
        aria-label={label}
        className={cn(
          'inline-flex h-10 items-center gap-2 rounded-lg px-4 text-sm font-medium transition-colors',
          'ring-1 ring-inset',
          isSaved
            ? 'bg-brand-50 text-brand-700 ring-brand-100'
            : 'bg-raised text-ink ring-line-strong hover:bg-sunken',
          isPending && 'opacity-70',
        )}
      >
        <Icon name="bookmark" className={isSaved ? 'fill-current' : undefined} />
        {isSaved ? 'Saved' : 'Save job'}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={isSaved}
      aria-label={label}
      className={cn(
        'inline-flex size-9 shrink-0 items-center justify-center rounded-lg transition-colors',
        isSaved
          ? 'bg-brand-50 text-brand-600'
          : 'text-ink-muted hover:bg-sunken hover:text-ink',
      )}
    >
      <Icon name="bookmark" size={17} className={isSaved ? 'fill-current' : undefined} />
    </button>
  );
}
