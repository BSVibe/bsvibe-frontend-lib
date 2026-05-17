/**
 * Next.js middleware factory. Wraps `next-intl/middleware` so products do not
 * have to import next-intl directly — they get a single, opinionated locale
 * router that already matches the BSVibe locale set + URL strategy, plus the
 * production redirect-loop guard below.
 *
 * Usage in product `middleware.ts`:
 *
 *   import { createI18nMiddleware, defaultMatcher } from '@bsvibe/i18n/middleware';
 *   export default createI18nMiddleware();
 *   export const config = { matcher: defaultMatcher };
 */
import createIntlMiddleware from 'next-intl/middleware';
import { NextResponse, type NextRequest } from 'next/server';

import { createI18nConfig, type CreateI18nConfigOptions } from './config';

/**
 * next-intl sets this request header on the internal `next()` rewrite
 * subrequest (`HEADER_LOCALE_NAME` in next-intl's `shared/constants`). Its
 * presence on an incoming request is the unambiguous signal "this is a
 * re-entrant pass next-intl has already locale-resolved".
 */
const HEADER_LOCALE_NAME = 'x-next-intl-locale';

/** Options for {@link createI18nMiddleware}. */
export interface CreateI18nMiddlewareOptions extends CreateI18nConfigOptions {
  /**
   * Forwarded to next-intl's `localeDetection`. Default `true` (next-intl's
   * own default). Set `false` when the bare, unprefixed path must
   * deterministically mean the *default* locale regardless of the request's
   * `Accept-Language` / `NEXT_LOCALE` cookie — required for products whose
   * default locale is not the typical browser locale (e.g. a `ko` default),
   * otherwise detection 307-redirects the bare path.
   */
  localeDetection?: boolean;
}

/**
 * Build the BSVibe i18n middleware.
 *
 * ── Re-entrancy guard (production redirect-loop fix) ───────────────────
 * With `localePrefix: 'as-needed'`, next-intl handles a request to the bare
 * default-locale path (`/`) by *rewriting* it to the prefixed internal path
 * (`/en`) — `NextResponse.rewrite`, status 200. In `next start` (production)
 * — but NOT in `next dev` — Next.js 15's route resolver re-runs middleware
 * on that rewritten internal path. On the second pass next-intl sees a
 * default-locale-*prefixed* path and *redirects* `/en` → `/` (307) to strip
 * the prefix. Next merges the two passes into one response carrying both
 * `x-middleware-rewrite: /en` AND `location: /` (307); the client follows
 * `location` straight back to `/` — an infinite redirect loop.
 *
 * The rewrite subrequest carries next-intl's `x-next-intl-locale` request
 * header. We detect it and short-circuit the second pass with
 * `NextResponse.next()`, so it never emits the prefix-stripping redirect.
 * `next dev` never enters the second pass, so the guard is a no-op there.
 */
export function createI18nMiddleware(opts: CreateI18nMiddlewareOptions = {}) {
  const cfg = createI18nConfig(opts);
  const intlMiddleware = createIntlMiddleware({
    locales: [...cfg.locales],
    defaultLocale: cfg.defaultLocale,
    localePrefix: cfg.localePrefix,
    ...(opts.localeDetection === undefined
      ? {}
      : { localeDetection: opts.localeDetection }),
  });

  return function i18nMiddleware(request: NextRequest) {
    if (request.headers.has(HEADER_LOCALE_NAME)) {
      // Re-entrant pass on a next-intl-rewritten internal path — the locale
      // is already resolved; do not let next-intl re-route (which would emit
      // the `as-needed` prefix-strip redirect and create the loop).
      return NextResponse.next();
    }
    return intlMiddleware(request);
  };
}

/**
 * Default route matcher: skip `api/`, Next.js internals (`_next`, `_vercel`),
 * any path with a file extension (e.g. `*.png`), and favicon. Leaves
 * everything else for the locale router.
 */
export const defaultMatcher = ['/((?!api|_next|_vercel|.*\\..*).*)'] as const;
