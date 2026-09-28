/**
 * Generates a tiny inline blur placeholder from a brand hue.
 *
 * Cheaper than shipping real LQIP bitmaps: a few hundred bytes of SVG, computed at
 * render time, that gives `next/image` something to paint immediately. Combined with
 * a fixed aspect ratio it means a cover image can never shift the layout.
 */
export function blurDataUrl(hue: number): string {
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="6">` +
    `<rect width="16" height="6" fill="hsl(${hue} 30% 82%)"/>` +
    `<rect width="9" height="6" fill="hsl(${(hue + 40) % 360} 34% 74%)"/>` +
    `</svg>`;

  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}
