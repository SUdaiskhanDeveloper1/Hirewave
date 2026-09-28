'use client';

import { APPLICANT_STAGE_LABELS } from '@/lib/labels';
import { formatCompactNumber } from '@/lib/utils/format';
import type { FunnelStage } from '@/types/domain';

interface FunnelChartProps {
  readonly stages: readonly FunnelStage[];
}

/**
 * Hiring funnel.
 *
 * Bars are CSS, not SVG: the browser already knows how to lay out and animate a
 * proportional row, and this keeps the whole component under a kilobyte.
 */
export function FunnelChart({ stages }: FunnelChartProps) {
  const peak = Math.max(1, ...stages.map((stage) => stage.count));

  return (
    <ol className="space-y-3">
      {stages.map((stage, index) => {
        const width = (stage.count / peak) * 100;
        const conversion =
          index === 0 || !stages[0]?.count
            ? undefined
            : Math.round((stage.count / stages[0].count) * 100);

        return (
          <li key={stage.stage}>
            <div className="mb-1.5 flex items-baseline justify-between gap-3 text-sm">
              <span className="font-medium text-ink">{APPLICANT_STAGE_LABELS[stage.stage]}</span>
              <span className="flex items-baseline gap-2 text-ink-secondary tabular-nums">
                {conversion === undefined ? null : (
                  <span className="text-xs text-ink-muted">{conversion}%</span>
                )}
                {formatCompactNumber(stage.count)}
              </span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-sunken">
              <div
                className="h-full rounded-full bg-brand-600 transition-[width] duration-500 ease-out"
                style={{ width: `${width}%`, opacity: 1 - index * 0.13 }}
              />
            </div>
          </li>
        );
      })}
    </ol>
  );
}
