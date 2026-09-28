'use client';

import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { formatCompactNumber } from '@/lib/utils/format';
import type { JobFiltersProps } from './JobFilters';
import { JobFilters } from './JobFilters';

interface MobileFilterSheetProps extends Omit<JobFiltersProps, 'bare'> {
  readonly open: boolean;
  readonly onClose: () => void;
  /** Result count for the confirm button, so the effect of the filters is visible. */
  readonly resultCount: number;
}

/**
 * Filters as a bottom sheet on small screens.
 *
 * Built on `<dialog>` for the same reasons as the modal - real focus trapping, an
 * inert page behind it and Escape handling without a hand-rolled key listener. The
 * panel renders the same `JobFilters` component as the desktop sidebar; only the
 * chrome around it differs, so the two lists cannot drift apart.
 *
 * Selections apply immediately (the results behind update live). The footer button
 * therefore confirms and dismisses rather than submitting.
 */
export function MobileFilterSheet({
  open,
  onClose,
  resultCount,
  ...filterProps
}: MobileFilterSheetProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) dialog.showModal();
    else if (!open && dialog.open) dialog.close();
  }, [open]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleClose = () => onClose();
    dialog.addEventListener('close', handleClose);
    return () => dialog.removeEventListener('close', handleClose);
  }, [onClose]);

  return (
    <dialog
      ref={dialogRef}
      aria-label="Filter jobs"
      onClick={(event) => {
        if (event.target === dialogRef.current) onClose();
      }}
      className="animate-slide-up m-0 mt-auto h-[88dvh] max-h-none w-full max-w-none rounded-t-2xl bg-raised p-0 text-ink shadow-overlay backdrop:bg-black/45 open:flex open:flex-col"
    >
      <div className="flex shrink-0 items-center justify-between border-b border-line px-4 py-3.5">
        <h2 className="flex items-center gap-2 text-base font-semibold text-ink">
          <Icon name="filter" size={16} className="text-ink-muted" />
          Filters
        </h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close filters"
          className="-mr-1 inline-flex size-9 items-center justify-center rounded-lg text-ink-muted transition-colors hover:bg-sunken hover:text-ink"
        >
          <Icon name="close" size={18} />
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <JobFilters {...filterProps} bare />
      </div>

      <div className="flex shrink-0 gap-2 border-t border-line px-4 py-3">
        <Button
          variant="secondary"
          size="md"
          className="flex-1"
          onClick={filterProps.onClear}
          disabled={filterProps.activeFilterCount === 0}
        >
          Clear all
        </Button>
        <Button variant="primary" size="md" className="flex-[1.4]" onClick={onClose}>
          Show {formatCompactNumber(resultCount)} {resultCount === 1 ? 'job' : 'jobs'}
        </Button>
      </div>
    </dialog>
  );
}
