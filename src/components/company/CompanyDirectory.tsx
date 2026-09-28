'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useMemo, useState } from 'react';
import { CompanyCard } from '@/components/company/CompanyCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Icon } from '@/components/ui/Icon';
import { Skeleton } from '@/components/ui/Skeleton';
import { useCompanies } from '@/hooks/use-companies';
import { useDebouncedCallback } from '@/hooks/use-debounced-value';

const PER_PAGE = 48;

/**
 * Searchable company directory.
 *
 * Same architecture as the job search, at a smaller scale: the URL owns the query,
 * the server prefetches the unfiltered first page into the cache, and typing is
 * debounced before it becomes a cache key. Proving the pattern generalises to a
 * second entity is most of the point of having a layered data access story.
 */
export function CompanyDirectory() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const serialized = searchParams.toString();

  const term = useMemo(
    () => new URLSearchParams(serialized).get('q') ?? '',
    [serialized],
  );

  const [draft, setDraft] = useState(term);

  const commit = useDebouncedCallback((value: string) => {
    const next = value ? `${pathname}?q=${encodeURIComponent(value)}` : pathname;
    window.history.replaceState(null, '', next);
  }, 280);

  const query = useMemo(
    () => ({ ...(term ? { q: term } : {}), perPage: PER_PAGE }),
    [term],
  );

  const { data, isPending, isError, isFetching, refetch } = useCompanies(query);

  return (
    <>
      <div className="mb-6 max-w-md">
        <div className="relative">
          <Icon
            name="search"
            size={17}
            className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-ink-muted"
          />
          <input
            type="search"
            value={draft}
            aria-label="Search companies"
            placeholder="Company, industry or city"
            onChange={(event) => {
              setDraft(event.target.value);
              commit(event.target.value);
            }}
            className="h-11 w-full rounded-lg bg-raised pl-10.5 pr-3 text-sm text-ink ring-1 ring-inset ring-line-strong placeholder:text-ink-muted focus:ring-2 focus:ring-brand-600"
          />
        </div>
        <p className="mt-2 text-sm text-ink-secondary" aria-live="polite">
          {isPending ? 'Loading companies...' : `${data?.meta.total ?? 0} teams with open roles`}
        </p>
      </div>

      {isError ? (
        <ErrorState
          title="Could not load companies"
          description="The directory service did not respond."
          onRetry={() => void refetch()}
        />
      ) : isPending ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 9 }, (_, index) => (
            <Skeleton key={index} className="h-44 rounded-card" />
          ))}
        </div>
      ) : data.data.length === 0 ? (
        <EmptyState
          icon="building"
          title="No companies match"
          description="Try a different name, industry or city."
        />
      ) : (
        <ul
          className={`cv-auto grid gap-3 transition-opacity sm:grid-cols-2 lg:grid-cols-3 ${
            isFetching ? 'opacity-60' : ''
          }`}
        >
          {data.data.map((company) => (
            <li key={company.id}>
              <CompanyCard company={company} />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
