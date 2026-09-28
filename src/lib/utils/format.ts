/**
 * Display formatting.
 *
 * `Intl` formatters are expensive to construct, so each one is created once at module
 * scope and reused. Building them inside a render (which is where it usually happens)
 * shows up immediately in a long list.
 */

const salaryFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
  notation: 'compact',
});

const compactFormatter = new Intl.NumberFormat('en-US', {
  notation: 'compact',
  maximumFractionDigits: 1,
});

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
  timeZone: 'UTC',
});

const percentFormatter = new Intl.NumberFormat('en-US', {
  style: 'percent',
  maximumFractionDigits: 1,
});

export function formatSalaryRange(min: number, max: number): string {
  // Some postings publish a single figure rather than a band, and repeating it either
  // side of a dash reads as a formatting bug.
  if (min === max) return salaryFormatter.format(min);
  return `${salaryFormatter.format(min)} - ${salaryFormatter.format(max)}`;
}

export function formatCompactNumber(value: number): string {
  return compactFormatter.format(value);
}

export function formatDate(iso: string): string {
  return dateFormatter.format(new Date(iso));
}

export function formatPercent(value: number): string {
  return percentFormatter.format(value / 100);
}

const DAY_MS = 86_400_000;

/**
 * Day-precision relative label.
 *
 * Deliberately coarse: anything finer would differ between the server render and
 * hydration, and a job board gains nothing from "4 hours ago".
 */
export function formatRelativeDays(iso: string, now: number = Date.now()): string {
  const days = Math.max(0, Math.floor((now - new Date(iso).getTime()) / DAY_MS));
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 14) return 'Last week';
  if (days < 31) return `${Math.floor(days / 7)} weeks ago`;
  return `${Math.max(1, Math.floor(days / 30))} months ago`;
}

/** Initials for the monogram avatars, which cost zero network requests. */
export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((part) => part.charAt(0).toUpperCase()).join('');
}

export function formatEmployeeCount(count: number): string {
  if (count < 50) return '1-50';
  if (count < 250) return '50-250';
  if (count < 1000) return '250-1k';
  return `${compactFormatter.format(count)}+`;
}

/**
 * Salary for display, including the case a real feed hits constantly: no published
 * pay. Around 60% of live postings omit it, so this returns an honest label rather
 * than a fabricated range.
 */
export function formatSalary(salary: { min: number; max: number } | null): string {
  return salary === null ? 'Not disclosed' : formatSalaryRange(salary.min, salary.max);
}
