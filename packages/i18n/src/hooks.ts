/**
 * Hook wrappers around `next-intl`. Products use these instead of importing
 * `next-intl` directly so we can swap implementations later (e.g. add caching,
 * telemetry, or a custom missing-key reporter) without a coordinated bump.
 */
'use client';

import { useLocale, useTranslations } from 'next-intl';

import { resolveLocale, type Locale } from './config';

/**
 * Translation hook. `namespace` is the JSON top-level key (e.g. `common`,
 * `auth`, or a product namespace like `gateway`).
 */
export function useT(namespace: string) {
  return useTranslations(namespace);
}

/**
 * Current locale, narrowed to the BSVibe `Locale` union when possible. If the
 * runtime returns an unsupported value, we fall back to the default rather
 * than letting an unknown string leak into product code.
 */
export function useCurrentLocale(): Locale {
  const raw = useLocale();
  return resolveLocale(raw);
}
