'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useCallback, useMemo } from 'react';
import type { DatePosted, JobSort, JobsQuery } from '@/lib/api/contracts';
import { countActiveJobFilters, jobsHref, parseJobsQuery } from '@/lib/api/query-params';

/** The multi-select filter dimensions, keyed by their `JobsQuery` field. */
export type FilterDimension = 'role' | 'type' | 'level' | 'mode';

type HistoryMode = 'push' | 'replace';

export interface JobSearchState {
  readonly query: JobsQuery;
  readonly activeFilterCount: number;
  readonly setKeyword: (value: string) => void;
  readonly toggleFilter: (dimension: FilterDimension, value: string) => void;
  readonly setLocation: (value: string | undefined) => void;
  readonly setSalaryMin: (value: number | undefined) => void;
  readonly setIndustry: (value: string | undefined) => void;
  readonly setPosted: (value: DatePosted | undefined) => void;
  readonly setSort: (value: JobSort) => void;
  readonly setPage: (value: number) => void;
  readonly clearFilters: () => void;
  readonly hrefForPage: (page: number) => string;
  readonly queryForPage: (page: number) => JobsQuery;
}

/**
 * URL-backed search state.
 *
 * The address bar is the single source of truth: every filter combination is
 * shareable and restorable, and there is no parallel client store to keep in sync.
 *
 * Writes go through `history.pushState` rather than the router. Next.js observes
 * those and re-runs `useSearchParams`, so toggling a filter updates the URL and the
 * React Query key with no server round trip. The server render is paid once, on first
 * load or a hard navigation, which is exactly where it earns its keep (SEO + LCP).
 */
export function useJobSearch(): JobSearchState {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const serialized = searchParams.toString();

  // Parsing is memoised on the serialised string, so the query object identity is
  // stable across re-renders and does not churn dependent query keys.
  const query = useMemo(() => parseJobsQuery(new URLSearchParams(serialized)), [serialized]);

  const commit = useCallback(
    (next: JobsQuery, mode: HistoryMode = 'push') => {
      const href = jobsHref(next, pathname);
      if (mode === 'push') window.history.pushState(null, '', href);
      else window.history.replaceState(null, '', href);
    },
    [pathname],
  );

  const setKeyword = useCallback(
    (value: string) => {
      // Typing replaces rather than pushes: the back button should undo the search,
      // not walk back through every keystroke.
      commit({ ...query, q: value || undefined, page: undefined }, 'replace');
    },
    [commit, query],
  );

  const toggleFilter = useCallback(
    (dimension: FilterDimension, value: string) => {
      const current = (query[dimension] ?? []) as readonly string[];
      const next = current.includes(value)
        ? current.filter((entry) => entry !== value)
        : [...current, value];

      commit({
        ...query,
        [dimension]: next.length > 0 ? next : undefined,
        page: undefined,
      } as JobsQuery);
    },
    [commit, query],
  );

  const setLocation = useCallback(
    (value: string | undefined) =>
      commit({ ...query, location: value || undefined, page: undefined }),
    [commit, query],
  );

  const setSalaryMin = useCallback(
    (value: number | undefined) => commit({ ...query, salaryMin: value, page: undefined }),
    [commit, query],
  );

  const setIndustry = useCallback(
    (value: string | undefined) =>
      commit({ ...query, industry: value || undefined, page: undefined }),
    [commit, query],
  );

  const setPosted = useCallback(
    (value: DatePosted | undefined) => commit({ ...query, posted: value, page: undefined }),
    [commit, query],
  );

  const setSort = useCallback(
    (value: JobSort) => commit({ ...query, sort: value, page: undefined }),
    [commit, query],
  );

  const setPage = useCallback(
    (value: number) => {
      commit({ ...query, page: value });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [commit, query],
  );

  const clearFilters = useCallback(
    () => commit(query.q ? { q: query.q } : {}),
    [commit, query.q],
  );

  const queryForPage = useCallback((page: number): JobsQuery => ({ ...query, page }), [query]);

  const hrefForPage = useCallback(
    (page: number) => jobsHref({ ...query, page }, pathname),
    [pathname, query],
  );

  return {
    query,
    activeFilterCount: countActiveJobFilters(query),
    setKeyword,
    toggleFilter,
    setLocation,
    setSalaryMin,
    setIndustry,
    setPosted,
    setSort,
    setPage,
    clearFilters,
    hrefForPage,
    queryForPage,
  };
}
