import { ButtonLink } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';

export default function NotFound() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-24 sm:px-6 lg:px-8">
      <EmptyState
        icon="search"
        title="Page not found"
        description="The page you were looking for does not exist or has moved."
        action={<ButtonLink href="/">Back to home</ButtonLink>}
      />
    </div>
  );
}
