/**
 * Source-check guard: `useAuth.tsx` MUST start with the `'use client'`
 * directive so Next.js consumers can import `<AuthProvider>` / `useAuth`
 * directly into Server Components without a wrapper shim.
 *
 * Background: BSupervisor (and every Next.js consumer in Phase A) hits a
 * first-build error when this directive is missing — the package becomes
 * unusable until a per-product `AuthProviderClient.tsx` shim is added.
 * Pinning the directive at the source level means it survives every
 * future refactor of the file.
 */
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

describe("'use client' directive", () => {
  it("is the first non-empty source line of useAuth.tsx", () => {
    const path = resolve(__dirname, 'useAuth.tsx');
    const src = readFileSync(path, 'utf8');
    const firstLine = src.split('\n').find((line) => line.trim().length > 0);
    expect(firstLine).toBe("'use client';");
  });
});
