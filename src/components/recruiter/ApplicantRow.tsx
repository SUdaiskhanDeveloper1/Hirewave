'use client';

import Link from 'next/link';
import { memo } from 'react';
import { Avatar } from '@/components/ui/Avatar';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { APPLICANT_STAGE_LABELS, APPLICANT_STAGE_TONE } from '@/lib/labels';
import { formatRelativeDays } from '@/lib/utils/format';
import type { Applicant } from '@/types/domain';

/**
 * Row heights the windowing maths depends on. Two values because the compact layout
 * stacks onto three lines instead of one.
 */
export const APPLICANT_ROW_HEIGHT = 64;
export const APPLICANT_ROW_HEIGHT_COMPACT = 96;

/** Shared column template, so the header and the rows cannot drift out of alignment. */
export const APPLICANT_GRID = 'grid-cols-[minmax(0,2.2fr)_minmax(0,1.6fr)_7rem_5rem_6rem]';

interface ApplicantRowProps {
  readonly applicant: Applicant;
  /** Stacked layout for narrow screens, where five columns cannot fit legibly. */
  readonly compact?: boolean;
}

/**
 * One candidate in the pipeline.
 *
 * Memoised because the windowed list re-renders on every scroll tick; rows whose
 * applicant object is unchanged (nearly all of them) then skip rendering entirely.
 * React Query's structural sharing keeps those object identities stable across
 * refetches, so the memo actually holds.
 */
export const ApplicantRow = memo(function ApplicantRow({
  applicant,
  compact = false,
}: ApplicantRowProps) {
  if (compact) {
    return (
      <div
        className="flex items-center gap-3 border-b border-line px-4"
        style={{ height: APPLICANT_ROW_HEIGHT_COMPACT }}
      >
        <Avatar name={applicant.name} hue={applicant.brandHue} size="sm" />

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-ink">{applicant.name}</p>
          <Link
            href={`/jobs/${applicant.jobSlug}`}
            className="mt-0.5 block truncate text-xs text-ink-secondary transition-colors hover:text-brand-600"
          >
            {applicant.jobTitle}
          </Link>
          <div className="mt-1.5 flex items-center gap-2">
            <StatusBadge tone={APPLICANT_STAGE_TONE[applicant.stage]}>
              {APPLICANT_STAGE_LABELS[applicant.stage]}
            </StatusBadge>
            <span className="text-xs text-ink-muted">
              Match {applicant.matchScore} ·{' '}
              <time dateTime={applicant.appliedAt} suppressHydrationWarning>
                {formatRelativeDays(applicant.appliedAt).toLowerCase()}
              </time>
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`grid ${APPLICANT_GRID} items-center gap-4 border-b border-line px-4 text-sm`}
      style={{ height: APPLICANT_ROW_HEIGHT }}
    >
      <div className="flex min-w-0 items-center gap-3">
        <Avatar name={applicant.name} hue={applicant.brandHue} size="sm" />
        <div className="min-w-0">
          <p className="truncate font-medium text-ink">{applicant.name}</p>
          <p className="truncate text-xs text-ink-muted">{applicant.email}</p>
        </div>
      </div>

      <div className="min-w-0">
        <Link
          href={`/jobs/${applicant.jobSlug}`}
          className="block truncate text-ink-secondary transition-colors hover:text-brand-600"
        >
          {applicant.jobTitle}
        </Link>
        <p className="truncate text-xs text-ink-muted">{applicant.location}</p>
      </div>

      <div>
        <StatusBadge tone={APPLICANT_STAGE_TONE[applicant.stage]}>
          {APPLICANT_STAGE_LABELS[applicant.stage]}
        </StatusBadge>
      </div>

      <div className="text-right font-medium text-ink tabular-nums">{applicant.matchScore}</div>

      <div className="text-right text-xs text-ink-muted">
        <time dateTime={applicant.appliedAt} suppressHydrationWarning>
          {formatRelativeDays(applicant.appliedAt)}
        </time>
      </div>
    </div>
  );
});
