import type { CompaniesQuery, CompaniesResponse, PageMeta } from '@/lib/api/contracts';
import type { Company } from '@/types/domain';
import { dataset } from '../dataset';

const DEFAULT_PER_PAGE = 12;

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

export function queryCompanies(query: CompaniesQuery): CompaniesResponse {
  const perPage = Math.min(query.perPage ?? DEFAULT_PER_PAGE, 48);
  const term = query.q?.trim().toLowerCase();

  const filtered = dataset.companies.filter((company) => {
    if (query.industry && company.industry !== query.industry) return false;
    if (!term) return true;
    return (
      company.name.toLowerCase().includes(term) ||
      company.industry.toLowerCase().includes(term) ||
      company.headquarters.toLowerCase().includes(term)
    );
  });

  const meta = buildMeta(filtered.length, query.page ?? 1, perPage);
  const start = (meta.page - 1) * perPage;

  return {
    data: [...filtered]
      .sort((a, b) => b.openRoles - a.openRoles)
      .slice(start, start + perPage),
    meta,
  };
}

export function findCompanyBySlug(slug: string): Company | null {
  return dataset.companyBySlug.get(slug) ?? null;
}

export function listCompanySlugs(): string[] {
  return dataset.companies.map((company) => company.slug);
}

export function listIndustries(): string[] {
  return [...new Set(dataset.companies.map((company) => company.industry))].sort();
}

/** Small, ordered slice used by the homepage trust strip. */
export function listTopCompanies(limit: number): Company[] {
  return [...dataset.companies].sort((a, b) => b.openRoles - a.openRoles).slice(0, limit);
}
