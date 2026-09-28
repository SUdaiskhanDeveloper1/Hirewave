/** Shared transport concerns for the mock API route handlers. */

import 'server-only';
import type { ApiErrorBody } from '@/lib/api/contracts';

/**
 * Optional artificial latency so skeletons and pending states can be exercised
 * locally. Defaults to 0 — performance measurements must not be distorted.
 */
const MOCK_LATENCY_MS = Number.parseInt(process.env.MOCK_LATENCY_MS ?? '0', 10) || 0;

export async function mockLatency(): Promise<void> {
  if (MOCK_LATENCY_MS <= 0) return;
  await new Promise((resolve) => setTimeout(resolve, MOCK_LATENCY_MS));
}

export interface JsonResponseOptions {
  /** Shared-cache lifetime in seconds. 0 disables caching for the response. */
  readonly cacheSeconds?: number;
  readonly staleWhileRevalidateSeconds?: number;
}

/**
 * The generic rejects a Promise at the type level. Data access became async when the
 * live provider landed, and a forgotten `await` here would otherwise have silently
 * serialised `{}` to every caller instead of failing.
 */
export function jsonResponse<T>(
  payload: T extends Promise<unknown> ? never : T,
  options: JsonResponseOptions = {},
): Response {
  const { cacheSeconds = 60, staleWhileRevalidateSeconds = 300 } = options;

  return Response.json(payload, {
    headers: {
      // A CDN can serve these for a minute and refresh in the background, so a
      // burst of identical searches costs one origin hit.
      'cache-control':
        cacheSeconds > 0
          ? `public, s-maxage=${cacheSeconds}, stale-while-revalidate=${staleWhileRevalidateSeconds}`
          : 'no-store',
    },
  });
}

export function apiError(status: number, code: string, message: string): Response {
  const body: ApiErrorBody = { error: { code, message } };
  return Response.json(body, { status, headers: { 'cache-control': 'no-store' } });
}
