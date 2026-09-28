'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useApplications } from '@/hooks/use-candidate';
import { SaveJobButton } from '@/components/jobs/SaveJobButton';
import { cn } from '@/lib/utils/cn';
import type { Job } from '@/types/domain';
import { ApplyDialog } from './ApplyDialog';

interface JobApplyActionsProps {
  readonly job: Job;
  /** Renders the compact bar pinned to the bottom of the viewport on small screens. */
  readonly variant?: 'inline' | 'sticky';
}

const INLINE_ACTIONS_ID = 'job-apply-actions';

/**
 * Apply and save controls.
 *
 * Two placements share one component: the primary pair in the job header, and a bar
 * that sticks to the bottom of the viewport on phones. On a long posting the header
 * buttons scroll away after a screenful, and asking someone to scroll back up to act
 * is the most common way a job page loses an application.
 *
 * If the candidate has already applied, both placements say so instead of offering
 * the button again.
 */

export function JobApplyActions({ job, variant = 'inline' }: JobApplyActionsProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isInlineVisible, setIsInlineVisible] = useState(true);
  const { data: applications } = useApplications();

  // Watch the inline buttons so the two placements are never both on screen. An
  // observer rather than a scroll listener: no work on the main thread until the
  // element actually crosses the viewport edge.
  useEffect(() => {
    if (variant !== 'sticky') return;
    const target = document.getElementById(INLINE_ACTIONS_ID);
    if (!target) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsInlineVisible(entry?.isIntersecting ?? false),
      { rootMargin: '-72px 0px 0px 0px' },
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [variant]);

  const existing = applications?.find((application) => application.jobId === job.id);

  if (variant === 'sticky') {
    return (
      <>
        <div
          className={cn(
            'fixed inset-x-0 bottom-0 z-30 border-t border-line bg-raised/95 p-3 backdrop-blur-md transition-all duration-200 lg:hidden',
            isInlineVisible ? 'pointer-events-none translate-y-full opacity-0' : 'translate-y-0 opacity-100',
          )}
        >
          <div className="mx-auto flex max-w-3xl items-center gap-2">
            <div className="min-w-0 flex-1">
              {existing ? (
                <StatusBadge tone="success">Application sent</StatusBadge>
              ) : (
                <Button size="lg" className="w-full" onClick={() => setIsDialogOpen(true)}>
                  Apply now
                </Button>
              )}
            </div>
            <SaveJobButton jobId={job.id} jobTitle={job.title} />
          </div>
        </div>

        {/* Keeps the page's own footer clear of the fixed bar. */}
        <div aria-hidden="true" className="h-20 lg:hidden" />

        <ApplyDialog job={job} open={isDialogOpen} onClose={() => setIsDialogOpen(false)} />
      </>
    );
  }

  return (
    <>
      <div id={INLINE_ACTIONS_ID} className="mt-6 flex flex-wrap items-center gap-2.5">
        {existing ? (
          <div className="flex items-center gap-2.5">
            <StatusBadge tone="success">Application sent</StatusBadge>
            <span className="text-sm text-ink-secondary">
              Track it from your{' '}
              <Link href="/applications" className="font-medium text-brand-600 hover:underline">
                applications
              </Link>
              .
            </span>
          </div>
        ) : (
          <Button size="lg" onClick={() => setIsDialogOpen(true)} className="flex-1 sm:flex-none">
            Apply now
          </Button>
        )}

        <SaveJobButton jobId={job.id} jobTitle={job.title} variant="labelled" />

        <a
          href={job.applyUrl}
          target="_blank"
          rel="nofollow noopener"
          className="inline-flex h-10 items-center gap-1.5 rounded-lg px-3 text-sm font-medium text-ink-secondary transition-colors hover:bg-sunken hover:text-ink"
        >
          Company careers page
          <Icon name="external" size={14} />
        </a>
      </div>

      <ApplyDialog job={job} open={isDialogOpen} onClose={() => setIsDialogOpen(false)} />
    </>
  );
}
