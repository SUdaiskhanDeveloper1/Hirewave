'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { getQueryClient } from '@/lib/query/client';

/**
 * The app's only global provider.
 *
 * `getQueryClient` returns a per-request client on the server and a singleton in the
 * browser, so a suspended render can never leak one user's cache into another's
 * response. React Query DevTools are deliberately not wired in: they are worth real
 * kilobytes and this project is measured on shipped JS.
 */
export function QueryProvider({ children }: { readonly children: ReactNode }) {
  return <QueryClientProvider client={getQueryClient()}>{children}</QueryClientProvider>;
}
