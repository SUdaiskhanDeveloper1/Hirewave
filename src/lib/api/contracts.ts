/**
 * API contracts — request parameters and response envelopes.
 *
 * Mock repository and future backend both satisfy these types, which is what makes
 * the data source swappable. Every list endpoint returns `{ data, meta }` so
 * pagination never has to be inferred from the payload.
 */

import type {
  Applicant,
  ApplicantStage,
  Company,
  EmploymentType,
  ExperienceLevel,
  Job,
  JobSummary,
  RecruiterOverview,
  RoleFamily,
  WorkMode,
} from '@/types/domain';

export interface PageMeta {
  readonly page: number;
  readonly perPage: number;
  readonly total: number;
  readonly totalPages: number;
  readonly hasNextPage: boolean;
  readonly hasPreviousPage: boolean;
}

export interface ApiCollection<T> {
  readonly data: readonly T[];
  readonly meta: PageMeta;
}

export interface ApiResource<T> {
  readonly data: T;
}

export interface ApiErrorBody {
  readonly error: {
    readonly code: string;
    readonly message: string;
  };
}

export const DATE_POSTED_OPTIONS = ['24h', '3d', '7d', '14d', '30d'] as const;
export type DatePosted = (typeof DATE_POSTED_OPTIONS)[number];

/** Days each date-posted option covers, used by the repository and the labels. */
export const DATE_POSTED_DAYS: Record<DatePosted, number> = {
  '24h': 1,
  '3d': 3,
  '7d': 7,
  '14d': 14,
  '30d': 30,
};

export const JOB_SORTS = ['relevance', 'newest', 'salary'] as const;
export type JobSort = (typeof JOB_SORTS)[number];

/**
 * The canonical job search query. It is produced from the URL, used as the React
 * Query cache key, and serialised straight onto the request — one shape, three jobs.
 */
export interface JobsQuery {
  readonly q?: string;
  readonly role?: readonly RoleFamily[];
  readonly type?: readonly EmploymentType[];
  readonly level?: readonly ExperienceLevel[];
  readonly mode?: readonly WorkMode[];
  readonly location?: string;
  readonly company?: string;
  readonly industry?: string;
  readonly salaryMin?: number;
  /** Rolling window on the posting date. */
  readonly posted?: DatePosted;
  readonly sort?: JobSort;
  readonly page?: number;
  readonly perPage?: number;
  /** Fetch a specific set of jobs (used by the saved-jobs view). */
  readonly ids?: readonly string[];
}

export const APPLICANT_SORTS = ['recent', 'match', 'name'] as const;
export type ApplicantSort = (typeof APPLICANT_SORTS)[number];

export interface ApplicantsQuery {
  readonly q?: string;
  readonly stage?: readonly ApplicantStage[];
  readonly jobId?: string;
  readonly sort?: ApplicantSort;
  readonly page?: number;
  readonly perPage?: number;
}

export interface CompaniesQuery {
  readonly q?: string;
  readonly industry?: string;
  readonly page?: number;
  readonly perPage?: number;
}

export interface FacetBucket<TValue extends string = string> {
  readonly value: TValue;
  readonly label: string;
  readonly count: number;
}

/** Filter counts computed server-side so the client never scans the dataset. */
export interface JobFacets {
  readonly roles: readonly FacetBucket<RoleFamily>[];
  readonly types: readonly FacetBucket<EmploymentType>[];
  readonly levels: readonly FacetBucket<ExperienceLevel>[];
  readonly modes: readonly FacetBucket<WorkMode>[];
  readonly locations: readonly FacetBucket[];
  readonly industries: readonly FacetBucket[];
  readonly total: number;
}

export interface SavedJobsPayload {
  readonly jobIds: readonly string[];
}

export type JobsResponse = ApiCollection<JobSummary>;
export type JobResponse = ApiResource<Job>;
export type CompaniesResponse = ApiCollection<Company>;
export type CompanyResponse = ApiResource<Company>;
export type ApplicantsResponse = ApiCollection<Applicant>;
export type FacetsResponse = ApiResource<JobFacets>;
export type OverviewResponse = ApiResource<RecruiterOverview>;
export type SavedJobsResponse = ApiResource<SavedJobsPayload>;

export const DEFAULT_JOBS_PER_PAGE = 12;
export const DEFAULT_APPLICANTS_PER_PAGE = 25;
