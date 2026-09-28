import type { Metadata } from 'next';
import { JobPostWizard } from '@/components/recruiter/post-job/JobPostWizard';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Post a job',
  description: 'Create a job posting: details, description, compensation and preview.',
  path: '/recruiter/jobs/new',
  noIndex: true,
});

export default function NewJobPage() {
  return (
    <>
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-ink">Post a job</h2>
        <p className="mt-0.5 text-sm text-ink-secondary">
          Eight short steps. You can go back and change anything before saving.
        </p>
      </div>

      <JobPostWizard />
    </>
  );
}
