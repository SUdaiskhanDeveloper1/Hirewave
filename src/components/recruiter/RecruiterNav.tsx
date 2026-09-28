'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils/cn';

const TABS = [
  { href: '/recruiter', label: 'Overview', exact: true },
  { href: '/recruiter/jobs', label: 'Job postings', exact: false },
  { href: '/recruiter/applicants', label: 'Candidates', exact: false },
] as const;

export function RecruiterNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Employer sections" className="no-scrollbar flex gap-1 overflow-x-auto border-b border-line">
      {TABS.map((tab) => {
        const isActive = tab.exact ? pathname === tab.href : pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={isActive ? 'page' : undefined}
            className={cn(
              '-mb-px shrink-0 border-b-2 px-3 py-2.5 text-sm font-medium whitespace-nowrap transition-colors',
              isActive
                ? 'border-brand-600 text-ink'
                : 'border-transparent text-ink-secondary hover:text-ink',
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
