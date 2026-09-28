import Link from 'next/link';
import { JobCard } from '@/components/jobs/JobCard';
import { CategoryGrid } from '@/components/shared/CategoryGrid';
import { HeroSearchForm } from '@/components/shared/HeroSearchForm';
import { Avatar } from '@/components/ui/Avatar';
import { ButtonLink } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { jobsHref } from '@/lib/api/query-params';
import { POPULAR_SEARCHES } from '@/lib/mock/categories';
import { getFeaturedJobs, getJobFacets, getJobsPage, getTopCompanies } from '@/lib/server/queries';
import { formatEmployeeCount } from '@/lib/utils/format';
import type { RoleFamily } from '@/types/domain';

/**
 * Fully static. Nothing here depends on the request, so it is prerendered at build
 * time and revalidated hourly - the fastest first byte the platform can produce. The
 * LCP element is the headline, which is text and needs no network round trip.
 */
export const revalidate = 3600;

/** Section heading with an optional "see all" link. Used four times below. */
function SectionHeader({
  title,
  description,
  href,
  linkLabel,
}: {
  readonly title: string;
  readonly description: string;
  readonly href?: string;
  readonly linkLabel?: string;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 className="text-xl font-semibold tracking-tight text-ink">{title}</h2>
        <p className="mt-1 text-sm text-ink-secondary">{description}</p>
      </div>
      {href && linkLabel ? (
        <ButtonLink href={href} variant="secondary" size="sm">
          {linkLabel}
          <Icon name="arrowRight" size={14} />
        </ButtonLink>
      ) : null}
    </div>
  );
}

export default async function HomePage() {
  const featured = await getFeaturedJobs(6);
  const remote = await getJobsPage({ mode: ['remote'], perPage: 4, sort: 'newest' });
  const companies = await getTopCompanies(8);
  const facets = (await getJobFacets({})).data;

  const countsByRole = new Map<RoleFamily, number>(
    facets.roles.map((bucket) => [bucket.value, bucket.count]),
  );

  return (
    <>
      <section className="border-b border-line bg-raised">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-18 lg:px-8">
          {/*
            The LCP element: plain text in a system font. No webfont request, no hero
            image, nothing to preload.
          */}
          <h1 className="max-w-3xl text-[2.1rem] leading-[1.12] font-semibold tracking-tight text-ink sm:text-5xl">
            Find your next role
          </h1>
          <p className="mt-4 max-w-xl text-[17px] leading-relaxed text-ink-secondary">
            Search {facets.total} open positions in engineering, product and design.
            Filter by location, salary and work arrangement, then apply straight from
            the posting.
          </p>

          <HeroSearchForm />

          <div className="mt-6 flex flex-wrap items-center gap-x-2 gap-y-2">
            <span className="text-sm text-ink-muted">Popular searches:</span>
            {POPULAR_SEARCHES.map((term) => (
              <Link
                key={term}
                href={jobsHref({ q: term })}
                className="rounded-full bg-canvas px-3 py-1 text-sm text-ink-secondary ring-1 ring-inset ring-line transition-colors hover:text-ink hover:ring-line-strong"
              >
                {term}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <SectionHeader
          title="Browse by category"
          description="Jump straight to the roles you are qualified for."
        />
        <div className="mt-5">
          <CategoryGrid countsByRole={countsByRole} totalRoles={facets.total} />
        </div>
      </section>

      <section className="cv-auto mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
        <SectionHeader
          title="Featured roles"
          description="Postings from teams actively interviewing this week."
          href="/jobs"
          linkLabel="Browse all jobs"
        />
        <ul className="mt-5 grid gap-3 lg:grid-cols-2">
          {featured.map((job) => (
            <li key={job.id}>
              <JobCard job={job} />
            </li>
          ))}
        </ul>
      </section>

      <section className="cv-auto border-y border-line bg-raised">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <SectionHeader
            title="Remote roles"
            description="Positions you can do from anywhere, or from your region."
            href={jobsHref({ mode: ['remote'] })}
            linkLabel="All remote jobs"
          />
          <ul className="mt-5 grid gap-3 lg:grid-cols-2">
            {remote.data.map((job) => (
              <li key={job.id}>
                <JobCard job={job} />
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="cv-auto mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <SectionHeader
          title="Companies hiring"
          description="Teams with open positions on the board right now."
          href="/companies"
          linkLabel="All companies"
        />
        <ul className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {companies.map((company) => (
            <li key={company.id}>
              <Link
                href={`/companies/${company.slug}`}
                className="flex h-full flex-col rounded-card bg-raised p-4 ring-1 ring-line transition-shadow hover:shadow-raised"
              >
                <Avatar name={company.name} hue={company.brandHue} size="sm" />
                <span className="mt-3 truncate text-sm font-semibold text-ink">
                  {company.name}
                </span>
                <span className="mt-0.5 truncate text-xs text-ink-muted">{company.industry}</span>
                <span className="mt-3 flex items-center justify-between text-xs text-ink-secondary">
                  <span>{formatEmployeeCount(company.employeeCount)} staff</span>
                  <span className="font-medium text-brand-600">{company.openRoles} roles</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="cv-auto mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="rounded-card bg-inverse px-6 py-10 text-ink-inverse sm:px-10 sm:py-12">
          <div className="max-w-xl">
            <h2 className="text-2xl font-semibold tracking-tight">Hiring for your team?</h2>
            <p className="mt-3 text-[15px] leading-relaxed opacity-80">
              Post a role, track applicants through your pipeline, and see how each
              posting is performing - all from one dashboard.
            </p>
            <div className="mt-6 flex flex-wrap gap-2.5">
              <ButtonLink href="/recruiter/jobs/new" variant="secondary" size="md">
                <Icon name="plus" size={15} />
                Post a job
              </ButtonLink>
              <ButtonLink
                href="/recruiter"
                variant="ghost"
                size="md"
                className="text-ink-inverse hover:bg-white/10 hover:text-ink-inverse"
              >
                See the employer dashboard
                <Icon name="arrowRight" size={14} />
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
