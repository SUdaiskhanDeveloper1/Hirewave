import type { Metadata } from 'next';
import { EmployerJobList } from '@/components/recruiter/EmployerJobList';
import { ButtonLink } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Manage postings',
  description: 'Active, draft and closed job postings for your team.',
  path: '/recruiter/jobs',
  noIndex: true,
});

export default function EmployerJobsPage() {
  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-ink">Job postings</h2>
          <p className="mt-0.5 text-sm text-ink-secondary">
            Everything your team has published, drafted or closed.
          </p>
        </div>
        <ButtonLink href="/recruiter/jobs/new">
          <Icon name="plus" size={15} />
          Post a job
        </ButtonLink>
      </div>

      <EmployerJobList />
    </>
  );
}
