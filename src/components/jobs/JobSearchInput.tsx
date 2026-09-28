'use client';

import { useEffect, useRef, useState } from 'react';
import { Icon } from '@/components/ui/Icon';
import { useDebouncedCallback } from '@/hooks/use-debounced-value';

interface JobSearchInputProps {
  readonly value: string;
  readonly onSearch: (value: string) => void;
  readonly placeholder?: string;
}

const DEBOUNCE_MS = 280;

/**
 * Debounced search field.
 *
 * The input renders local state so typing is never gated on the network, while the
 * URL (and therefore the query key) is only written after the user pauses. That is
 * what keeps INP low and stops a five-letter word from firing five searches.
 */
export function JobSearchInput({
  value,
  onSearch,
  placeholder = 'Job title, skill or company',
}: JobSearchInputProps) {
  const [draft, setDraft] = useState(value);
  const isEditing = useRef(false);
  const commit = useDebouncedCallback(onSearch, DEBOUNCE_MS);

  // Adopt external changes (back button, cleared filters) without fighting the user
  // for control of the caret while they are typing.
  useEffect(() => {
    if (!isEditing.current) setDraft(value);
  }, [value]);

  return (
    <div className="relative">
      <Icon
        name="search"
        size={17}
        className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-ink-muted"
      />
      <input
        type="search"
        inputMode="search"
        value={draft}
        placeholder={placeholder}
        aria-label="Search jobs"
        enterKeyHint="search"
        onFocus={() => {
          isEditing.current = true;
        }}
        onBlur={() => {
          isEditing.current = false;
        }}
        onChange={(event) => {
          setDraft(event.target.value);
          commit(event.target.value);
        }}
        className="h-11 w-full rounded-lg bg-raised pl-10.5 pr-3 text-sm text-ink ring-1 ring-inset ring-line-strong placeholder:text-ink-muted focus:ring-2 focus:ring-brand-600"
      />
    </div>
  );
}
