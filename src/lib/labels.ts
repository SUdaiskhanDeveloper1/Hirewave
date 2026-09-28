/**
 * Human-readable labels for domain enums.
 *
 * Deliberately dependency-free so both server repositories and client components can
 * import it — pulling these out of the repository is what keeps the mock dataset from
 * being traced into the client bundle.
 */

import type {
  ApplicantStage,
  EmploymentType,
  ExperienceLevel,
  RoleFamily,
  WorkMode,
} from '@/types/domain';

export const ROLE_LABELS: Record<RoleFamily, string> = {
  frontend: 'Frontend',
  backend: 'Backend',
  fullstack: 'Full Stack',
  mobile: 'Mobile',
  devops: 'DevOps / SRE',
  data: 'Data & ML',
  design: 'Design',
  product: 'Product',
  qa: 'QA',
  security: 'Security',
};

export const EMPLOYMENT_TYPE_LABELS: Record<EmploymentType, string> = {
  'full-time': 'Full-time',
  'part-time': 'Part-time',
  contract: 'Contract',
  internship: 'Internship',
};

export const EXPERIENCE_LEVEL_LABELS: Record<ExperienceLevel, string> = {
  junior: 'Junior',
  mid: 'Mid-level',
  senior: 'Senior',
  lead: 'Lead',
  principal: 'Principal',
};

export const WORK_MODE_LABELS: Record<WorkMode, string> = {
  remote: 'Remote',
  hybrid: 'Hybrid',
  onsite: 'On-site',
};

export const APPLICANT_STAGE_LABELS: Record<ApplicantStage, string> = {
  applied: 'Applied',
  screening: 'Screening',
  interview: 'Interview',
  offer: 'Offer',
  hired: 'Hired',
  rejected: 'Declined',
};

import type { StatusTone } from '@/components/ui/StatusBadge';

/**
 * Stage to semantic tone. Kept next to the labels so a new stage cannot be added
 * with a label but no colour.
 */
export const APPLICANT_STAGE_TONE: Record<ApplicantStage, StatusTone> = {
  applied: 'neutral',
  screening: 'info',
  interview: 'info',
  offer: 'warning',
  hired: 'success',
  rejected: 'danger',
};
