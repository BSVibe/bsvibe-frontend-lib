/**
 * Middleware factory wraps next-intl/middleware. We test the factory shape
 * (locales/defaultLocale propagated, config object well-formed) rather than
 * actually exercising Next.js routing — that belongs in product e2e tests.
 */
import { describe, expect, it, vi } from 'vitest';

vi.mock('next-intl/middleware', () => ({
  default: vi.fn((cfg: unknown) => {
    // The wrapper that next-intl returns is just a function; expose the config
    // it received so we can assert against it.
    const fn = vi.fn();
    Object.defineProperty(fn, 'config', { value: cfg });
    return fn;
  }),
}));

import createIntlMiddleware from 'next-intl/middleware';
import { createI18nMiddleware, defaultMatcher } from './middleware';

describe('createI18nMiddleware', () => {
  it('passes locales/defaultLocale/localePrefix to next-intl', () => {
    const mw = createI18nMiddleware();
    expect(createIntlMiddleware).toHaveBeenCalled();
    const lastCall = (createIntlMiddleware as unknown as ReturnType<typeof vi.fn>)
      .mock.calls.at(-1);
    expect(lastCall?.[0]).toMatchObject({
      locales: ['ko', 'en'],
      defaultLocale: 'ko',
      localePrefix: 'as-needed',
    });
    expect(typeof mw).toBe('function');
  });

  it('honours overrides', () => {
    createI18nMiddleware({
      locales: ['en', 'ko'],
      defaultLocale: 'en',
      localePrefix: 'always',
    });
    const lastCall = (createIntlMiddleware as unknown as ReturnType<typeof vi.fn>)
      .mock.calls.at(-1);
    expect(lastCall?.[0]).toMatchObject({
      locales: ['en', 'ko'],
      defaultLocale: 'en',
      localePrefix: 'always',
    });
  });
});

describe('defaultMatcher', () => {
  it('excludes Next.js internals and static assets', () => {
    expect(defaultMatcher).toEqual([
      // ignore api, _next, _vercel, files with extension, and favicon
      '/((?!api|_next|_vercel|.*\\..*).*)',
    ]);
  });
});
