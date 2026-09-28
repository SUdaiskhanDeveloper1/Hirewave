import Link from 'next/link';
import { Avatar } from '@/components/ui/Avatar';
import { Icon } from '@/components/ui/Icon';
import { formatEmployeeCount } from '@/lib/utils/format';
import type { Company } from '@/types/domain';

export function CompanyCard({ company }: { readonly company: Company }) {
  return (
    <article className="group relative flex h-full flex-col rounded-card bg-raised p-5 shadow-card ring-1 ring-line transition-shadow hover:shadow-raised">
      <div className="flex items-start gap-3.5">
        <Avatar name={company.name} hue={company.brandHue} />
        <div className="min-w-0 flex-1">
          <h3 className="text-[15px] font-semibold text-ink">
            <Link href={`/companies/${company.slug}`} className="after:absolute after:inset-0">
              {company.name}
            </Link>
          </h3>
          <p className="mt-0.5 text-sm text-ink-muted">{company.industry}</p>
        </div>
      </div>

      <p className="mt-3.5 line-clamp-2 flex-1 text-sm leading-relaxed text-ink-secondary">
        {company.tagline}
      </p>

      <dl className="mt-4 flex items-center gap-4 border-t border-line pt-3.5 text-xs text-ink-secondary">
        <div className="flex items-center gap-1.5">
          <dt className="sr-only">Headquarters</dt>
          <Icon name="pin" size={13} className="text-ink-muted" />
          <dd className="truncate">{company.headquarters}</dd>
        </div>
        <div className="flex items-center gap-1.5">
          <dt className="sr-only">Team size</dt>
          <Icon name="users" size={13} className="text-ink-muted" />
          <dd>{formatEmployeeCount(company.employeeCount)}</dd>
        </div>
        <div className="ml-auto shrink-0 font-medium text-brand-600">
          {company.openRoles} open
        </div>
      </dl>
    </article>
  );
}
