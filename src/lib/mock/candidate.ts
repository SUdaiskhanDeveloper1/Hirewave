import type { Application, CandidateProfile } from '@/types/domain';

/**
 * Demo candidate.
 *
 * There is no auth yet, so the app shows one signed-in candidate. The shape matches
 * what `GET /me/profile` is expected to return, and the applications below reference
 * real job ids from the jobs API so the service can expand them into full records.
 */
export const MOCK_CANDIDATE: CandidateProfile = {
  name: 'Rowan Ellis',
  headline: 'Frontend engineer focused on performance and design systems',
  email: 'rowan.ellis@example.com',
  location: 'Manchester, UK',
  brandHue: 232,
  openToWork: true,
  preferredWorkModes: ['remote', 'hybrid'],
  preferredRoles: ['frontend', 'fullstack'],
  about:
    'Frontend engineer with seven years building customer-facing products, most recently ' +
    'on a design system used by four product teams. I care about the boring parts that ' +
    'users feel: load time, keyboard access, and interfaces that behave predictably. ' +
    'Looking for a senior role on a small team that ships often.',
  experience: [
    {
      id: 'exp_1',
      title: 'Senior Frontend Engineer',
      company: 'Brightline Retail',
      startDate: '2023-02',
      endDate: null,
      location: 'Manchester, UK (hybrid)',
      summary:
        'Own the component library used across checkout, account and storefront. Cut the ' +
        'storefront JavaScript bundle by a third and moved the catalogue to server rendering.',
    },
    {
      id: 'exp_2',
      title: 'Frontend Engineer',
      company: 'Halden Software',
      startDate: '2020-06',
      endDate: '2023-01',
      location: 'Remote',
      summary:
        'Built the reporting interface and the shared charting layer. Introduced visual ' +
        'regression tests that caught layout breaks before release.',
    },
    {
      id: 'exp_3',
      title: 'Junior Web Developer',
      company: 'Northgate Studio',
      startDate: '2019-01',
      endDate: '2020-05',
      location: 'Leeds, UK',
      summary:
        'Delivered marketing sites and internal tools for small business clients, working ' +
        'directly with designers on handover and accessibility review.',
    },
  ],
  education: [
    {
      id: 'edu_1',
      qualification: 'BSc Computer Science',
      institution: 'University of Leeds',
      startYear: 2015,
      endYear: 2018,
    },
  ],
  skills: [
    'TypeScript',
    'React',
    'Next.js',
    'Design Systems',
    'Accessibility',
    'Core Web Vitals',
    'Testing Library',
    'CSS Architecture',
  ],
  resumeFileName: 'rowan-ellis-cv.pdf',
  links: [
    { label: 'Portfolio', url: 'https://rowanellis.example' },
    { label: 'GitHub', url: 'https://github.example/rowanellis' },
  ],
};

/**
 * Application records. `jobId` values are stable ids from the jobs dataset, so the
 * service layer can expand each one into a full job summary in a single request.
 */
export const MOCK_APPLICATIONS: readonly Application[] = [
  {
    id: 'app_c_001',
    jobId: 'job_0004',
    status: 'interview',
    appliedAt: '2026-08-24T09:12:00.000Z',
    updatedAt: '2026-09-04T15:30:00.000Z',
    nextStep: 'Technical interview on 11 September, 2:00pm BST',
  },
  {
    id: 'app_c_002',
    jobId: 'job_0011',
    status: 'under-review',
    appliedAt: '2026-08-29T11:45:00.000Z',
    updatedAt: '2026-09-02T08:05:00.000Z',
    nextStep: 'The hiring team is reviewing your application',
  },
  {
    id: 'app_c_003',
    jobId: 'job_0019',
    status: 'offer',
    appliedAt: '2026-08-02T16:20:00.000Z',
    updatedAt: '2026-09-05T10:00:00.000Z',
    nextStep: 'Offer sent - respond by 15 September',
  },
  {
    id: 'app_c_004',
    jobId: 'job_0027',
    status: 'submitted',
    appliedAt: '2026-09-06T18:02:00.000Z',
    updatedAt: '2026-09-06T18:02:00.000Z',
  },
  {
    id: 'app_c_005',
    jobId: 'job_0033',
    status: 'rejected',
    appliedAt: '2026-07-30T13:15:00.000Z',
    updatedAt: '2026-08-18T09:40:00.000Z',
    nextStep: 'The team moved forward with another candidate',
  },
  {
    id: 'app_c_006',
    jobId: 'job_0042',
    status: 'submitted',
    appliedAt: '2026-09-07T07:55:00.000Z',
    updatedAt: '2026-09-07T07:55:00.000Z',
  },
  {
    id: 'app_c_007',
    jobId: 'job_0055',
    status: 'under-review',
    appliedAt: '2026-08-21T10:30:00.000Z',
    updatedAt: '2026-08-27T14:10:00.000Z',
  },
];
