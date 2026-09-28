'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { buttonClass } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { cn } from '@/lib/utils/cn';
import { CANDIDATE_LINKS, EMPLOYER_LINKS, isActivePath } from './nav-links';

/**
 * Small-screen navigation.
 *
 * The previous build hid the nav below `md` with nothing in its place, so a phone
 * could only reach the logo. This is a disclosure panel rather than a full-screen
 * overlay: it keeps the page behind visible, needs no scroll locking, and closes
 * itself on navigation and on Escape.
 */
export function MobileNav() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const close = useCallback(() => setIsOpen(false), []);

  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };
    // A panel left open while the viewport grows would duplicate the desktop nav.
    const query = window.matchMedia('(min-width: 768px)');

    document.addEventListener('keydown', onKeyDown);
    query.addEventListener('change', close);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      query.removeEventListener('change', close);
    };
  }, [isOpen, close]);

  const itemClass = (active: boolean): string =>
    cn(
      'flex items-center justify-between rounded-lg px-3 py-2.5 text-[15px] font-medium transition-colors',
      active ? 'bg-brand-50 text-brand-700' : 'text-ink hover:bg-sunken',
    );

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        aria-controls="mobile-nav"
        aria-label={isOpen ? 'Close menu' : 'Open menu'}
        className="inline-flex size-9 items-center justify-center rounded-lg text-ink-secondary transition-colors hover:bg-sunken hover:text-ink"
      >
        <Icon name={isOpen ? 'close' : 'menu'} size={19} />
      </button>

      {isOpen ? (
        <div
          id="mobile-nav"
          className="animate-rise absolute inset-x-0 top-16 z-40 max-h-[calc(100dvh-4rem)] overflow-y-auto border-b border-line bg-raised shadow-raised"
        >
          <nav aria-label="Mobile" className="px-4 py-3 sm:px-6">
            <ul className="space-y-0.5">
              {CANDIDATE_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={close}
                    aria-current={isActivePath(pathname, link.href) ? 'page' : undefined}
                    className={itemClass(isActivePath(pathname, link.href))}
                  >
                    {link.label}
                    <Icon name="chevronRight" size={15} className="text-ink-muted" />
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/saved" onClick={close} className={itemClass(isActivePath(pathname, '/saved'))}>
                  Saved jobs
                  <Icon name="chevronRight" size={15} className="text-ink-muted" />
                </Link>
              </li>
              <li>
                <Link href="/profile" onClick={close} className={itemClass(isActivePath(pathname, '/profile'))}>
                  My profile
                  <Icon name="chevronRight" size={15} className="text-ink-muted" />
                </Link>
              </li>
            </ul>

            <p className="mt-3 border-t border-line px-3 pt-3 text-xs font-semibold tracking-wide text-ink-muted uppercase">
              For employers
            </p>
            <ul className="mt-1 space-y-0.5">
              {EMPLOYER_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} onClick={close} className={itemClass(isActivePath(pathname, link.href))}>
                    {link.label}
                    <Icon name="chevronRight" size={15} className="text-ink-muted" />
                  </Link>
                </li>
              ))}
            </ul>

            <Link
              href="/recruiter/jobs/new"
              onClick={close}
              className={buttonClass('primary', 'md', 'mt-3 mb-1 w-full')}
            >
              <Icon name="plus" size={15} />
              Post a job
            </Link>
          </nav>
        </div>
      ) : null}
    </>
  );
}
