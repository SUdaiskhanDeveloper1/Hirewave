import Link from 'next/link';
import type { IconName } from '@/components/ui/Icon';
import { Icon } from '@/components/ui/Icon';
import { jobsHref } from '@/lib/api/query-params';
import { JOB_CATEGORIES } from '@/lib/mock/categories';
import type { RoleFamily } from '@/types/domain';

interface CategoryGridProps {
  /** Open-role count per role family, so each tile shows a real number. */
  readonly countsByRole: ReadonlyMap<RoleFamily, number>;
  readonly totalRoles: number;
}

/**
 * Browse tiles. Each one is a prepared search rather than a separate page, so a
 * category link and a hand-built filter URL resolve to exactly the same results.
 */
export function CategoryGrid({ countsByRole, totalRoles }: CategoryGridProps) {
  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {JOB_CATEGORIES.map((category) => {
        const count =
          category.roleFamilies.length === 0
            ? totalRoles
            : category.roleFamilies.reduce((sum, role) => sum + (countsByRole.get(role) ?? 0), 0);

        const href =
          category.roleFamilies.length === 0
            ? '/jobs'
            : jobsHref({ role: category.roleFamilies });

        return (
          <li key={category.slug}>
            <Link
              href={href}
              className="group flex h-full flex-col rounded-card bg-raised p-4 ring-1 ring-line transition-all hover:shadow-raised hover:ring-line-strong"
            >
              <span className="flex size-9 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                <Icon name={category.icon as IconName} size={17} />
              </span>
              <span className="mt-3 text-sm font-semibold text-ink">{category.name}</span>
              <span className="mt-1 line-clamp-2 flex-1 text-xs leading-relaxed text-ink-muted">
                {category.description}
              </span>
              <span className="mt-3 text-xs font-medium text-brand-600">
                {count} {count === 1 ? 'open role' : 'open roles'}
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
