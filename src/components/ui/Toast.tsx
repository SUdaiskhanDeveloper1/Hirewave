'use client';

import type { ReactNode } from 'react';
import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { cn } from '@/lib/utils/cn';
import { Icon } from './Icon';

type ToastTone = 'success' | 'error' | 'info';

interface Toast {
  readonly id: number;
  readonly message: string;
  readonly tone: ToastTone;
}

interface ToastContextValue {
  readonly notify: (message: string, tone?: ToastTone) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const TONES: Record<ToastTone, { readonly ring: string; readonly icon: 'check' | 'alert' | 'info' }> = {
  success: { ring: 'text-success', icon: 'check' },
  error: { ring: 'text-danger', icon: 'alert' },
  info: { ring: 'text-brand-600', icon: 'info' },
};

const DISMISS_AFTER_MS = 4000;

/**
 * Transient confirmation for actions that would otherwise complete silently.
 *
 * Deliberately small: a queue, a timer and a live region. Toasts are announced through
 * `role="status"` so a screen reader hears "Application submitted" rather than nothing.
 */
export function ToastProvider({ children }: { readonly children: ReactNode }) {
  const [toasts, setToasts] = useState<readonly Toast[]>([]);
  const nextId = useRef(0);

  const notify = useCallback((message: string, tone: ToastTone = 'success') => {
    const id = (nextId.current += 1);
    setToasts((current) => [...current, { id, message, tone }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, DISMISS_AFTER_MS);
  }, []);

  const value = useMemo(() => ({ notify }), [notify]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        role="status"
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex flex-col items-center gap-2 p-4 sm:items-end sm:p-6"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="animate-slide-up pointer-events-auto flex w-full max-w-sm items-center gap-2.5 rounded-lg bg-raised px-3.5 py-3 text-sm text-ink shadow-overlay ring-1 ring-line"
          >
            <Icon name={TONES[toast.tone].icon} size={16} className={cn('shrink-0', TONES[toast.tone].ring)} />
            <span className="min-w-0 flex-1">{toast.message}</span>
            <button
              type="button"
              onClick={() => setToasts((current) => current.filter((t) => t.id !== toast.id))}
              aria-label="Dismiss notification"
              className="-mr-1 shrink-0 rounded p-1 text-ink-muted transition-colors hover:text-ink"
            >
              <Icon name="close" size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

/**
 * Returns a no-op outside the provider so a component can call `notify` without
 * needing to know whether it is mounted inside the toast host.
 */
export function useToast(): ToastContextValue {
  return useContext(ToastContext) ?? { notify: () => undefined };
}
