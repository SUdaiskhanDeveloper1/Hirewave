import Link from 'next/link';
import { JobApplyActions } from '@/components/jobs/JobApplyActions';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { ButtonLink } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Icon } from '@/components/ui/Icon';
import {
  EMPLOYMENT_TYPE_LABELS,
  EXPERIENCE_LEVEL_LABELS,
  ROLE_LABELS,
  WORK_MODE_LABELS,
} from '@/lib/labels';
import {
  formatCompactNumber,
  formatDate,
  formatEmployeeCount,
  formatRelativeDays,
  formatSalaryRange,
} from '@/lib/utils/format';
import type { Company, Job } from '@/types/domain';

/** A titled bullet section. Used four times, so it earns a component. */
function BulletSection({
  id,
  title,
  items,
}: {
  readonly id: string;
  readonly title: string;
  readonly items: readonly string[];
}) {
  // Live postings publish one prose body rather than structured lists, so these
  // arrays are often empty. A heading with nothing under it reads as a broken page.
  if (items.length === 0) return null;

  return (
    <section aria-labelledby={id}>
      <h2 id={id} className="text-base font-semibold text-ink">
        {title}
      </h2>
      <ul className="mt-3 space-y-2">
        {items.map((item) => (
          <li key={item} className="flex gap-2.5 text-[15px] leading-relaxed text-ink-secondary">
            <Icon name="check" size={15} className="mt-1 shrink-0 text-brand-600" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function FactRow({ label, value }: { readonly label: string; readonly value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 text-sm">
      <dt className="shrink-0 text-ink-muted">{label}</dt>
      <dd className="text-right font-medium text-ink">{value}</dd>
    </div>
  );
}

interface JobDetailProps {
  readonly job: Job;
  readonly company: Company | null;
}

/**
 * The full posting.
 *
 * Server-rendered apart from the apply and save controls, so the page most likely to
 * arrive from a search engine ships almost no JavaScript. Order follows how people
 * actually read a job ad: title and employer, the facts that rule it in or out, the
 * apply action, then the detail.
 */
export function JobDetail({ job, company }: JobDetailProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
      <div className="space-y-6">
        <Card className="p-5 sm:p-7">
          <div className="flex flex-wrap items-start gap-4">
            <Avatar name={job.company.name} hue={job.company.brandHue} size="lg" />
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl font-semibold tracking-tight text-ink sm:text-[27px]">
                {job.title}
              </h1>
              <p className="mt-1.5 text-[15px] text-ink-secondary">
                <Link
                  href={`/companies/${job.company.slug}`}
                  className="font-medium text-ink transition-colors hover:text-brand-600"
                >
                  {job.company.name}
                </Link>
                <span className="text-ink-muted"> · {job.company.industry}</span>
              </p>

              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-ink-secondary">
                <span className="flex items-center gap-1.5">
                  <Icon name="pin" size={14} className="text-ink-muted" />
                  {job.location}
                </span>
                <span className="flex items-center gap-1.5">
                  <Icon name="globe" size={14} className="text-ink-muted" />
                  {WORK_MODE_LABELS[job.workMode]}
                </span>
                <span className="flex items-center gap-1.5">
                  <Icon name="briefcase" size={14} className="text-ink-muted" />
                  {EMPLOYMENT_TYPE_LABELS[job.employmentType]}
                </span>
                <span className="flex items-center gap-1.5">
                  <Icon name="clock" size={14} className="text-ink-muted" />
                  Posted{' '}
                  <time dateTime={job.postedAt} suppressHydrationWarning>
                    {formatRelativeDays(job.postedAt).toLowerCase()}
                  </time>
                </span>
              </div>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-1.5">
            {job.isFeatured ? (
              <Badge tone="brand">
                <Icon name="sparkle" size={11} />
                Featured
              </Badge>
            ) : null}
            <Badge tone="outline">{EXPERIENCE_LEVEL_LABELS[job.experienceLevel]}</Badge>
            <Badge tone="outline">{ROLE_LABELS[job.roleFamily]}</Badge>
            {job.tags.map((tag) => (
              <Badge key={tag} tone="neutral">
                {tag}
              </Badge>
            ))}
          </div>

          <div className="mt-5 rounded-lg bg-sunken px-4 py-3">
            <p className="text-xs font-semibold tracking-wide text-ink-muted uppercase">
              Base salary
            </p>
            <p className="mt-0.5 text-lg font-semibold text-ink">
              {job.salary === null ? (
                <span className="text-base font-medium text-ink-secondary">
                  Not disclosed by the employer
                </span>
              ) : (
                <>
                  {formatSalaryRange(job.salary.min, job.salary.max)}
                  <span className="ml-1.5 text-sm font-normal text-ink-secondary">
                    per year
                  </span>
                </>
              )}
            </p>
          </div>

          <JobApplyActions job={job} />
        </Card>

        <Card className="space-y-7 p-5 sm:p-7">
          <section aria-labelledby="about-role">
            <h2 id="about-role" className="text-base font-semibold text-ink">
              About the role
            </h2>
            {job.description.map((paragraph) => (
              <p key={paragraph} className="mt-3 text-[15px] leading-relaxed text-ink-secondary">
                {paragraph}
              </p>
            ))}
          </section>

          <BulletSection id="responsibilities" title="Responsibilities" items={job.responsibilities} />
          <BulletSection id="requirements" title="Requirements" items={job.requirements} />
          <BulletSection
            id="preferred"
            title="Preferred qualifications"
            items={job.preferredQualifications}
          />

          <section aria-labelledby="compensation">
            <h2 id="compensation" className="text-base font-semibold text-ink">
              Compensation
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed text-ink-secondary">
              {job.salary === null ? (
                <>
                  This employer has not published a salary range for this role. Pay is
                  usually discussed during the first conversation with the hiring team.
                </>
              ) : (
                <>
                  This role pays {formatSalaryRange(job.salary.min, job.salary.max)} per
                  year, depending on experience and location. The range is the published
                  band for the level and is reviewed annually.
                </>
              )}
            </p>
          </section>

          <BulletSection id="benefits" title="Benefits" items={job.benefits} />

          <section aria-labelledby="about-company">
            <h2 id="about-company" className="text-base font-semibold text-ink">
              About {job.company.name}
            </h2>
            {company ? (
              <>
                <p className="mt-3 text-[15px] leading-relaxed text-ink-secondary">
                  {company.description}
                </p>
                <ButtonLink
                  href={`/companies/${company.slug}`}
                  variant="secondary"
                  size="sm"
                  className="mt-4"
                >
                  View company profile
                  <Icon name="arrowRight" size={14} />
                </ButtonLink>
              </>
            ) : (
              <p className="mt-3 text-[15px] leading-relaxed text-ink-secondary">
                {job.company.name} is a {job.company.industry.toLowerCase()} company based in{' '}
                {job.company.headquarters}.
              </p>
            )}
          </section>

          <section aria-labelledby="application-info">
            <h2 id="application-info" className="text-base font-semibold text-ink">
              Application information
            </h2>
            <dl className="mt-3 space-y-2.5 text-[15px] leading-relaxed text-ink-secondary">
              <div className="flex gap-2.5">
                <Icon name="send" size={15} className="mt-1 shrink-0 text-brand-600" />
                <div>
                  <dt className="inline font-medium text-ink">How to apply: </dt>
                  <dd className="inline">
                    Submit your details through the apply button on this page. You do not need
                    an account.
                  </dd>
                </div>
              </div>
              <div className="flex gap-2.5">
                <Icon name="users" size={15} className="mt-1 shrink-0 text-brand-600" />
                <div>
                  <dt className="inline font-medium text-ink">Who reviews it: </dt>
                  <dd className="inline">
                    {job.hiringManager} and the hiring team at {job.company.name}.
                  </dd>
                </div>
              </div>
              <div className="flex gap-2.5">
                <Icon name="calendar" size={15} className="mt-1 shrink-0 text-brand-600" />
                <div>
                  <dt className="inline font-medium text-ink">Closing date: </dt>
                  <dd className="inline">{formatDate(job.expiresAt)}</dd>
                </div>
              </div>
            </dl>
          </section>
        </Card>
      </div>

      <aside className="space-y-4 lg:sticky lg:top-20">
        <Card className="p-5">
          <h2 className="text-sm font-semibold text-ink">Role at a glance</h2>
          <dl className="mt-3.5 space-y-3">
            <FactRow label="Seniority" value={EXPERIENCE_LEVEL_LABELS[job.experienceLevel]} />
            <FactRow label="Contract" value={EMPLOYMENT_TYPE_LABELS[job.employmentType]} />
            <FactRow label="Arrangement" value={WORK_MODE_LABELS[job.workMode]} />
            <FactRow label="Applicants" value={formatCompactNumber(job.applicantCount)} />
            <FactRow label="Closes" value={formatDate(job.expiresAt)} />
          </dl>
        </Card>

        <Card className="p-5">
          <h2 className="text-sm font-semibold text-ink">About the employer</h2>
          <Link
            href={`/companies/${job.company.slug}`}
            className="mt-3.5 flex items-center gap-3 rounded-lg p-2 -mx-2 transition-colors hover:bg-sunken"
          >
            <Avatar name={job.company.name} hue={job.company.brandHue} size="sm" />
            <span className="min-w-0">
              <span className="block truncate text-sm font-medium text-ink">
                {job.company.name}
              </span>
              <span className="block truncate text-xs text-ink-muted">
                {job.company.industry}
              </span>
            </span>
          </Link>
          <dl className="mt-3 space-y-3 border-t border-line pt-3">
            <FactRow label="Headquarters" value={job.company.headquarters} />
            <FactRow label="Team size" value={formatEmployeeCount(job.company.employeeCount)} />
            {company ? <FactRow label="Open roles" value={String(company.openRoles)} /> : null}
          </dl>
        </Card>

        <Card className="p-5">
          <h2 className="text-sm font-semibold text-ink">Skills</h2>
          <ul className="mt-3 flex flex-wrap gap-1.5">
            {job.tags.map((tag) => (
              <li key={tag}>
                <Link href={`/jobs?q=${encodeURIComponent(tag)}`}>
                  <Badge tone="neutral" className="transition-colors hover:bg-brand-50 hover:text-brand-700">
                    {tag}
                  </Badge>
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      </aside>

      {/* Bottom bar on phones, where the header buttons have long scrolled away. */}
      <JobApplyActions job={job} variant="sticky" />
    </div>
  );
}
