'use client';

import dynamic from 'next/dynamic';
import { Card } from '@/components/ui/Card';
import { ErrorState } from '@/components/ui/ErrorState';
import { useRecruiterOverview } from '@/hooks/use-recruiter-overview';
import { ChartSkeleton } from './MetricCardSkeleton';

/**
 * Charts are code-split away from the dashboard shell.
 *
 * `ssr: false` keeps them out of the server render as well as the initial JS, so the
 * first paint is the metric cards (the thing a recruiter actually looks at first) and
 * the chart code is fetched in parallel afterwards. Neither chart is on the candidate
 * side of the app, so this code never reaches a job seeker's browser at all.
 */
const TrendChart = dynamic(() => import('./charts/TrendChart').then((mod) => mod.TrendChart), {
  ssr: false,
  loading: () => <ChartSkeleton />,
});

const FunnelChart = dynamic(() => import('./charts/FunnelChart').then((mod) => mod.FunnelChart), {
  ssr: false,
  loading: () => <ChartSkeleton height="h-56" />,
});

export function AnalyticsPanel() {
  const { data, isPending, isError, refetch } = useRecruiterOverview();

  if (isError) {
    return (
      <ErrorState
        title="Analytics unavailable"
        description="The dashboard aggregates could not be loaded."
        onRetry={() => void refetch()}
      />
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
      <Card className="p-5">
        <h2 className="text-sm font-semibold text-ink">Applications, last 30 days</h2>
        <div className="mt-4">
          {isPending || !data ? <ChartSkeleton /> : <TrendChart points={data.trend} />}
        </div>
      </Card>

      <Card className="p-5">
        <h2 className="text-sm font-semibold text-ink">Pipeline funnel</h2>
        <div className="mt-4">
          {isPending || !data ? (
            <ChartSkeleton height="h-56" />
          ) : (
            <FunnelChart stages={data.funnel} />
          )}
        </div>
      </Card>
    </div>
  );
}
