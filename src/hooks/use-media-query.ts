'use client';

import { useCallback, useSyncExternalStore } from 'react';

/**
 * Subscribes to a media query.
 *
 * Built on `useSyncExternalStore` rather than an effect: the server snapshot is
 * always `false`, so the first client render matches the server exactly and then
 * corrects itself in the same commit, with no hydration warning and no cascading
 * re-render.
 *
 * Only for cases where layout genuinely cannot be expressed in CSS - here, the row
 * height a virtualised list needs to know about. Anything CSS can do should stay in CSS.
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      const list = window.matchMedia(query);
      list.addEventListener('change', onStoreChange);
      return () => list.removeEventListener('change', onStoreChange);
    },
    [query],
  );

  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,
  );
}
