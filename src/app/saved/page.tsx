import type { Metadata } from 'next';
import { SavedJobsList } from '@/components/jobs/SavedJobsList';
import { buildMetadata } from '@/lib/seo';

/**
 * Personal, device-local content: nothing here belongs in a search index, and the
 * page is a static shell whose only dynamic part is a client component.
 */
export const metadata: Metadata = buildMetadata({
  title: 'Saved jobs',
  description: 'Roles you have saved on this device.',
  path: '/saved',
  noIndex: true,
});

export default function SavedJobsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-ink">Saved jobs</h1>
        <p className="mt-1.5 text-sm text-ink-secondary">
          Stored in this browser. Saving is optimistic, so the button responds before
          the write completes.
        </p>
      </header>

      <SavedJobsList />
    </div>
  );
}
