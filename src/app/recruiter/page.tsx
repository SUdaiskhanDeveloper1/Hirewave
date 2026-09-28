import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import type { Metadata } from 'next';
import { AnalyticsPanel } from '@/components/recruiter/AnalyticsPanel';
import { MetricCard } from '@/components/recruiter/MetricCard';
import { RecentApplicants } from '@/components/recruiter/RecentApplicants';
import { TopJobsTable } from '@/components/recruiter/TopJobsTable';
import { ButtonLink } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { makeQueryClient } from '@/lib/query/client';
import { queryKeys } from '@/lib/query/keys';
import { buildMetadata } from '@/lib/seo';
import { getApplicantsPage, getOverview } from '@/lib/server/queries';
import { formatCompactNumber } from '@/lib/utils/format';

export const metadata: Metadata = buildMetadata({
  title: 'Recruiter dashboard',
  description: 'Hiring metrics, pipeline funnel and posting performance.',
  path: '/recruiter',
  noIndex: true,
});

const RECENT_QUERY = { perPage: 6 } as const;

export default function RecruiterDashboardPage() {
  const { data: overview } = getOverview();
  const { metrics } = overview;

  // Seed the cache the client components will read from, so the dashboard renders
  // its first frame without a single request.
  const queryClient = makeQueryClient();
  queryClient.setQueryData(queryKeys.recruiter.overview, { data: overview });
  queryClient.setQueryData(queryKeys.applicants.list(RECENT_QUERY), getApplicantsPage(RECENT_QUERY));

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-ink">Overview</h2>
            <p className="mt-0.5 text-sm text-ink-secondary">
              Hiring activity across all of your postings.
            </p>
          </div>
          <div className="flex gap-2">
            <ButtonLink href="/recruiter/jobs" variant="secondary" size="sm">
              Manage postings
            </ButtonLink>
            <ButtonLink href="/recruiter/jobs/new" size="sm">
              <Icon name="plus" size={14} />
              Post a job
            </ButtonLink>
          </div>
        </div>

        {/* Metric cards are rendered on the server: they are the first thing read
            and they need no interactivity, so they ship as plain HTML. */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            label="Active postings"
            value={String(metrics.activeJobs)}
            delta={metrics.deltas.activeJobs}
          />
          <MetricCard
            label="Total applicants"
            value={formatCompactNumber(metrics.totalApplicants)}
            delta={metrics.deltas.totalApplicants}
          />
          <MetricCard
            label="In interview"
            value={String(metrics.inInterview)}
            delta={metrics.deltas.inInterview}
          />
          <MetricCard
            label="Hired this quarter"
            value={String(metrics.hiredThisQuarter)}
            delta={metrics.deltas.hiredThisQuarter}
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            label="Avg time to hire"
            value={`${metrics.avgTimeToHireDays} days`}
            hint="From first application to signed offer"
          />
          <MetricCard
            label="Offer acceptance"
            value={`${metrics.offerAcceptanceRate}%`}
            hint="Offers accepted this quarter"
          />
        </div>

        {/* Charts are code-split and load after the shell is interactive. */}
        <AnalyticsPanel />

        <div className="cv-auto grid gap-3 lg:grid-cols-2">
          <TopJobsTable jobs={overview.topJobs} />
          <RecentApplicants />
        </div>
      </div>
    </HydrationBoundary>
  );
}
