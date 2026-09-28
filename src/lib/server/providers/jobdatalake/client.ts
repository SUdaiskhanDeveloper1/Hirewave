import 'server-only';

/**
 * Transport for the JobDataLake API.
 *
 * The key is read from `JOBDATALAKE_API_KEY` - deliberately without the
 * `NEXT_PUBLIC_` prefix, so Next.js will not inline it into any client bundle. This
 * module imports `server-only`, which turns an accidental import from a Client
 * Component into a build error rather than a leaked credential.
 *
 * Every response is cached by the Next.js data cache. The upstream index changes on
 * the order of hours, not seconds, so a short revalidate window keeps pages fresh
 * while keeping request volume (and the bill) low.
 */

const BASE_URL = 'https://api.jobdatalake.com/v1';

/** Search results move slowly; an hour of caching cuts request volume hard. */
const SEARCH_REVALIDATE_SECONDS = 60 * 60;
/** A single posting changes even less often once published. */
const DETAIL_REVALIDATE_SECONDS = 60 * 60 * 6;

export class JobDataLakeError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'JobDataLakeError';
    this.status = status;
  }
}

export function getApiKey(): string | undefined {
  const key = process.env.JOBDATALAKE_API_KEY?.trim();
  return key ? key : undefined;
}

export function isConfigured(): boolean {
  return getApiKey() !== undefined;
}

interface RequestOptions {
  readonly searchParams?: Record<string, string | number | undefined>;
  readonly revalidate?: number;
}

export async function jdlFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const key = getApiKey();
  if (!key) {
    throw new JobDataLakeError('JOBDATALAKE_API_KEY is not set', 500);
  }

  const url = new URL(`${BASE_URL}${path}`);
  for (const [name, value] of Object.entries(options.searchParams ?? {})) {
    if (value !== undefined && value !== '') url.searchParams.set(name, String(value));
  }

  const response = await fetch(url, {
    headers: { 'X-API-Key': key, accept: 'application/json' },
    next: { revalidate: options.revalidate ?? SEARCH_REVALIDATE_SECONDS },
  });

  if (!response.ok) {
    // Read the body for the upstream message, but never let a parse failure mask the
    // status code the caller needs to react to.
    let detail = '';
    try {
      const body = (await response.json()) as { error?: string };
      detail = body.error ? `: ${body.error}` : '';
    } catch {
      // Non-JSON error body.
    }
    throw new JobDataLakeError(
      `JobDataLake responded ${response.status}${detail}`,
      response.status,
    );
  }

  return (await response.json()) as T;
}

export const REVALIDATE = {
  search: SEARCH_REVALIDATE_SECONDS,
  detail: DETAIL_REVALIDATE_SECONDS,
} as const;
