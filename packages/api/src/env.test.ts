/**
 * Tests for readDualEnv() — Phase Z migration helper.
 *
 * Reads NEXT_PUBLIC_* first, falls back to VITE_* (read from a provided
 * import.meta.env-like object), then to a default. This lets a single
 * shared package work in both Vite and Next.js consumers during the
 * Phase Z (Vite → Next.js) migration window.
 */
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { readDualEnv } from './env';

describe('readDualEnv', () => {
  let envBackup: NodeJS.ProcessEnv;

  beforeEach(() => {
    envBackup = { ...process.env };
    delete process.env.NEXT_PUBLIC_API_URL;
    delete process.env.VITE_API_URL;
    delete process.env.NEXT_PUBLIC_AUTH_URL;
    delete process.env.VITE_AUTH_URL;
  });

  afterEach(() => {
    process.env = envBackup;
  });

  it('prefers NEXT_PUBLIC_* over VITE_* over default', () => {
    process.env.NEXT_PUBLIC_API_URL = 'https://next.example.com';
    process.env.VITE_API_URL = 'https://vite.example.com';
    expect(readDualEnv('API_URL', { fallback: 'https://default.example.com' })).toBe(
      'https://next.example.com',
    );
  });

  it('falls back to VITE_* from process.env when NEXT_PUBLIC_* is missing', () => {
    process.env.VITE_API_URL = 'https://vite.example.com';
    expect(readDualEnv('API_URL')).toBe('https://vite.example.com');
  });

  it('falls back to viteEnv parameter when process.env has neither', () => {
    expect(
      readDualEnv('API_URL', {
        viteEnv: { VITE_API_URL: 'https://vite-only.example.com' },
      }),
    ).toBe('https://vite-only.example.com');
  });

  it('returns fallback when nothing is set', () => {
    expect(readDualEnv('API_URL', { fallback: 'https://default.example.com' })).toBe(
      'https://default.example.com',
    );
  });

  it('returns undefined when nothing is set and no fallback given', () => {
    expect(readDualEnv('API_URL')).toBeUndefined();
  });

  it('treats empty strings as missing (Phase Z trap — bare `VITE_X=`)', () => {
    process.env.NEXT_PUBLIC_API_URL = '';
    process.env.VITE_API_URL = 'https://vite.example.com';
    expect(readDualEnv('API_URL')).toBe('https://vite.example.com');
  });

  it('strips trailing slash by default', () => {
    process.env.NEXT_PUBLIC_API_URL = 'https://api.example.com/';
    expect(readDualEnv('API_URL')).toBe('https://api.example.com');
  });

  it('keeps trailing slash when stripTrailingSlash=false', () => {
    process.env.NEXT_PUBLIC_API_URL = 'https://api.example.com/';
    expect(readDualEnv('API_URL', { stripTrailingSlash: false })).toBe(
      'https://api.example.com/',
    );
  });
});
