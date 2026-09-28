import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { formatCompactNumber } from '@/lib/utils/format';
import type { JobPerformance } from '@/types/domain';

/**
 * Server-rendered: this table is read-only and never changes after the page loads,
 * so it has no reason to be a Client Component or to cost any JavaScript.
 */
export function TopJobsTable({ jobs }: { readonly jobs: readonly JobPerformance[] }) {
  return (
    <Card className="overflow-hidden">
      <h2 className="border-b border-line px-5 py-3.5 text-sm font-semibold text-ink">
        Best performing postings
      </h2>
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-sunken text-xs font-semibold tracking-wide text-ink-muted uppercase">
            <th scope="col" className="px-5 py-2.5 text-left font-semibold">
              Role
            </th>
            <th scope="col" className="px-3 py-2.5 text-right font-semibold">
              Views
            </th>
            <th scope="col" className="px-3 py-2.5 text-right font-semibold">
              Applicants
            </th>
            <th scope="col" className="px-5 py-2.5 text-right font-semibold">
              Conversion
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {jobs.map((job) => (
            <tr key={job.jobId}>
              <td className="max-w-0 px-5 py-3">
                <Link
                  href={`/jobs/${job.slug}`}
                  className="block truncate font-medium text-ink transition-colors hover:text-brand-600"
                >
                  {job.title}
                </Link>
              </td>
              <td className="px-3 py-3 text-right text-ink-secondary tabular-nums">
                {formatCompactNumber(job.views)}
              </td>
              <td className="px-3 py-3 text-right text-ink-secondary tabular-nums">
                {job.applicants}
              </td>
              <td className="px-5 py-3 text-right font-medium text-ink tabular-nums">
                {job.conversionRate}%
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}
