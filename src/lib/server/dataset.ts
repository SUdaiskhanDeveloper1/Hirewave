/**
 * In-memory mock dataset. Built once per server process and never mutated during a
 * request, so repository reads are pure array/Map lookups.
 *
 * Replace this module (and the repositories that read it) with real persistence;
 * nothing above the repository layer knows it exists.
 */

import type {
  Applicant,
  ApplicantStage,
  Company,
  CompanySummary,
  EmploymentType,
  ExperienceLevel,
  Job,
  RoleFamily,
  WorkMode,
} from '@/types/domain';
import { APPLICANT_STAGES, EMPLOYMENT_TYPES, EXPERIENCE_LEVELS, WORK_MODES } from '@/types/domain';
import { buildExcerpt, ROLE_FOCUS } from './excerpts';
import { createRandom, intBetween, pick, pickN, slugify } from './seed';

/**
 * Fixed reference point for all generated dates. Keeping it a constant (rather than
 * `Date.now()`) means statically generated pages stay byte-identical between builds.
 */
export const DATASET_EPOCH = Date.UTC(2026, 8, 8);
const DAY_MS = 86_400_000;

/** Search-optimised record. The blob is precomputed so filtering never re-serialises. */
export interface JobRecord {
  readonly job: Job;
  readonly blob: string;
  readonly postedAtMs: number;
  readonly views: number;
}

interface CompanySeed {
  readonly name: string;
  readonly industry: string;
  readonly headquarters: string;
  readonly tagline: string;
}

const COMPANY_SEEDS: readonly CompanySeed[] = [
  { name: 'Northwind Labs', industry: 'Developer Tools', headquarters: 'Austin, TX', tagline: 'Infrastructure primitives for product teams.' },
  { name: 'Lumen Health', industry: 'Health Tech', headquarters: 'Boston, MA', tagline: 'Clinical software that clinicians actually like.' },
  { name: 'Cobalt Freight', industry: 'Logistics', headquarters: 'Rotterdam, NL', tagline: 'Moving containers with fewer emails.' },
  { name: 'Fernwood Studio', industry: 'Design Software', headquarters: 'Portland, OR', tagline: 'Creative tools for small studios.' },
  { name: 'Kestrel Pay', industry: 'Fintech', headquarters: 'London, UK', tagline: 'Payments for marketplaces at any scale.' },
  { name: 'Atlas Grid', industry: 'Energy', headquarters: 'Copenhagen, DK', tagline: 'Software for the electrified grid.' },
  { name: 'Verdigris AI', industry: 'Machine Learning', headquarters: 'Berlin, DE', tagline: 'Applied models for industrial data.' },
  { name: 'Harbour and Co', industry: 'E-commerce', headquarters: 'Toronto, ON', tagline: 'Retail commerce without the platform tax.' },
  { name: 'Sable Security', industry: 'Cyber Security', headquarters: 'Tel Aviv, IL', tagline: 'Detection engineering as a product.' },
  { name: 'Pinecrest Learn', industry: 'Education', headquarters: 'Remote', tagline: 'Curriculum tooling for public schools.' },
  { name: 'Orbital Works', industry: 'Aerospace', headquarters: 'Seattle, WA', tagline: 'Ground systems for small satellites.' },
  { name: 'Tidewater Data', industry: 'Data Platform', headquarters: 'Amsterdam, NL', tagline: 'Warehouses that stay queryable.' },
  { name: 'Juniper Bank', industry: 'Banking', headquarters: 'New York, NY', tagline: 'A bank built on an API.' },
  { name: 'Marlowe Media', industry: 'Media', headquarters: 'Los Angeles, CA', tagline: 'Streaming infrastructure for publishers.' },
  { name: 'Quarry Robotics', industry: 'Robotics', headquarters: 'Pittsburgh, PA', tagline: 'Autonomy for heavy industry.' },
  { name: 'Bellwether HR', industry: 'HR Tech', headquarters: 'Chicago, IL', tagline: 'People operations without spreadsheets.' },
  { name: 'Solstice Travel', industry: 'Travel', headquarters: 'Barcelona, ES', tagline: 'Booking rails for independent agencies.' },
  { name: 'Ironvine Legal', industry: 'Legal Tech', headquarters: 'Remote', tagline: 'Contract review that cites its sources.' },
  { name: 'Cedarline Foods', industry: 'Food and Beverage', headquarters: 'Melbourne, AU', tagline: 'Supply chain software for growers.' },
  { name: 'Halcyon Games', industry: 'Gaming', headquarters: 'Montreal, QC', tagline: 'Live-service backends for indie studios.' },
  { name: 'Perigee Maps', industry: 'Geospatial', headquarters: 'Zurich, CH', tagline: 'Vector tiles at planetary scale.' },
  { name: 'Rowan Insurance', industry: 'Insurance', headquarters: 'Dublin, IE', tagline: 'Underwriting, continuously deployed.' },
  { name: 'Meridian Cloud', industry: 'Cloud Infrastructure', headquarters: 'Singapore, SG', tagline: 'Regional cloud for regulated workloads.' },
  { name: 'Wisteria Retail', industry: 'Retail', headquarters: 'Manchester, UK', tagline: 'Store operations, unified.' },
];

const ROLE_TITLES: Record<RoleFamily, readonly string[]> = {
  frontend: ['Frontend Engineer', 'React Engineer', 'Web Performance Engineer', 'UI Engineer'],
  backend: ['Backend Engineer', 'API Engineer', 'Platform Engineer', 'Go Engineer'],
  fullstack: ['Full Stack Engineer', 'Product Engineer', 'Founding Engineer'],
  mobile: ['iOS Engineer', 'Android Engineer', 'React Native Engineer'],
  devops: ['Site Reliability Engineer', 'DevOps Engineer', 'Infrastructure Engineer'],
  data: ['Data Engineer', 'Analytics Engineer', 'Machine Learning Engineer'],
  design: ['Product Designer', 'Design Systems Designer', 'UX Researcher'],
  product: ['Product Manager', 'Technical Product Manager', 'Group Product Manager'],
  qa: ['QA Engineer', 'Test Automation Engineer', 'Release Engineer'],
  security: ['Security Engineer', 'Application Security Engineer', 'Detection Engineer'],
};

const ROLE_SKILLS: Record<RoleFamily, readonly string[]> = {
  frontend: ['TypeScript', 'React', 'Next.js', 'CSS Architecture', 'Core Web Vitals', 'Accessibility'],
  backend: ['Go', 'PostgreSQL', 'gRPC', 'Event Streaming', 'Distributed Systems', 'Node.js'],
  fullstack: ['TypeScript', 'React', 'PostgreSQL', 'REST APIs', 'Prisma', 'Testing'],
  mobile: ['Swift', 'Kotlin', 'React Native', 'Offline Sync', 'App Store Release'],
  devops: ['Kubernetes', 'Terraform', 'Observability', 'CI/CD', 'AWS', 'Incident Response'],
  data: ['Python', 'dbt', 'Airflow', 'Snowflake', 'Spark', 'Feature Stores'],
  design: ['Figma', 'Design Systems', 'Prototyping', 'User Research', 'Motion'],
  product: ['Discovery', 'Roadmapping', 'Analytics', 'Experimentation', 'Stakeholder Comms'],
  qa: ['Playwright', 'Test Strategy', 'CI Pipelines', 'Load Testing'],
  security: ['Threat Modelling', 'SIEM', 'Cryptography', 'Cloud Security', 'Pen Testing'],
};

const REMOTE_LOCATIONS: readonly string[] = ['Remote - Global', 'Remote - US', 'Remote - EU'];

const CITIES: readonly string[] = [
  'London, UK',
  'Berlin, DE',
  'Austin, TX',
  'New York, NY',
  'San Francisco, CA',
  'Toronto, ON',
  'Amsterdam, NL',
  'Lisbon, PT',
  'Singapore, SG',
  'Sydney, AU',
  'Dublin, IE',
  'Warsaw, PL',
  'Bengaluru, IN',
];

const PERKS: readonly string[] = [
  'Four-day summer weeks',
  'Home office budget',
  'Private healthcare',
  'Equity from day one',
  'Learning stipend',
  '32 days paid leave',
  'Quarterly team offsites',
  'Parental leave top-up',
  'Commuter allowance',
  'Wellness budget',
];

const FIRST_NAMES: readonly string[] = [
  'Amara', 'Theo', 'Priya', 'Mateo', 'Nour', 'Elin', 'Kwame', 'Sora', 'Iris', 'Dmitri',
  'Lena', 'Rafael', 'Zainab', 'Oskar', 'Mei', 'Caleb', 'Yara', 'Finn', 'Aditi', 'Bruno',
  'Sasha', 'Noor', 'Emeka', 'Clara', 'Hugo', 'Anaya', 'Jonas', 'Leila', 'Tomas', 'Rin',
];

const LAST_NAMES: readonly string[] = [
  'Okafor', 'Lindqvist', 'Nakamura', 'Duarte', 'Haddad', 'Kowalski', 'Mensah', 'Rossi',
  'Fitzgerald', 'Volkov', 'Bergstrom', 'Silva', 'Osei', 'Novak', 'Chen', 'Aguilar',
  'Bakker', 'Moreau', 'Iyer', 'Costa', 'Petrov', 'Larsen', 'Bianchi', 'Ferreira',
];

const SALARY_BY_LEVEL: Record<ExperienceLevel, readonly [number, number]> = {
  junior: [58_000, 82_000],
  mid: [90_000, 125_000],
  senior: [130_000, 175_000],
  lead: [165_000, 205_000],
  principal: [195_000, 250_000],
};

const YEARS_BY_LEVEL: Record<ExperienceLevel, string> = {
  junior: '1+',
  mid: '3+',
  senior: '5+',
  lead: '7+',
  principal: '10+',
};

/** Stage distribution weights - most applicants sit early in the funnel. */
const STAGE_WEIGHTS: readonly (readonly [ApplicantStage, number])[] = [
  ['applied', 44],
  ['screening', 22],
  ['interview', 15],
  ['offer', 6],
  ['hired', 5],
  ['rejected', 8],
];

function weightedStage(random: () => number): ApplicantStage {
  const total = STAGE_WEIGHTS.reduce((sum, entry) => sum + entry[1], 0);
  let threshold = random() * total;
  for (const [stage, weight] of STAGE_WEIGHTS) {
    threshold -= weight;
    if (threshold <= 0) return stage;
  }
  return APPLICANT_STAGES[0];
}

function buildCompanies(random: () => number): Company[] {
  return COMPANY_SEEDS.map((seed, index) => {
    const slug = slugify(seed.name);
    return {
      id: `cmp_${(index + 1).toString().padStart(3, '0')}`,
      slug,
      name: seed.name,
      brandHue: (index * 47) % 360,
      industry: seed.industry,
      headquarters: seed.headquarters,
      employeeCount: intBetween(1, 60, random) * 45,
      tagline: seed.tagline,
      description:
        `${seed.name} builds ${seed.industry.toLowerCase()} products used by teams in more than ` +
        `${intBetween(8, 60, random)} countries. The engineering group is deliberately small, ships to ` +
        `production several times a day, and treats performance and accessibility as product ` +
        `requirements rather than clean-up work.`,
      website: `https://www.${slug}.example`,
      foundedYear: intBetween(2008, 2022, random),
      // Remote, on-demand optimised imagery: never fetched at build time.
      coverImageUrl: `https://picsum.photos/seed/${slug}/1280/440`,
      benefits: pickN(PERKS, 5, random),
      openRoles: 0,
      rating: Math.round((3.6 + random() * 1.3) * 10) / 10,
    } satisfies Company;
  });
}

function toSummary(company: Company): CompanySummary {
  return {
    id: company.id,
    slug: company.slug,
    name: company.name,
    brandHue: company.brandHue,
    industry: company.industry,
    headquarters: company.headquarters,
    employeeCount: company.employeeCount,
  };
}

function buildJobs(companies: readonly Company[], random: () => number): JobRecord[] {
  const roleFamilies = Object.keys(ROLE_TITLES) as RoleFamily[];
  const records: JobRecord[] = [];
  const usedSlugs = new Set<string>();
  const total = 186;

  for (let index = 0; index < total; index += 1) {
    const company = companies[index % companies.length] as Company;
    const roleFamily = pick(roleFamilies, random);
    const baseTitle = pick(ROLE_TITLES[roleFamily], random);
    const level = pick(EXPERIENCE_LEVELS, random);
    const employmentType: EmploymentType =
      random() < 0.78 ? 'full-time' : pick(EMPLOYMENT_TYPES, random);
    const workMode: WorkMode = random() < 0.42 ? 'remote' : pick(WORK_MODES, random);
    const location = workMode === 'remote' ? pick(REMOTE_LOCATIONS, random) : pick(CITIES, random);
    const levelPrefix = level === 'mid' ? '' : `${level.charAt(0).toUpperCase()}${level.slice(1)} `;
    const title = `${levelPrefix}${baseTitle}`.trim();

    let slug = slugify(`${title}-at-${company.name}`);
    if (usedSlugs.has(slug)) slug = `${slug}-${index}`;
    usedSlugs.add(slug);

    const [salaryFloor, salaryCeiling] = SALARY_BY_LEVEL[level];
    const min = Math.round((salaryFloor + random() * 12_000) / 1000) * 1000;
    const max = Math.round((salaryCeiling + random() * 18_000) / 1000) * 1000;
    const daysAgo = intBetween(0, 44, random);
    const postedAtMs = DATASET_EPOCH - daysAgo * DAY_MS;
    const skills = pickN(ROLE_SKILLS[roleFamily], 4, random);
    const workModeSentence =
      workMode === 'onsite' ? `based in ${location}` : `${workMode} from ${location}`;

    const job: Job = {
      id: `job_${(index + 1).toString().padStart(4, '0')}`,
      slug,
      title,
      company: toSummary(company),
      location,
      workMode,
      employmentType,
      experienceLevel: level,
      roleFamily,
      salary: { min, max, currency: 'USD', period: 'year' },
      postedAt: new Date(postedAtMs).toISOString(),
      isFeatured: random() < 0.14,
      tags: skills,
      excerpt: buildExcerpt({
        company: company.name,
        industry: company.industry,
        skills,
        teamSize: intBetween(4, 14, random),
        focus: pick(ROLE_FOCUS[roleFamily], random),
        random,
      }),
      description: [
        `${company.name} is hiring a ${title} to work on ${company.tagline.toLowerCase().replace(/\.$/, '')}. ` +
          `The team owns its roadmap, its on-call rotation and its performance budget.`,
        `This is a ${employmentType.replace('-', ' ')} role, ${workModeSentence}. We review work in small ` +
          `pull requests, keep CI under ten minutes and ship behind feature flags.`,
      ],
      responsibilities: [
        `Design, build and operate ${roleFamily} systems behind customer-facing products.`,
        'Set and defend measurable quality budgets: latency, error rate, bundle size.',
        'Review the work of peers and leave the codebase simpler than you found it.',
        'Partner with product and design from discovery through to release.',
      ],
      requirements: [
        `${YEARS_BY_LEVEL[level]} years building and operating production software.`,
        `Strong working knowledge of ${skills.slice(0, 2).join(' and ')}.`,
        'Comfortable owning a feature end to end, including its instrumentation.',
        'Clear written communication: this team defaults to async.',
      ],
      preferredQualifications: [
        `Hands-on experience with ${skills[2] ?? skills[0]} on a team of similar size.`,
        'Have shipped and then maintained something with real users on it.',
        'Comfortable giving and receiving direct feedback in code review.',
        `Interest in the ${company.industry.toLowerCase()} domain, or a willingness to learn it.`,
      ],
      benefits: pickN(PERKS, 4, random),
      applicantCount: intBetween(3, 240, random),
      expiresAt: new Date(postedAtMs + 45 * DAY_MS).toISOString(),
      hiringManager: `${pick(FIRST_NAMES, random)} ${pick(LAST_NAMES, random)}`,
      applyUrl: `https://www.${company.slug}.example/careers/${slug}`,
    };

    records.push({
      job,
      // Lowercased once at startup; every keyword search is then a substring test.
      blob: [title, company.name, location, roleFamily, level, employmentType, workMode, ...skills]
        .join(' ')
        .toLowerCase(),
      postedAtMs,
      views: intBetween(120, 9_800, random),
    });
  }

  return records.sort((a, b) => b.postedAtMs - a.postedAtMs);
}

function buildApplicants(records: readonly JobRecord[], random: () => number): Applicant[] {
  const applicants: Applicant[] = [];
  const total = 1_420;

  for (let index = 0; index < total; index += 1) {
    const record = records[Math.floor(random() * records.length)] as JobRecord;
    const first = pick(FIRST_NAMES, random);
    const last = pick(LAST_NAMES, random);
    const daysAgo = intBetween(0, 30, random);

    applicants.push({
      id: `app_${(index + 1).toString().padStart(5, '0')}`,
      name: `${first} ${last}`,
      email: `${first.toLowerCase()}.${last.toLowerCase()}@example.com`,
      brandHue: (index * 29) % 360,
      jobId: record.job.id,
      jobSlug: record.job.slug,
      jobTitle: record.job.title,
      stage: weightedStage(random),
      // Time-of-day is added, not subtracted: subtracting would push every
      // "zero days ago" application into the previous day and leave the most
      // recent day of the trend chart permanently empty.
      appliedAt: new Date(
        DATASET_EPOCH - daysAgo * DAY_MS + intBetween(0, 82_000, random) * 1000,
      ).toISOString(),
      experienceYears: intBetween(1, 16, random),
      location: pick([...REMOTE_LOCATIONS, ...CITIES], random),
      matchScore: intBetween(41, 99, random),
      skills: pickN(ROLE_SKILLS[record.job.roleFamily], 3, random),
    });
  }

  return applicants.sort((a, b) => (a.appliedAt < b.appliedAt ? 1 : -1));
}

export interface Dataset {
  readonly companies: readonly Company[];
  readonly companyBySlug: ReadonlyMap<string, Company>;
  readonly jobRecords: readonly JobRecord[];
  readonly jobBySlug: ReadonlyMap<string, JobRecord>;
  readonly jobById: ReadonlyMap<string, JobRecord>;
  readonly applicants: readonly Applicant[];
}

function build(): Dataset {
  const random = createRandom(20260908);
  const companies = buildCompanies(random);
  const jobRecords = buildJobs(companies, random);
  const applicants = buildApplicants(jobRecords, random);

  const openRolesByCompany = new Map<string, number>();
  for (const record of jobRecords) {
    const companyId = record.job.company.id;
    openRolesByCompany.set(companyId, (openRolesByCompany.get(companyId) ?? 0) + 1);
  }

  const hydratedCompanies = companies.map((company) => ({
    ...company,
    openRoles: openRolesByCompany.get(company.id) ?? 0,
  }));

  return {
    companies: hydratedCompanies,
    companyBySlug: new Map(hydratedCompanies.map((company) => [company.slug, company])),
    jobRecords,
    jobBySlug: new Map(jobRecords.map((record) => [record.job.slug, record])),
    jobById: new Map(jobRecords.map((record) => [record.job.id, record])),
    applicants,
  };
}

/**
 * Module-level singleton: generated on first import, reused for the lifetime of the
 * process, so no request ever pays dataset construction cost.
 */
export const dataset: Dataset = build();
