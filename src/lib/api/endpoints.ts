/**
 * Typed endpoint functions. React Query hooks call these and nothing else, so the UI
 * never knows a URL, a header or a response envelope.
 *
 * Only the endpoints the UI actually consumes have a client here. Job and company
 * *detail* pages are server-rendered from the repository, so they need no client
 * fetcher; the REST routes still exist for external consumers.
 */

import type {
  ApplicantsQuery,
  ApplicantsResponse,
  CompaniesQuery,
  CompaniesResponse,
  FacetsResponse,
  JobsQuery,
  JobsResponse,
  OverviewResponse,
} from './contracts';
import { apiFetch } from './http';
import { applicantsQueryToSearchParams, jobsQueryToSearchParams } from './query-params';

interface RequestContext {
  readonly signal?: AbortSignal;
}

function withQuery(path: string, params: URLSearchParams): string {
  const serialized = params.toString();
  return serialized ? `${path}?${serialized}` : path;
}

export const jobsApi = {
  list: (query: JobsQuery, ctx: RequestContext = {}): Promise<JobsResponse> =>
    apiFetch<JobsResponse>(withQuery('/jobs', jobsQueryToSearchParams(query)), ctx),

  facets: (query: JobsQuery, ctx: RequestContext = {}): Promise<FacetsResponse> =>
    apiFetch<FacetsResponse>(withQuery('/jobs/facets', jobsQueryToSearchParams(query)), ctx),
};

export const companiesApi = {
  list: (query: CompaniesQuery, ctx: RequestContext = {}): Promise<CompaniesResponse> => {
    const params = new URLSearchParams();
    if (query.q) params.set('q', query.q);
    if (query.industry) params.set('industry', query.industry);
    if (query.page && query.page > 1) params.set('page', String(query.page));
    if (query.perPage) params.set('perPage', String(query.perPage));
    return apiFetch<CompaniesResponse>(withQuery('/companies', params), ctx);
  },
};

export const applicantsApi = {
  list: (query: ApplicantsQuery, ctx: RequestContext = {}): Promise<ApplicantsResponse> =>
    apiFetch<ApplicantsResponse>(
      withQuery('/applicants', applicantsQueryToSearchParams(query)),
      ctx,
    ),
};

export const recruiterApi = {
  overview: (ctx: RequestContext = {}): Promise<OverviewResponse> =>
    apiFetch<OverviewResponse>('/recruiter/overview', ctx),
};
