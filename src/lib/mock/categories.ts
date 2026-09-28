import type { JobCategory } from '@/types/domain';

/**
 * Browse categories.
 *
 * Each one maps to the role families the search API already understands, so a
 * category tile is just a pre-built search rather than a separate data concept.
 */
export const JOB_CATEGORIES: readonly JobCategory[] = [
  {
    slug: 'engineering',
    icon: 'code',
    name: 'Engineering',
    description: 'Frontend, backend, mobile and platform roles',
    roleFamilies: ['frontend', 'backend', 'fullstack', 'mobile'],
  },
  {
    slug: 'design',
    icon: 'sparkle',
    name: 'Design',
    description: 'Product design, design systems and research',
    roleFamilies: ['design'],
  },
  {
    slug: 'data',
    icon: 'trending',
    name: 'Data',
    description: 'Analytics, data engineering and machine learning',
    roleFamilies: ['data'],
  },
  {
    slug: 'product',
    icon: 'star',
    name: 'Product',
    description: 'Product management and technical product roles',
    roleFamilies: ['product'],
  },
  {
    slug: 'infrastructure',
    icon: 'globe',
    name: 'Infrastructure',
    description: 'DevOps, SRE and cloud platform work',
    roleFamilies: ['devops'],
  },
  {
    slug: 'security',
    icon: 'shield',
    name: 'Security',
    description: 'Application security and detection engineering',
    roleFamilies: ['security'],
  },
  {
    slug: 'quality',
    icon: 'eye',
    name: 'Quality',
    description: 'Test automation and release engineering',
    roleFamilies: ['qa'],
  },
  {
    slug: 'all-roles',
    icon: 'search',
    name: 'All roles',
    description: 'Browse every open position on the board',
    roleFamilies: [],
  },
];

/** Search terms people actually type, surfaced as one-click links on the homepage. */
export const POPULAR_SEARCHES: readonly string[] = [
  'Frontend Engineer',
  'Product Manager',
  'Data Engineer',
  'Product Designer',
  'Site Reliability Engineer',
  'React',
  'TypeScript',
  'Kubernetes',
];
