import { cn } from '@/lib/utils/cn';
import type { JobSummary } from '@/types/domain';
import { JobCard } from './JobCard';

interface JobListProps {
  readonly jobs: readonly JobSummary[];
  /** Dims the list while a new page or filter is loading, without unmounting it. */
  readonly isRefreshing?: boolean;
  readonly className?: string;
}

export function JobList({ jobs, isRefreshing = false, className }: JobListProps) {
  return (
    <ul
      className={cn(
        'cv-auto grid gap-3 transition-opacity duration-150',
        isRefreshing && 'opacity-55',
        className,
      )}
      // Announce result changes without stealing focus.
      aria-busy={isRefreshing}
    >
      {jobs.map((job) => (
        // Keyed by the stable domain id, never by index: reordering a filtered list
        // must not remount cards (which would reset the save button transitions).
        <li key={job.id}>
          <JobCard job={job} />
        </li>
      ))}
    </ul>
  );
}
