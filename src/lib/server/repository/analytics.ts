import type { OverviewResponse } from '@/lib/api/contracts';
import { APPLICANT_STAGES } from '@/types/domain';
import type { FunnelStage, JobPerformance, TrendPoint } from '@/types/domain';
import { DATASET_EPOCH, dataset } from '../dataset';
import { countApplicantsByStage } from './applicants';

const DAY_MS = 86_400_000;
const TREND_DAYS = 30;

/**
 * Aggregated once and cached for the process lifetime. The dashboard is read-only
 * against a static dataset, so recomputing it per request would be pure waste.
 */
let cached: OverviewResponse | null = null;

function buildTrend(): TrendPoint[] {
  const applicationsByDay = new Map<string, number>();
  const interviewsByDay = new Map<string, number>();

  for (const applicant of dataset.applicants) {
    const day = applicant.appliedAt.slice(0, 10);
    applicationsByDay.set(day, (applicationsByDay.get(day) ?? 0) + 1);
    if (applicant.stage === 'interview' || applicant.stage === 'offer' || applicant.stage === 'hired') {
      interviewsByDay.set(day, (interviewsByDay.get(day) ?? 0) + 1);
    }
  }

  const points: TrendPoint[] = [];
  for (let offset = TREND_DAYS - 1; offset >= 0; offset -= 1) {
    const date = new Date(DATASET_EPOCH - offset * DAY_MS).toISOString().slice(0, 10);
    points.push({
      date,
      applications: applicationsByDay.get(date) ?? 0,
      interviews: interviewsByDay.get(date) ?? 0,
    });
  }
  return points;
}

/**
 * A funnel counts everyone who *reached* a stage, not everyone sitting in it right
 * now. Walking the stage order backwards and accumulating turns the current-stage
 * snapshot into reach counts, which is what makes the conversion percentages on the
 * chart mean something. `applied` is every applicant, including those since rejected.
 */
function buildFunnel(): FunnelStage[] {
  const counts = countApplicantsByStage();
  const order = APPLICANT_STAGES.filter((stage) => stage !== 'rejected');
  const rejected = counts.get('rejected') ?? 0;

  let reached = 0;
  const funnel: FunnelStage[] = [];
  for (let index = order.length - 1; index >= 0; index -= 1) {
    const stage = order[index] as (typeof order)[number];
    reached += counts.get(stage) ?? 0;
    funnel.unshift({ stage, count: stage === 'applied' ? reached + rejected : reached });
  }

  return funnel;
}

function buildTopJobs(): JobPerformance[] {
  const applicantsByJob = new Map<string, number>();
  for (const applicant of dataset.applicants) {
    applicantsByJob.set(applicant.jobId, (applicantsByJob.get(applicant.jobId) ?? 0) + 1);
  }

  return dataset.jobRecords
    .map((record) => {
      const applicants = applicantsByJob.get(record.job.id) ?? 0;
      return {
        jobId: record.job.id,
        slug: record.job.slug,
        title: record.job.title,
        views: record.views,
        applicants,
        conversionRate: record.views === 0 ? 0 : Math.round((applicants / record.views) * 1000) / 10,
      } satisfies JobPerformance;
    })
    .sort((a, b) => b.applicants - a.applicants)
    .slice(0, 6);
}

export function getRecruiterOverview(): OverviewResponse {
  if (cached) return cached;

  const counts = countApplicantsByStage();
  const totalApplicants = dataset.applicants.length;
  const hired = counts.get('hired') ?? 0;
  const offers = counts.get('offer') ?? 0;

  cached = {
    data: {
      metrics: {
        activeJobs: dataset.jobRecords.length,
        totalApplicants,
        inInterview: counts.get('interview') ?? 0,
        hiredThisQuarter: hired,
        avgTimeToHireDays: 27,
        offerAcceptanceRate:
          offers + hired === 0 ? 0 : Math.round((hired / (offers + hired)) * 100),
        deltas: { activeJobs: 6.4, totalApplicants: 12.8, inInterview: -3.1, hiredThisQuarter: 9.2 },
      },
      funnel: buildFunnel(),
      trend: buildTrend(),
      topJobs: buildTopJobs(),
    },
  };

  return cached;
}
