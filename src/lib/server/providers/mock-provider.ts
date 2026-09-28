import 'server-only';

import type { CompaniesQuery, JobsQuery } from '@/lib/api/contracts';
import type { Job } from '@/types/domain';
import {
  findCompanyBySlug,
  listCompanySlugs,
  listTopCompanies,
  queryCompanies,
} from '../repository/companies';
import {
  computeJobFacets,
  findJobBySlug,
  listFeaturedJobs,
  listJobSlugs,
  listJobsByCompany,
  listSimilarJobs,
  queryJobs,
} from '../repository/jobs';
import type { JobsProvider } from './types';

/**
 * The generated dataset, behind the provider interface.
 *
 * This is the default and it is deliberately the fallback: the app runs, builds and
 * demos with no API key, no network and no quota spend. The repository underneath is
 * synchronous, so these wrappers add a resolved promise and nothing else.
 */
export const mockProvider: JobsProvider = {
  name: 'mock dataset',
  isLive: false,

  queryJobs: async (query: JobsQuery) => queryJobs(query),
  computeFacets: async (query: JobsQuery) => ({ data: computeJobFacets(query) }),

  findJob: async (slug: string) => {
    const job = findJobBySlug(slug);
    return job ? { data: job } : null;
  },

  listFeaturedJobs: async (limit: number) => listFeaturedJobs(limit),
  listSimilarJobs: async (job: Job, limit: number) => listSimilarJobs(job, limit),
  listJobsByCompany: async (companySlug: string, limit: number) =>
    listJobsByCompany(companySlug, limit),
  listJobSlugs: async (limit?: number) => listJobSlugs(limit),

  queryCompanies: async (query: CompaniesQuery) => queryCompanies(query),

  findCompany: async (slug: string) => {
    const company = findCompanyBySlug(slug);
    return company ? { data: company } : null;
  },

  listTopCompanies: async (limit: number) => listTopCompanies(limit),
  listCompanySlugs: async () => listCompanySlugs(),
};
