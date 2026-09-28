import type { ReactNode } from 'react';
import { RecruiterNav } from '@/components/recruiter/RecruiterNav';

/**
 * Recruiter shell. Rendering the nav in a layout means moving between dashboard tabs
 * only re-renders the page segment, not the chrome around it.
 */
export default function RecruiterLayout({ children }: { readonly children: ReactNode }) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-5">
        <h1 className="text-2xl font-semibold tracking-tight text-ink">Employer workspace</h1>
        <p className="mt-1.5 text-sm text-ink-secondary">
          Post roles, track candidates and see how each posting is performing.
        </p>
      </header>
      <RecruiterNav />
      <div className="mt-6">{children}</div>
    </div>
  );
}
