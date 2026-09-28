import 'server-only';

import { isConfigured } from './jobdatalake/client';
import { jobDataLakeProvider } from './jobdatalake/provider';
import { mockProvider } from './mock-provider';
import type { JobsProvider } from './types';

export type { JobsProvider } from './types';

/**
 * Picks the data source once, at module load.
 *
 * Set `JOBDATALAKE_API_KEY` and the app serves live postings; leave it unset and it
 * serves the generated dataset. Nothing else in the codebase branches on this - the
 * choice is made here and every caller goes through `lib/server/queries.ts`.
 *
 * Defaulting to the mock is deliberate: a checkout with no key still builds, runs and
 * demos offline, and a build cannot quietly spend API credits.
 */
export const jobsProvider: JobsProvider = isConfigured() ? jobDataLakeProvider : mockProvider;

export const isLiveData = jobsProvider.isLive;
