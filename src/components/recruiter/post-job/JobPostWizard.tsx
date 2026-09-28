'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Alert } from '@/components/ui/Alert';
import { Button, ButtonLink } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Field } from '@/components/ui/Field';
import { Icon } from '@/components/ui/Icon';
import { Input, Textarea } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { useToast } from '@/components/ui/Toast';
import { useSaveJobDraft } from '@/hooks/use-employer-jobs';
import type { JobDraftInput } from '@/lib/api/employer';
import {
  EMPLOYMENT_TYPE_LABELS,
  EXPERIENCE_LEVEL_LABELS,
  WORK_MODE_LABELS,
} from '@/lib/labels';
import { cn } from '@/lib/utils/cn';
import { EMPLOYMENT_TYPES, EXPERIENCE_LEVELS, WORK_MODES } from '@/types/domain';
import { JobPostPreview } from './JobPostPreview';
import type { DraftErrors, StepId } from './wizard-steps';
import { EMPTY_DRAFT, WIZARD_STEPS, validateStep } from './wizard-steps';

/**
 * Multi-step job posting form.
 *
 * Each step validates only its own fields, so the Next button is blocked by something
 * visible rather than by a problem several screens back. Nothing is lost moving
 * between steps - the draft is one state object and steps only change which slice of
 * it is on screen.
 *
 * Publishing belongs to the backend, so the final step saves a draft (which works)
 * and says plainly what publishing will do once the API exists, rather than offering
 * a button that silently does nothing.
 */
export function JobPostWizard() {
  const router = useRouter();
  const { notify } = useToast();
  const { mutate: saveDraft, isPending, isSuccess } = useSaveJobDraft();

  const [stepIndex, setStepIndex] = useState(0);
  const [draft, setDraft] = useState<JobDraftInput>(EMPTY_DRAFT);
  const [errors, setErrors] = useState<DraftErrors>({});

  const step = WIZARD_STEPS[stepIndex] as (typeof WIZARD_STEPS)[number];
  const isLastStep = stepIndex === WIZARD_STEPS.length - 1;

  function update<K extends keyof JobDraftInput>(field: K, value: JobDraftInput[K]): void {
    setDraft((current) => ({ ...current, [field]: value }));
    // Clear a field's error as soon as it is touched; re-checked on the next advance.
    if (errors[field]) setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function goNext(): void {
    const found = validateStep(step.id, draft);
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    setStepIndex((index) => Math.min(index + 1, WIZARD_STEPS.length - 1));
  }

  function goBack(): void {
    setErrors({});
    setStepIndex((index) => Math.max(index - 1, 0));
  }

  /** Re-runs every step's validation before the final save. */
  function handleSaveDraft(): void {
    const allErrors = WIZARD_STEPS.reduce<DraftErrors>(
      (acc, definition) => ({ ...acc, ...validateStep(definition.id, draft) }),
      {},
    );

    if (Object.keys(allErrors).length > 0) {
      setErrors(allErrors);
      const firstBrokenStep = WIZARD_STEPS.findIndex(
        (definition) => Object.keys(validateStep(definition.id, draft)).length > 0,
      );
      setStepIndex(firstBrokenStep === -1 ? 0 : firstBrokenStep);
      notify('Some details still need attention', 'error');
      return;
    }

    saveDraft(draft, {
      onSuccess: () => {
        notify('Draft saved');
        router.push('/recruiter/jobs');
      },
      onError: () => notify('Could not save the draft. Please try again.', 'error'),
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[15rem_minmax(0,1fr)] lg:items-start">
      {/* Step rail. Doubles as progress: completed steps are clickable to go back. */}
      {/* min-w-0: a grid child defaults to min-width:auto, which would let the step
          rail expand to its content width instead of scrolling inside itself. */}
      <nav aria-label="Posting steps" className="min-w-0 lg:sticky lg:top-20">
        <ol className="flex gap-2 overflow-x-auto no-scrollbar lg:flex-col lg:gap-0.5 lg:overflow-visible">
          {WIZARD_STEPS.map((definition, index) => {
            const isCurrent = index === stepIndex;
            const isComplete = index < stepIndex;

            return (
              <li key={definition.id} className="shrink-0 lg:shrink">
                <button
                  type="button"
                  onClick={() => isComplete && setStepIndex(index)}
                  disabled={!isComplete && !isCurrent}
                  aria-current={isCurrent ? 'step' : undefined}
                  className={cn(
                    'flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition-colors',
                    isCurrent && 'bg-brand-50 font-medium text-brand-700',
                    isComplete && 'text-ink hover:bg-sunken',
                    !isCurrent && !isComplete && 'cursor-default text-ink-muted',
                  )}
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      'flex size-5 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold',
                      isCurrent && 'bg-brand-600 text-white',
                      isComplete && 'bg-success-bg text-success',
                      !isCurrent && !isComplete && 'bg-sunken text-ink-muted',
                    )}
                  >
                    {isComplete ? <Icon name="check" size={11} strokeWidth={3} /> : index + 1}
                  </span>
                  <span className="whitespace-nowrap lg:whitespace-normal">
                    {definition.title}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </nav>

      <Card className="p-5 sm:p-6">
        <header className="mb-5 border-b border-line pb-4">
          <p className="text-xs font-semibold tracking-wide text-ink-muted uppercase">
            Step {stepIndex + 1} of {WIZARD_STEPS.length}
          </p>
          <h2 className="mt-1 text-lg font-semibold text-ink">{step.title}</h2>
          <p className="mt-0.5 text-sm text-ink-secondary">{step.hint}</p>
        </header>

        <div className="space-y-4">
          <StepFields
            step={step.id}
            draft={draft}
            errors={errors}
            update={update}
            isPending={isPending}
            isSuccess={isSuccess}
          />
        </div>

        <div className="mt-6 flex items-center justify-between gap-3 border-t border-line pt-4">
          <Button variant="ghost" onClick={goBack} disabled={stepIndex === 0 || isPending}>
            <Icon name="chevronLeft" size={15} />
            Back
          </Button>

          <div className="flex gap-2">
            <ButtonLink href="/recruiter/jobs" variant="secondary">
              Cancel
            </ButtonLink>
            {isLastStep ? (
              <Button onClick={handleSaveDraft} disabled={isPending}>
                {isPending ? 'Saving...' : 'Save as draft'}
              </Button>
            ) : (
              <Button onClick={goNext}>
                Continue
                <Icon name="chevronRight" size={15} />
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}

interface StepFieldsProps {
  readonly step: StepId;
  readonly draft: JobDraftInput;
  readonly errors: DraftErrors;
  readonly update: <K extends keyof JobDraftInput>(field: K, value: JobDraftInput[K]) => void;
  readonly isPending: boolean;
  readonly isSuccess: boolean;
}

/** The fields for one step. Split out so the orchestrator above stays readable. */
function StepFields({ step, draft, errors, update, isPending, isSuccess }: StepFieldsProps) {
  if (step === 'information') {
    return (
      <>
        <Field
          id="job-title"
          label="Job title"
          required
          error={errors.title}
          hint="Use the title candidates would search for, not an internal grade."
        >
          <Input
            id="job-title"
            value={draft.title}
            placeholder="Senior Frontend Engineer"
            invalid={Boolean(errors.title)}
            onChange={(event) => update('title', event.target.value)}
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="job-type" label="Employment type" required>
            <Select
              id="job-type"
              value={draft.employmentType}
              onChange={(event) => update('employmentType', event.target.value)}
            >
              {EMPLOYMENT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {EMPLOYMENT_TYPE_LABELS[type]}
                </option>
              ))}
            </Select>
          </Field>

          <Field id="job-level" label="Experience level" required>
            <Select
              id="job-level"
              value={draft.experienceLevel}
              onChange={(event) => update('experienceLevel', event.target.value)}
            >
              {EXPERIENCE_LEVELS.map((level) => (
                <option key={level} value={level}>
                  {EXPERIENCE_LEVEL_LABELS[level]}
                </option>
              ))}
            </Select>
          </Field>
        </div>
      </>
    );
  }

  if (step === 'description') {
    return (
      <Field
        id="job-description"
        label="About the role"
        required
        error={errors.description}
        hint="What the team does, what this person will own, and who they work with."
      >
        <Textarea
          id="job-description"
          rows={10}
          value={draft.description}
          invalid={Boolean(errors.description)}
          placeholder="We are looking for someone to own the customer-facing side of our product..."
          onChange={(event) => update('description', event.target.value)}
        />
      </Field>
    );
  }

  if (step === 'requirements') {
    return (
      <>
        <Field
          id="job-responsibilities"
          label="Responsibilities"
          required
          error={errors.responsibilities}
          hint="One per line. These become the bullet list on the posting."
        >
          <Textarea
            id="job-responsibilities"
            rows={6}
            value={draft.responsibilities}
            invalid={Boolean(errors.responsibilities)}
            placeholder={'Build and maintain the checkout experience\nOwn the on-call rotation for your services'}
            onChange={(event) => update('responsibilities', event.target.value)}
          />
        </Field>

        <Field
          id="job-requirements"
          label="Requirements"
          required
          error={errors.requirements}
          hint="One per line. Keep this to what is genuinely required."
        >
          <Textarea
            id="job-requirements"
            rows={6}
            value={draft.requirements}
            invalid={Boolean(errors.requirements)}
            placeholder={'5+ years building production web applications\nStrong TypeScript and React'}
            onChange={(event) => update('requirements', event.target.value)}
          />
        </Field>
      </>
    );
  }

  if (step === 'compensation') {
    return (
      <>
        <Alert tone="info">
          Postings that show a salary band get noticeably more qualified applicants than
          ones that do not.
        </Alert>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="job-salary-min" label="Salary from (USD)" required error={errors.salaryMin}>
            <Input
              id="job-salary-min"
              type="number"
              inputMode="numeric"
              min={0}
              step={1000}
              value={draft.salaryMin}
              placeholder="120000"
              invalid={Boolean(errors.salaryMin)}
              onChange={(event) => update('salaryMin', event.target.value)}
            />
          </Field>

          <Field id="job-salary-max" label="Salary to (USD)" required error={errors.salaryMax}>
            <Input
              id="job-salary-max"
              type="number"
              inputMode="numeric"
              min={0}
              step={1000}
              value={draft.salaryMax}
              placeholder="160000"
              invalid={Boolean(errors.salaryMax)}
              onChange={(event) => update('salaryMax', event.target.value)}
            />
          </Field>
        </div>

        <Field
          id="job-benefits"
          label="Benefits"
          hint="Optional. One per line."
        >
          <Textarea
            id="job-benefits"
            rows={5}
            value={draft.benefits}
            placeholder={'Private healthcare\n28 days paid leave\nLearning budget'}
            onChange={(event) => update('benefits', event.target.value)}
          />
        </Field>
      </>
    );
  }

  if (step === 'location') {
    return (
      <>
        <Field id="job-mode" label="Work arrangement" required>
          <Select
            id="job-mode"
            value={draft.workMode}
            onChange={(event) => update('workMode', event.target.value)}
          >
            {WORK_MODES.map((mode) => (
              <option key={mode} value={mode}>
                {WORK_MODE_LABELS[mode]}
              </option>
            ))}
          </Select>
        </Field>

        <Field
          id="job-location"
          label="Location"
          required
          error={errors.location}
          hint={
            draft.workMode === 'remote'
              ? 'For remote roles, state the region candidates must be in.'
              : 'The office or city this role is based in.'
          }
        >
          <Input
            id="job-location"
            value={draft.location}
            placeholder={draft.workMode === 'remote' ? 'Remote - EU' : 'London, UK'}
            invalid={Boolean(errors.location)}
            onChange={(event) => update('location', event.target.value)}
          />
        </Field>
      </>
    );
  }

  if (step === 'application') {
    return (
      <Field
        id="job-apply-email"
        label="Send applications to"
        required
        error={errors.applyEmail}
        hint="Every application for this role is delivered to this address."
      >
        <Input
          id="job-apply-email"
          type="email"
          value={draft.applyEmail}
          placeholder="hiring@yourcompany.com"
          invalid={Boolean(errors.applyEmail)}
          onChange={(event) => update('applyEmail', event.target.value)}
        />
      </Field>
    );
  }

  if (step === 'preview') {
    return (
      <>
        <p className="text-sm text-ink-secondary">
          This is how the posting will read to candidates. Use Back to change anything.
        </p>
        <JobPostPreview draft={draft} />
      </>
    );
  }

  return (
    <>
      {isSuccess ? (
        <Alert tone="success" title="Draft saved">
          Your posting is saved under Drafts. You can reopen and finish it at any time.
        </Alert>
      ) : (
        <Alert tone="info" title="Publishing arrives with the API">
          This is the frontend phase, so the posting saves as a draft rather than going
          live. When the backend endpoint is connected, this step becomes Publish and the
          same draft is submitted unchanged.
        </Alert>
      )}

      <dl className="divide-y divide-line rounded-lg ring-1 ring-line">
        {[
          { label: 'Title', value: draft.title },
          { label: 'Type', value: EMPLOYMENT_TYPE_LABELS[draft.employmentType as never] },
          { label: 'Level', value: EXPERIENCE_LEVEL_LABELS[draft.experienceLevel as never] },
          { label: 'Arrangement', value: WORK_MODE_LABELS[draft.workMode as never] },
          { label: 'Location', value: draft.location },
          { label: 'Salary', value: `$${draft.salaryMin} - $${draft.salaryMax}` },
          { label: 'Applications to', value: draft.applyEmail },
        ].map((row) => (
          <div key={row.label} className="flex items-baseline justify-between gap-4 px-4 py-2.5">
            <dt className="text-sm text-ink-muted">{row.label}</dt>
            <dd className="text-right text-sm font-medium text-ink">{row.value || 'Not set'}</dd>
          </div>
        ))}
      </dl>

      <p className="text-sm text-ink-secondary">
        {isPending
          ? 'Saving your draft...'
          : 'Saving keeps everything above, including the full description and bullet lists.'}
      </p>
    </>
  );
}
