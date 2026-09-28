import type { Metadata } from 'next';
import { CandidateDashboard } from '@/components/candidate/CandidateDashboard';
import { buildMetadata } from '@/lib/seo';

/**
 * Personal to the signed-in candidate, so it is a static shell with client-fetched
 * content and is kept out of the index.
 */
export const metadata: Metadata = buildMetadata({
  title: 'Your dashboard',
  description: 'Applications, recommendations and profile strength in one place.',
  path: '/dashboard',
  noIndex: true,
});

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <CandidateDashboard />
    </div>
  );
}
