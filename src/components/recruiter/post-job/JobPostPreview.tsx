import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Icon } from '@/components/ui/Icon';
import type { JobDraftInput } from '@/lib/api/employer';
import { EMPLOYMENT_TYPE_LABELS, EXPERIENCE_LEVEL_LABELS, WORK_MODE_LABELS } from '@/lib/labels';
import { formatSalaryRange } from '@/lib/utils/format';
import type { EmploymentType, ExperienceLevel, WorkMode } from '@/types/domain';
import { toLines } from './wizard-steps';

/**
 * Renders the draft the way the public posting will look.
 *
 * Uses the same tokens, badges and section order as the real job page, so the preview
 * is a genuine check rather than a differently-styled summary.
 */
export function JobPostPreview({ draft }: { readonly draft: JobDraftInput }) {
  const responsibilities = toLines(draft.responsibilities);
  const requirements = toLines(draft.requirements);
  const benefits = toLines(draft.benefits);

  const min = Number(draft.salaryMin);
  const max = Number(draft.salaryMax);
  const hasSalary = Number.isFinite(min) && Number.isFinite(max) && min > 0 && max > 0;

  return (
    <div className="rounded-card bg-canvas p-5 ring-1 ring-line sm:p-6">
      <div className="flex items-start gap-3.5">
        <Avatar name="Your Company" hue={259} />
        <div className="min-w-0 flex-1">
          <h3 className="text-xl font-semibold tracking-tight text-ink">
            {draft.title || 'Untitled role'}
          </h3>
          <p className="mt-1 text-sm text-ink-secondary">
            Your Company<span className="text-ink-muted"> · Preview</span>
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-ink-secondary">
            <span className="flex items-center gap-1.5">
              <Icon name="pin" size={14} className="text-ink-muted" />
              {draft.location || 'Location not set'}
            </span>
            <span className="flex items-center gap-1.5">
              <Icon name="globe" size={14} className="text-ink-muted" />
              {WORK_MODE_LABELS[draft.workMode as WorkMode]}
            </span>
            <span className="flex items-center gap-1.5">
              <Icon name="briefcase" size={14} className="text-ink-muted" />
              {EMPLOYMENT_TYPE_LABELS[draft.employmentType as EmploymentType]}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5">
        <Badge tone="outline">
          {EXPERIENCE_LEVEL_LABELS[draft.experienceLevel as ExperienceLevel]}
        </Badge>
      </div>

      {hasSalary ? (
        <div className="mt-4 rounded-lg bg-sunken px-4 py-3">
          <p className="text-xs font-semibold tracking-wide text-ink-muted uppercase">
            Base salary
          </p>
          <p className="mt-0.5 text-lg font-semibold text-ink">
            {formatSalaryRange(min, max)}
            <span className="ml-1.5 text-sm font-normal text-ink-secondary">per year</span>
          </p>
        </div>
      ) : null}

      <section className="mt-6">
        <h4 className="text-base font-semibold text-ink">About the role</h4>
        <p className="mt-2 text-[15px] leading-relaxed whitespace-pre-line text-ink-secondary">
          {draft.description || 'No description written yet.'}
        </p>
      </section>

      {[
        { title: 'Responsibilities', items: responsibilities },
        { title: 'Requirements', items: requirements },
        { title: 'Benefits', items: benefits },
      ]
        .filter((section) => section.items.length > 0)
        .map((section) => (
          <section key={section.title} className="mt-6">
            <h4 className="text-base font-semibold text-ink">{section.title}</h4>
            <ul className="mt-2 space-y-2">
              {section.items.map((item) => (
                <li
                  key={item}
                  className="flex gap-2.5 text-[15px] leading-relaxed text-ink-secondary"
                >
                  <Icon name="check" size={15} className="mt-1 shrink-0 text-brand-600" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>
        ))}

      {draft.applyEmail ? (
        <section className="mt-6 border-t border-line pt-4">
          <h4 className="text-base font-semibold text-ink">How to apply</h4>
          <p className="mt-2 text-[15px] text-ink-secondary">
            Applications are sent to{' '}
            <span className="font-medium text-ink">{draft.applyEmail}</span>.
          </p>
        </section>
      ) : null}
    </div>
  );
}
