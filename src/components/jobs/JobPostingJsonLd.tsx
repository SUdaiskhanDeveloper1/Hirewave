import { JsonLd } from '@/components/shared/JsonLd';
import { absoluteUrl } from '@/lib/seo';
import type { EmploymentType, Job } from '@/types/domain';

const SCHEMA_EMPLOYMENT_TYPE: Record<EmploymentType, string> = {
  'full-time': 'FULL_TIME',
  'part-time': 'PART_TIME',
  contract: 'CONTRACTOR',
  internship: 'INTERN',
};

/**
 * schema.org JobPosting markup.
 *
 * This is what makes a posting eligible for Google Jobs. It is emitted from the
 * server render, so it is present in the initial HTML for crawlers that do not
 * execute JavaScript.
 */
export function JobPostingJsonLd({ job }: { readonly job: Job }) {
  const isRemote = job.workMode === 'remote';

  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'JobPosting',
        title: job.title,
        description: [...job.description, ...job.responsibilities].join(' '),
        identifier: {
          '@type': 'PropertyValue',
          name: job.company.name,
          value: job.id,
        },
        datePosted: job.postedAt,
        validThrough: job.expiresAt,
        employmentType: SCHEMA_EMPLOYMENT_TYPE[job.employmentType],
        hiringOrganization: {
          '@type': 'Organization',
          name: job.company.name,
          sameAs: absoluteUrl(`/companies/${job.company.slug}`),
        },
        ...(isRemote
          ? {
              jobLocationType: 'TELECOMMUTE',
              applicantLocationRequirements: {
                '@type': 'Country',
                name: job.location.replace(/^Remote - /, ''),
              },
            }
          : {
              jobLocation: {
                '@type': 'Place',
                address: {
                  '@type': 'PostalAddress',
                  addressLocality: job.location,
                },
              },
            }),
        // Omitted entirely when the employer published no range. Emitting a guessed
        // or zero band would be structured-data spam, and Google treats an incorrect
        // baseSalary as a reason to drop the posting from job results.
        ...(job.salary === null
          ? {}
          : {
              baseSalary: {
                '@type': 'MonetaryAmount',
                currency: job.salary.currency,
                value: {
                  '@type': 'QuantitativeValue',
                  minValue: job.salary.min,
                  maxValue: job.salary.max,
                  unitText: 'YEAR',
                },
              },
            }),
        directApply: false,
        url: absoluteUrl(`/jobs/${job.slug}`),
      }}
    />
  );
}
