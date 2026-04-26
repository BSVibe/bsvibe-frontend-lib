/**
 * Type-level tests for readDualEnv() — ensures the overload correctly
 * narrows the return type to `string` when a `fallback` is supplied,
 * and stays `string | undefined` otherwise.
 *
 * This file is consumed by `vitest --typecheck` (separate from the runtime
 * suite) so the type contract is mechanically verified on every PR.
 */
import { expectTypeOf, test } from 'vitest';
import { readDualEnv } from './env';

test('readDualEnv returns `string` when fallback is supplied', () => {
  expectTypeOf(
    readDualEnv('API_URL', { fallback: 'https://default.example.com' }),
  ).toEqualTypeOf<string>();

  expectTypeOf(readDualEnv('API_URL', { fallback: '' })).toEqualTypeOf<string>();

  // Fallback combined with other options also narrows.
  expectTypeOf(
    readDualEnv('API_URL', {
      fallback: 'https://default.example.com',
      stripTrailingSlash: false,
    }),
  ).toEqualTypeOf<string>();
});

test('readDualEnv returns `string | undefined` when no fallback', () => {
  expectTypeOf(readDualEnv('API_URL')).toEqualTypeOf<string | undefined>();

  expectTypeOf(readDualEnv('API_URL', {})).toEqualTypeOf<string | undefined>();

  expectTypeOf(
    readDualEnv('API_URL', { stripTrailingSlash: false }),
  ).toEqualTypeOf<string | undefined>();

  // viteEnv alone (no fallback) still returns `string | undefined`.
  expectTypeOf(
    readDualEnv('API_URL', {
      viteEnv: { VITE_API_URL: 'x' },
    }),
  ).toEqualTypeOf<string | undefined>();
});
