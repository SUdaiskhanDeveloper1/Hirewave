/**
 * Employer services.
 *
 * Same arrangement as the candidate services: future endpoint signatures
 * (`GET /employer/jobs`, `POST /employer/jobs`) over mock records, with published rows
 * expanded from the jobs API so the dashboard needs one request rather than one per row.
 */

import type { EmployerJob, JobPostStatus } from '@/types/domain';
import type { ApiCollection, ApiResource } from './contracts';
import { jobsApi } from './endpoints';
import { MOCK_EMPLOYER_JOBS } from '@/lib/mock/employer';

/** Drafts created in this browser session, ahead of the seeded rows. */
const sessionDrafts: EmployerJob[] = [];

export interface JobDraftInput {
  readonly title: string;
  readonly location: string;
  readonly employmentType: string;
  readonly workMode: string;
  readonly experienceLevel: string;
  readonly salaryMin: string;
  readonly salaryMax: string;
  readonly description: string;
  readonly responsibilities: string;
  readonly requirements: string;
  readonly benefits: string;
  readonly applyEmail: string;
}

export const employerApi = {
  listJobs: async (
    status?: JobPostStatus,
    signal?: AbortSignal,
  ): Promise<ApiCollection<EmployerJob>> => {
    const records = [...sessionDrafts, ...MOCK_EMPLOYER_JOBS].filter(
      (record) => status === undefined || record.status === status,
    );

    const jobIds = records.map((record) => record.jobId).filter(Boolean);
    const jobById = new Map(
      jobIds.length === 0
        ? []
        : (await jobsApi.list({ ids: jobIds, perPage: jobIds.length }, { signal })).data.map(
            (job) => [job.id, job] as const,
          ),
    );

    const data = records
      .map((record) => {
        const job = jobById.get(record.jobId);
        return job ? { ...record, job } : record;
      })
      // Published rows without a matching posting would render an empty card.
      .filter((record) => record.status === 'draft' || record.job !== undefined)
      .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));

    return {
      data,
      meta: {
        page: 1,
        perPage: data.length,
        total: data.length,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    };
  },

  /**
   * Saves a posting as a draft. Publishing is intentionally out of scope for the
   * frontend phase - the endpoint that creates a live posting belongs to the backend.
   */
  saveDraft: async (input: JobDraftInput): Promise<ApiResource<EmployerJob>> => {
    const draft: EmployerJob = {
      id: `post_${Date.now()}`,
      jobId: '',
      status: 'draft',
      draftTitle: input.title,
      views: 0,
      applicantCount: 0,
      newApplicantCount: 0,
      updatedAt: new Date().toISOString(),
    };

    sessionDrafts.unshift(draft);
    return { data: draft };
  },
};
