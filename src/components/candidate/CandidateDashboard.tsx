'use client';

import Link from 'next/link';
import { JobCard } from '@/components/jobs/JobCard';
import { JobListSkeleton } from '@/components/jobs/JobSkeleton';
import { ButtonLink } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Icon } from '@/components/ui/Icon';
import { Skeleton } from '@/components/ui/Skeleton';
import { profileCompletion, useApplications, useCandidateProfile } from '@/hooks/use-candidate';
import { useJobs } from '@/hooks/use-jobs';
import { useSavedJobs } from '@/hooks/use-saved-jobs';
import { jobsHref } from '@/lib/api/query-params';
import { ApplicationCard } from './ApplicationCard';

/** Compact figure with a label. Four of these sit across the top of the dashboard. */
function SummaryTile({
  label,
  value,
  href,
  icon,
}: {
  readonly label: string;
  readonly value: number | string;
  readonly href: string;
  readonly icon: 'send' | 'users' | 'bookmark' | 'star';
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-card bg-raised p-4 ring-1 ring-line transition-all hover:shadow-raised hover:ring-line-strong"
    >
      <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
        <Icon name={icon} size={18} />
      </span>
      <span className="min-w-0">
        <span className="block text-xl font-semibold text-ink tabular-nums">{value}</span>
        <span className="block truncate text-xs text-ink-muted">{label}</span>
      </span>
    </Link>
  );
}

/**
 * Candidate home.
 *
 * Answers the three questions someone opening this page has: what happened to my
 * applications, what should I look at next, and what is missing from my profile.
 */
export function CandidateDashboard() {
  const { data: profile, isPending: profileLoading } = useCandidateProfile();
  const applications = useApplications();
  const saved = useSavedJobs();

  // Recommendations follow the preferences on the profile rather than a black box, so
  // the reason a job appears here is something the candidate can see and change.
  const recommendedQuery = {
    ...(profile ? { role: profile.preferredRoles, mode: profile.preferredWorkModes } : {}),
    perPage: 4,
    sort: 'newest' as const,
  };
  const recommended = useJobs(recommendedQuery, { enabled: profile !== undefined });

  const completion = profile ? profileCompletion(profile) : null;
  const activeCount =
    applications.data?.filter(
      (application) => application.status !== 'rejected' && application.status !== 'submitted',
    ).length ?? 0;
  const interviewCount =
    applications.data?.filter((application) => application.status === 'interview').length ?? 0;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">Your dashboard</h1>
        {/*
          The greeting is personalised, so it renders after the profile arrives. The
          heading above it is static and server-rendered, which keeps the document
          outline intact while that happens.
        */}
        {profileLoading || !profile ? (
          <Skeleton className="mt-1.5 h-5 w-72 max-w-full" />
        ) : (
          <p className="mt-1.5 text-sm text-ink-secondary">
            {profile.name.split(' ')[0]}, here is where your applications,
            recommendations and profile stand.
          </p>
        )}
      </header>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryTile
          label="Applications sent"
          value={applications.data?.length ?? '-'}
          href="/applications"
          icon="send"
        />
        <SummaryTile label="In progress" value={activeCount} href="/applications" icon="users" />
        <SummaryTile
          label="Interviews"
          value={interviewCount}
          href="/applications?status=interview"
          icon="star"
        />
        <SummaryTile
          label="Saved jobs"
          value={saved.data?.length ?? 0}
          href="/saved"
          icon="bookmark"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
        <div className="space-y-6">
          <section aria-labelledby="recommended-heading">
            <div className="flex items-end justify-between gap-3">
              <div>
                <h2 id="recommended-heading" className="text-lg font-semibold text-ink">
                  Recommended for you
                </h2>
                <p className="mt-0.5 text-sm text-ink-secondary">
                  {profile
                    ? `Matching your preferred roles and ${profile.preferredWorkModes.join(' or ')} work.`
                    : 'Based on the preferences on your profile.'}
                </p>
              </div>
              <ButtonLink
                href={profile ? jobsHref({ role: profile.preferredRoles }) : '/jobs'}
                variant="secondary"
                size="sm"
              >
                See all
                <Icon name="arrowRight" size={14} />
              </ButtonLink>
            </div>

            <div className="mt-4">
              {recommended.isError ? (
                <ErrorState
                  title="Could not load recommendations"
                  onRetry={() => void recommended.refetch()}
                />
              ) : recommended.isPending ? (
                <JobListSkeleton count={3} />
              ) : recommended.data.data.length === 0 ? (
                <EmptyState
                  icon="search"
                  title="No matches yet"
                  description="Widen the roles or work arrangements on your profile to see more."
                  action={
                    <ButtonLink href="/profile" variant="secondary" size="sm">
                      Update preferences
                    </ButtonLink>
                  }
                />
              ) : (
                <ul className="grid gap-3">
                  {recommended.data.data.map((job) => (
                    <li key={job.id}>
                      <JobCard job={job} />
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>

          <section aria-labelledby="recent-applications-heading">
            <div className="flex items-end justify-between gap-3">
              <h2 id="recent-applications-heading" className="text-lg font-semibold text-ink">
                Recent applications
              </h2>
              <ButtonLink href="/applications" variant="secondary" size="sm">
                View all
                <Icon name="arrowRight" size={14} />
              </ButtonLink>
            </div>

            <div className="mt-4">
              {applications.isError ? (
                <ErrorState
                  title="Could not load your applications"
                  onRetry={() => void applications.refetch()}
                />
              ) : applications.isPending ? (
                <JobListSkeleton count={2} />
              ) : applications.data.length === 0 ? (
                <EmptyState
                  icon="send"
                  title="No applications yet"
                  description="When you apply for a role it will show up here with its current status."
                  action={<ButtonLink href="/jobs">Browse jobs</ButtonLink>}
                />
              ) : (
                <ul className="grid gap-3">
                  {applications.data.slice(0, 3).map((application) => (
                    <li key={application.id}>
                      <ApplicationCard application={application} />
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-20">
          <Card className="p-5">
            <h2 className="text-sm font-semibold text-ink">Profile strength</h2>

            {!completion || !profile ? (
              <div className="mt-3 space-y-2">
                <Skeleton className="h-2 w-full rounded-full" />
                <Skeleton className="h-4 w-32" />
              </div>
            ) : (
              <>
                <div className="mt-3 flex items-baseline justify-between">
                  <span className="text-2xl font-semibold text-ink tabular-nums">
                    {completion.percent}%
                  </span>
                  <span className="text-xs text-ink-muted">
                    {completion.missing.length === 0
                      ? 'Complete'
                      : `${completion.missing.length} left`}
                  </span>
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
                  <>
                    <p className="mt-4 text-xs font-semibold tracking-wide text-ink-muted uppercase">
                      Still to add
                    </p>
                    <ul className="mt-2 space-y-1.5">
                      {completion.missing.slice(0, 4).map((item) => (
                        <li
                          key={item}
                          className="flex items-center gap-2 text-sm text-ink-secondary"
                        >
                          <span
                            aria-hidden="true"
                            className="size-1.5 shrink-0 rounded-full bg-line-strong"
                          />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </>
                ) : null}

                <ButtonLink href="/profile" variant="secondary" size="sm" className="mt-4 w-full">
                  <Icon name="edit" size={14} />
                  Edit profile
                </ButtonLink>
              </>
            )}
          </Card>

          <Card className="p-5">
            <h2 className="text-sm font-semibold text-ink">Saved jobs</h2>
            <p className="mt-2 text-sm text-ink-secondary">
              {saved.data && saved.data.length > 0
                ? `You have ${saved.data.length} ${saved.data.length === 1 ? 'job' : 'jobs'} saved for later.`
                : 'Save a job from any listing to come back to it here.'}
            </p>
            <ButtonLink href="/saved" variant="secondary" size="sm" className="mt-3.5 w-full">
              Open saved jobs
            </ButtonLink>
          </Card>
        </aside>
      </div>
    </div>
  );
}
