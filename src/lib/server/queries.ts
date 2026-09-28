/**
 * Server-side data access for React Server Components.
 *
 * Every Server Component, route handler and sitemap entry reads through this module,
 * and this module reads through the active provider. Which provider that is - the
 * generated dataset or the live JobDataLake API - is decided once by whether
 * `JOBDATALAKE_API_KEY` is set, and nothing above this file can tell the difference.
 *
 * Recruiter-side data (applicants, pipeline analytics) has no upstream equivalent, so
 * it always comes from the local repository regardless of provider.
 */

import 'server-only';

import type {
  ApplicantsQuery,
  ApplicantsResponse,
  CompaniesQuery,
  CompaniesResponse,
  CompanyResponse,
  FacetsResponse,
  JobResponse,
  JobsQuery,
  JobsResponse,
  OverviewResponse,
} from '@/lib/api/contracts';
import type { Company, Job, JobSummary } from '@/types/domain';
import { jobsProvider } from './providers';
import { getRecruiterOverview } from './repository/analytics';
import { queryApplicants } from './repository/applicants';

export { isLiveData } from './providers';

/** Name of the active source, surfaced in the UI so demo data is never mistaken for live. */
export const dataSourceName = jobsProvider.name;

export function getJobsPage(query: JobsQuery): Promise<JobsResponse> {
  return jobsProvider.queryJobs(query);
}

export function getJobFacets(query: JobsQuery): Promise<FacetsResponse> {
  return jobsProvider.computeFacets(query);
}

export function getJob(slug: string): Promise<JobResponse | null> {
  return jobsProvider.findJob(slug);
}

export function getFeaturedJobs(limit: number): Promise<readonly JobSummary[]> {
  return jobsProvider.listFeaturedJobs(limit);
}

export function getSimilarJobs(job: Job, limit: number): Promise<readonly JobSummary[]> {
  return jobsProvider.listSimilarJobs(job, limit);
}

export function getCompanyJobs(companySlug: string, limit: number): Promise<readonly JobSummary[]> {
  return jobsProvider.listJobsByCompany(companySlug, limit);
}

export function getCompaniesPage(query: CompaniesQuery): Promise<CompaniesResponse> {
  return jobsProvider.queryCompanies(query);
}

export function getCompany(slug: string): Promise<CompanyResponse | null> {
  return jobsProvider.findCompany(slug);
}

export function getTopCompanies(limit: number): Promise<readonly Company[]> {
  return jobsProvider.listTopCompanies(limit);
}

/**
 * Params for `generateStaticParams` and the sitemap.
 *
 * The live provider returns nothing here on purpose: an index of millions of postings
 * cannot be prerendered, so those pages render on demand and are cached by their
 * route's `revalidate` window instead.
 */
export function getJobSlugs(limit?: number): Promise<readonly string[]> {
  return jobsProvider.listJobSlugs(limit);
}

export function getCompanySlugs(): Promise<readonly string[]> {
  return jobsProvider.listCompanySlugs();
}

/* Recruiter workspace: local repository only, both providers. */

export function getApplicantsPage(query: ApplicantsQuery): ApplicantsResponse {
  return queryApplicants(query);
}

export function getOverview(): OverviewResponse {
  return getRecruiterOverview();
}
