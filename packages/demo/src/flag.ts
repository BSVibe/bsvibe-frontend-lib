/**
 * Build-time demo mode flag — both Vite and Next conventions supported.
 *
 * Vite:  import.meta.env.VITE_BSVIBE_DEMO === '1'
 * Next:  process.env.NEXT_PUBLIC_BSVIBE_DEMO === '1'
 *
 * Each product passes a precomputed boolean instead of having this lib
 * read globals — that keeps the build environment-agnostic. This helper
 * is kept for legacy call sites that already use the env var directly.
 */
export function isDemoMode(): boolean {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const viteEnv: any = typeof import.meta !== "undefined" ? (import.meta as any).env : undefined;
  if (viteEnv?.VITE_BSVIBE_DEMO === "1" || viteEnv?.VITE_BSVIBE_DEMO === "true") {
    return true;
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const proc: any = typeof globalThis !== "undefined" ? (globalThis as any).process : undefined;
  if (proc?.env) {
    const v = proc.env.NEXT_PUBLIC_BSVIBE_DEMO;
    if (v === "1" || v === "true") {
      return true;
    }
  }
  return false;
}
