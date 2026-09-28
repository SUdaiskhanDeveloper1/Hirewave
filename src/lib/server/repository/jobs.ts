/**
 * Job repository. The only module in the app that reads the dataset directly.
 * Every function returns an API contract shape, which is what lets the route
 * handlers stay a thin transport wrapper.
 */

import type {
  FacetBucket,
  JobFacets,
  JobsQuery,
  JobsResponse,
  PageMeta,
} from '@/lib/api/contracts';
import { DATE_POSTED_DAYS, DEFAULT_JOBS_PER_PAGE } from '@/lib/api/contracts';
import type {
  EmploymentType,
  ExperienceLevel,
  Job,
  JobSummary,
  RoleFamily,
  WorkMode,
} from '@/types/domain';
import { EMPLOYMENT_TYPES, EXPERIENCE_LEVELS, ROLE_FAMILIES, WORK_MODES } from '@/types/domain';
import {
  EMPLOYMENT_TYPE_LABELS,
  EXPERIENCE_LEVEL_LABELS,
  ROLE_LABELS,
  WORK_MODE_LABELS,
} from '@/lib/labels';
import type { JobRecord } from '../dataset';
import { DATASET_EPOCH, dataset } from '../dataset';

const MAX_PER_PAGE = 50;

/**
 * List projection. The feed ships ~15 fields per job instead of the full document —
 * the single biggest lever on payload size for the search page.
 */
function projectSummary(job: Job): JobSummary {
  return {
    id: job.id,
    slug: job.slug,
    title: job.title,
    company: job.company,
    location: job.location,
    workMode: job.workMode,
    employmentType: job.employmentType,
    experienceLevel: job.experienceLevel,
    roleFamily: job.roleFamily,
    salary: job.salary,
    postedAt: job.postedAt,
    isFeatured: job.isFeatured,
    tags: job.tags,
    excerpt: job.excerpt,
  };
}

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

function includesAny<T extends string>(selected: readonly T[] | undefined, value: T): boolean {
  return selected === undefined || selected.length === 0 || selected.includes(value);
}

/** Keyword terms are ANDed, so "senior react remote" narrows rather than widens. */
function matchesKeyword(record: JobRecord, terms: readonly string[]): boolean {
  for (const term of terms) {
    if (!record.blob.includes(term)) return false;
  }
  return true;
}

function toTerms(q: string | undefined): string[] {
  if (!q) return [];
  return q.toLowerCase().split(/\s+/).filter(Boolean);
}

/** Cheap relevance signal: keyword hits in the title beat hits elsewhere. */
function relevanceScore(record: JobRecord, terms: readonly string[]): number {
  const title = record.job.title.toLowerCase();
  let score = record.job.isFeatured ? 12 : 0;
  for (const term of terms) {
    if (title.includes(term)) score += 24;
    else if (record.blob.includes(term)) score += 6;
  }
  // Recency tiebreaker, capped so it never outweighs a title match.
  const ageDays = (dataset.jobRecords[0]?.postedAtMs ?? 0) - record.postedAtMs;
  return score - Math.min(10, ageDays / 86_400_000 / 5);
}

function filterRecords(query: JobsQuery): JobRecord[] {
  const terms = toTerms(query.q);
  const location = query.location?.toLowerCase();
  const idSet = query.ids && query.ids.length > 0 ? new Set(query.ids) : undefined;
  // The dataset's epoch is its "now", so the window is measured from there rather
  // than wall-clock time - otherwise the filter would drift as the fixture ages.
  const postedAfter =
    query.posted === undefined
      ? undefined
      : DATASET_EPOCH - DATE_POSTED_DAYS[query.posted] * 86_400_000;

  const results: JobRecord[] = [];
  for (const record of dataset.jobRecords) {
    const { job } = record;
    if (idSet && !idSet.has(job.id)) continue;
    if (!includesAny(query.role, job.roleFamily)) continue;
    if (!includesAny(query.type, job.employmentType)) continue;
    if (!includesAny(query.level, job.experienceLevel)) continue;
    if (!includesAny(query.mode, job.workMode)) continue;
    if (query.company && job.company.slug !== query.company) continue;
    if (query.industry && job.company.industry !== query.industry) continue;
    if (postedAfter !== undefined && record.postedAtMs < postedAfter) continue;
    if (query.salaryMin !== undefined && (job.salary === null || job.salary.max < query.salaryMin))
      continue;
    if (location && !job.location.toLowerCase().includes(location)) continue;
    if (terms.length > 0 && !matchesKeyword(record, terms)) continue;
    results.push(record);
  }
  return results;
}

function sortRecords(records: JobRecord[], query: JobsQuery): JobRecord[] {
  const sort = query.sort ?? 'relevance';
  if (sort === 'newest') {
    // Dataset is already newest-first; avoid a pointless sort pass.
    return records;
  }
  if (sort === 'salary') {
    // Undisclosed pay sorts to the bottom rather than to the top as a zero.
    return [...records].sort((a, b) => (b.job.salary?.max ?? -1) - (a.job.salary?.max ?? -1));
  }
  const terms = toTerms(query.q);
  if (terms.length === 0) {
    return [...records].sort((a, b) => Number(b.job.isFeatured) - Number(a.job.isFeatured));
  }
  return [...records]
    .map((record) => ({ record, score: relevanceScore(record, terms) }))
    .sort((a, b) => b.score - a.score)
    .map((entry) => entry.record);
}

export function queryJobs(query: JobsQuery): JobsResponse {
  const perPage = Math.min(query.perPage ?? DEFAULT_JOBS_PER_PAGE, MAX_PER_PAGE);
  const filtered = filterRecords(query);
  const meta = buildMeta(filtered.length, query.page ?? 1, perPage);
  const start = (meta.page - 1) * perPage;
  const page = sortRecords(filtered, query).slice(start, start + perPage);

  return { data: page.map((record) => projectSummary(record.job)), meta };
}

export function findJobBySlug(slug: string): Job | null {
  return dataset.jobBySlug.get(slug)?.job ?? null;
}

export function findJobById(id: string): Job | null {
  return dataset.jobById.get(id)?.job ?? null;
}

/** Slugs for `generateStaticParams`; newest first so the most-visited pages prerender. */
export function listJobSlugs(limit?: number): string[] {
  const records = limit === undefined ? dataset.jobRecords : dataset.jobRecords.slice(0, limit);
  return records.map((record) => record.job.slug);
}

export function listFeaturedJobs(limit: number): JobSummary[] {
  const featured = dataset.jobRecords.filter((record) => record.job.isFeatured);
  const source = featured.length >= limit ? featured : dataset.jobRecords;
  return source.slice(0, limit).map((record) => projectSummary(record.job));
}

/** Same role family, different posting — cheap "related roles" without a search call. */
export function listSimilarJobs(job: Job, limit: number): JobSummary[] {
  const matches: JobSummary[] = [];
  for (const record of dataset.jobRecords) {
    if (matches.length >= limit) break;
    if (record.job.id === job.id) continue;
    if (record.job.roleFamily !== job.roleFamily) continue;
    matches.push(projectSummary(record.job));
  }
  return matches;
}

export function listJobsByCompany(companySlug: string, limit: number): JobSummary[] {
  const matches: JobSummary[] = [];
  for (const record of dataset.jobRecords) {
    if (matches.length >= limit) break;
    if (record.job.company.slug !== companySlug) continue;
    matches.push(projectSummary(record.job));
  }
  return matches;
}

function toBucket<T extends string>(value: T, label: string, count: number): FacetBucket<T> {
  return { value, label, count };
}

/**
 * Facet counts are scoped by the free-text and location filters only. Counting
 * within the *same* dimension a user is toggling would zero out every unselected
 * option, which is the behaviour people expect from a job board sidebar.
 */
export function computeJobFacets(query: JobsQuery): JobFacets {
  const scoped = filterRecords({ q: query.q, location: query.location, company: query.company });

  const roles = new Map<RoleFamily, number>();
  const types = new Map<EmploymentType, number>();
  const levels = new Map<ExperienceLevel, number>();
  const modes = new Map<WorkMode, number>();
  const locations = new Map<string, number>();
  const industries = new Map<string, number>();

  for (const { job } of scoped) {
    roles.set(job.roleFamily, (roles.get(job.roleFamily) ?? 0) + 1);
    types.set(job.employmentType, (types.get(job.employmentType) ?? 0) + 1);
    levels.set(job.experienceLevel, (levels.get(job.experienceLevel) ?? 0) + 1);
    modes.set(job.workMode, (modes.get(job.workMode) ?? 0) + 1);
    locations.set(job.location, (locations.get(job.location) ?? 0) + 1);
    industries.set(job.company.industry, (industries.get(job.company.industry) ?? 0) + 1);
  }

  return {
    roles: ROLE_FAMILIES.map((value) => toBucket(value, ROLE_LABELS[value], roles.get(value) ?? 0)),
    types: EMPLOYMENT_TYPES.map((value) =>
      toBucket(value, EMPLOYMENT_TYPE_LABELS[value], types.get(value) ?? 0),
    ),
    levels: EXPERIENCE_LEVELS.map((value) =>
      toBucket(value, EXPERIENCE_LEVEL_LABELS[value], levels.get(value) ?? 0),
    ),
    modes: WORK_MODES.map((value) => toBucket(value, WORK_MODE_LABELS[value], modes.get(value) ?? 0)),
    locations: [...locations.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 12)
      .map(([value, count]) => toBucket(value, value, count)),
    industries: [...industries.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([value, count]) => toBucket(value, value, count)),
    total: scoped.length,
  };
}
