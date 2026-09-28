'use client';

import type { ReactNode } from 'react';
import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils/cn';
import { Icon } from './Icon';

interface ModalProps {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly title: string;
  readonly description?: string;
  readonly children: ReactNode;
  readonly footer?: ReactNode;
  readonly size?: 'md' | 'lg';
}

/**
 * Dialog built on the native `<dialog>` element.
 *
 * `showModal()` gives focus trapping, inertness of the page behind, Escape-to-close
 * and the top layer for free. A hand-rolled focus trap would have been more code and
 * less correct.
 */
export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
}: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) dialog.showModal();
    else if (!open && dialog.open) dialog.close();
  }, [open]);

  // Escape and backdrop dismissal both surface as `cancel`/`close`; keep React state
  // in step with whatever the browser did.
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
      aria-labelledby="modal-title"
      aria-describedby={description ? 'modal-description' : undefined}
      onClick={(event) => {
        // Clicks land on the dialog element itself only when they hit the backdrop.
        if (event.target === dialogRef.current) onClose();
      }}
      className={cn(
        'w-[calc(100vw-2rem)] rounded-card bg-raised p-0 text-ink shadow-overlay backdrop:bg-black/45',
        'animate-slide-up open:flex open:flex-col',
        size === 'lg' ? 'max-w-2xl' : 'max-w-lg',
      )}
    >
      <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
        <div className="min-w-0">
          <h2 id="modal-title" className="text-base font-semibold text-ink">
            {title}
          </h2>
          {description ? (
            <p id="modal-description" className="mt-0.5 text-sm text-ink-secondary">
              {description}
            </p>
          ) : null}
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close dialog"
          className="-mr-1.5 -mt-1 inline-flex size-8 shrink-0 items-center justify-center rounded-lg text-ink-muted transition-colors hover:bg-sunken hover:text-ink"
        >
          <Icon name="close" size={17} />
        </button>
      </div>

      <div className="max-h-[65vh] overflow-y-auto px-5 py-4">{children}</div>

      {footer ? (
        <div className="flex justify-end gap-2 border-t border-line px-5 py-3.5">{footer}</div>
      ) : null}
    </dialog>
  );
}
