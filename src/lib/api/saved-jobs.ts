/**
 * Saved-jobs adapter.
 *
 * Today it is backed by `localStorage`; the future backend will expose
 * `GET/POST/DELETE /me/saved-jobs`. The signatures and the response envelope already
 * match that contract, so swapping the three bodies below for `apiFetch` calls is the
 * whole change — the hooks, the optimistic updates and the UI stay exactly as they are.
 */

import type { SavedJobsResponse } from './contracts';

const STORAGE_KEY = 'hirewave:saved-jobs:v1';
const MAX_SAVED = 500;

function read(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === 'string') : [];
  } catch {
    // Private mode, disabled storage, or corrupt JSON: behave like an empty list.
    return [];
  }
}

function write(jobIds: readonly string[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(jobIds.slice(0, MAX_SAVED)));
  } catch {
    // Quota or permission failure — the optimistic cache update still stands for
    // this session, and the mutation resolves rather than rolling back.
  }
}

export const savedJobsApi = {
  list: async (): Promise<SavedJobsResponse> => ({ data: { jobIds: read() } }),

  add: async (jobId: string): Promise<SavedJobsResponse> => {
    const next = [jobId, ...read().filter((id) => id !== jobId)];
    write(next);
    return { data: { jobIds: next } };
  },

  remove: async (jobId: string): Promise<SavedJobsResponse> => {
    const next = read().filter((id) => id !== jobId);
    write(next);
    return { data: { jobIds: next } };
  },
};
