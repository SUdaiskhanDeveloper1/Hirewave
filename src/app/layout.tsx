import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { JsonLd } from '@/components/shared/JsonLd';
import { SiteFooter } from '@/components/shared/SiteFooter';
import { SiteHeader } from '@/components/shared/SiteHeader';
import { WebVitals } from '@/components/shared/WebVitals';
import { ToastProvider } from '@/components/ui/Toast';
import { QueryProvider } from '@/providers/query-provider';
import { SITE_NAME, SITE_TAGLINE, SITE_URL, absoluteUrl } from '@/lib/seo';
import { THEME_INIT_SCRIPT } from '@/lib/theme';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} - ${SITE_TAGLINE}`,
    // Every page supplies only its own name; the suffix is applied once, here.
    template: `%s | ${SITE_NAME}`,
  },
  description:
    'Search engineering, product and design jobs. Filter by role, location, salary and work arrangement, then apply directly from the posting.',
  applicationName: SITE_NAME,
  alternates: { canonical: SITE_URL },
  openGraph: {
    type: 'website',
    siteName: SITE_NAME,
    url: SITE_URL,
    title: `${SITE_NAME} - ${SITE_TAGLINE}`,
  },
  robots: { index: true, follow: true },
  // app/favicon.ico is picked up by the file convention and covers tabs and legacy
  // probes. This adds the same artwork at 128px for browsers that prefer a
  // higher-resolution icon.
  icons: {
    icon: [
      { url: '/logo.webp', sizes: '128x128', type: 'image/webp' },
    ],
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  // Matches the header background in each scheme so the browser chrome never flashes.
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fbfbfd' },
    { media: '(prefers-color-scheme: dark)', color: '#111318' },
  ],
};

const ORGANIZATION_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: SITE_NAME,
  url: SITE_URL,
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${absoluteUrl('/jobs')}?q={search_term_string}`,
    },
    'query-input': 'required name=search_term_string',
  },
};

export default function RootLayout({ children }: { readonly children: ReactNode }) {
  return (
    // Browser extensions (e.g. QuillBot's `data-qb-installed`) and the theme script below
    // set attributes on <html> before React hydrates; this silences that attribute-only
    // mismatch on this element.
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="min-h-dvh antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-lg focus:bg-raised focus:px-4 focus:py-2 focus:text-sm focus:ring-2 focus:ring-brand-600"
        >
          Skip to content
        </a>

        {/*
          QueryProvider is the app's only client-side wrapper. The header, footer and
          every page shell below stay Server Components; only the leaves that need
          interactivity ship JavaScript.
        */}
        <QueryProvider>
          <ToastProvider>
            <SiteHeader />
            <main id="main">{children}</main>
            <SiteFooter />
          </ToastProvider>
        </QueryProvider>

        <JsonLd data={ORGANIZATION_JSON_LD} />
        {process.env.NODE_ENV === 'development' ? <WebVitals /> : null}
      </body>
    </html>
  );
}
