/**
 * Tests for the 401 cascading-logout guard.
 *
 * Memory rule (feedback_no_dev_login_bypass + cascading-logout):
 *  - When a backend 401 fires, we MUST NOT trigger the registered
 *    onAuthError callback more than once per "logout episode".
 *  - Concurrent in-flight requests that all 401 should *all* observe
 *    the failure (they should still throw / reject), but only the
 *    first one should fire onAuthError. The others see the guard
 *    already engaged and skip the redirect/logout side-effect.
 *  - resetAuthErrorGuard() lets app code re-arm the guard after a
 *    successful re-login (e.g. a hot-swapped token).
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { handleAuthError, resetAuthErrorGuard, setOnAuthError } from './auth';

describe('auth-error guard (401 cascading logout protection)', () => {
  afterEach(() => {
    resetAuthErrorGuard();
    setOnAuthError(null);
  });

  it('fires the registered onAuthError exactly once for concurrent 401s', () => {
    const cb = vi.fn();
    setOnAuthError(cb);

    handleAuthError();
    handleAuthError();
    handleAuthError();

    expect(cb).toHaveBeenCalledTimes(1);
  });

  it('is a no-op when no callback is registered (does not throw)', () => {
    setOnAuthError(null);
    expect(() => handleAuthError()).not.toThrow();
  });

  it('re-arms after resetAuthErrorGuard()', () => {
    const cb = vi.fn();
    setOnAuthError(cb);

    handleAuthError();
    handleAuthError();
    expect(cb).toHaveBeenCalledTimes(1);

    resetAuthErrorGuard();

    handleAuthError();
    expect(cb).toHaveBeenCalledTimes(2);
  });

  it('overwriting the callback before guard is tripped uses the new callback', () => {
    const first = vi.fn();
    const second = vi.fn();

    setOnAuthError(first);
    setOnAuthError(second);
    handleAuthError();

    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);
  });

  it('returns true on first call, false thereafter (so callers can short-circuit retries)', () => {
    setOnAuthError(vi.fn());
    expect(handleAuthError()).toBe(true);
    expect(handleAuthError()).toBe(false);
  });
});
