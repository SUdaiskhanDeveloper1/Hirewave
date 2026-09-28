import type { SVGProps } from 'react';

/**
 * The complete icon set for the app: a hand-picked set of 24px paths.
 *
 * An icon package would add tens of kilobytes (often a component per glyph) for what
 * amounts to a few hundred bytes of path data. Most icons here are rendered by Server
 * Components, so the markup ships in the HTML and never enters the JS bundle at all.
 */
const PATHS = {
  search: 'M21 21l-4.35-4.35M17 11a6 6 0 1 1-12 0 6 6 0 0 1 12 0Z',
  pin: 'M12 21s-7-5.686-7-11a7 7 0 1 1 14 0c0 5.314-7 11-7 11Zm0-8.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z',
  briefcase:
    'M4 8h16a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1Zm5 0V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M3 13h18',
  bookmark: 'M6 4h12a1 1 0 0 1 1 1v15l-7-4-7 4V5a1 1 0 0 1 1-1Z',
  chevronRight: 'M9 6l6 6-6 6',
  chevronLeft: 'M15 6l-6 6 6 6',
  chevronDown: 'M6 9l6 6 6-6',
  check: 'M20 6L9 17l-5-5',
  close: 'M18 6L6 18M6 6l12 12',
  users:
    'M16 19v-1a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v1M9.5 10a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Zm11.5 9v-1a4 4 0 0 0-3-3.87M16 3.13A4 4 0 0 1 16 11',
  trending: 'M3 17l6-6 4 4 8-8m0 0h-5m5 0v5',
  filter: 'M4 6h16M7 12h10M10 18h4',
  sparkle: 'M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3Z',
  building:
    'M4 21V5a1 1 0 0 1 1-1h9a1 1 0 0 1 1 1v16M15 21V10h4a1 1 0 0 1 1 1v10M8 8h3M8 12h3M8 16h3',
  clock: 'M12 7v5l3 2m6-2a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
  menu: 'M4 7h16M4 12h16M4 17h16',
  info: 'M12 16v-4m0-4h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
  alert: 'M12 9v4m0 4h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z',
  arrowRight: 'M5 12h14m-6-6 6 6-6 6',
  external: 'M15 3h6v6M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6',
  calendar: 'M8 2v4m8-4v4M3 10h18M5 6h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Z',
  globe: 'M2 12h20M12 2a15 15 0 0 1 0 20 15 15 0 0 1 0-20Zm9 10a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
  plus: 'M12 5v14M5 12h14',
  edit: 'M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z',
  eye: 'M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Zm10 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z',
  send: 'M22 2 11 13M22 2l-7 20-4-9-9-4 20-7Z',
  star: 'M12 3.5l2.6 5.6 5.9.7-4.4 4.1 1.2 6-5.3-3-5.3 3 1.2-6L3.5 9.8l5.9-.7L12 3.5Z',
  layers: 'M12 3 3 8l9 5 9-5-9-5ZM3 16l9 5 9-5M3 12l9 5 9-5',
  upload: 'M12 16V4m0 0L8 8m4-4 4 4M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2',
  code: 'M8 6l-6 6 6 6m8-12 6 6-6 6',
  shield: 'M12 3l8 3v5.5c0 4.8-3.3 8.4-8 9.5-4.7-1.1-8-4.7-8-9.5V6l8-3Z',
  mail: 'm3 7 9 6 9-6M5 5h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z',
  sun: 'M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32 1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z',
  moon: 'M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z',
} as const;

export type IconName = keyof typeof PATHS;

interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'children'> {
  readonly name: IconName;
  readonly size?: number;
}

export function Icon({ name, size = 16, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <path d={PATHS[name]} />
    </svg>
  );
}
