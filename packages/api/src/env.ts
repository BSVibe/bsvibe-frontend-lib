/**
 * Dual-read env helper for the Phase Z (Vite → Next.js) migration window.
 *
 * Reads `NEXT_PUBLIC_<NAME>` first (process.env, set on the server during
 * build / runtime in Next.js), then falls back to `VITE_<NAME>` (also from
 * process.env, since the legacy Vite consumers' build replaces these), then
 * to a caller-supplied default.
 *
 * Why this matters during the migration: a single shared package needs to
 * function in both build systems while products are mid-flight. We want the
 * same `@bsvibe/api` build artefact to drop into a Next.js consumer reading
 * `NEXT_PUBLIC_API_URL` and a leftover Vite consumer reading `VITE_API_URL`
 * without separate code paths.
 *
 * Note: `import.meta.env` (Vite) is a build-time substitution — it doesn't
 * exist at runtime when this package is bundled by Next.js. Callers can
 * pass a snapshot of `import.meta.env` via `viteEnv` if they need a third
 * fallback layer. In practice, Vite consumers' build will have already
 * inlined the values into process.env via a wrapper when running under
 * Next.js compatibility shims.
 */

export interface ReadDualEnvOptions {
  /** Fallback returned when neither NEXT_PUBLIC_* nor VITE_* is set. */
  fallback?: string;
  /** Optional snapshot of `import.meta.env` (Vite consumers). */
  viteEnv?: Record<string, string | undefined>;
  /** Strip a single trailing `/` from the resolved value. Default: true. */
  stripTrailingSlash?: boolean;
}

/**
 * Subset of `ReadDualEnvOptions` that guarantees `fallback` is a `string`.
 * Used by the overload that narrows the return type to `string`.
 */
export interface ReadDualEnvOptionsWithFallback extends ReadDualEnvOptions {
  fallback: string;
}

function nonEmpty(v: string | undefined): string | undefined {
  if (v === undefined || v === null) return undefined;
  if (v === '') return undefined;
  return v;
}

// Overloads — when the caller supplies a `fallback` (even `""`), the return
// type narrows to `string`. Otherwise it stays `string | undefined`.
//
// Rationale: `createApiFetch({ baseUrl: string })` requires a non-undefined
// string, so every consumer was forced to write `readDualEnv(...) ?? ""`.
// With this overload the boilerplate disappears at the call site and the
// type contract is honest about the resolved value.
export function readDualEnv(name: string, opts: ReadDualEnvOptionsWithFallback): string;
export function readDualEnv(name: string, opts?: ReadDualEnvOptions): string | undefined;
export function readDualEnv(name: string, opts: ReadDualEnvOptions = {}): string | undefined {
  const { fallback, viteEnv, stripTrailingSlash = true } = opts;

  const fromNextPublic = nonEmpty(process.env[`NEXT_PUBLIC_${name}`]);
  const fromViteEnvProcess = nonEmpty(process.env[`VITE_${name}`]);
  const fromViteEnvSnapshot = nonEmpty(viteEnv?.[`VITE_${name}`]);

  let resolved: string | undefined =
    fromNextPublic ?? fromViteEnvProcess ?? fromViteEnvSnapshot ?? fallback;

  if (resolved && stripTrailingSlash && resolved.endsWith('/')) {
    resolved = resolved.replace(/\/+$/, '');
  }

  return resolved;
}
