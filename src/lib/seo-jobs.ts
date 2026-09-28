import type { JobsQuery } from '@/lib/api/contracts';
import {
  EMPLOYMENT_TYPE_LABELS,
  EXPERIENCE_LEVEL_LABELS,
  ROLE_LABELS,
  WORK_MODE_LABELS,
} from '@/lib/labels';

/**
 * Turns a filter combination into a title and description a search engine can use.
 *
 * Facet pages are real landing pages ("Remote frontend jobs"), so they deserve
 * distinct copy rather than one shared title with a query string appended.
 */
export function describeJobsQuery(query: JobsQuery, total: number): {
  readonly title: string;
  readonly description: string;
  readonly heading: string;
} {
  const parts: string[] = [];

  const mode = query.mode?.length === 1 ? query.mode[0] : undefined;
  if (mode) parts.push(WORK_MODE_LABELS[mode]);

  const level = query.level?.length === 1 ? query.level[0] : undefined;
  if (level) parts.push(EXPERIENCE_LEVEL_LABELS[level]);

  const role = query.role?.length === 1 ? query.role[0] : undefined;
  if (role) parts.push(ROLE_LABELS[role]);

  const type = query.type?.length === 1 ? query.type[0] : undefined;

  const subject = parts.length > 0 ? `${parts.join(' ')} jobs` : 'Jobs';
  const qualified = type ? `${subject} (${EMPLOYMENT_TYPE_LABELS[type]})` : subject;
  const located = query.location ? `${qualified} in ${query.location}` : qualified;

  // The unfiltered heading describes the catalogue rather than saying nothing.
  const isUnfiltered = located === 'Jobs' && !query.q;
  const heading = isUnfiltered
    ? 'Engineering, product and design jobs'
    : query.q
      ? `${located} matching "${query.q}"`
      : located;

  return {
    title: query.q ? `${query.q} jobs` : located,
    description:
      `Browse ${total} ${located.toLowerCase()} on HireWave. Filter by role, seniority, ` +
      `salary and work mode, with every result server-rendered and shareable by URL.`,
    heading,
  };
}

/**
 * Indexing policy for facet pages.
 *
 * One filter dimension on page one is a genuine landing page and gets indexed.
 * Deeper combinations and paginated slices are near-duplicates of each other, so they
 * are followed but not indexed, with the canonical pointing at the indexable parent.
 * This is what keeps a job board out of crawl-budget trouble.
 */
export function jobsIndexingPolicy(query: JobsQuery): {
  readonly noIndex: boolean;
  readonly canonicalPath: string;
} {
  const dimensions = [
    query.role?.length ?? 0,
    query.type?.length ?? 0,
    query.level?.length ?? 0,
    query.mode?.length ?? 0,
    query.location ? 1 : 0,
    query.salaryMin ? 1 : 0,
  ];

  const activeDimensions = dimensions.filter((count) => count > 0).length;
  const totalSelections = dimensions.reduce((sum, count) => sum + count, 0);
  const isPaginated = (query.page ?? 1) > 1;
  const isSimpleFacet = activeDimensions <= 1 && totalSelections <= 1 && !query.q;

  if (isSimpleFacet && !isPaginated) {
    return { noIndex: false, canonicalPath: canonicalFacetPath(query) };
  }

  return { noIndex: true, canonicalPath: isSimpleFacet ? canonicalFacetPath(query) : '/jobs' };
}

function canonicalFacetPath(query: JobsQuery): string {
  if (query.role?.length === 1) return `/jobs?role=${query.role[0]}`;
  if (query.mode?.length === 1) return `/jobs?mode=${query.mode[0]}`;
  if (query.level?.length === 1) return `/jobs?level=${query.level[0]}`;
  if (query.type?.length === 1) return `/jobs?type=${query.type[0]}`;
  if (query.location) return `/jobs?location=${encodeURIComponent(query.location)}`;
  return '/jobs';
}
