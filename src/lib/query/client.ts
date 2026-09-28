/**
 * QueryClient construction and cache policy.
 *
 * One place decides stale times, garbage collection and retry behaviour, so no hook
 * has to restate them. The server gets a fresh client per render pass (never shared
 * between requests); the browser keeps a single client for the tab's lifetime.
 */

import { QueryClient, defaultShouldDehydrateQuery, isServer } from '@tanstack/react-query';
import { ApiError } from '@/lib/api/http';

/** Job listings churn slowly — a minute of staleness saves a lot of requests. */
export const STALE_TIME = {
  /** Search results and facets: long enough to make pagination and back-nav free. */
  search: 60_000,
  /** A single posting rarely changes while it is being read. */
  detail: 5 * 60_000,
  /** Recruiter aggregates: refreshed on a slower cadence than the applicant list. */
  analytics: 2 * 60_000,
  /** Locally-owned state; never stale, only invalidated by its own mutations. */
  local: Number.POSITIVE_INFINITY,
} as const;

export function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: STALE_TIME.search,
        // Keep unused entries around long enough for back-navigation to be instant,
        // then release the memory.
        gcTime: 10 * 60_000,
        // The address bar is the source of truth for search; refetching on every
        // window focus would spend requests without changing what the user sees.
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        retry: (failureCount, error) => {
          // Client errors are deterministic — retrying a 404 just wastes a round trip.
          if (error instanceof ApiError && error.status < 500) return false;
          return failureCount < 2;
        },
        retryDelay: (attempt) => Math.min(1_000 * 2 ** attempt, 8_000),
      },
      mutations: {
        retry: 0,
      },
      dehydrate: {
        // Also ship in-flight queries so streamed markup can hand the client a
        // pending promise instead of restarting the request after hydration.
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) || query.state.status === 'pending',
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined;

export function getQueryClient(): QueryClient {
  if (isServer) return makeQueryClient();
  browserQueryClient ??= makeQueryClient();
  return browserQueryClient;
}
