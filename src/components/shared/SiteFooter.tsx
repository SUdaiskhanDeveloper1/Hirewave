import Link from 'next/link';
import { Logo } from '@/components/ui/Logo';
import { isLiveData } from '@/lib/server/queries';

const COLUMNS = [
  {
    title: 'For candidates',
    links: [
      { href: '/jobs', label: 'Browse all jobs' },
      { href: '/jobs?mode=remote', label: 'Remote roles' },
      { href: '/companies', label: 'Company directory' },
      { href: '/saved', label: 'Saved jobs' },
      { href: '/applications', label: 'My applications' },
    ],
  },
  {
    title: 'For employers',
    links: [
      { href: '/recruiter/jobs/new', label: 'Post a job' },
      { href: '/recruiter', label: 'Employer dashboard' },
      { href: '/recruiter/jobs', label: 'Manage postings' },
      { href: '/recruiter/applicants', label: 'Candidate pipeline' },
    ],
  },
  {
    title: 'Browse by role',
    links: [
      { href: '/jobs?role=frontend', label: 'Frontend' },
      { href: '/jobs?role=backend', label: 'Backend' },
      { href: '/jobs?role=data', label: 'Data and ML' },
      { href: '/jobs?role=design', label: 'Design' },
      { href: '/jobs?role=product', label: 'Product' },
    ],
  },
] as const;

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-line bg-raised">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-[1.4fr_repeat(3,1fr)] lg:px-8">
        <div>
          <Logo />
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-ink-secondary">
            A job board for engineering, product and design teams. Search by role,
            location and work arrangement, and apply without an account.
          </p>
        </div>

        {COLUMNS.map((column) => (
          <div key={column.title}>
            <h2 className="text-xs font-semibold tracking-wide text-ink-muted uppercase">
              {column.title}
            </h2>
            <ul className="mt-3 space-y-2">
              {column.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-ink-secondary transition-colors hover:text-ink"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/*
        The disclaimer tracks the active data source. Saying "everything here is a
        fixture" while serving live postings would be as misleading as the reverse.
      */}
      <div className="border-t border-line px-4 py-6 text-center text-xs text-ink-muted sm:px-6 lg:px-8">
        {isLiveData ? (
          <>
            Job and company listings are live data from the JobDataLake API. The
            candidate and employer workspaces use demo data.
          </>
        ) : (
          <>
            Demonstration project. Companies, roles and candidates shown here are
            generated fixtures, not real organisations or people.
          </>
        )}
      </div>
    </footer>
  );
}
