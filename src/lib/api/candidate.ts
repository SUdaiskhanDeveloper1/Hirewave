/**
 * Candidate services.
 *
 * These back the parts of the product the backend has not built yet. Each function
 * has the signature its future endpoint will have (`GET /me/applications`,
 * `GET /me/profile`, `POST /jobs/:id/applications`), returns the same envelope as the
 * real API, and reads from the mock module instead of the network.
 *
 * Replacing a body with an `apiFetch` call is the whole migration. The hooks, the
 * cache keys and the screens above them do not change.
 */

import type { Application, CandidateProfile } from '@/types/domain';
import type { ApiCollection, ApiResource } from './contracts';
import { jobsApi } from './endpoints';
import { MOCK_APPLICATIONS, MOCK_CANDIDATE } from '@/lib/mock/candidate';

/** Applications submitted in this browser session, on top of the seeded history. */
const sessionApplications: Application[] = [];

function buildMeta(total: number) {
  return {
    page: 1,
    perPage: total,
    total,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  };
}

/** Profile edits made in this session, layered over the seeded record. */
let profileOverrides: Partial<CandidateProfile> = {};

export const candidateApi = {
  profile: async (): Promise<ApiResource<CandidateProfile>> => ({
    data: { ...MOCK_CANDIDATE, ...profileOverrides },
  }),

  /**
   * Saves profile edits. Held in memory rather than persisted, which is the right
   * scope for a frontend phase - the future endpoint is a PATCH with the same payload.
   */
  updateProfile: async (
    changes: Partial<CandidateProfile>,
  ): Promise<ApiResource<CandidateProfile>> => {
    profileOverrides = { ...profileOverrides, ...changes };
    return { data: { ...MOCK_CANDIDATE, ...profileOverrides } };
  },

  /**
   * Applications with their job expanded.
   *
   * The join happens here rather than in the UI: one request for every job referenced,
   * instead of a component fetching each posting as it renders.
   */
  applications: async (signal?: AbortSignal): Promise<ApiCollection<Application>> => {
    const records = [...sessionApplications, ...MOCK_APPLICATIONS];
    const jobIds = [...new Set(records.map((record) => record.jobId))];

    const jobs = await jobsApi.list({ ids: jobIds, perPage: jobIds.length }, { signal });
    const jobById = new Map(jobs.data.map((job) => [job.id, job]));

    const data = records
      // flatMap rather than map+filter: it drops unmatched records without needing a
      // type predicate to convince the compiler the nulls are gone.
      .flatMap((record) => {
        const job = jobById.get(record.jobId);
        return job ? [{ ...record, job }] : [];
      })
      .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));

    return { data, meta: buildMeta(data.length) };
  },

  /**
   * Submits an application. Recorded in memory so the candidate screens reflect the
   * action immediately; the future endpoint will return the created record the same way.
   */
  apply: async (jobId: string): Promise<ApiResource<Application>> => {
    const now = new Date().toISOString();
    const application: Application = {
      id: `app_c_${Date.now()}`,
      jobId,
      status: 'submitted',
      appliedAt: now,
      updatedAt: now,
    };

    sessionApplications.unshift(application);
    return { data: application };
  },

  /** True when this browser session has already applied to the job. */
  hasApplied: (jobId: string): boolean =>
    sessionApplications.some((application) => application.jobId === jobId) ||
    MOCK_APPLICATIONS.some((application) => application.jobId === jobId),
};
