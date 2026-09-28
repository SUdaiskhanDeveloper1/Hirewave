import type { Metadata } from 'next';
import { CandidateProfileView } from '@/components/candidate/CandidateProfileView';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Your profile',
  description: 'The profile hiring teams see when you apply.',
  path: '/profile',
  noIndex: true,
});

export default function ProfilePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-ink">Your profile</h1>
        <p className="mt-1.5 text-sm text-ink-secondary">
          This is what a hiring team sees when you apply.
        </p>
      </header>

      <CandidateProfileView />
    </div>
  );
}
