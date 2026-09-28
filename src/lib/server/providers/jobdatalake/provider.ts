import 'server-only';

import type {
  CompaniesQuery,
  CompaniesResponse,
  FacetsResponse,
  JobsQuery,
  JobsResponse,
  PageMeta,
} from '@/lib/api/contracts';
import { DEFAULT_JOBS_PER_PAGE } from '@/lib/api/contracts';
import {
  EMPLOYMENT_TYPE_LABELS,
  EXPERIENCE_LEVEL_LABELS,
  ROLE_LABELS,
  WORK_MODE_LABELS,
} from '@/lib/labels';
import type { Company, Job, JobSummary } from '@/types/domain';
import { EMPLOYMENT_TYPES, EXPERIENCE_LEVELS, ROLE_FAMILIES, WORK_MODES } from '@/types/domain';
import type { JobsProvider } from '../types';
import { REVALIDATE, jdlFetch } from './client';
import type { JdlCompany, JdlJob, JdlJobsResponse } from './mappers';
import { toCompany, toJob, toJobSummary } from './mappers';

/** Upstream pages are fixed at 20 records. */
const UPSTREAM_PAGE_SIZE = 20;

function buildMeta(total: number, page: number, perPage: number): PageMeta {
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const safePage = Math.min(Math.max(1, page), totalPages);
  return {
    page: safePage,
    perPage,
    total,
    totalPages,
    hasNextPage: safePage < totalPages,
    hasPreviousPage: safePage > 1,
  };
}

/**
 * Builds the upstream query.
 *
 * The API exposes a single free-text `q`, so the structured filters the UI offers
 * (role, seniority, work mode, contract, salary floor) are folded into the keyword
 * where that helps recall, then enforced exactly in `applyLocalFilters`. Filtering
 * locally after the fetch is what keeps the sidebar honest: a facet the API cannot
 * express still narrows the list correctly.
 */
function buildKeyword(query: JobsQuery): string {
  const parts: string[] = [];
  if (query.q) parts.push(query.q);
  if (query.role?.length === 1) parts.push(ROLE_LABELS[query.role[0]!]);
  if (query.location) parts.push(query.location);
  return parts.join(' ').trim() || 'engineer';
}

function applyLocalFilters(jobs: readonly JobSummary[], query: JobsQuery): JobSummary[] {
  const location = query.location?.toLowerCase();

  return jobs.filter((job) => {
    if (query.role?.length && !query.role.includes(job.roleFamily)) return false;
    if (query.type?.length && !query.type.includes(job.employmentType)) return false;
    if (query.level?.length && !query.level.includes(job.experienceLevel)) return false;
    if (query.mode?.length && !query.mode.includes(job.workMode)) return false;
    if (query.company && job.company.slug !== query.company) return false;
    if (query.industry && job.company.industry !== query.industry) return false;
    if (location && !job.location.toLowerCase().includes(location)) return false;
    // A posting with no published band cannot satisfy a salary floor.
    if (query.salaryMin !== undefined && (job.salary === null || job.salary.max < query.salaryMin)) {
      return false;
    }
    if (query.ids?.length && !query.ids.includes(job.id)) return false;
    return true;
  });
}

function sortJobs(jobs: JobSummary[], query: JobsQuery): JobSummary[] {
  if (query.sort === 'newest') {
    return [...jobs].sort((a, b) => (a.postedAt < b.postedAt ? 1 : -1));
  }
  if (query.sort === 'salary') {
    return [...jobs].sort((a, b) => (b.salary?.max ?? -1) - (a.salary?.max ?? -1));
  }
  return jobs;
}

/**
 * Fetches enough upstream pages to fill one page of the UI after local filtering.
 * Capped hard: a filter that matches almost nothing must not turn into an unbounded
 * crawl of the index (and an unbounded bill).
 */
async function fetchPool(query: JobsQuery, wanted: number): Promise<{
  jobs: JobSummary[];
  found: number;
}> {
  const keyword = buildKeyword(query);
  const maxUpstreamPages = 4;

  const collected: JobSummary[] = [];
  let found = 0;

  for (let page = 1; page <= maxUpstreamPages; page += 1) {
    const response = await jdlFetch<JdlJobsResponse>('/jobs', {
      searchParams: { q: keyword, page },
      revalidate: REVALIDATE.search,
    });

    found = response.found ?? 0;
    collected.push(...(response.jobs ?? []).map(toJobSummary));

    const filtered = applyLocalFilters(collected, query);
    if (filtered.length >= wanted) break;
    if ((response.jobs ?? []).length < UPSTREAM_PAGE_SIZE) break;
  }

  return { jobs: collected, found };
}

/**
 * Live JobDataLake data.
 *
 * Active only when `JOBDATALAKE_API_KEY` is set. Recruiter-side data (applicants,
 * pipeline analytics) is not part of this API and stays on the mock repository.
 */
export const jobDataLakeProvider: JobsProvider = {
  name: 'JobDataLake API',
  isLive: true,

  queryJobs: async (query: JobsQuery): Promise<JobsResponse> => {
    const perPage = query.perPage ?? DEFAULT_JOBS_PER_PAGE;
    const page = query.page ?? 1;
    const wanted = perPage * page;

    const { jobs, found } = await fetchPool(query, wanted);
    const filtered = sortJobs(applyLocalFilters(jobs, query), query);

    // `found` is the upstream keyword count; once local filters run, the honest total
    // is what actually survived them.
    const isNarrowed =
      Boolean(query.role?.length || query.type?.length || query.level?.length || query.mode?.length) ||
      query.salaryMin !== undefined;
    const total = isNarrowed ? filtered.length : Math.max(found, filtered.length);

    const meta = buildMeta(total, page, perPage);
    const start = (meta.page - 1) * perPage;

    return { data: filtered.slice(start, start + perPage), meta };
  },

  computeFacets: async (query: JobsQuery): Promise<FacetsResponse> => {
    // Counts come from the sample actually fetched for this keyword, so a bucket
    // never claims more than the provider can show.
    const { jobs } = await fetchPool({ q: query.q, location: query.location }, UPSTREAM_PAGE_SIZE);
    const scoped = applyLocalFilters(jobs, { q: query.q, location: query.location });

    const count = <T extends string>(pick: (job: JobSummary) => T, value: T): number =>
      scoped.filter((job) => pick(job) === value).length;

    const locations = new Map<string, number>();
    for (const job of scoped) locations.set(job.location, (locations.get(job.location) ?? 0) + 1);

    return {
      data: {
        roles: ROLE_FAMILIES.map((value) => ({
          value,
          label: ROLE_LABELS[value],
          count: count((job) => job.roleFamily, value),
        })),
        types: EMPLOYMENT_TYPES.map((value) => ({
          value,
          label: EMPLOYMENT_TYPE_LABELS[value],
          count: count((job) => job.employmentType, value),
        })),
        levels: EXPERIENCE_LEVELS.map((value) => ({
          value,
          label: EXPERIENCE_LEVEL_LABELS[value],
          count: count((job) => job.experienceLevel, value),
        })),
        modes: WORK_MODES.map((value) => ({
          value,
          label: WORK_MODE_LABELS[value],
          count: count((job) => job.workMode, value),
        })),
        locations: [...locations.entries()]
          .sort((a, b) => b[1] - a[1])
          .slice(0, 12)
          .map(([value, total]) => ({ value, label: value, count: total })),
        industries: [],
        total: scoped.length,
      },
    };
  },

  findJob: async (slug: string) => {
    try {
      const response = await jdlFetch<{ job?: JdlJob } & JdlJob>(
        `/jobs/${encodeURIComponent(slug)}`,
        { revalidate: REVALIDATE.detail },
      );
      const raw = response.job ?? response;
      return raw && raw.id ? { data: toJob(raw) } : null;
    } catch {
      // A missing or withdrawn posting is a 404 for the page, not a crash.
      return null;
    }
  },

  listFeaturedJobs: async (limit: number): Promise<readonly JobSummary[]> => {
    const { jobs } = await fetchPool({ q: 'software engineer' }, limit);
    return jobs.slice(0, limit);
  },

  listSimilarJobs: async (job: Job, limit: number): Promise<readonly JobSummary[]> => {
    const { jobs } = await fetchPool({ q: ROLE_LABELS[job.roleFamily] }, limit + 1);
    return jobs.filter((candidate) => candidate.id !== job.id).slice(0, limit);
  },

  listJobsByCompany: async (companySlug: string, limit: number): Promise<readonly JobSummary[]> => {
    const { jobs } = await fetchPool({ q: companySlug.replace(/-/g, ' ') }, limit);
    return jobs.filter((job) => job.company.slug === companySlug).slice(0, limit);
  },

  // An index of 1.8M postings cannot be prerendered; job pages render on demand.
  listJobSlugs: async () => [],

  queryCompanies: async (query: CompaniesQuery): Promise<CompaniesResponse> => {
    // The API has no company search, only lookup by domain. The directory is built
    // from the companies attached to a sample of live postings.
    const { jobs } = await fetchPool({ q: query.q ?? 'software engineer' }, 60);

    const bySlug = new Map<string, Company>();
    for (const job of jobs) {
      if (bySlug.has(job.company.slug)) continue;
      bySlug.set(job.company.slug, {
        ...job.company,
        tagline: '',
        description: `${job.company.name} has open roles on the board.`,
        website: '',
        foundedYear: 0,
        coverImageUrl: '',
        benefits: [],
        openRoles: jobs.filter((other) => other.company.slug === job.company.slug).length,
        rating: 0,
      });
    }

    const data = [...bySlug.values()].sort((a, b) => b.openRoles - a.openRoles);
    const perPage = query.perPage ?? 24;
    const meta = buildMeta(data.length, query.page ?? 1, perPage);
    const start = (meta.page - 1) * perPage;

    return { data: data.slice(start, start + perPage), meta };
  },

  findCompany: async (slug: string) => {
    try {
      // The lookup is by domain; the directory slugs drop the TLD, so .com is the
      // pragmatic guess for a demo profile page.
      const company = await jdlFetch<JdlCompany>(`/companies/${slug}.com`, {
        revalidate: REVALIDATE.detail,
      });
      return company && company.domain ? { data: toCompany(company) } : null;
    } catch {
      return null;
    }
  },

  listTopCompanies: async (limit: number): Promise<readonly Company[]> => {
    const response = await jobDataLakeProvider.queryCompanies({ perPage: limit });
    return response.data;
  },

  listCompanySlugs: async () => [],
};
