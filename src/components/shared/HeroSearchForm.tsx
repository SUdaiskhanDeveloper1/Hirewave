import { Icon } from '@/components/ui/Icon';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { WORK_MODE_LABELS } from '@/lib/labels';
import { WORK_MODES } from '@/types/domain';

/**
 * Homepage search.
 *
 * A plain GET form pointed at /jobs, so the landing page's primary action needs no
 * JavaScript and works before hydration. The field names match the search query
 * parameters exactly, which means the browser's own navigation produces a valid,
 * shareable results URL: /jobs?q=react&location=London&mode=remote
 *
 * The richer debounced search lives on the results page, where it is actually needed.
 */
export function HeroSearchForm() {
  return (
    <form
      action="/jobs"
      method="get"
      role="search"
      aria-label="Search jobs"
      className="mt-7 w-full max-w-3xl rounded-card bg-raised p-2 shadow-raised ring-1 ring-line"
    >
      <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
        <div className="relative flex-1 lg:border-r lg:border-line">
          <label htmlFor="hero-keyword" className="sr-only">
            Job title, skill or company
          </label>
          <Icon
            name="search"
            size={18}
            className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-ink-muted"
          />
          <Input
            id="hero-keyword"
            name="q"
            type="search"
            inputSize="lg"
            hasLeadingIcon
            bare
            placeholder="Job title, skill or company"
          />
        </div>

        <div className="relative flex-1 lg:border-r lg:border-line">
          <label htmlFor="hero-location" className="sr-only">
            Location
          </label>
          <Icon
            name="pin"
            size={18}
            className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-ink-muted"
          />
          <Input
            id="hero-location"
            name="location"
            type="text"
            inputSize="lg"
            hasLeadingIcon
            bare
            placeholder="City or country"
          />
        </div>

        <div className="lg:w-44">
          <label htmlFor="hero-mode" className="sr-only">
            Work arrangement
          </label>
          <Select
            id="hero-mode"
            name="mode"
            selectSize="lg"
            defaultValue=""
            bare
          >
            <option value="">Any arrangement</option>
            {WORK_MODES.map((mode) => (
              <option key={mode} value={mode}>
                {WORK_MODE_LABELS[mode]}
              </option>
            ))}
          </Select>
        </div>

        <button
          type="submit"
          className="h-12 shrink-0 rounded-lg bg-brand-600 px-7 text-[15px] font-semibold text-white transition-colors hover:bg-brand-700 focus-visible:outline-offset-4"
        >
          Search jobs
        </button>
      </div>
    </form>
  );
}
