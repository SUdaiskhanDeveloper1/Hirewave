import type { MetadataRoute } from 'next';
import { ROLE_FAMILIES, WORK_MODES } from '@/types/domain';
import { absoluteUrl } from '@/lib/seo';
import { getCompanySlugs, getJobSlugs } from '@/lib/server/queries';

/**
 * Generated sitemap covering every crawlable URL: static pages, the indexable facet
 * landing pages, all company profiles and all job postings.
 *
 * Deliberately excludes deep filter combinations and paginated slices, which the
 * indexing policy in `seo-jobs.ts` marks noindex; listing them here would spend crawl
 * budget on pages we have asked Google to ignore.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: absoluteUrl('/'), lastModified: now, changeFrequency: 'daily', priority: 1 },
    { url: absoluteUrl('/jobs'), lastModified: now, changeFrequency: 'hourly', priority: 0.9 },
    { url: absoluteUrl('/companies'), lastModified: now, changeFrequency: 'daily', priority: 0.7 },
  ];

  const facetRoutes: MetadataRoute.Sitemap = [
    ...ROLE_FAMILIES.map((role) => absoluteUrl(`/jobs?role=${role}`)),
    ...WORK_MODES.map((mode) => absoluteUrl(`/jobs?mode=${mode}`)),
  ].map((url) => ({ url, lastModified: now, changeFrequency: 'daily' as const, priority: 0.6 }));

  const companyRoutes: MetadataRoute.Sitemap = (await getCompanySlugs()).map((slug) => ({
    url: absoluteUrl(`/companies/${slug}`),
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.5,
  }));

  const jobRoutes: MetadataRoute.Sitemap = (await getJobSlugs()).map((slug) => ({
    url: absoluteUrl(`/jobs/${slug}`),
    lastModified: now,
    changeFrequency: 'daily',
    priority: 0.8,
  }));

  return [...staticRoutes, ...facetRoutes, ...companyRoutes, ...jobRoutes];
}
