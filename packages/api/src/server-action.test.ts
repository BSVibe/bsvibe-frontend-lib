/**
 * Tests for createServerAction() — Next.js 15 Server Action wrapper.
 *
 * Wraps a typed handler with consistent error -> result envelope so that
 * Server Actions can return `{ ok: true, data } | { ok: false, error }`
 * to the client without leaking thrown ApiError details that would
 * otherwise crash the client tree.
 *
 * Behaviours:
 *  - happy path: returns { ok: true, data: <handler result> }
 *  - ApiError thrown: returns { ok: false, error: { status, message } }
 *  - generic Error thrown: returns { ok: false, error: { status: 500, message } }
 *  - 401 thrown inside handler: still envelope-returned, AND fires the
 *    auth-error guard so the client tree can surface a logout banner
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createServerAction } from './server-action';
import { ApiError } from './fetch';
import { resetAuthErrorGuard, setOnAuthError } from './auth';

afterEach(() => {
  resetAuthErrorGuard();
  setOnAuthError(null);
});

describe('createServerAction', () => {
  it('returns { ok: true, data } on happy path', async () => {
    const action = createServerAction(async (input: { name: string }) => {
      return { greeting: `hi ${input.name}` };
    });

    const result = await action({ name: 'world' });

    expect(result).toEqual({ ok: true, data: { greeting: 'hi world' } });
  });

  it('catches ApiError and returns { ok: false, error: { status, message } }', async () => {
    const action = createServerAction(async () => {
      throw new ApiError(404, 'not found', null);
    });

    const result = await action({});

    expect(result).toEqual({
      ok: false,
      error: { status: 404, message: 'not found' },
    });
  });

  it('catches generic Error and returns 500 envelope', async () => {
    const action = createServerAction(async () => {
      throw new Error('database down');
    });

    const result = await action({});

    expect(result).toEqual({
      ok: false,
      error: { status: 500, message: 'database down' },
    });
  });

  it('catches non-Error throw and returns generic 500', async () => {
    const action = createServerAction(async () => {
      throw 'oops';
    });

    const result = await action({});

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.status).toBe(500);
    }
  });

  it('on 401 ApiError, fires auth-error guard exactly once', async () => {
    const cb = vi.fn();
    setOnAuthError(cb);

    const action = createServerAction(async () => {
      throw new ApiError(401, 'expired', null);
    });

    await action({});
    await action({}); // second call should be guarded

    expect(cb).toHaveBeenCalledTimes(1);
  });

  it('preserves typed handler input', async () => {
    interface UpdateInput {
      id: string;
      name: string;
    }
    const handler = vi.fn(async (_input: UpdateInput) => ({ updated: true }));
    const action = createServerAction(handler);

    await action({ id: 'p1', name: 'demo' });

    expect(handler).toHaveBeenCalledWith({ id: 'p1', name: 'demo' });
  });
});
