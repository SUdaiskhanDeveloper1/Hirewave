'use client';

import type { MouseEvent } from 'react';
import { useMemo } from 'react';
import type { PageMeta } from '@/lib/api/contracts';
import { cn } from '@/lib/utils/cn';
import { Icon } from './Icon';

interface PaginationProps {
  readonly meta: PageMeta;
  readonly onPageChange: (page: number) => void;
  /** Real hrefs keep pages crawlable and middle-clickable. */
  readonly hrefForPage: (page: number) => string;
  /** Called on hover/focus so the next page is usually already cached on click. */
  readonly onPrefetchPage?: (page: number) => void;
}

const GAP = '...';

/**
 * Builds a compact window of page numbers with ellipses, e.g. 1 ... 6 7 8 ... 22.
 * Memoised because it runs on every results render and the output only depends on
 * two numbers.
 */
function usePageItems(page: number, totalPages: number): (number | typeof GAP)[] {
  return useMemo(() => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    const items: (number | typeof GAP)[] = [1];
    const start = Math.max(2, page - 1);
    const end = Math.min(totalPages - 1, page + 1);

    if (start > 2) items.push(GAP);
    for (let current = start; current <= end; current += 1) items.push(current);
    if (end < totalPages - 1) items.push(GAP);
    items.push(totalPages);

    return items;
  }, [page, totalPages]);
}

export function Pagination({
  meta,
  onPageChange,
  hrefForPage,
  onPrefetchPage,
}: PaginationProps) {
  const items = usePageItems(meta.page, meta.totalPages);

  if (meta.totalPages <= 1) return null;

  const navigate = (event: MouseEvent<HTMLAnchorElement>, page: number): void => {
    // Let modified clicks (new tab, new window) behave natively.
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
    event.preventDefault();
    onPageChange(page);
  };

  const linkClass = (active: boolean): string =>
    cn(
      'inline-flex h-9 min-w-9 items-center justify-center rounded-lg px-2.5 text-sm font-medium transition-colors',
      active
        ? 'bg-brand-600 text-white'
        : 'text-ink-secondary hover:bg-sunken hover:text-ink',
    );

  return (
    <nav aria-label="Pagination" className="flex items-center justify-center gap-1">
      <a
        href={hrefForPage(meta.page - 1)}
        onClick={(event) => meta.hasPreviousPage && navigate(event, meta.page - 1)}
        onMouseEnter={() => meta.hasPreviousPage && onPrefetchPage?.(meta.page - 1)}
        aria-disabled={!meta.hasPreviousPage}
        aria-label="Previous page"
        className={cn(
          linkClass(false),
          !meta.hasPreviousPage && 'pointer-events-none opacity-40',
        )}
      >
        <Icon name="chevronLeft" />
      </a>

      {items.map((item, index) =>
        item === GAP ? (
          <span
            key={`gap-${index}`}
            aria-hidden="true"
            className="px-1 text-sm text-ink-muted"
          >
            {GAP}
          </span>
        ) : (
          <a
            key={item}
            href={hrefForPage(item)}
            onClick={(event) => navigate(event, item)}
            onMouseEnter={() => onPrefetchPage?.(item)}
            onFocus={() => onPrefetchPage?.(item)}
            aria-current={item === meta.page ? 'page' : undefined}
            className={linkClass(item === meta.page)}
          >
            {item}
          </a>
        ),
      )}

      <a
        href={hrefForPage(meta.page + 1)}
        onClick={(event) => meta.hasNextPage && navigate(event, meta.page + 1)}
        onMouseEnter={() => meta.hasNextPage && onPrefetchPage?.(meta.page + 1)}
        aria-disabled={!meta.hasNextPage}
        aria-label="Next page"
        className={cn(linkClass(false), !meta.hasNextPage && 'pointer-events-none opacity-40')}
      >
        <Icon name="chevronRight" />
      </a>
    </nav>
  );
}
