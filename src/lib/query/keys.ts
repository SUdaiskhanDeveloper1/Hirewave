/**
 * Central query-key factory.
 *
 * Keys are built from *normalised* query objects, which is what makes request
 * deduplication actually work: `?role=frontend,backend` and `?role=backend,frontend`
 * hit the same cache entry, and a server prefetch lands on the exact key the client
 * will look up during hydration.
 */

import type { ApplicantsQuery, CompaniesQuery, JobsQuery } from '@/lib/api/contracts';
import { normalizeApplicantsQuery, normalizeJobsQuery } from '@/lib/api/query-params';

/**
 * Facets only depend on the free-text/location/company scope — not on the checkbox
 * dimensions. Narrowing the key means toggling a role filter reuses cached facets
 * instead of firing a second request.
 */
function facetScope(query: JobsQuery): JobsQuery {
  return normalizeJobsQuery({
    ...(query.q === undefined ? {} : { q: query.q }),
    ...(query.location === undefined ? {} : { location: query.location }),
    ...(query.company === undefined ? {} : { company: query.company }),
  });
}

export const queryKeys = {
  jobs: {
    root: ['jobs'] as const,
    list: (query: JobsQuery) => ['jobs', 'list', normalizeJobsQuery(query)] as const,
    facets: (query: JobsQuery) => ['jobs', 'facets', facetScope(query)] as const,
  },
  companies: {
    root: ['companies'] as const,
    list: (query: CompaniesQuery) =>
      [
        'companies',
        'list',
        {
          ...(query.q ? { q: query.q } : {}),
          ...(query.industry ? { industry: query.industry } : {}),
          ...(query.page && query.page > 1 ? { page: query.page } : {}),
          ...(query.perPage ? { perPage: query.perPage } : {}),
        },
      ] as const,
  },
  applicants: {
    root: ['applicants'] as const,
    list: (query: ApplicantsQuery) =>
      ['applicants', 'list', normalizeApplicantsQuery(query)] as const,
  },
  savedJobs: ['saved-jobs'] as const,
  candidate: {
    root: ['candidate'] as const,
    profile: ['candidate', 'profile'] as const,
    applications: ['candidate', 'applications'] as const,
  },
  employer: {
    root: ['employer'] as const,
    jobs: (status?: string) => ['employer', 'jobs', status ?? 'all'] as const,
  },
  recruiter: {
    root: ['recruiter'] as const,
    overview: ['recruiter', 'overview'] as const,
  },
} as const;
