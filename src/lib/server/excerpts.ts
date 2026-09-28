import type { RoleFamily } from '@/types/domain';
import { pick } from './seed';

/**
 * What each kind of role actually works on.
 *
 * Used to give every posting a specific first line. A single template repeated across
 * a results page reads as filler, which is the fastest way to make a real product look
 * generated - so the summary names the team's actual concern instead.
 */
export const ROLE_FOCUS: Record<RoleFamily, readonly string[]> = {
  frontend: [
    'the checkout and account flows',
    'a component library used by four product teams',
    'the public marketing and search pages',
    'an internal tool used by the support team every day',
  ],
  backend: [
    'the billing and entitlements services',
    'the public API and its rate limiting',
    'a data ingestion pipeline handling millions of events a day',
    'the search and indexing layer',
  ],
  fullstack: [
    'a new self-serve onboarding flow, end to end',
    'the reporting area, from schema to chart',
    'integrations with the three systems customers ask for most',
    'the admin console the operations team lives in',
  ],
  mobile: [
    'the iOS app and its offline sync',
    'the Android rewrite now underway',
    'push notifications and deep linking across both platforms',
    'the shared React Native codebase',
  ],
  devops: [
    'the migration off self-managed Kubernetes',
    'build and release pipelines used by six teams',
    'observability, from instrumentation to on-call runbooks',
    'infrastructure as code across three regions',
  ],
  data: [
    'the warehouse models the whole company reports from',
    'a feature store backing two production models',
    'the event pipeline and its schema contracts',
    'forecasting used by the commercial team',
  ],
  design: [
    'the design system and its documentation',
    'the end-to-end applicant experience',
    'research with customers, turned into shipped changes',
    'a redesign of the core product surface',
  ],
  product: [
    'the activation and retention roadmap',
    'a platform area with three engineering teams',
    'pricing and packaging, working closely with sales',
    'the mobile product line',
  ],
  qa: [
    'the automated suite that gates every release',
    'test strategy across web and mobile',
    'performance and load testing before peak season',
    'release engineering and rollback tooling',
  ],
  security: [
    'application security review and threat modelling',
    'the detection and response tooling',
    'cloud posture across three environments',
    'the security work behind an upcoming certification',
  ],
};

interface ExcerptInput {
  readonly company: string;
  readonly industry: string;
  readonly skills: readonly string[];
  readonly teamSize: number;
  readonly focus: string;
  readonly random: () => number;
}

/**
 * Builds the one-line summary shown on a job card. Six sentence shapes, each drawing
 * on different facts, so a page of twelve cards does not read as one sentence twelve
 * times.
 */
export function buildExcerpt({
  company,
  industry,
  skills,
  teamSize,
  focus,
  random,
}: ExcerptInput): string {
  const primary = skills[0] ?? 'the stack';
  const secondary = skills[1] ?? primary;

  const templates: readonly string[] = [
    `You would own ${focus}, working with ${teamSize} other engineers.`,
    `${company} is hiring for ${focus}. Mostly ${primary} and ${secondary}.`,
    `Join a team of ${teamSize} and take on ${focus}.`,
    `This role is focused on ${focus}, in ${industry}.`,
    `Work on ${focus} alongside product and design, shipping weekly.`,
    `${primary} and ${secondary}, applied to ${focus}.`,
  ];

  return pick(templates, random);
}
