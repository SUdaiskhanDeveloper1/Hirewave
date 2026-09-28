import type { EmployerJob } from '@/types/domain';

/**
 * Postings owned by the demo employer account.
 *
 * `jobId` values reference the jobs API, so the service expands published rows into
 * full summaries. Drafts have no published posting yet and carry a working title
 * instead - which is exactly how the real endpoint will need to behave.
 */
export const MOCK_EMPLOYER_JOBS: readonly EmployerJob[] = [
  {
    id: 'post_001',
    jobId: 'job_0003',
    status: 'active',
    views: 2840,
    applicantCount: 64,
    newApplicantCount: 9,
    updatedAt: '2026-09-06T09:00:00.000Z',
  },
  {
    id: 'post_002',
    jobId: 'job_0027',
    status: 'active',
    views: 1910,
    applicantCount: 41,
    newApplicantCount: 4,
    updatedAt: '2026-09-05T14:20:00.000Z',
  },
  {
    id: 'post_003',
    jobId: 'job_0051',
    status: 'active',
    views: 3620,
    applicantCount: 88,
    newApplicantCount: 12,
    updatedAt: '2026-09-07T08:45:00.000Z',
  },
  {
    id: 'post_004',
    jobId: 'job_0075',
    status: 'active',
    views: 760,
    applicantCount: 17,
    newApplicantCount: 0,
    updatedAt: '2026-09-01T11:10:00.000Z',
  },
  {
    id: 'post_005',
    jobId: '',
    status: 'draft',
    draftTitle: 'Staff Backend Engineer, Payments',
    views: 0,
    applicantCount: 0,
    newApplicantCount: 0,
    updatedAt: '2026-09-08T16:30:00.000Z',
  },
  {
    id: 'post_006',
    jobId: '',
    status: 'draft',
    draftTitle: 'Engineering Manager, Platform',
    views: 0,
    applicantCount: 0,
    newApplicantCount: 0,
    updatedAt: '2026-09-03T12:05:00.000Z',
  },
  {
    id: 'post_007',
    jobId: 'job_0110',
    status: 'closed',
    views: 4180,
    applicantCount: 132,
    newApplicantCount: 0,
    updatedAt: '2026-08-14T17:00:00.000Z',
  },
  {
    id: 'post_008',
    jobId: 'job_0132',
    status: 'closed',
    views: 2210,
    applicantCount: 57,
    newApplicantCount: 0,
    updatedAt: '2026-07-29T10:25:00.000Z',
  },
];
