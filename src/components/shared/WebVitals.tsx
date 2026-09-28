'use client';

import { useReportWebVitals } from 'next/web-vitals';

/**
 * Development-only Core Web Vitals logging.
 *
 * In production this component is not rendered at all, so the reporting hook and its
 * `web-vitals` payload never reach real users. Swap the console call for a beacon to
 * an analytics endpoint when you want field data.
 */
export function WebVitals() {
  useReportWebVitals((metric) => {
    // CLS is a unitless score, the rest are milliseconds.
    const formatted =
      metric.name === 'CLS' ? metric.value.toFixed(3) : `${Math.round(metric.value)}ms`;

    // eslint-disable-next-line no-console
    console.info(`[web-vital] ${metric.name}: ${formatted} (${metric.rating})`);
  });

  return null;
}
