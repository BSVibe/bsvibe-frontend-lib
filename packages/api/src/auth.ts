/**
 * 401 cascading-logout guard.
 *
 * Background — extracted from BSGateway/BSNexus/BSage:
 *
 * When a session expires, every in-flight API request 401s near-simultaneously
 * (page mount typically fires 3-5 requests). Without a guard, each one
 * triggers a `window.location.href = ".../login"` (or equivalent), and the
 * browser navigation cascades — the LAST redirect wins, but the user briefly
 * sees their app frame flicker through several login URLs. Worse, in
 * cookie-SSO products, multiple logout API calls race each other and can
 * corrupt the session cookie state on the auth server.
 *
 * The fix is a single boolean latch shared by all fetch wrappers in the
 * process. The first 401 fires `onAuthError`; subsequent 401s in the same
 * "logout episode" return false (caller can short-circuit) and skip the
 * callback entirely.
 *
 * `resetAuthErrorGuard()` is provided so an app can re-arm after a successful
 * silent token refresh / re-login (e.g. when the user grants new consent
 * mid-session in a popup).
 */

let onAuthError: (() => void) | null = null;
let isHandlingAuthError = false;

/**
 * Register the callback that runs on the first 401. Pass `null` to clear.
 *
 * Typical app wiring (Next.js layout / `app/layout.tsx`):
 *   setOnAuthError(() => { window.location.href = `${authUrl}/login`; });
 */
export function setOnAuthError(cb: (() => void) | null): void {
  onAuthError = cb;
}

/**
 * Notify the guard that a 401 just happened.
 *
 * Returns `true` if this was the first 401 (callback fired), `false` if
 * the guard was already engaged (callers can use this to skip retries).
 */
export function handleAuthError(): boolean {
  if (isHandlingAuthError) return false;
  isHandlingAuthError = true;
  if (onAuthError) {
    try {
      onAuthError();
    } catch {
      /* swallow — onAuthError is a fire-and-forget side-effect */
    }
  }
  return true;
}

/**
 * Re-arm the guard. Call after a successful silent re-login so that a
 * subsequent expiry triggers a fresh logout flow.
 */
export function resetAuthErrorGuard(): void {
  isHandlingAuthError = false;
}

/** Test helper — exposes the latch state. */
export function isAuthErrorGuardEngaged(): boolean {
  return isHandlingAuthError;
}
