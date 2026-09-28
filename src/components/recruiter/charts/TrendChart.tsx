'use client';

import { useMemo } from 'react';
import type { TrendPoint } from '@/types/domain';

interface TrendChartProps {
  readonly points: readonly TrendPoint[];
}

const WIDTH = 640;
const HEIGHT = 200;
const PADDING = { top: 12, right: 8, bottom: 22, left: 8 };

function buildPath(values: readonly number[], max: number): string {
  const innerWidth = WIDTH - PADDING.left - PADDING.right;
  const innerHeight = HEIGHT - PADDING.top - PADDING.bottom;
  const step = values.length > 1 ? innerWidth / (values.length - 1) : 0;

  return values
    .map((value, index) => {
      const x = PADDING.left + index * step;
      const y = PADDING.top + innerHeight - (max === 0 ? 0 : (value / max) * innerHeight);
      return `${index === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(' ');
}

/**
 * Applications over time.
 *
 * Drawn as plain SVG rather than pulled from a charting library: two paths and a
 * gradient do not justify 50-100 KB of runtime. The geometry is memoised on the data,
 * so re-renders from unrelated dashboard state cost nothing.
 */
export function TrendChart({ points }: TrendChartProps) {
  const { linePath, areaPath, interviewPath, max, labels } = useMemo(() => {
    const applications = points.map((point) => point.applications);
    const interviews = points.map((point) => point.interviews);
    const peak = Math.max(1, ...applications);
    const line = buildPath(applications, peak);
    const baseline = HEIGHT - PADDING.bottom;

    return {
      max: peak,
      linePath: line,
      areaPath: `${line} L${WIDTH - PADDING.right} ${baseline} L${PADDING.left} ${baseline} Z`,
      interviewPath: buildPath(interviews, peak),
      labels: [points[0]?.date, points[Math.floor(points.length / 2)]?.date, points.at(-1)?.date],
    };
  }, [points]);

  return (
    <figure className="w-full">
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="h-auto w-full"
        role="img"
        aria-label={`Applications over the last ${points.length} days, peaking at ${max} in a day`}
      >
        <defs>
          <linearGradient id="trend-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--brand-600)" stopOpacity="0.22" />
            <stop offset="100%" stopColor="var(--brand-600)" stopOpacity="0" />
          </linearGradient>
        </defs>

        {[0.25, 0.5, 0.75, 1].map((fraction) => {
          const y = PADDING.top + (HEIGHT - PADDING.top - PADDING.bottom) * fraction;
          return (
            <line
              key={fraction}
              x1={PADDING.left}
              x2={WIDTH - PADDING.right}
              y1={y}
              y2={y}
              stroke="var(--line-subtle)"
              strokeWidth={1}
            />
          );
        })}

        <path d={areaPath} fill="url(#trend-fill)" />
        <path
          d={linePath}
          fill="none"
          stroke="var(--brand-600)"
          strokeWidth={2}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        <path
          d={interviewPath}
          fill="none"
          stroke="var(--success-fg)"
          strokeWidth={1.75}
          strokeDasharray="4 3"
          strokeLinejoin="round"
        />

        {labels.map((label, index) =>
          label ? (
            <text
              key={label}
              x={PADDING.left + index * ((WIDTH - PADDING.left - PADDING.right) / 2)}
              y={HEIGHT - 4}
              textAnchor={index === 0 ? 'start' : index === 2 ? 'end' : 'middle'}
              className="fill-[var(--text-muted)] text-[11px]"
            >
              {label.slice(5)}
            </text>
          ) : null,
        )}
      </svg>

      <figcaption className="mt-3 flex items-center gap-4 text-xs text-ink-secondary">
        <span className="flex items-center gap-1.5">
          <span className="h-0.5 w-4 rounded bg-brand-600" aria-hidden="true" />
          Applications
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-0.5 w-4 rounded bg-success" aria-hidden="true" />
          Reached interview
        </span>
      </figcaption>
    </figure>
  );
}
