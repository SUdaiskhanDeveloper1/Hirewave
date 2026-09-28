import Link from 'next/link';
import { Avatar } from '@/components/ui/Avatar';
import { Icon } from '@/components/ui/Icon';
import { StatusBadge } from '@/components/ui/StatusBadge';
import type { StatusTone } from '@/components/ui/StatusBadge';
import { formatRelativeDays, formatSalary } from '@/lib/utils/format';
import type { Application, ApplicationStatus } from '@/types/domain';

export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
  submitted: 'Applied',
  'under-review': 'Under review',
  interview: 'Interview',
  offer: 'Offer',
  rejected: 'Not selected',
};

export const APPLICATION_STATUS_TONE: Record<ApplicationStatus, StatusTone> = {
  submitted: 'neutral',
  'under-review': 'info',
  interview: 'info',
  offer: 'warning',
  rejected: 'danger',
};

/**
 * One application in the candidate's list.
 *
 * Leads with what changed and when, because that is what someone checking their
 * applications is actually looking for - the job title is context they already have.
 */
export function ApplicationCard({ application }: { readonly application: Application }) {
  const { job } = application;
  if (!job) return null;

  return (
    <article className="group relative rounded-card bg-raised p-4 shadow-card ring-1 ring-line transition-all hover:shadow-raised hover:ring-line-strong sm:p-5">
      <div className="flex items-start gap-3.5">
        <Avatar name={job.company.name} hue={job.company.brandHue} />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="text-[15px] leading-snug font-semibold text-ink">
                <Link
                  href={`/jobs/${job.slug}`}
                  className="after:absolute after:inset-0 group-hover:text-brand-700"
                >
                  {job.title}
                </Link>
              </h3>
              <p className="mt-1 truncate text-sm text-ink-secondary">
                {job.company.name}
                <span className="text-ink-muted"> · {job.location}</span>
              </p>
            </div>

            <StatusBadge tone={APPLICATION_STATUS_TONE[application.status]}>
              {APPLICATION_STATUS_LABELS[application.status]}
            </StatusBadge>
          </div>

          {application.nextStep ? (
            <p className="mt-3 flex items-start gap-2 rounded-lg bg-sunken px-3 py-2 text-sm text-ink-secondary">
              <Icon name="info" size={15} className="mt-0.5 shrink-0 text-ink-muted" />
              {application.nextStep}
            </p>
          ) : null}

          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-muted">
            <span className="flex items-center gap-1.5">
              <Icon name="calendar" size={13} />
              Applied{' '}
              <time dateTime={application.appliedAt} suppressHydrationWarning>
                {formatRelativeDays(application.appliedAt).toLowerCase()}
              </time>
            </span>
            <span className="flex items-center gap-1.5">
              <Icon name="clock" size={13} />
              Updated{' '}
              <time dateTime={application.updatedAt} suppressHydrationWarning>
                {formatRelativeDays(application.updatedAt).toLowerCase()}
              </time>
            </span>
            <span className="flex items-center gap-1.5">
              <Icon name="trending" size={13} />
              {formatSalary(job.salary)}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}
