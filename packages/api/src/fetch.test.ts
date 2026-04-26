/**
 * Tests for createApiFetch() — Server / RSC / Client fetch wrapper.
 *
 * Captures the unified pattern from BSGateway/BSNexus/BSage/BSupervisor:
 *  - prepend baseUrl
 *  - inject Bearer token from a `getToken()` resolver (auth header)
 *  - parse JSON / 204 / non-2xx error envelope ({error.message,detail})
 *  - 401 → cascading-logout guard fires once + onUnauthorized invoked
 *  - cookie-SSO mode: `credentials: 'include'` is set (rather than Bearer)
 *  - timeout via AbortController (default 30s, configurable)
 *  - throws ApiError with .status + .body intact
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError, createApiFetch } from './fetch';
import { resetAuthErrorGuard, setOnAuthError } from './auth';

function jsonResponse(status: number, body: unknown, init?: ResponseInit): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
}

describe('createApiFetch', () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn();
    resetAuthErrorGuard();
    setOnAuthError(null);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('prepends baseUrl to request paths', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(200, { ok: true }));
    const api = createApiFetch({ baseUrl: 'https://api.example.com', fetchImpl: fetchMock });

    await api.get('/projects');

    const url = fetchMock.mock.calls[0]?.[0] as string;
    expect(url).toBe('https://api.example.com/projects');
  });

  it('injects Bearer token from getToken() resolver', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(200, { ok: true }));
    const api = createApiFetch({
      baseUrl: 'https://api.example.com',
      getToken: async () => 'tkn-abc',
      fetchImpl: fetchMock,
    });

    await api.get('/me');

    const init = fetchMock.mock.calls[0]?.[1] as RequestInit;
    expect((init.headers as Record<string, string>)['Authorization']).toBe('Bearer tkn-abc');
  });

  it('omits Authorization when getToken returns null', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(200, { ok: true }));
    const api = createApiFetch({
      baseUrl: 'https://api.example.com',
      getToken: async () => null,
      fetchImpl: fetchMock,
    });

    await api.get('/public');

    const init = fetchMock.mock.calls[0]?.[1] as RequestInit;
    const headers = init.headers as Record<string, string>;
    expect(headers['Authorization']).toBeUndefined();
  });

  it('sets credentials: "include" when useCookies=true (cookie-SSO mode)', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(200, { ok: true }));
    const api = createApiFetch({
      baseUrl: 'https://api.example.com',
      useCookies: true,
      fetchImpl: fetchMock,
    });

    await api.get('/me');

    const init = fetchMock.mock.calls[0]?.[1] as RequestInit;
    expect(init.credentials).toBe('include');
  });

  it('parses JSON success body', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(200, { id: 'p1', name: 'demo' }));
    const api = createApiFetch({ baseUrl: 'https://x', fetchImpl: fetchMock });

    const data = await api.get<{ id: string; name: string }>('/p');

    expect(data).toEqual({ id: 'p1', name: 'demo' });
  });

  it('returns undefined on 204 No Content', async () => {
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 204 }));
    const api = createApiFetch({ baseUrl: 'https://x', fetchImpl: fetchMock });

    const data = await api.delete('/p/1');

    expect(data).toBeUndefined();
  });

  it('throws ApiError with .status + .body on non-2xx', async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse(404, { error: { message: 'not found' } }),
    );
    const api = createApiFetch({ baseUrl: 'https://x', fetchImpl: fetchMock });

    await expect(api.get('/missing')).rejects.toMatchObject({
      name: 'ApiError',
      status: 404,
      message: 'not found',
    });
  });

  it('extracts message from FastAPI-style {detail} envelope', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(422, { detail: 'invalid email' }));
    const api = createApiFetch({ baseUrl: 'https://x', fetchImpl: fetchMock });

    await expect(api.post('/u', { email: '' })).rejects.toMatchObject({
      status: 422,
      message: 'invalid email',
    });
  });

  it('falls back to statusText when error body has no message', async () => {
    fetchMock.mockResolvedValueOnce(
      new Response('upstream broken', { status: 502, statusText: 'Bad Gateway' }),
    );
    const api = createApiFetch({ baseUrl: 'https://x', fetchImpl: fetchMock });

    await expect(api.get('/x')).rejects.toMatchObject({
      status: 502,
      message: 'Bad Gateway',
    });
  });

  it('on 401 — invokes onUnauthorized exactly once across concurrent requests', async () => {
    const onUnauthorized = vi.fn();
    fetchMock.mockResolvedValue(jsonResponse(401, { error: { message: 'expired' } }));
    const api = createApiFetch({
      baseUrl: 'https://x',
      onUnauthorized,
      fetchImpl: fetchMock,
    });

    // 3 concurrent requests all 401
    const results = await Promise.allSettled([
      api.get('/a'),
      api.get('/b'),
      api.get('/c'),
    ]);

    // All three rejected
    expect(results.every((r) => r.status === 'rejected')).toBe(true);
    // But cb fired only once (cascading-logout guard)
    expect(onUnauthorized).toHaveBeenCalledTimes(1);
  });

  it('serializes JSON body for POST/PUT/PATCH', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(200, { ok: true }));
    const api = createApiFetch({ baseUrl: 'https://x', fetchImpl: fetchMock });

    await api.post('/p', { name: 'demo' });

    const init = fetchMock.mock.calls[0]?.[1] as RequestInit;
    expect(init.method).toBe('POST');
    expect(init.body).toBe(JSON.stringify({ name: 'demo' }));
    expect((init.headers as Record<string, string>)['Content-Type']).toBe(
      'application/json',
    );
  });

  it('omits body when post() called with no payload', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(200, { ok: true }));
    const api = createApiFetch({ baseUrl: 'https://x', fetchImpl: fetchMock });

    await api.post('/trigger');

    const init = fetchMock.mock.calls[0]?.[1] as RequestInit;
    expect(init.method).toBe('POST');
    expect(init.body).toBeUndefined();
  });

  it('aborts after configured timeoutMs', async () => {
    fetchMock.mockImplementationOnce(
      (_url: string, init: RequestInit) =>
        new Promise((_resolve, reject) => {
          init.signal?.addEventListener('abort', () => {
            reject(new DOMException('aborted', 'AbortError'));
          });
        }),
    );
    const api = createApiFetch({
      baseUrl: 'https://x',
      timeoutMs: 10,
      fetchImpl: fetchMock,
    });

    await expect(api.get('/slow')).rejects.toThrow();
  });

  it('ApiError is a real Error subclass (instanceof works)', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(500, { error: { message: 'boom' } }));
    const api = createApiFetch({ baseUrl: 'https://x', fetchImpl: fetchMock });

    try {
      await api.get('/x');
      expect.fail('should have thrown');
    } catch (e) {
      expect(e).toBeInstanceOf(ApiError);
      expect(e).toBeInstanceOf(Error);
    }
  });

  it('passes extra headers from caller', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(200, { ok: true }));
    const api = createApiFetch({ baseUrl: 'https://x', fetchImpl: fetchMock });

    await api.get('/p', { headers: { 'X-Trace-Id': 'abc' } });

    const init = fetchMock.mock.calls[0]?.[1] as RequestInit;
    expect((init.headers as Record<string, string>)['X-Trace-Id']).toBe('abc');
  });
});
