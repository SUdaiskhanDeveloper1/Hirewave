import type { Metadata } from 'next';

export const SITE_NAME = 'HireWave';
export const SITE_TAGLINE = 'Engineering, product and design roles';

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
).replace(/\/$/, '');

export function absoluteUrl(path: string): string {
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

interface PageMetadataInput {
  readonly title: string;
  readonly description: string;
  /** Path used for both the canonical URL and Open Graph URL. */
  readonly path: string;
  readonly noIndex?: boolean;
  readonly type?: 'website' | 'article';
  readonly publishedTime?: string;
}

/**
 * One helper builds every page's metadata, so canonical URLs, Open Graph and Twitter
 * cards cannot drift apart between routes.
 */
export function buildMetadata({
  title,
  description,
  path,
  noIndex = false,
  type = 'website',
  publishedTime,
}: PageMetadataInput): Metadata {
  const url = absoluteUrl(path);

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      type,
      ...(publishedTime ? { publishedTime } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    ...(noIndex ? { robots: { index: false, follow: true } } : {}),
  };
}
