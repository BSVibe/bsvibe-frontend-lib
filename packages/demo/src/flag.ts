// Ambient declaration — bundlers (Next.js, Vite) provide ``process.env`` at
// build time. We don't want to pull in @types/node as a runtime dep just to
// type a single string lookup, so we narrow it inline.
declare const process: { env?: Record<string, string | undefined> } | undefined;

/**
 * Build-time demo mode flag.
 *
 * Next.js: ``process.env.NEXT_PUBLIC_*`` is statically replaced at build time
 * **only when accessed via that exact dotted syntax**. The previous version
 * of this file went through ``(globalThis as any).process`` for safety, but
 * that dynamic lookup defeats the static replacement — Webpack inlines a
 * literal only when it sees ``process.env.NEXT_PUBLIC_BSVIBE_DEMO`` verbatim,
 * so the value was ``undefined`` at runtime in the browser bundle. The
 * direct access below is load-bearing.
 *
 * Vite: ``import.meta.env.VITE_*`` is similarly replaced at build time when
 * accessed directly.
 *
 * Both branches are safe in the other environment because the missing global
 * (``process`` in Vite, ``import.meta`` in some Next setups) is short-
 * circuited by the ``typeof`` check.
 */
export function isDemoMode(): boolean {
  // Vite: import.meta.env.VITE_BSVIBE_DEMO
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ime: any = typeof import.meta !== "undefined" ? (import.meta as any).env : undefined;
  if (ime?.VITE_BSVIBE_DEMO === "1" || ime?.VITE_BSVIBE_DEMO === "true") {
    return true;
  }
  // Next.js: must use direct process.env.NEXT_PUBLIC_* so the bundler can
  // statically inline the literal. Do NOT replace this with a dynamic
  // (globalThis as any).process lookup — Webpack will not see it.
  if (typeof process !== "undefined" && process?.env) {
    const v = process.env.NEXT_PUBLIC_BSVIBE_DEMO;
    if (v === "1" || v === "true") {
      return true;
    }
  }
  return false;
}
