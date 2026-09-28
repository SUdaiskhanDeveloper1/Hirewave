import Image from 'next/image';
import { cn } from '@/lib/utils/cn';

interface LogoMarkProps {
  readonly size?: number;
  readonly className?: string;
  /** Set on the one instance that is visible in the initial viewport. */
  readonly priority?: boolean;
}

/**
 * The brand mark: an H whose right upright is a figure with a raised arm, carried
 * through by a wave.
 *
 * Supplied as artwork rather than drawn in code, so it is used as-is. The source had
 * a baked-in white background, which would have shown as a white tile against the
 * dark navbar and in dark mode, so the delivered asset is a keyed version with a real
 * alpha channel. `favicon.ico` and `icon.png` are cut from the same artwork, so every
 * place the brand appears is the same mark.
 *
 * Explicit width and height mean the space is reserved before the image loads: the
 * logo can never shift the header.
 */
export function LogoMark({ size = 32, className, priority = false }: LogoMarkProps) {
  return (
    <Image
      src="/logo.webp"
      alt=""
      width={size}
      height={size}
      priority={priority}
      className={cn('shrink-0 object-contain', className)}
    />
  );
}

interface LogoProps {
  readonly className?: string;
  readonly size?: number;
  readonly priority?: boolean;
  /** Hides the wordmark, for places where the space only fits the mark. */
  readonly markOnly?: boolean;
}

export function Logo({ className, size = 32, priority = false, markOnly = false }: LogoProps) {
  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <LogoMark size={size} priority={priority} />
      {markOnly ? null : (
        null
        // <span className="text-[17px] font-semibold tracking-tight text-ink">HireWave</span>
      )}
    </span>
  );
}
