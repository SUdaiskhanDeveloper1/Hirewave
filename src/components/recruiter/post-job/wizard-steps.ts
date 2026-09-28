import type { JobDraftInput } from '@/lib/api/employer';

export type StepId =
  | 'information'
  | 'description'
  | 'requirements'
  | 'compensation'
  | 'location'
  | 'application'
  | 'preview'
  | 'publish';

export interface StepDefinition {
  readonly id: StepId;
  readonly title: string;
  readonly hint: string;
}

export const WIZARD_STEPS: readonly StepDefinition[] = [
  { id: 'information', title: 'Job information', hint: 'Title, seniority and contract type' },
  { id: 'description', title: 'Description', hint: 'What the role is and who it reports to' },
  { id: 'requirements', title: 'Requirements', hint: 'Responsibilities and what you need' },
  { id: 'compensation', title: 'Compensation', hint: 'Salary band and benefits' },
  { id: 'location', title: 'Location', hint: 'Where the work happens' },
  { id: 'application', title: 'Application settings', hint: 'How candidates reach you' },
  { id: 'preview', title: 'Preview', hint: 'Exactly what candidates will see' },
  { id: 'publish', title: 'Publish', hint: 'Save the posting' },
];

export const EMPTY_DRAFT: JobDraftInput = {
  title: '',
  location: '',
  employmentType: 'full-time',
  workMode: 'remote',
  experienceLevel: 'mid',
  salaryMin: '',
  salaryMax: '',
  description: '',
  responsibilities: '',
  requirements: '',
  benefits: '',
  applyEmail: '',
};

export type DraftErrors = Partial<Record<keyof JobDraftInput, string>>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * Validation per step.
 *
 * Each step only reports on its own fields, so moving forward is blocked by what is
 * on screen rather than by a problem three steps away that the user cannot see.
 */
export function validateStep(step: StepId, draft: JobDraftInput): DraftErrors {
  const errors: DraftErrors = {};

  if (step === 'information') {
    if (draft.title.trim().length < 3) {
      errors.title = 'Enter the job title candidates will search for.';
    } else if (draft.title.trim().length > 90) {
      errors.title = 'Keep the title under 90 characters.';
    }
  }

  if (step === 'description') {
    if (draft.description.trim().length < 80) {
      errors.description = 'Write at least a couple of sentences about the role.';
    }
  }

  if (step === 'requirements') {
    if (draft.responsibilities.trim().length === 0) {
      errors.responsibilities = 'List at least one responsibility, one per line.';
    }
    if (draft.requirements.trim().length === 0) {
      errors.requirements = 'List at least one requirement, one per line.';
    }
  }

  if (step === 'compensation') {
    const min = Number(draft.salaryMin);
    const max = Number(draft.salaryMax);

    if (!draft.salaryMin || !Number.isFinite(min) || min <= 0) {
      errors.salaryMin = 'Enter the bottom of the band.';
    }
    if (!draft.salaryMax || !Number.isFinite(max) || max <= 0) {
      errors.salaryMax = 'Enter the top of the band.';
    }
    if (!errors.salaryMin && !errors.salaryMax && max < min) {
      errors.salaryMax = 'The top of the band cannot be below the bottom.';
    }
  }

  if (step === 'location') {
    if (draft.location.trim().length === 0) {
      errors.location = 'Add a city, region or "Remote".';
    }
  }

  if (step === 'application') {
    if (!EMAIL_PATTERN.test(draft.applyEmail.trim())) {
      errors.applyEmail = 'Enter the address applications should go to.';
    }
  }

  return errors;
}

/** Splits a textarea into list items, dropping blank lines. */
export function toLines(value: string): string[] {
  return value
    .split('\n')
    .map((line) => line.replace(/^[-*]\s*/, '').trim())
    .filter((line) => line.length > 0);
}
