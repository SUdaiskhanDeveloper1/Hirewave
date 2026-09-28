'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils/cn';
import { CANDIDATE_LINKS, isActivePath } from './nav-links';

/** Desktop navigation. Client-side only because it needs the current path. */
export function HeaderNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Main" className="flex items-center gap-0.5">
      {CANDIDATE_LINKS.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          aria-current={isActivePath(pathname, link.href) ? 'page' : undefined}
          className={cn(
            'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
            isActivePath(pathname, link.href)
              ? 'bg-sunken text-ink'
              : 'text-ink-secondary hover:bg-sunken hover:text-ink',
          )}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
