import Link from 'next/link';
import { HeaderNav } from '@/components/shared/HeaderNav';
import { MobileNav } from '@/components/shared/MobileNav';
import { SavedJobsCounter } from '@/components/shared/SavedJobsCounter';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { ButtonLink } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Logo } from '@/components/ui/Logo';

/**
 * Application header. A Server Component with three small client leaves: the desktop
 * nav and the mobile menu (both need the current path) and the saved-jobs counter,
 * which reads the same cache entry the save buttons write to.
 */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-canvas/90 backdrop-blur-md">
      <div className="relative mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6 lg:px-8">
        <Link href="/" aria-label="HireWave home" className="shrink-0">
          <Logo priority />
        </Link>

        <div className="ml-2 hidden md:block">
          <HeaderNav />
        </div>

        <div className="ml-auto flex items-center gap-1.5">
          <ThemeToggle />
          <SavedJobsCounter />
          <ButtonLink
            href="/recruiter/jobs/new"
            variant="primary"
            size="sm"
            className="hidden sm:inline-flex"
          >
            <Icon name="plus" size={14} />
            Post a job
          </ButtonLink>
          <div className="md:hidden">
            <MobileNav />
          </div>
        </div>
      </div>
    </header>
  );
}
