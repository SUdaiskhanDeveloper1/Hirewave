'use client';

import type { FormEvent } from 'react';
import { useState } from 'react';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Field, describedBy } from '@/components/ui/Field';
import { Input, Textarea } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { useApplyToJob, useCandidateProfile } from '@/hooks/use-candidate';
import type { Job } from '@/types/domain';

interface ApplyDialogProps {
  readonly job: Job;
  readonly open: boolean;
  readonly onClose: () => void;
}

interface FormErrors {
  name?: string;
  email?: string;
  coverNote?: string;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MAX_COVER_NOTE = 1200;

/**
 * Application form.
 *
 * Validation runs on submit and then live per field, so a first-time visitor is not
 * scolded while still typing but does get immediate confirmation once they have
 * corrected something. Fields are prefilled from the candidate profile because
 * retyping a name and email that the product already holds is friction, not security.
 *
 * The mutation is intentionally not optimistic: applying is a commitment, and the
 * user should see it confirmed rather than assumed.
 */
export function ApplyDialog({ job, open, onClose }: ApplyDialogProps) {
  const { data: profile } = useCandidateProfile();
  const { mutate, isPending } = useApplyToJob();
  const { notify } = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [coverNote, setCoverNote] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [hasSubmitted, setHasSubmitted] = useState(false);

  // Prefill once the profile arrives, without clobbering anything already typed.
  const resolvedName = name || profile?.name || '';
  const resolvedEmail = email || profile?.email || '';

  function validate(values: { name: string; email: string; coverNote: string }): FormErrors {
    const next: FormErrors = {};
    if (values.name.trim().length < 2) next.name = 'Enter your full name.';
    if (!EMAIL_PATTERN.test(values.email.trim())) {
      next.email = 'Enter a valid email address so the team can reply.';
    }
    if (values.coverNote.length > MAX_COVER_NOTE) {
      next.coverNote = `Keep this under ${MAX_COVER_NOTE} characters.`;
    }
    return next;
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    setHasSubmitted(true);

    const values = { name: resolvedName, email: resolvedEmail, coverNote };
    const nextErrors = validate(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    mutate(job.id, {
      onSuccess: () => {
        notify(`Application sent to ${job.company.name}`);
        setCoverNote('');
        setHasSubmitted(false);
        onClose();
      },
      onError: () => {
        notify('Could not send your application. Please try again.', 'error');
      },
    });
  }

  /** Re-validates a single field, but only after the first submit attempt. */
  function revalidate(field: keyof FormErrors, values: Partial<FormErrors & { value: string }>): void {
    if (!hasSubmitted) return;
    const next = validate({
      name: field === 'name' ? (values.value ?? '') : resolvedName,
      email: field === 'email' ? (values.value ?? '') : resolvedEmail,
      coverNote: field === 'coverNote' ? (values.value ?? '') : coverNote,
    });
    setErrors(next);
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Apply for ${job.title}`}
      description={`${job.company.name} · ${job.location}`}
      footer={
        <>
          <Button type="button" variant="secondary" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button type="submit" form="apply-form" disabled={isPending}>
            {isPending ? 'Sending...' : 'Submit application'}
          </Button>
        </>
      }
    >
      <form id="apply-form" noValidate onSubmit={handleSubmit} className="space-y-4">
        <Field
          id="apply-name"
          label="Full name"
          required
          error={errors.name}
        >
          <Input
            id="apply-name"
            name="name"
            autoComplete="name"
            value={resolvedName}
            invalid={Boolean(errors.name)}
            aria-describedby={describedBy('apply-name', undefined, errors.name)}
            onChange={(event) => {
              setName(event.target.value);
              revalidate('name', { value: event.target.value });
            }}
          />
        </Field>

        <Field
          id="apply-email"
          label="Email address"
          required
          error={errors.email}
          hint="The hiring team will reply to this address."
        >
          <Input
            id="apply-email"
            name="email"
            type="email"
            autoComplete="email"
            value={resolvedEmail}
            invalid={Boolean(errors.email)}
            aria-describedby={describedBy('apply-email', 'hint', errors.email)}
            onChange={(event) => {
              setEmail(event.target.value);
              revalidate('email', { value: event.target.value });
            }}
          />
        </Field>

        <Field
          id="apply-note"
          label="Message to the hiring team"
          error={errors.coverNote}
          hint={`Optional. ${MAX_COVER_NOTE - coverNote.length} characters remaining.`}
        >
          <Textarea
            id="apply-note"
            name="coverNote"
            rows={5}
            value={coverNote}
            invalid={Boolean(errors.coverNote)}
            aria-describedby={describedBy('apply-note', 'hint', errors.coverNote)}
            placeholder={`Why you are interested in this role at ${job.company.name}, and what you would bring to it.`}
            onChange={(event) => {
              setCoverNote(event.target.value);
              revalidate('coverNote', { value: event.target.value });
            }}
          />
        </Field>

        {profile?.resumeFileName ? (
          <Alert tone="info" title="CV attached">
            {profile.resumeFileName} will be sent with this application. Change it from your
            profile.
          </Alert>
        ) : (
          <Alert tone="warning" title="No CV on file">
            You can still apply, but adding a CV to your profile gives the team more to go on.
          </Alert>
        )}
      </form>
    </Modal>
  );
}
