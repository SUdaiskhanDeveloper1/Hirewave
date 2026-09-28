import 'server-only';

import type {
  CompaniesQuery,
  CompaniesResponse,
  CompanyResponse,
  FacetsResponse,
  JobResponse,
  JobsQuery,
  JobsResponse,
} from '@/lib/api/contracts';
import type { Company, Job, JobSummary } from '@/types/domain';

/**
 * The seam between the app and wherever jobs actually come from.
 *
 * Both implementations return identical contract shapes, so swapping the source is a
 * configuration change: no component, hook, cache key or route handler is aware of
 * which one is active.
 *
 * Everything is async because a real provider is a network call. The mock provider
 * resolves immediately, so nothing pays for the abstraction in mock mode.
 */
export interface JobsProvider {
  /** Shown in the footer and logged at boot so the active source is never a guess. */
  readonly name: string;
  /** False for the mock provider; used to decide whether to prerender job pages. */
  readonly isLive: boolean;

  queryJobs(query: JobsQuery): Promise<JobsResponse>;
  computeFacets(query: JobsQuery): Promise<FacetsResponse>;
  findJob(slug: string): Promise<JobResponse | null>;
  listFeaturedJobs(limit: number): Promise<readonly JobSummary[]>;
  listSimilarJobs(job: Job, limit: number): Promise<readonly JobSummary[]>;
  listJobsByCompany(companySlug: string, limit: number): Promise<readonly JobSummary[]>;
  /** Empty for a live provider: an index of millions cannot be prerendered. */
  listJobSlugs(limit?: number): Promise<readonly string[]>;

  queryCompanies(query: CompaniesQuery): Promise<CompaniesResponse>;
  findCompany(slug: string): Promise<CompanyResponse | null>;
  listTopCompanies(limit: number): Promise<readonly Company[]>;
  listCompanySlugs(): Promise<readonly string[]>;
}
