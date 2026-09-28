import type { Metadata } from 'next';
import { Suspense } from 'react';
import { ApplicantPipeline } from '@/components/recruiter/ApplicantPipeline';
import { Skeleton } from '@/components/ui/Skeleton';
import { buildMetadata } from '@/lib/seo';

/**
 * Private workspace view: never indexed. The page is a static shell; all of the data
 * arrives through paginated client queries, because loading 1,400 candidate records
 * into the document would be the wrong trade in every direction.
 */
export const metadata: Metadata = buildMetadata({
  title: 'Candidate pipeline',
  description: 'Search, filter and triage candidates across every open role.',
  path: '/recruiter/applicants',
  noIndex: true,
});

export default function ApplicantsPage() {
  return (
    <>
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-ink">Candidates</h2>
        <p className="mt-0.5 text-sm text-ink-secondary">
          Everyone who has applied, across every posting.
        </p>
      </div>

      {/* The pipeline reads ?jobId from the URL, which suspends on a static render. */}
      <Suspense fallback={<Skeleton className="h-[600px] rounded-card" />}>
        <ApplicantPipeline />
      </Suspense>
    </>
  );
}
