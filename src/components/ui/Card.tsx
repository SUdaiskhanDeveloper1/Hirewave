import type { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

interface CardProps {
  readonly children: ReactNode;
  readonly className?: string;
  readonly as?: 'div' | 'article' | 'section' | 'li';
}

export function Card({ children, className, as: Tag = 'div' }: CardProps) {
  return (
    <Tag className={cn('rounded-card bg-raised shadow-card ring-1 ring-line', className)}>
      {children}
    </Tag>
  );
}
