import { cn } from '@/lib/utils/cn';
import { initials } from '@/lib/utils/format';

interface AvatarProps {
  readonly name: string;
  /** Deterministic hue from the domain model, so colours never change between renders. */
  readonly hue: number;
  readonly size?: 'sm' | 'md' | 'lg';
  readonly className?: string;
}

const SIZES = {
  sm: 'size-8 text-[11px]',
  md: 'size-11 text-sm',
  lg: 'size-14 text-base',
} as const;

/**
 * Monogram avatar.
 *
 * Company and candidate marks are drawn with CSS rather than fetched as images: no
 * request, no decode, no layout shift, and identical output on the server.
 */
export function Avatar({ name, hue, size = 'md', className }: AvatarProps) {
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-xl font-semibold tracking-tight',
        'ring-1 ring-inset ring-black/5 dark:ring-white/10',
        SIZES[size],
        className,
      )}
      style={{
        backgroundColor: `oklch(0.93 0.05 ${hue})`,
        color: `oklch(0.42 0.16 ${hue})`,
      }}
      aria-hidden="true"
    >
      {initials(name)}
    </span>
  );
}
