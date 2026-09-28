/**
 * Domain model. These shapes are the contract between the data layer and the UI;
 * they intentionally describe *business* entities, not the mock data source, so the
 * mock repository can be replaced by a real backend without touching a component.
 */

export const EMPLOYMENT_TYPES = ['full-time', 'part-time', 'contract', 'internship'] as const;
export type EmploymentType = (typeof EMPLOYMENT_TYPES)[number];

export const EXPERIENCE_LEVELS = ['junior', 'mid', 'senior', 'lead', 'principal'] as const;
export type ExperienceLevel = (typeof EXPERIENCE_LEVELS)[number];

export const WORK_MODES = ['remote', 'hybrid', 'onsite'] as const;
export type WorkMode = (typeof WORK_MODES)[number];

export const ROLE_FAMILIES = [
  'frontend',
  'backend',
  'fullstack',
  'mobile',
  'devops',
  'data',
  'design',
  'product',
  'qa',
  'security',
] as const;
export type RoleFamily = (typeof ROLE_FAMILIES)[number];

export const APPLICANT_STAGES = [
  'applied',
  'screening',
  'interview',
  'offer',
  'hired',
  'rejected',
] as const;
export type ApplicantStage = (typeof APPLICANT_STAGES)[number];

export interface SalaryRange {
  readonly min: number;
  readonly max: number;
  readonly currency: 'USD';
  readonly period: 'year';
}

/** Denormalised company fields embedded in job payloads — avoids an N+1 fetch in the UI. */
export interface CompanySummary {
  readonly id: string;
  readonly slug: string;
  readonly name: string;
  /** Deterministic brand hue used to render a zero-request monogram avatar. */
  readonly brandHue: number;
  readonly industry: string;
  readonly headquarters: string;
  readonly employeeCount: number;
}

export interface Company extends CompanySummary {
  readonly tagline: string;
  readonly description: string;
  readonly website: string;
  readonly foundedYear: number;
  readonly coverImageUrl: string;
  readonly benefits: readonly string[];
  readonly openRoles: number;
  readonly rating: number;
}

/** The list-view projection of a job. Deliberately small: it is what the feed ships. */
export interface JobSummary {
  readonly id: string;
  readonly slug: string;
  readonly title: string;
  readonly company: CompanySummary;
  readonly location: string;
  readonly workMode: WorkMode;
  readonly employmentType: EmploymentType;
  readonly experienceLevel: ExperienceLevel;
  readonly roleFamily: RoleFamily;
  /**
   * Absent on a large share of real postings - roughly 60% of the live feed does not
   * publish pay - so this is nullable and the UI says so rather than inventing a range.
   */
  readonly salary: SalaryRange | null;
  readonly postedAt: string;
  readonly isFeatured: boolean;
  readonly tags: readonly string[];
  readonly excerpt: string;
}

export interface Job extends JobSummary {
  readonly description: readonly string[];
  readonly responsibilities: readonly string[];
  readonly requirements: readonly string[];
  readonly preferredQualifications: readonly string[];
  readonly benefits: readonly string[];
  readonly applicantCount: number;
  readonly expiresAt: string;
  readonly hiringManager: string;
  readonly applyUrl: string;
}

export interface Applicant {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly brandHue: number;
  readonly jobId: string;
  readonly jobSlug: string;
  readonly jobTitle: string;
  readonly stage: ApplicantStage;
  readonly appliedAt: string;
  readonly experienceYears: number;
  readonly location: string;
  /** 0-100 fit score produced by the (future) matching service. */
  readonly matchScore: number;
  readonly skills: readonly string[];
}

export interface RecruiterMetrics {
  readonly activeJobs: number;
  readonly totalApplicants: number;
  readonly inInterview: number;
  readonly hiredThisQuarter: number;
  readonly avgTimeToHireDays: number;
  readonly offerAcceptanceRate: number;
  /** Percentage change vs. the previous period, for trend indicators. */
  readonly deltas: {
    readonly activeJobs: number;
    readonly totalApplicants: number;
    readonly inInterview: number;
    readonly hiredThisQuarter: number;
  };
}

export interface FunnelStage {
  readonly stage: ApplicantStage;
  readonly count: number;
}

export interface TrendPoint {
  /** ISO date (day precision). */
  readonly date: string;
  readonly applications: number;
  readonly interviews: number;
}

export interface JobPerformance {
  readonly jobId: string;
  readonly slug: string;
  readonly title: string;
  readonly views: number;
  readonly applicants: number;
  readonly conversionRate: number;
}

export interface RecruiterOverview {
  readonly metrics: RecruiterMetrics;
  readonly funnel: readonly FunnelStage[];
  readonly trend: readonly TrendPoint[];
  readonly topJobs: readonly JobPerformance[];
}

/* ------------------------------------------------------------------------- *
 * Candidate-side entities
 *
 * These describe the areas the backend has not built yet. They are modelled the
 * same way as the job entities above, so the service functions behind them can be
 * repointed at real endpoints without touching a component.
 * ------------------------------------------------------------------------- */

export const APPLICATION_STATUSES = [
  'submitted',
  'under-review',
  'interview',
  'offer',
  'rejected',
] as const;
export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export interface Application {
  readonly id: string;
  readonly jobId: string;
  readonly status: ApplicationStatus;
  readonly appliedAt: string;
  readonly updatedAt: string;
  /** What the candidate is waiting on, when there is something concrete to show. */
  readonly nextStep?: string;
  /** Expanded job summary, joined by the service so the UI needs one call. */
  readonly job?: JobSummary;
}

export interface ExperienceEntry {
  readonly id: string;
  readonly title: string;
  readonly company: string;
  readonly startDate: string;
  readonly endDate: string | null;
  readonly location: string;
  readonly summary: string;
}

export interface EducationEntry {
  readonly id: string;
  readonly qualification: string;
  readonly institution: string;
  readonly startYear: number;
  readonly endYear: number;
}

export interface ProfileLink {
  readonly label: string;
  readonly url: string;
}

export interface CandidateProfile {
  readonly name: string;
  readonly headline: string;
  readonly email: string;
  readonly location: string;
  readonly about: string;
  readonly brandHue: number;
  readonly openToWork: boolean;
  readonly preferredWorkModes: readonly WorkMode[];
  /** Role families the candidate wants, used to build their recommendations. */
  readonly preferredRoles: readonly RoleFamily[];
  readonly experience: readonly ExperienceEntry[];
  readonly education: readonly EducationEntry[];
  readonly skills: readonly string[];
  readonly resumeFileName: string | null;
  readonly links: readonly ProfileLink[];
}

/* ------------------------------------------------------------------------- *
 * Employer-side entities
 * ------------------------------------------------------------------------- */

export const JOB_POST_STATUSES = ['active', 'draft', 'closed'] as const;
export type JobPostStatus = (typeof JOB_POST_STATUSES)[number];

export interface EmployerJob {
  readonly id: string;
  readonly jobId: string;
  readonly status: JobPostStatus;
  readonly views: number;
  readonly applicantCount: number;
  readonly newApplicantCount: number;
  readonly updatedAt: string;
  /** Expanded job summary, joined by the service. Absent for drafts. */
  readonly job?: JobSummary;
  /** Drafts have no published posting yet, so they carry their own working title. */
  readonly draftTitle?: string;
}

/** Top-level browse category. Maps onto one or more role families for search links. */
export interface JobCategory {
  readonly slug: string;
  readonly name: string;
  readonly description: string;
  /** Name of an entry in the app icon set. */
  readonly icon: string;
  readonly roleFamilies: readonly RoleFamily[];
}
