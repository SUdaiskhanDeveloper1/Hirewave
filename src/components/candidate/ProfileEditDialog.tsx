'use client';

import type { FormEvent } from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Input, Textarea } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { useUpdateProfile } from '@/hooks/use-candidate';
import type { CandidateProfile } from '@/types/domain';

interface ProfileEditDialogProps {
  readonly profile: CandidateProfile;
  readonly open: boolean;
  readonly onClose: () => void;
}

interface Errors {
  name?: string;
  headline?: string;
  location?: string;
  about?: string;
}

const MAX_ABOUT = 1500;

/**
 * Edits the headline block of the profile.
 *
 * Scoped to the fields a candidate changes most often. Experience and education are
 * edited in place on the profile page itself, which avoids a dialog that would need
 * to manage a growing list inside a growing form.
 */
export function ProfileEditDialog({ profile, open, onClose }: ProfileEditDialogProps) {
  const { mutate, isPending } = useUpdateProfile();
  const { notify } = useToast();

  const [values, setValues] = useState({
    name: profile.name,
    headline: profile.headline,
    location: profile.location,
    about: profile.about,
  });
  const [errors, setErrors] = useState<Errors>({});

  function validate(next: typeof values): Errors {
    const found: Errors = {};
    if (next.name.trim().length < 2) found.name = 'Enter your full name.';
    if (next.headline.trim().length < 10) {
      found.headline = 'Write at least a short phrase describing what you do.';
    }
    if (next.headline.length > 120) found.headline = 'Keep the headline under 120 characters.';
    if (next.location.trim().length === 0) found.location = 'Add a city or country.';
    if (next.about.length > MAX_ABOUT) found.about = `Keep this under ${MAX_ABOUT} characters.`;
    return found;
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();

    const found = validate(values);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    mutate(
      {
        name: values.name.trim(),
        headline: values.headline.trim(),
        location: values.location.trim(),
        about: values.about.trim(),
      },
      {
        onSuccess: () => {
          notify('Profile updated');
          onClose();
        },
        onError: () => notify('Could not save your changes. Please try again.', 'error'),
      },
    );
  }

  function update(field: keyof typeof values, value: string): void {
    const next = { ...values, [field]: value };
    setValues(next);
    // Only clear errors as they are fixed; never introduce new ones mid-typing.
    if (errors[field]) setErrors(validate(next));
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Edit profile"
      description="This is what hiring teams see first."
      size="lg"
      footer={
        <>
          <Button type="button" variant="secondary" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button type="submit" form="profile-form" disabled={isPending}>
            {isPending ? 'Saving...' : 'Save changes'}
          </Button>
        </>
      }
    >
      <form id="profile-form" noValidate onSubmit={handleSubmit} className="space-y-4">
        <Field id="profile-name" label="Full name" required error={errors.name}>
          <Input
            id="profile-name"
            value={values.name}
            autoComplete="name"
            invalid={Boolean(errors.name)}
            onChange={(event) => update('name', event.target.value)}
          />
        </Field>

        <Field
          id="profile-headline"
          label="Professional headline"
          required
          error={errors.headline}
          hint="One line on what you do and what you are good at."
        >
          <Input
            id="profile-headline"
            value={values.headline}
            invalid={Boolean(errors.headline)}
            onChange={(event) => update('headline', event.target.value)}
          />
        </Field>

        <Field id="profile-location" label="Location" required error={errors.location}>
          <Input
            id="profile-location"
            value={values.location}
            autoComplete="address-level2"
            invalid={Boolean(errors.location)}
            onChange={(event) => update('location', event.target.value)}
          />
        </Field>

        <Field
          id="profile-about"
          label="About"
          error={errors.about}
          hint={`${MAX_ABOUT - values.about.length} characters remaining.`}
        >
          <Textarea
            id="profile-about"
            rows={7}
            value={values.about}
            invalid={Boolean(errors.about)}
            onChange={(event) => update('about', event.target.value)}
          />
        </Field>
      </form>
    </Modal>
  );
}
