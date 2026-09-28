import 'server-only';

import type {
  Company,
  CompanySummary,
  EmploymentType,
  ExperienceLevel,
  Job,
  JobSummary,
  RoleFamily,
  SalaryRange,
  WorkMode,
} from '@/types/domain';

/* -------------------------------------------------------------------------- *
 * Upstream payload shapes.
 *
 * Everything past the identity fields is optional on purpose: measured against a
 * sample of live software roles, the enrichment fields are present on about 90% of
 * records and salary on about 40%. Treating them as guaranteed would crash on the
 * first sparse posting.
 * -------------------------------------------------------------------------- */

export interface JdlJob {
  readonly id: string;
  readonly title: string;
  readonly job_handle?: string;
  readonly company_name?: string;
  readonly domain_name?: string;
  readonly url?: string;
  readonly posted_at?: number;
  readonly first_seen_at?: number;
  readonly locations?: readonly string[];
  readonly states?: readonly string[];
  readonly countries?: readonly string[];
  readonly remote_type?: string | readonly string[];
  readonly employment_type?: string | readonly string[];
  readonly seniority?: string | readonly string[];
  readonly required_skills?: string | readonly string[];
  readonly job_function?: string | readonly string[];
  readonly salary_min_usd?: number;
  readonly salary_max_usd?: number;
  readonly employee_count?: string;
  readonly funding?: string;
  readonly description?: string;
  readonly company?: JdlCompany;
}

export interface JdlCompany {
  readonly id?: string;
  readonly handle?: string;
  readonly domain?: string;
  readonly name?: string;
  readonly logo_url?: string;
  readonly career_url?: string;
  readonly tagline?: string;
  readonly industry?: string | readonly string[];
  readonly employee_count?: string;
  readonly funding?: string;
  readonly total_jobs?: number;
}

export interface JdlJobsResponse {
  readonly found: number;
  readonly page: number;
  readonly per_page: number;
  readonly jobs: readonly JdlJob[];
}

/* -------------------------------------------------------------------------- *
 * Value mapping
 * -------------------------------------------------------------------------- */

/**
 * The feed is inconsistent about list-shaped fields: `seniority` arrives as
 * `"Staff,Senior"` on some records and `["Staff", "Senior"]` on others, and the same
 * is true of skills and industries. Everything list-like goes through here so one
 * oddly-shaped record cannot take down a render.
 */
function toStringList(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((entry): entry is string => typeof entry === 'string');
  }
  if (typeof value === 'string') {
    return value
      .split(',')
      .map((entry) => entry.trim())
      .filter(Boolean);
  }
  return [];
}

/** First usable value from a field that may be a scalar or a list. */
function toScalar(value: unknown): string | undefined {
  const [first] = toStringList(value);
  return first;
}

const WORK_MODE_BY_REMOTE_TYPE: Record<string, WorkMode> = {
  fully_remote: 'remote',
  remote: 'remote',
  hybrid: 'hybrid',
  on_site: 'onsite',
  onsite: 'onsite',
};

const EMPLOYMENT_TYPE_MAP: Record<string, EmploymentType> = {
  full_time: 'full-time',
  part_time: 'part-time',
  contract: 'contract',
  contractor: 'contract',
  internship: 'internship',
  intern: 'internship',
  temporary: 'contract',
};

/**
 * `seniority` arrives as a comma-separated list ("Staff,Senior", "Principal,Manager").
 * Rank each token and keep the highest, which is how a candidate reads the posting.
 */
const SENIORITY_RANK: readonly (readonly [RegExp, ExperienceLevel, number])[] = [
  [/intern/i, 'junior', 0],
  [/entry|junior|graduate|associate/i, 'junior', 1],
  [/mid/i, 'mid', 2],
  [/senior/i, 'senior', 3],
  [/staff|lead/i, 'lead', 4],
  [/principal|director|head|vp|manager/i, 'principal', 5],
];

/**
 * `job_function` is coarse (most engineering roles are just "eng"), so the title is
 * the better signal for the role family the filters are built around. The function
 * code is the fallback when the title says nothing useful.
 */
const ROLE_BY_TITLE: readonly (readonly [RegExp, RoleFamily])[] = [
  [/front[\s-]?end|react|angular|vue|ui engineer|web developer/i, 'frontend'],
  [/back[\s-]?end|api engineer|golang|\bgo\b|rust|java engineer|\.net/i, 'backend'],
  [/full[\s-]?stack/i, 'fullstack'],
  [/\bios\b|android|mobile|react native|flutter|swift|kotlin/i, 'mobile'],
  [/devops|sre|site reliability|infrastructure|platform engineer|cloud engineer/i, 'devops'],
  [/data|machine learning|\bml\b|analytics|scientist|analyst/i, 'data'],
  [/designer|design system|\bux\b|\bui\/ux\b|product design/i, 'design'],
  [/product manager|product owner|\bpm\b/i, 'product'],
  [/\bqa\b|quality|test engineer|sdet|automation/i, 'qa'],
  [/security|appsec|infosec|penetration/i, 'security'],
];

const ROLE_BY_FUNCTION: Record<string, RoleFamily> = {
  eng: 'backend',
  engineering: 'backend',
  software: 'backend',
  data: 'data',
  design: 'design',
  product: 'product',
  security: 'security',
  qa: 'qa',
  it: 'devops',
};

export function mapWorkMode(job: JdlJob): WorkMode {
  const raw = toScalar(job.remote_type);
  const explicit = raw ? WORK_MODE_BY_REMOTE_TYPE[raw.toLowerCase()] : undefined;
  if (explicit) return explicit;
  // Some feeds only signal remoteness through the location string.
  const location = (job.locations ?? []).join(' ').toLowerCase();
  if (location.includes('remote')) return 'remote';
  if (location.includes('hybrid')) return 'hybrid';
  return 'onsite';
}

export function mapEmploymentType(job: JdlJob): EmploymentType {
  const raw = toScalar(job.employment_type)?.toLowerCase();
  return (raw ? EMPLOYMENT_TYPE_MAP[raw] : undefined) ?? 'full-time';
}

export function mapExperienceLevel(job: JdlJob): ExperienceLevel {
  const tokens = toStringList(job.seniority);

  let best: ExperienceLevel = 'mid';
  let bestRank = -1;
  for (const token of tokens) {
    for (const [pattern, level, rank] of SENIORITY_RANK) {
      if (pattern.test(token) && rank > bestRank) {
        best = level;
        bestRank = rank;
      }
    }
  }
  return best;
}

export function mapRoleFamily(job: JdlJob): RoleFamily {
  for (const [pattern, role] of ROLE_BY_TITLE) {
    if (pattern.test(job.title)) return role;
  }
  const fn = toScalar(job.job_function)?.toLowerCase();
  return (fn ? ROLE_BY_FUNCTION[fn] : undefined) ?? 'backend';
}

/**
 * Upstream salaries are quoted in thousands of USD per year: a principal engineer
 * comes through as `223`-`258`, meaning $223k-$258k. Rendering those raw produced
 * "$223 - $258" on the card, which reads as an hourly rate.
 *
 * The threshold keeps it safe both ways - anything already in whole dollars (a value
 * of 120000 rather than 120) is passed through untouched rather than multiplied into
 * nine figures.
 */
const SALARY_THOUSANDS_CEILING = 1_000;

function toAnnualUsd(value: number): number {
  return value < SALARY_THOUSANDS_CEILING ? Math.round(value * 1_000) : Math.round(value);
}

/** Null unless both ends of the band are published; never a guessed range. */
export function mapSalary(job: JdlJob): SalaryRange | null {
  const min = job.salary_min_usd;
  const max = job.salary_max_usd;
  if (typeof min !== 'number' || typeof max !== 'number' || min <= 0 || max <= 0) return null;

  const low = toAnnualUsd(Math.min(min, max));
  const high = toAnnualUsd(Math.max(min, max));
  return { min: low, max: high, currency: 'USD', period: 'year' };
}

/** "10001+" / "501-1000" -> a single number for the size band label. */
export function parseEmployeeCount(value: string | undefined): number {
  if (!value) return 0;
  const digits = value.match(/\d+/g);
  if (!digits || digits.length === 0) return 0;
  return Number.parseInt(digits[digits.length - 1] as string, 10);
}

/** Stable hue per company so the monogram colour never changes between renders. */
export function hueFromString(value: string): number {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }
  return hash % 360;
}

export function companySlugFromDomain(domain: string): string {
  return domain
    .toLowerCase()
    .replace(/^www\./, '')
    .replace(/\.[a-z.]+$/, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

/**
 * Strips the HTML description into paragraphs.
 *
 * The upstream body is publisher-authored markup. It is never rendered as HTML - the
 * text is extracted and rendered as React children, so a malicious posting cannot
 * inject anything into the page.
 */
export function htmlToParagraphs(html: string | undefined, limit = 12): string[] {
  if (!html) return [];

  return html
    .replace(/<\s*(br|\/p|\/h[1-6]|\/li|\/div)\s*>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&#39;|&rsquo;/gi, "'")
    .replace(/&quot;|&ldquo;|&rdquo;/gi, '"')
    .split('\n')
    .map((line) => line.replace(/\s+/g, ' ').trim())
    .filter((line) => line.length > 2)
    .slice(0, limit);
}

/* -------------------------------------------------------------------------- *
 * Entity mapping
 * -------------------------------------------------------------------------- */

function toCompanySummary(job: JdlJob): CompanySummary {
  const domain = job.domain_name ?? job.company?.domain ?? '';
  const name = job.company_name ?? job.company?.name ?? domain ?? 'Unknown company';
  const industries = toStringList(job.company?.industry);

  return {
    id: domain || job.id,
    slug: domain ? companySlugFromDomain(domain) : 'unknown',
    name,
    brandHue: hueFromString(domain || name),
    industry: industries[0] ?? 'Technology',
    headquarters: job.locations?.[0] ?? 'Not specified',
    employeeCount: parseEmployeeCount(job.employee_count ?? job.company?.employee_count),
  };
}

export function toJobSummary(job: JdlJob): JobSummary {
  const skills = toStringList(job.required_skills).slice(0, 6);
  const company = toCompanySummary(job);
  const postedAt = new Date(job.posted_at ?? job.first_seen_at ?? Date.now()).toISOString();

  return {
    id: job.id,
    slug: job.job_handle ?? job.id,
    title: job.title,
    company,
    location: job.locations?.[0] ?? 'Not specified',
    workMode: mapWorkMode(job),
    employmentType: mapEmploymentType(job),
    experienceLevel: mapExperienceLevel(job),
    roleFamily: mapRoleFamily(job),
    salary: mapSalary(job),
    postedAt,
    // The upstream feed has no editorial "featured" concept, and inventing one would
    // be a fake badge on a real posting.
    isFeatured: false,
    tags: skills,
    excerpt:
      htmlToParagraphs(job.description, 1)[0]?.slice(0, 180) ??
      `${job.title} at ${company.name}, ${job.locations?.[0] ?? 'location not specified'}.`,
  };
}

export function toJob(job: JdlJob): Job {
  const summary = toJobSummary(job);
  const paragraphs = htmlToParagraphs(job.description);

  return {
    ...summary,
    description:
      paragraphs.length > 0
        ? paragraphs
        : [`${summary.title} at ${summary.company.name}. Full description on the employer site.`],
    // The feed publishes one prose body rather than structured lists, so these stay
    // empty and their sections are hidden instead of being padded with invented copy.
    responsibilities: [],
    requirements: [],
    preferredQualifications: [],
    benefits: [],
    applicantCount: 0,
    expiresAt: new Date(new Date(summary.postedAt).getTime() + 45 * 86_400_000).toISOString(),
    hiringManager: '',
    applyUrl: job.url ?? '',
  };
}

export function toCompany(company: JdlCompany, openRoles = 0): Company {
  const domain = company.domain ?? '';
  const name = company.name ?? domain;

  return {
    id: company.id ?? domain,
    slug: company.handle ?? companySlugFromDomain(domain),
    name,
    brandHue: hueFromString(domain || name),
    industry: toStringList(company.industry)[0] ?? 'Technology',
    headquarters: 'Not specified',
    employeeCount: parseEmployeeCount(company.employee_count),
    tagline: company.tagline ?? '',
    description: company.tagline ?? `${name} is hiring on JobDataLake.`,
    website: company.career_url ?? (domain ? `https://${domain}` : ''),
    foundedYear: 0,
    coverImageUrl: '',
    benefits: [],
    openRoles: company.total_jobs ?? openRoles,
    rating: 0,
  };
}
