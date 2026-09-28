'use client';

import { useRef, useState } from 'react';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ErrorState } from '@/components/ui/ErrorState';
import { Icon } from '@/components/ui/Icon';
import { Input } from '@/components/ui/Input';
import { Skeleton } from '@/components/ui/Skeleton';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useToast } from '@/components/ui/Toast';
import {
  profileCompletion,
  useCandidateProfile,
  useUpdateProfile,
} from '@/hooks/use-candidate';
import { WORK_MODE_LABELS } from '@/lib/labels';
import type { EducationEntry, ExperienceEntry } from '@/types/domain';
import { ProfileEditDialog } from './ProfileEditDialog';

const MONTH_FORMATTER = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
});

/** "2023-02" -> "Feb 2023". Entries store month precision, so parse it as one. */
function formatMonth(value: string): string {
  const [year, month] = value.split('-');
  if (!year || !month) return value;
  return MONTH_FORMATTER.format(new Date(Date.UTC(Number(year), Number(month) - 1, 1)));
}

function ExperienceItem({ entry }: { readonly entry: ExperienceEntry }) {
  return (
    <li className="relative pl-6">
      <span
        aria-hidden="true"
        className="absolute top-1.5 left-0 size-2.5 rounded-full bg-brand-600 ring-4 ring-brand-50"
      />
      <span
        aria-hidden="true"
        className="absolute top-5 bottom-[-1.25rem] left-[0.3125rem] w-px bg-line last:hidden"
      />
      <h3 className="text-[15px] font-semibold text-ink">{entry.title}</h3>
      <p className="mt-0.5 text-sm text-ink-secondary">
        {entry.company}
        <span className="text-ink-muted"> · {entry.location}</span>
      </p>
      <p className="mt-0.5 text-xs text-ink-muted">
        {formatMonth(entry.startDate)} - {entry.endDate ? formatMonth(entry.endDate) : 'Present'}
      </p>
      <p className="mt-2 text-sm leading-relaxed text-ink-secondary">{entry.summary}</p>
    </li>
  );
}

function EducationItem({ entry }: { readonly entry: EducationEntry }) {
  return (
    <li>
      <h3 className="text-[15px] font-semibold text-ink">{entry.qualification}</h3>
      <p className="mt-0.5 text-sm text-ink-secondary">{entry.institution}</p>
      <p className="mt-0.5 text-xs text-ink-muted">
        {entry.startYear} - {entry.endYear}
      </p>
    </li>
  );
}

function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-44 rounded-card" />
      <Skeleton className="h-56 rounded-card" />
      <Skeleton className="h-40 rounded-card" />
    </div>
  );
}

/**
 * The candidate profile.
 *
 * Read-first: the page shows what an employer would see, with editing available where
 * it belongs rather than behind one large form. Skills and the CV are edited in place
 * because they change often; the headline block opens a dialog.
 */
export function CandidateProfileView() {
  const { data: profile, isPending, isError, refetch } = useCandidateProfile();
  const { mutate: updateProfile } = useUpdateProfile();
  const { notify } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [newSkill, setNewSkill] = useState('');

  if (isError) {
    return (
      <ErrorState
        title="Could not load your profile"
        description="We could not reach the profile service."
        onRetry={() => void refetch()}
      />
    );
  }

  if (isPending || !profile) return <ProfileSkeleton />;

  const completion = profileCompletion(profile);

  function addSkill(): void {
    if (!profile) return;
    const value = newSkill.trim();
    if (value.length === 0) return;

    if (profile.skills.some((skill) => skill.toLowerCase() === value.toLowerCase())) {
      notify('That skill is already on your profile', 'info');
      setNewSkill('');
      return;
    }

    updateProfile({ skills: [...profile.skills, value] });
    setNewSkill('');
  }

  function removeSkill(skill: string): void {
    if (!profile) return;
    updateProfile({ skills: profile.skills.filter((entry) => entry !== skill) });
  }

  return (
    <div className="space-y-6">
      <Card className="p-5 sm:p-7">
        <div className="flex flex-wrap items-start gap-4">
          <Avatar name={profile.name} hue={profile.brandHue} size="lg" />

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <h2 className="text-2xl font-semibold tracking-tight text-ink">{profile.name}</h2>
              {profile.openToWork ? <StatusBadge tone="success">Open to work</StatusBadge> : null}
            </div>
            <p className="mt-1 text-[15px] text-ink-secondary">{profile.headline}</p>
            <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-ink-muted">
              <span className="flex items-center gap-1.5">
                <Icon name="pin" size={14} />
                {profile.location}
              </span>
              <span className="flex items-center gap-1.5">
                <Icon name="mail" size={14} />
                {profile.email}
              </span>
            </p>
          </div>

          <Button variant="secondary" size="sm" onClick={() => setIsEditing(true)}>
            <Icon name="edit" size={14} />
            Edit profile
          </Button>
        </div>

        <div className="mt-5 border-t border-line pt-4">
          <div className="flex items-baseline justify-between gap-3">
            <p className="text-sm font-medium text-ink">Profile strength</p>
            <p className="text-sm text-ink-secondary tabular-nums">{completion.percent}%</p>
          </div>
          <div
            className="mt-2 h-2 overflow-hidden rounded-full bg-sunken"
            role="progressbar"
            aria-valuenow={completion.percent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Profile completion"
          >
            <div
              className="h-full rounded-full bg-brand-600 transition-[width] duration-500"
              style={{ width: `${completion.percent}%` }}
            />
          </div>
          {completion.missing.length > 0 ? (
            <p className="mt-2 text-xs text-ink-muted">
              Still to add: {completion.missing.join(', ')}.
            </p>
          ) : null}
        </div>
      </Card>

      <Card className="p-5 sm:p-7">
        <h2 className="text-base font-semibold text-ink">About</h2>
        <p className="mt-3 text-[15px] leading-relaxed text-ink-secondary">{profile.about}</p>

        <div className="mt-5 flex flex-wrap gap-2 border-t border-line pt-4">
          <span className="text-sm text-ink-muted">Looking for:</span>
          {profile.preferredWorkModes.map((mode) => (
            <Badge key={mode} tone="brand">
              {WORK_MODE_LABELS[mode]}
            </Badge>
          ))}
        </div>
      </Card>

      <Card className="p-5 sm:p-7">
        <h2 className="text-base font-semibold text-ink">Experience</h2>
        <ul className="mt-4 space-y-5">
          {profile.experience.map((entry) => (
            <ExperienceItem key={entry.id} entry={entry} />
          ))}
        </ul>
      </Card>

      <Card className="p-5 sm:p-7">
        <h2 className="text-base font-semibold text-ink">Education</h2>
        <ul className="mt-4 space-y-4">
          {profile.education.map((entry) => (
            <EducationItem key={entry.id} entry={entry} />
          ))}
        </ul>
      </Card>

      <Card className="p-5 sm:p-7">
        <h2 className="text-base font-semibold text-ink">Skills</h2>

        <ul className="mt-4 flex flex-wrap gap-1.5">
          {profile.skills.map((skill) => (
            <li key={skill}>
              <span className="inline-flex items-center gap-1.5 rounded-md bg-sunken py-1 pr-1.5 pl-2.5 text-sm text-ink-secondary ring-1 ring-inset ring-line">
                {skill}
                <button
                  type="button"
                  onClick={() => removeSkill(skill)}
                  aria-label={`Remove ${skill}`}
                  className="flex size-4 items-center justify-center rounded text-ink-muted transition-colors hover:bg-danger-bg hover:text-danger"
                >
                  <Icon name="close" size={11} strokeWidth={2.5} />
                </button>
              </span>
            </li>
          ))}
        </ul>

        <form
          className="mt-4 flex gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            addSkill();
          }}
        >
          <label htmlFor="new-skill" className="sr-only">
            Add a skill
          </label>
          <Input
            id="new-skill"
            inputSize="sm"
            value={newSkill}
            placeholder="Add a skill"
            className="max-w-56"
            onChange={(event) => setNewSkill(event.target.value)}
          />
          <Button type="submit" variant="secondary" size="sm" disabled={newSkill.trim().length === 0}>
            <Icon name="plus" size={14} />
            Add
          </Button>
        </form>
      </Card>

      <Card className="p-5 sm:p-7">
        <h2 className="text-base font-semibold text-ink">CV and links</h2>

        <div className="mt-4 flex flex-wrap items-center gap-3 rounded-lg bg-sunken p-3.5">
          <Icon name="upload" size={18} className="text-ink-muted" />
          <span className="min-w-0 flex-1 truncate text-sm text-ink">
            {profile.resumeFileName ?? 'No CV uploaded yet'}
          </span>
          <Button variant="secondary" size="sm" onClick={() => fileInputRef.current?.click()}>
            {profile.resumeFileName ? 'Replace' : 'Upload'}
          </Button>
          {/*
            Frontend-only: the chosen file's name is recorded so the UI is honest about
            what would be attached. Uploading is a backend concern.
          */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx"
            className="sr-only"
            aria-label="Upload your CV"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (!file) return;
              updateProfile({ resumeFileName: file.name });
              notify(`${file.name} attached to your profile`);
              event.target.value = '';
            }}
          />
        </div>

        <ul className="mt-4 space-y-2">
          {profile.links.map((link) => (
            <li key={link.url}>
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-medium text-brand-600 transition-colors hover:text-brand-700"
              >
                {link.label}
                <Icon name="external" size={13} />
              </a>
            </li>
          ))}
        </ul>
      </Card>

      <ProfileEditDialog profile={profile} open={isEditing} onClose={() => setIsEditing(false)} />
    </div>
  );
}
