import type { ApplicantsQuery, ApplicantsResponse, PageMeta } from '@/lib/api/contracts';
import { DEFAULT_APPLICANTS_PER_PAGE } from '@/lib/api/contracts';
import type { Applicant } from '@/types/domain';
import { dataset } from '../dataset';

const MAX_PER_PAGE = 100;

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

function compare(sort: ApplicantsQuery['sort']): (a: Applicant, b: Applicant) => number {
  if (sort === 'match') return (a, b) => b.matchScore - a.matchScore;
  if (sort === 'name') return (a, b) => a.name.localeCompare(b.name);
  return () => 0; // 'recent' — dataset is already stored newest-first.
}

/**
 * Paginated on the server by design: the recruiter dashboard must never pull 1,400
 * applicant records into the browser to render 25 rows.
 */
export function queryApplicants(query: ApplicantsQuery): ApplicantsResponse {
  const perPage = Math.min(query.perPage ?? DEFAULT_APPLICANTS_PER_PAGE, MAX_PER_PAGE);
  const term = query.q?.trim().toLowerCase();
  const stages = query.stage && query.stage.length > 0 ? new Set(query.stage) : undefined;

  const filtered: Applicant[] = [];
  for (const applicant of dataset.applicants) {
    if (stages && !stages.has(applicant.stage)) continue;
    if (query.jobId && applicant.jobId !== query.jobId) continue;
    if (term) {
      const haystack = `${applicant.name} ${applicant.email} ${applicant.jobTitle} ${applicant.location}`;
      if (!haystack.toLowerCase().includes(term)) continue;
    }
    filtered.push(applicant);
  }

  const meta = buildMeta(filtered.length, query.page ?? 1, perPage);
  const start = (meta.page - 1) * perPage;
  const sorted = query.sort && query.sort !== 'recent' ? [...filtered].sort(compare(query.sort)) : filtered;

  return { data: sorted.slice(start, start + perPage), meta };
}

export function countApplicantsByStage(): Map<Applicant['stage'], number> {
  const counts = new Map<Applicant['stage'], number>();
  for (const applicant of dataset.applicants) {
    counts.set(applicant.stage, (counts.get(applicant.stage) ?? 0) + 1);
  }
  return counts;
}
