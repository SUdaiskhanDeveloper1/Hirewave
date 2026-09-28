import Link from 'next/link';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Icon } from '@/components/ui/Icon';
import { EMPLOYMENT_TYPE_LABELS, EXPERIENCE_LEVEL_LABELS, WORK_MODE_LABELS } from '@/lib/labels';
import { cn } from '@/lib/utils/cn';
import { formatRelativeDays, formatSalary } from '@/lib/utils/format';
import type { JobSummary } from '@/types/domain';
import { SaveJobButton } from './SaveJobButton';

interface JobCardProps {
  readonly job: JobSummary;
  readonly className?: string;
}

/**
 * The unit of the job feed.
 *
 * Ordered the way people scan a listing: title, then employer, then the three facts
 * that decide whether to read on (location, arrangement, pay). Presentational and
 * hook-free, so the same component renders on the server (homepage, company pages)
 * and inside the client-side results list. Its only interactive child is the save
 * button, which owns a tiny client boundary of its own.
 */
export function JobCard({ job, className }: JobCardProps) {
  return (
    <article
      className={cn(
        'group relative rounded-card bg-raised p-4 shadow-card ring-1 ring-line transition-all',
        'hover:shadow-raised hover:ring-line-strong sm:p-5',
        className,
      )}
    >
      <div className="flex items-start gap-3.5">
        <Avatar name={job.company.name} hue={job.company.brandHue} />

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="text-[15px] leading-snug font-semibold text-ink">
                {/* Stretched link: the whole card is clickable without nesting anchors. */}
                <Link
                  href={`/jobs/${job.slug}`}
                  className="after:absolute after:inset-0 group-hover:text-brand-700"
                >
                  {job.title}
                </Link>
              </h3>
              <p className="mt-1 truncate text-sm text-ink-secondary">
                {job.company.name}
                <span className="text-ink-muted"> · {job.company.industry}</span>
              </p>
            </div>

            {/* Sits above the stretched link so the button stays clickable. */}
            <div className="relative z-10 -mt-1 -mr-1">
              <SaveJobButton jobId={job.id} jobTitle={job.title} />
            </div>
          </div>

          <dl className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm">
            <div className="flex items-center gap-1.5 text-ink-secondary">
              <dt className="sr-only">Location</dt>
              <Icon name="pin" size={14} className="shrink-0 text-ink-muted" />
              <dd className="truncate">{job.location}</dd>
            </div>
            {/* A remote job's location already reads "Remote - EU"; repeating the
                arrangement beside it just costs a line on a phone. */}
            {job.location.startsWith('Remote') ? null : (
              <div className="flex items-center gap-1.5 text-ink-secondary">
                <dt className="sr-only">Work arrangement</dt>
                <Icon name="globe" size={14} className="shrink-0 text-ink-muted" />
                <dd>{WORK_MODE_LABELS[job.workMode]}</dd>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <dt className="sr-only">Salary</dt>
              <Icon name="trending" size={14} className="shrink-0 text-ink-muted" />
              <dd className="font-medium text-ink">
                {formatSalary(job.salary)}
              </dd>
            </div>
          </dl>

          <p className="mt-2.5 line-clamp-2 text-sm leading-relaxed text-ink-secondary sm:line-clamp-1">
            {job.excerpt}
          </p>

          <div className="mt-3.5 flex flex-wrap items-center gap-1.5">
            {job.isFeatured ? (
              <Badge tone="brand">
                <Icon name="sparkle" size={11} />
                Featured
              </Badge>
            ) : null}
            <Badge tone="outline">{EMPLOYMENT_TYPE_LABELS[job.employmentType]}</Badge>
            <Badge tone="outline">{EXPERIENCE_LEVEL_LABELS[job.experienceLevel]}</Badge>
            {job.tags.slice(0, 2).map((tag) => (
              <Badge key={tag} tone="neutral">
                {tag}
              </Badge>
            ))}

            <span className="ml-auto flex items-center gap-1.5 text-xs text-ink-muted">
              <Icon name="clock" size={13} />
              {/* Day-precision label; suppressed because a render straddling midnight
                  would otherwise warn on hydration. */}
              <time dateTime={job.postedAt} suppressHydrationWarning>
                {formatRelativeDays(job.postedAt)}
              </time>
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}
