import Link from 'next/link';
import { JsonLd } from '@/components/shared/JsonLd';
import { Icon } from '@/components/ui/Icon';
import { absoluteUrl } from '@/lib/seo';

export interface Crumb {
  readonly label: string;
  readonly href: string;
}

/**
 * Visible breadcrumbs plus the matching BreadcrumbList markup, so the trail Google
 * shows in results is the same one the user sees.
 */
export function Breadcrumbs({ crumbs }: { readonly crumbs: readonly Crumb[] }) {
  return (
    <>
      <nav aria-label="Breadcrumb">
        <ol className="flex flex-wrap items-center gap-1 text-sm text-ink-muted">
          {crumbs.map((crumb, index) => {
            const isLast = index === crumbs.length - 1;
            return (
              <li key={crumb.href} className="flex items-center gap-1">
                {index > 0 ? <Icon name="chevronRight" size={13} /> : null}
                {isLast ? (
                  <span aria-current="page" className="truncate text-ink-secondary">
                    {crumb.label}
                  </span>
                ) : (
                  <Link href={crumb.href} className="transition-colors hover:text-ink">
                    {crumb.label}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>

      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: crumbs.map((crumb, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: crumb.label,
            item: absoluteUrl(crumb.href),
          })),
        }}
      />
    </>
  );
}
