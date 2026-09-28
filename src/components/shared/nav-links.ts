export interface NavItem {
  readonly href: string;
  readonly label: string;
}

/** Shared between the desktop nav and the mobile panel so the two cannot drift. */
export const CANDIDATE_LINKS: readonly NavItem[] = [
  { href: '/jobs', label: 'Find jobs' },
  { href: '/companies', label: 'Companies' },
  { href: '/dashboard', label: 'Dashboard' },
];

export const EMPLOYER_LINKS: readonly NavItem[] = [
  { href: '/recruiter', label: 'Employer dashboard' },
  { href: '/recruiter/jobs', label: 'Manage jobs' },
];

export function isActivePath(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}
