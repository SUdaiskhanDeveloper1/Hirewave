import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,

  // Ship less JS: strip console calls (except errors) from production bundles.
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? { exclude: ['error'] } : false,
  },

  images: {
    // Modern formats only; AVIF first, WebP fallback.
    formats: ['image/avif', 'image/webp'],
    // Explicit, small set of widths -> fewer variants to generate + better CDN hit rate.
    deviceSizes: [420, 640, 828, 1080, 1440, 1920],
    imageSizes: [40, 64, 96, 128, 256],
    minimumCacheTTL: 60 * 60 * 24 * 30,
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'picsum.photos' },
    ],
  },

  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ];
  },
};

export default nextConfig;
