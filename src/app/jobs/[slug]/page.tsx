import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { JobCard } from '@/components/jobs/JobCard';
import { JobDetail } from '@/components/jobs/JobDetail';
import { JobPostingJsonLd } from '@/components/jobs/JobPostingJsonLd';
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';
import { ROLE_LABELS } from '@/lib/labels';
import { buildMetadata } from '@/lib/seo';
import { getCompany, getJob, getJobSlugs, getSimilarJobs } from '@/lib/server/queries';
import { formatSalary } from '@/lib/utils/format';

interface JobPageProps {
  readonly params: Promise<{ readonly slug: string }>;
}

/**
 * Every posting is prerendered at build time and refreshed every five minutes.
 * A crawler (or a user arriving from search) gets a static HTML document from the
 * edge: no server work, no database, no client fetch before the content is readable.
 */
export const revalidate = 300;

/** Slugs published after the build are rendered on first request, then cached. */
export const dynamicParams = true;

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  return (await getJobSlugs()).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: JobPageProps): Promise<Metadata> {
  const { slug } = await params;
  const response = await getJob(slug);

  if (!response) {
    return buildMetadata({
      title: 'Job not found',
      description: 'This job posting is no longer available.',
      path: `/jobs/${slug}`,
      noIndex: true,
    });
  }

  const job = response.data;

  return buildMetadata({
    title: `${job.title} at ${job.company.name}`,
    description:
      `${job.company.name} is hiring a ${job.title} (${job.location}). ` +
      `${formatSalary(job.salary)}. ${job.excerpt}`,
    path: `/jobs/${job.slug}`,
    type: 'article',
    publishedTime: job.postedAt,
  });
}

export default async function JobPage({ params }: JobPageProps) {
  const { slug } = await params;
  const response = await getJob(slug);

  if (!response) notFound();

  const job = response.data;
  // Independent lookups: run them together rather than in series.
  const [similar, companyResponse] = await Promise.all([
    getSimilarJobs(job, 4),
    getCompany(job.company.slug),
  ]);
  const company = companyResponse?.data ?? null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-5">
        <Breadcrumbs
          crumbs={[
            { label: 'Jobs', href: '/jobs' },
            { label: ROLE_LABELS[job.roleFamily], href: `/jobs?role=${job.roleFamily}` },
            { label: job.title, href: `/jobs/${job.slug}` },
          ]}
        />
      </div>

      <JobDetail job={job} company={company} />

      {similar.length > 0 ? (
        <section className="cv-auto mt-12">
          <h2 className="text-xl font-semibold tracking-tight text-ink">
            Similar {ROLE_LABELS[job.roleFamily].toLowerCase()} roles
          </h2>
          <ul className="mt-5 grid gap-3 lg:grid-cols-2">
            {similar.map((similarJob) => (
              <li key={similarJob.id}>
                <JobCard job={similarJob} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <JobPostingJsonLd job={job} />
    </div>
  );
}
