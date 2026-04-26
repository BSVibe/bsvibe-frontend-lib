import { describe, expect, it } from 'vitest';

import {
  DEFAULT_LOCALE,
  LOCALES,
  createI18nConfig,
  isSupportedLocale,
  resolveLocale,
} from './config';

describe('LOCALES and DEFAULT_LOCALE', () => {
  it('exposes ko and en', () => {
    expect(LOCALES).toEqual(['ko', 'en']);
  });

  it('defaults to ko', () => {
    expect(DEFAULT_LOCALE).toBe('ko');
  });
});

describe('isSupportedLocale', () => {
  it('returns true for ko/en', () => {
    expect(isSupportedLocale('ko')).toBe(true);
    expect(isSupportedLocale('en')).toBe(true);
  });

  it('returns false for anything else', () => {
    expect(isSupportedLocale('fr')).toBe(false);
    expect(isSupportedLocale('')).toBe(false);
    expect(isSupportedLocale(undefined)).toBe(false);
  });
});

describe('resolveLocale', () => {
  it('returns the locale itself when supported', () => {
    expect(resolveLocale('en')).toBe('en');
    expect(resolveLocale('ko')).toBe('ko');
  });

  it('falls back to default for unsupported', () => {
    expect(resolveLocale('fr')).toBe('ko');
    expect(resolveLocale(undefined)).toBe('ko');
  });

  it('honours an override fallback', () => {
    expect(resolveLocale('fr', 'en')).toBe('en');
  });
});

describe('createI18nConfig', () => {
  it('defaults to ko + en, defaultLocale ko, prefix as-needed', () => {
    const cfg = createI18nConfig();
    expect(cfg.locales).toEqual(['ko', 'en']);
    expect(cfg.defaultLocale).toBe('ko');
    expect(cfg.localePrefix).toBe('as-needed');
  });

  it('accepts overrides', () => {
    const cfg = createI18nConfig({
      locales: ['en', 'ko'],
      defaultLocale: 'en',
      localePrefix: 'always',
    });
    expect(cfg.locales).toEqual(['en', 'ko']);
    expect(cfg.defaultLocale).toBe('en');
    expect(cfg.localePrefix).toBe('always');
  });

  it('rejects defaultLocale that is not in locales', () => {
    expect(() =>
      createI18nConfig({
        locales: ['ko'],
        // @ts-expect-error testing invalid combo
        defaultLocale: 'en',
      }),
    ).toThrow(/defaultLocale/);
  });
});
