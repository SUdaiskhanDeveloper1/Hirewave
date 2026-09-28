'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useCallback, useMemo } from 'react';
import { ButtonLink } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Skeleton } from '@/components/ui/Skeleton';
import { Tabs } from '@/components/ui/Tabs';
import type { TabItem } from '@/components/ui/Tabs';
import { useApplications } from '@/hooks/use-candidate';
import { APPLICATION_STATUSES } from '@/types/domain';
import type { ApplicationStatus } from '@/types/domain';
import { ApplicationCard, APPLICATION_STATUS_LABELS } from './ApplicationCard';

type StatusFilter = ApplicationStatus | 'all';

const EMPTY_COPY: Record<StatusFilter, { readonly title: string; readonly description: string }> = {
  all: {
    title: 'No applications yet',
    description:
      'When you apply for a role it will appear here, along with where it has got to.',
  },
  submitted: {
    title: 'Nothing newly submitted',
    description: 'Applications you have just sent will show up here before a team picks them up.',
  },
  'under-review': {
    title: 'Nothing under review',
    description: 'Applications a hiring team is actively reading will appear here.',
  },
  interview: {
    title: 'No interviews scheduled',
    description: 'Once a team invites you to interview, the details will show here.',
  },
  offer: {
    title: 'No offers yet',
    description: 'Offers and their deadlines will be listed here when they arrive.',
  },
  rejected: {
    title: 'Nothing closed out',
    description: 'Applications that did not go forward are kept here for your records.',
  },
};

/**
 * Applications, filtered by stage.
 *
 * The filter lives in the URL so a particular view can be shared or bookmarked, and
 * so the dashboard can link straight to "Interviews". Counts on the tabs are computed
 * from the loaded list rather than fetched separately.
 */
export function ApplicationsList() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const serialized = searchParams.toString();

  const status = useMemo<StatusFilter>(() => {
    const raw = new URLSearchParams(serialized).get('status');
    return raw && (APPLICATION_STATUSES as readonly string[]).includes(raw)
      ? (raw as ApplicationStatus)
      : 'all';
  }, [serialized]);

  const setStatus = useCallback(
    (next: StatusFilter) => {
      const href = next === 'all' ? pathname : `${pathname}?status=${next}`;
      window.history.pushState(null, '', href);
    },
    [pathname],
  );

  const { data, isPending, isError, refetch } = useApplications();

  const counts = useMemo(() => {
    const map = new Map<StatusFilter, number>([['all', data?.length ?? 0]]);
    for (const applicationStatus of APPLICATION_STATUSES) {
      map.set(
        applicationStatus,
        data?.filter((application) => application.status === applicationStatus).length ?? 0,
      );
    }
    return map;
  }, [data]);

  const tabs: TabItem<StatusFilter>[] = [
    { value: 'all', label: 'All', count: counts.get('all') },
    ...APPLICATION_STATUSES.map((value) => ({
      value: value as StatusFilter,
      label: APPLICATION_STATUS_LABELS[value],
      count: counts.get(value),
    })),
  ];

  const visible =
    status === 'all'
      ? (data ?? [])
      : (data ?? []).filter((application) => application.status === status);

  return (
    <>
      <Tabs items={tabs} value={status} onChange={setStatus} label="Filter applications by stage" />

      <div className="mt-6">
        {isError ? (
          <ErrorState
            title="Could not load your applications"
            description="We could not reach the applications service. Nothing has been lost."
            onRetry={() => void refetch()}
          />
        ) : isPending ? (
          <ul className="grid gap-3" aria-hidden="true">
            {Array.from({ length: 4 }, (_, index) => (
              <li key={index}>
                <Skeleton className="h-[130px] rounded-card" />
              </li>
            ))}
          </ul>
        ) : visible.length === 0 ? (
          <EmptyState
            icon="send"
            title={EMPTY_COPY[status].title}
            description={EMPTY_COPY[status].description}
            action={<ButtonLink href="/jobs">Browse open jobs</ButtonLink>}
          />
        ) : (
          <ul className="grid gap-3">
            {visible.map((application) => (
              <li key={application.id}>
                <ApplicationCard application={application} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
