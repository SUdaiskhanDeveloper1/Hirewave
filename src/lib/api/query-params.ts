/**
 * Bidirectional translation between URLs and the typed query objects.
 *
 * This module is the hinge of the whole search feature: the same `JobsQuery` is
 * parsed from the address bar, used as the React Query cache key, and serialised
 * onto the API request. Because it is dependency-free it is safe on both sides of
 * the client boundary.
 *
 * Multi-value filters use a compact comma-separated form so shared links stay short:
 *   /jobs?q=react&role=frontend,fullstack&mode=remote&page=2
 */

import type { ApplicantsQuery, ApplicantSort, DatePosted, JobSort, JobsQuery } from './contracts';
import { APPLICANT_SORTS, DATE_POSTED_OPTIONS, JOB_SORTS } from './contracts';
import type {
  ApplicantStage,
  EmploymentType,
  ExperienceLevel,
  RoleFamily,
  WorkMode,
} from '@/types/domain';
import {
  APPLICANT_STAGES,
  EMPLOYMENT_TYPES,
  EXPERIENCE_LEVELS,
  ROLE_FAMILIES,
  WORK_MODES,
} from '@/types/domain';

/** Shape Next.js hands to a page as `searchParams`. */
export type RawSearchParams = Record<string, string | string[] | undefined>;

export type SearchParamsInput = URLSearchParams | RawSearchParams;

function readParam(input: SearchParamsInput, key: string): string | undefined {
  if (input instanceof URLSearchParams) return input.get(key) ?? undefined;
  const value = input[key];
  if (Array.isArray(value)) return value[0];
  return value;
}

/**
 * Parses a comma-separated list and drops anything not in the allowed set, so a
 * hand-edited URL can never reach the data layer with an invalid filter value.
 */
function readEnumList<T extends string>(
  input: SearchParamsInput,
  key: string,
  allowed: readonly T[],
): T[] | undefined {
  const raw = readParam(input, key);
  if (!raw) return undefined;
  const allowedSet = new Set<string>(allowed);
  const values = raw
    .split(',')
    .map((value) => value.trim().toLowerCase())
    .filter((value) => allowedSet.has(value)) as T[];
  return values.length > 0 ? [...new Set(values)] : undefined;
}

function readPositiveInt(input: SearchParamsInput, key: string): number | undefined {
  const raw = readParam(input, key);
  if (!raw) return undefined;
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
}

function readTrimmed(input: SearchParamsInput, key: string, maxLength = 120): string | undefined {
  const raw = readParam(input, key)?.trim();
  if (!raw) return undefined;
  return raw.slice(0, maxLength);
}

function readEnum<T extends string>(
  input: SearchParamsInput,
  key: string,
  allowed: readonly T[],
): T | undefined {
  const raw = readParam(input, key)?.toLowerCase();
  return raw && (allowed as readonly string[]).includes(raw) ? (raw as T) : undefined;
}

/** Drops undefined keys and sorts array members: two equivalent URLs produce one cache key. */
export function normalizeJobsQuery(query: JobsQuery): JobsQuery {
  const normalized: Record<string, unknown> = {};
  const assign = (key: keyof JobsQuery, value: unknown): void => {
    if (value === undefined) return;
    if (Array.isArray(value) && value.length === 0) return;
    normalized[key] = Array.isArray(value) ? [...value].sort() : value;
  };

  assign('q', query.q?.trim() || undefined);
  assign('role', query.role);
  assign('type', query.type);
  assign('level', query.level);
  assign('mode', query.mode);
  assign('location', query.location);
  assign('company', query.company);
  assign('industry', query.industry);
  assign('salaryMin', query.salaryMin);
  assign('posted', query.posted);
  assign('sort', query.sort && query.sort !== 'relevance' ? query.sort : undefined);
  assign('page', query.page && query.page > 1 ? query.page : undefined);
  assign('perPage', query.perPage);
  assign('ids', query.ids);

  return normalized as JobsQuery;
}

export function parseJobsQuery(input: SearchParamsInput): JobsQuery {
  return normalizeJobsQuery({
    q: readTrimmed(input, 'q'),
    role: readEnumList<RoleFamily>(input, 'role', ROLE_FAMILIES),
    type: readEnumList<EmploymentType>(input, 'type', EMPLOYMENT_TYPES),
    level: readEnumList<ExperienceLevel>(input, 'level', EXPERIENCE_LEVELS),
    mode: readEnumList<WorkMode>(input, 'mode', WORK_MODES),
    location: readTrimmed(input, 'location'),
    company: readTrimmed(input, 'company', 80),
    industry: readTrimmed(input, 'industry', 60),
    salaryMin: readPositiveInt(input, 'salaryMin'),
    posted: readEnum<DatePosted>(input, 'posted', DATE_POSTED_OPTIONS),
    sort: readEnum<JobSort>(input, 'sort', JOB_SORTS),
    page: readPositiveInt(input, 'page'),
    perPage: readPositiveInt(input, 'perPage'),
    ids: readTrimmed(input, 'ids', 2_000)?.split(',').filter(Boolean),
  });
}

export function jobsQueryToSearchParams(query: JobsQuery): URLSearchParams {
  const normalized = normalizeJobsQuery(query);
  const params = new URLSearchParams();

  if (normalized.q) params.set('q', normalized.q);
  if (normalized.role) params.set('role', normalized.role.join(','));
  if (normalized.type) params.set('type', normalized.type.join(','));
  if (normalized.level) params.set('level', normalized.level.join(','));
  if (normalized.mode) params.set('mode', normalized.mode.join(','));
  if (normalized.location) params.set('location', normalized.location);
  if (normalized.company) params.set('company', normalized.company);
  if (normalized.industry) params.set('industry', normalized.industry);
  if (normalized.salaryMin) params.set('salaryMin', String(normalized.salaryMin));
  if (normalized.posted) params.set('posted', normalized.posted);
  if (normalized.sort) params.set('sort', normalized.sort);
  if (normalized.page) params.set('page', String(normalized.page));
  if (normalized.perPage) params.set('perPage', String(normalized.perPage));
  if (normalized.ids) params.set('ids', normalized.ids.join(','));

  return params;
}

/** `/jobs?...` href for a query — used by links, filter writes and canonical URLs. */
export function jobsHref(query: JobsQuery, pathname = '/jobs'): string {
  const params = jobsQueryToSearchParams(query).toString();
  return params ? `${pathname}?${params}` : pathname;
}

export function normalizeApplicantsQuery(query: ApplicantsQuery): ApplicantsQuery {
  const normalized: Record<string, unknown> = {};
  if (query.q?.trim()) normalized.q = query.q.trim();
  if (query.stage && query.stage.length > 0) normalized.stage = [...query.stage].sort();
  if (query.jobId) normalized.jobId = query.jobId;
  if (query.sort && query.sort !== 'recent') normalized.sort = query.sort;
  if (query.page && query.page > 1) normalized.page = query.page;
  if (query.perPage) normalized.perPage = query.perPage;
  return normalized as ApplicantsQuery;
}

export function parseApplicantsQuery(input: SearchParamsInput): ApplicantsQuery {
  return normalizeApplicantsQuery({
    q: readTrimmed(input, 'q'),
    stage: readEnumList<ApplicantStage>(input, 'stage', APPLICANT_STAGES),
    jobId: readTrimmed(input, 'jobId', 40),
    sort: readEnum<ApplicantSort>(input, 'sort', APPLICANT_SORTS),
    page: readPositiveInt(input, 'page'),
    perPage: readPositiveInt(input, 'perPage'),
  });
}

export function applicantsQueryToSearchParams(query: ApplicantsQuery): URLSearchParams {
  const normalized = normalizeApplicantsQuery(query);
  const params = new URLSearchParams();
  if (normalized.q) params.set('q', normalized.q);
  if (normalized.stage) params.set('stage', normalized.stage.join(','));
  if (normalized.jobId) params.set('jobId', normalized.jobId);
  if (normalized.sort) params.set('sort', normalized.sort);
  if (normalized.page) params.set('page', String(normalized.page));
  if (normalized.perPage) params.set('perPage', String(normalized.perPage));
  return params;
}

/** True when no filter is active — lets the UI hide "clear all" and skip empty states. */
export function isEmptyJobsQuery(query: JobsQuery): boolean {
  const normalized = normalizeJobsQuery(query);
  const keys = Object.keys(normalized).filter((key) => key !== 'page' && key !== 'perPage');
  return keys.length === 0;
}

export function countActiveJobFilters(query: JobsQuery): number {
  return (
    (query.role?.length ?? 0) +
    (query.type?.length ?? 0) +
    (query.level?.length ?? 0) +
    (query.mode?.length ?? 0) +
    (query.location ? 1 : 0) +
    (query.industry ? 1 : 0) +
    (query.posted ? 1 : 0) +
    (query.salaryMin ? 1 : 0)
  );
}
