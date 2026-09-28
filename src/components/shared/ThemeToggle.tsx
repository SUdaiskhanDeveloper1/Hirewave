'use client';

import { useSyncExternalStore } from 'react';
import { Icon } from '@/components/ui/Icon';
import { THEME_STORAGE_KEY, type Theme } from '@/lib/theme';

const listeners = new Set<() => void>();

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getTheme(): Theme {
  return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
}

// The server cannot know the saved choice; the label settles right after hydration.
function getServerTheme(): Theme | null {
  return null;
}

function setTheme(theme: Theme): void {
  document.documentElement.dataset.theme = theme;
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Private mode or disabled storage: the switch still applies for this visit.
  }
  listeners.forEach((listener) => listener());
}

/**
 * Switches between light and night mode. Which icon shows is decided by CSS from
 * `data-theme`, so the button is correct on first paint with no hydration mismatch.
 */
export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, getTheme, getServerTheme);
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={() => setTheme(getTheme() === 'dark' ? 'light' : 'dark')}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to night mode'}
      title={isDark ? 'Light mode' : 'Night mode'}
      className="inline-flex size-9 items-center justify-center rounded-lg text-ink-secondary transition-colors hover:bg-sunken hover:text-ink"
    >
      <Icon name="moon" size={17} className="dark:hidden" />
      <Icon name="sun" size={17} className="hidden dark:block" />
    </button>
  );
}
