import { EmptyState } from '@/components/ui/EmptyState';
import { ButtonLink } from '@/components/ui/Button';

export default function JobNotFound() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-20 sm:px-6 lg:px-8">
      <EmptyState
        icon="briefcase"
        title="This posting has closed"
        description="The role you are looking for is no longer listed. It may have been filled or withdrawn."
        action={<ButtonLink href="/jobs">Browse open roles</ButtonLink>}
      />
    </div>
  );
}
