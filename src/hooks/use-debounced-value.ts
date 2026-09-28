'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Debounces a rapidly-changing value. Used to keep keystrokes off the network
 * without making the input itself feel laggy: the field renders the raw value,
 * only the derived value (and therefore the query key) is delayed.
 */
export function useDebouncedValue<T>(value: T, delayMs = 300): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    if (value === debounced) return;
    const timer = window.setTimeout(() => setDebounced(value), delayMs);
    return () => window.clearTimeout(timer);
    // `debounced` is intentionally excluded: including it would restart the timer
    // on every settle and turn the debounce into a throttle.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, delayMs]);

  return debounced;
}

/**
 * Debounces a side effect while keeping a stable function identity, so passing it to
 * a memoised child never invalidates that child's props.
 */
export function useDebouncedCallback<TArgs extends readonly unknown[]>(
  callback: (...args: TArgs) => void,
  delayMs = 300,
): (...args: TArgs) => void {
  const callbackRef = useRef(callback);
  const timerRef = useRef<number | undefined>(undefined);

  // Keep the latest closure without changing the identity handed to children.
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => () => window.clearTimeout(timerRef.current), []);

  return useCallback(
    (...args: TArgs) => {
      window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(() => callbackRef.current(...args), delayMs);
    },
    [delayMs],
  );
}
