import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { JobCard } from '@/components/jobs/JobCard';
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';
import { JsonLd } from '@/components/shared/JsonLd';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Icon } from '@/components/ui/Icon';
import { absoluteUrl, buildMetadata } from '@/lib/seo';
import { getCompany, getCompanyJobs, getCompanySlugs } from '@/lib/server/queries';
import { blurDataUrl } from '@/lib/utils/blur';
import { formatEmployeeCount } from '@/lib/utils/format';

interface CompanyPageProps {
  readonly params: Promise<{ readonly slug: string }>;
}

export const revalidate = 3600;

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  return (await getCompanySlugs()).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: CompanyPageProps): Promise<Metadata> {
  const { slug } = await params;
  const response = await getCompany(slug);

  if (!response) {
    return buildMetadata({
      title: 'Company not found',
      description: 'This company profile is no longer available.',
      path: `/companies/${slug}`,
      noIndex: true,
    });
  }

  const company = response.data;

  return buildMetadata({
    title: `${company.name} careers`,
    description: `${company.tagline} ${company.openRoles} open roles at ${company.name}, based in ${company.headquarters}.`,
    path: `/companies/${company.slug}`,
  });
}

export default async function CompanyPage({ params }: CompanyPageProps) {
  const { slug } = await params;
  const response = await getCompany(slug);

  if (!response) notFound();

  const company = response.data;
  const jobs = await getCompanyJobs(company.slug, 8);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-5">
        <Breadcrumbs
          crumbs={[
            { label: 'Companies', href: '/companies' },
            { label: company.name, href: `/companies/${company.slug}` },
          ]}
        />
      </div>

      <Card className="overflow-hidden">
        {/*
          The one genuinely photographic asset in the app, and the LCP element of this
          route. `priority` preloads it, `sizes` stops a phone downloading a desktop
          bitmap, the fixed aspect ratio reserves the space before it arrives, and the
          generated blur placeholder paints immediately. AVIF/WebP conversion is
          handled by the image optimiser configured in next.config.ts.
        */}
        <div className="relative aspect-[1280/300] w-full bg-sunken sm:aspect-[1280/240]">
          <Image
            src={company.coverImageUrl}
            alt=""
            fill
            priority
            placeholder="blur"
            blurDataURL={blurDataUrl(company.brandHue)}
            sizes="100vw"
            className="object-cover"
          />
        </div>

        <div className="p-5 sm:p-7">
          <div className="flex flex-wrap items-start gap-4">
            <Avatar name={company.name} hue={company.brandHue} size="lg" />
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl font-semibold tracking-tight text-ink">{company.name}</h1>
              <p className="mt-1 text-[15px] text-ink-secondary">{company.tagline}</p>
            </div>
            <Badge tone="brand">{company.openRoles} open roles</Badge>
          </div>

          <p className="mt-5 max-w-3xl text-[15px] leading-relaxed text-ink-secondary">
            {company.description}
          </p>

          <dl className="mt-6 grid gap-4 border-t border-line pt-5 sm:grid-cols-4">
            <div>
              <dt className="text-xs font-semibold tracking-wide text-ink-muted uppercase">
                Industry
              </dt>
              <dd className="mt-1 text-sm font-medium text-ink">{company.industry}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold tracking-wide text-ink-muted uppercase">
                Headquarters
              </dt>
              <dd className="mt-1 text-sm font-medium text-ink">{company.headquarters}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold tracking-wide text-ink-muted uppercase">
                Team size
              </dt>
              <dd className="mt-1 text-sm font-medium text-ink">
                {formatEmployeeCount(company.employeeCount)}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold tracking-wide text-ink-muted uppercase">
                Founded
              </dt>
              <dd className="mt-1 text-sm font-medium text-ink">{company.foundedYear}</dd>
            </div>
          </dl>

          <ul className="mt-5 flex flex-wrap gap-1.5">
            {company.benefits.map((benefit) => (
              <li key={benefit}>
                <Badge tone="outline">
                  <Icon name="check" size={11} />
                  {benefit}
                </Badge>
              </li>
            ))}
          </ul>
        </div>
      </Card>

      <section className="cv-auto mt-10">
        <h2 className="text-xl font-semibold tracking-tight text-ink">
          Open roles at {company.name}
        </h2>
        {jobs.length > 0 ? (
          <ul className="mt-5 grid gap-3 lg:grid-cols-2">
            {jobs.map((job) => (
              <li key={job.id}>
                <JobCard job={job} />
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-5">
            <EmptyState
              icon="briefcase"
              title="No open roles right now"
              description="This company is not hiring at the moment. Check back soon."
            />
          </div>
        )}
      </section>

      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: company.name,
          description: company.tagline,
          url: absoluteUrl(`/companies/${company.slug}`),
          foundingDate: String(company.foundedYear),
          numberOfEmployees: {
            '@type': 'QuantitativeValue',
            value: company.employeeCount,
          },
          address: {
            '@type': 'PostalAddress',
            addressLocality: company.headquarters,
          },
        }}
      />
    </div>
  );
}
