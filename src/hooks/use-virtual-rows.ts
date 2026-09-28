'use client';

import type { RefObject } from 'react';
import { useCallback, useEffect, useState } from 'react';

export interface VirtualRowsOptions {
  readonly rowCount: number;
  readonly rowHeight: number;
  /** Rows rendered beyond the viewport on each side, to hide scroll latency. */
  readonly overscan?: number;
}

export interface VirtualRows {
  readonly startIndex: number;
  readonly endIndex: number;
  readonly paddingTop: number;
  readonly paddingBottom: number;
  readonly onScroll: () => void;
}

/**
 * Minimal fixed-height windowing.
 *
 * A virtualisation library would be a dependency for about forty lines of maths.
 * This covers the one view that genuinely needs it (the recruiter pipeline table)
 * and nothing more.
 *
 * The scroll container's ref is owned by the caller and passed in, rather than
 * returned: the hook never hands a ref back through render, and the component keeps
 * the ordinary `ref={...}` idiom.
 */
export function useVirtualRows(
  containerRef: RefObject<HTMLDivElement | null>,
  { rowCount, rowHeight, overscan = 8 }: VirtualRowsOptions,
): VirtualRows {
  const [range, setRange] = useState({ start: 0, end: 40 });

  // Reads layout imperatively and only calls setState when the visible window
  // actually moves, so scrolling does not thrash React.
  const measure = useCallback(() => {
    const element = containerRef.current;
    if (!element) return;

    const visibleRows = Math.ceil(element.clientHeight / rowHeight);
    const first = Math.floor(element.scrollTop / rowHeight);
    const start = Math.max(0, first - overscan);
    const end = Math.min(rowCount, first + visibleRows + overscan);

    setRange((current) =>
      current.start === start && current.end === end ? current : { start, end },
    );
  }, [containerRef, overscan, rowCount, rowHeight]);

  // Re-measure when the row count changes (a page was appended) or on resize.
  useEffect(() => {
    measure();
    window.addEventListener('resize', measure, { passive: true });
    return () => window.removeEventListener('resize', measure);
  }, [measure]);

  const endIndex = Math.min(range.end, rowCount);
  const startIndex = Math.min(range.start, Math.max(0, endIndex - 1));

  return {
    startIndex,
    endIndex,
    paddingTop: startIndex * rowHeight,
    paddingBottom: Math.max(0, (rowCount - endIndex) * rowHeight),
    onScroll: measure,
  };
}
