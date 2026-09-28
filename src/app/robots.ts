import type { MetadataRoute } from 'next';
import { absoluteUrl } from '@/lib/seo';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // The recruiter workspace, personal saved lists and the mock API are of no
        // value to a crawler and would waste crawl budget.
        disallow: ['/recruiter', '/saved', '/api/'],
      },
    ],
    sitemap: absoluteUrl('/sitemap.xml'),
  };
}
