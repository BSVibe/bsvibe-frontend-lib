/**
 * Next.js middleware factory. Wraps `next-intl/middleware` so products do not
 * have to import next-intl directly — they get a single, opinionated locale
 * router that already matches the BSVibe locale set + URL strategy.
 *
 * Usage in product `middleware.ts`:
 *
 *   import { createI18nMiddleware, defaultMatcher } from '@bsvibe/i18n/middleware';
 *   export default createI18nMiddleware();
 *   export const config = { matcher: defaultMatcher };
 */
import createIntlMiddleware from 'next-intl/middleware';

import { createI18nConfig, type CreateI18nConfigOptions } from './config';

export function createI18nMiddleware(opts: CreateI18nConfigOptions = {}) {
  const cfg = createI18nConfig(opts);
  return createIntlMiddleware({
    locales: [...cfg.locales],
    defaultLocale: cfg.defaultLocale,
    localePrefix: cfg.localePrefix,
  });
}

/**
 * Default route matcher: skip `api/`, Next.js internals (`_next`, `_vercel`),
 * any path with a file extension (e.g. `*.png`), and favicon. Leaves
 * everything else for the locale router.
 */
export const defaultMatcher = ['/((?!api|_next|_vercel|.*\\..*).*)'] as const;
