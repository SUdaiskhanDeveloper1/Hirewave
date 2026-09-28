/**
 * Transport for the data API.
 *
 * `NEXT_PUBLIC_API_BASE_URL` points at this app's own route handlers by default.
 * Switching it to a real backend origin is the entire migration story for the
 * client: nothing else in the app constructs a request.
 */

import type { ApiErrorBody } from './contracts';

const DEFAULT_BASE_URL = '/api/v1';

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(message: string, status: number, code = 'unknown_error') {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

function resolveBaseUrl(): string {
  const configured = process.env.NEXT_PUBLIC_API_BASE_URL ?? DEFAULT_BASE_URL;
  if (/^https?:\/\//.test(configured)) return configured.replace(/\/$/, '');

  // A relative base is fine in the browser; on the server fetch needs an origin.
  if (typeof window !== 'undefined') return configured.replace(/\/$/, '');

  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? `http://localhost:${process.env.PORT ?? 3000}`;
  return `${origin.replace(/\/$/, '')}${configured.replace(/\/$/, '')}`;
}

export interface ApiFetchOptions {
  readonly signal?: AbortSignal;
  readonly method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  readonly body?: unknown;
  /**
   * Next.js fetch cache hint. Only meaningful on the server; harmless in the browser
   * where React Query owns caching.
   */
  readonly revalidate?: number | false;
}

export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const { signal, method = 'GET', body, revalidate } = options;

  const response = await fetch(`${resolveBaseUrl()}${path}`, {
    method,
    signal,
    headers: body ? { 'content-type': 'application/json' } : undefined,
    body: body === undefined ? undefined : JSON.stringify(body),
    ...(revalidate === undefined ? {} : { next: { revalidate } }),
  });

  if (!response.ok) {
    // Surface the API's own error code when it sends one; fall back to the status.
    const fallback = `Request failed with status ${response.status}`;
    let message = fallback;
    let code = 'http_error';
    try {
      const parsed = (await response.json()) as Partial<ApiErrorBody>;
      if (parsed.error?.message) message = parsed.error.message;
      if (parsed.error?.code) code = parsed.error.code;
    } catch {
      // Non-JSON error body — keep the fallback message.
    }
    throw new ApiError(message, response.status, code);
  }

  return (await response.json()) as T;
}
