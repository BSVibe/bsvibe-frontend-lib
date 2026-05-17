/**
 * Middleware factory wraps next-intl/middleware. We test the factory shape
 * (locales/defaultLocale/localeDetection propagated, config object
 * well-formed) and the re-entrancy guard — but not actual Next.js routing,
 * which belongs in product e2e tests.
 */
import { describe, expect, it, vi } from 'vitest';

vi.mock('next-intl/middleware', () => ({
  default: vi.fn((cfg: unknown) => {
    // The wrapper that next-intl returns is just a function; expose the config
    // it received so we can assert against it.
    const fn = vi.fn(() => 'INTL_HANDLED');
    Object.defineProperty(fn, 'config', { value: cfg });
    return fn;
  }),
}));

import createIntlMiddleware from 'next-intl/middleware';
import { createI18nMiddleware, defaultMatcher } from './middleware';

const intlMock = createIntlMiddleware as unknown as ReturnType<typeof vi.fn>;

/** Minimal NextRequest stand-in — the guard only reads `headers`. */
function fakeRequest(headers: Record<string, string> = {}) {
  return { headers: new Headers(headers) } as unknown as Parameters<
    ReturnType<typeof createI18nMiddleware>
  >[0];
}

describe('createI18nMiddleware', () => {
  it('passes locales/defaultLocale/localePrefix to next-intl', () => {
    const mw = createI18nMiddleware();
    expect(createIntlMiddleware).toHaveBeenCalled();
    expect(intlMock.mock.calls.at(-1)?.[0]).toMatchObject({
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
    expect(intlMock.mock.calls.at(-1)?.[0]).toMatchObject({
      locales: ['en', 'ko'],
      defaultLocale: 'en',
      localePrefix: 'always',
    });
  });

  it('omits localeDetection when not supplied (next-intl default)', () => {
    createI18nMiddleware();
    expect(intlMock.mock.calls.at(-1)?.[0]).not.toHaveProperty('localeDetection');
  });

  it('forwards localeDetection: false when supplied', () => {
    createI18nMiddleware({ defaultLocale: 'ko', localeDetection: false });
    expect(intlMock.mock.calls.at(-1)?.[0]).toMatchObject({
      localeDetection: false,
    });
  });

  describe('re-entrancy guard', () => {
    it('delegates to next-intl on a normal request', () => {
      const mw = createI18nMiddleware();
      const inner = intlMock.mock.results.at(-1)?.value as ReturnType<typeof vi.fn>;
      const callsBefore = inner.mock.calls.length;
      const result = mw(fakeRequest());
      expect(inner.mock.calls.length).toBe(callsBefore + 1);
      expect(result).toBe('INTL_HANDLED');
    });

    it('short-circuits the re-entrant pass carrying x-next-intl-locale', () => {
      const mw = createI18nMiddleware();
      const inner = intlMock.mock.results.at(-1)?.value as ReturnType<typeof vi.fn>;
      const callsBefore = inner.mock.calls.length;
      const result = mw(fakeRequest({ 'x-next-intl-locale': 'en' }));
      // next-intl is NOT re-invoked on the rewritten internal path.
      expect(inner.mock.calls.length).toBe(callsBefore);
      // A NextResponse.next() passthrough — not the loop-causing redirect.
      expect(result).toBeInstanceOf(Response);
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
