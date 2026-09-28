import Link from 'next/link';
import type { ComponentProps, ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

const VARIANTS = {
  primary: 'bg-brand-600 text-white hover:bg-brand-700 active:bg-brand-700',
  secondary: 'bg-raised text-ink ring-1 ring-inset ring-line-strong hover:bg-sunken',
  ghost: 'bg-transparent text-ink-secondary hover:bg-sunken hover:text-ink',
  inverse: 'bg-inverse text-ink-inverse hover:opacity-90',
} as const;

const SIZES = {
  sm: 'h-8 gap-1.5 px-3 text-sm',
  md: 'h-10 gap-2 px-4 text-sm',
  lg: 'h-12 gap-2 px-6 text-base',
} as const;

export type ButtonVariant = keyof typeof VARIANTS;
export type ButtonSize = keyof typeof SIZES;

/**
 * Exported separately so Client Components can reuse the exact styling without
 * importing a component that would then have to live on the client too.
 */
export function buttonClass(
  variant: ButtonVariant = 'primary',
  size: ButtonSize = 'md',
  className?: string,
): string {
  return cn(
    'inline-flex items-center justify-center rounded-lg font-medium transition-colors',
    'disabled:pointer-events-none disabled:opacity-55',
    VARIANTS[variant],
    SIZES[size],
    className,
  );
}

interface ButtonProps extends Omit<ComponentProps<'button'>, 'className'> {
  readonly variant?: ButtonVariant;
  readonly size?: ButtonSize;
  readonly className?: string;
  readonly children: ReactNode;
}

export function Button({ variant, size, className, children, ...props }: ButtonProps) {
  return (
    <button className={buttonClass(variant, size, className)} {...props}>
      {children}
    </button>
  );
}

interface ButtonLinkProps extends Omit<ComponentProps<typeof Link>, 'className'> {
  readonly variant?: ButtonVariant;
  readonly size?: ButtonSize;
  readonly className?: string;
  readonly children: ReactNode;
}

export function ButtonLink({ variant, size, className, children, ...props }: ButtonLinkProps) {
  return (
    <Link className={buttonClass(variant, size, className)} {...props}>
      {children}
    </Link>
  );
}
