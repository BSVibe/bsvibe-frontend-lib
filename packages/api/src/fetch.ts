/**
 * createApiFetch — unified Server / RSC / Client fetch wrapper.
 *
 * Background: BSGateway, BSNexus, BSage, BSupervisor each ship a near-identical
 * ~40 LoC fetch/axios wrapper:
 *   - prepend baseUrl
 *   - inject `Authorization: Bearer <token>` from a getToken() resolver
 *   - parse JSON success + error envelopes (`{error.message}` / `{detail}`)
 *   - on 401, redirect to auth.bsvibe.dev/login
 *   - timeout after 30s
 *
 * Each product has the cascading-logout bug or the cookie-SSO branch
 * implemented slightly differently. This wrapper unifies them.
 *
 * Two operating modes:
 *  - **Bearer mode** (default): caller supplies `getToken()`. Authorization
 *    header attached. Used by BSGateway/BSNexus/BSage today.
 *  - **Cookie-SSO mode** (`useCookies: true`): `credentials: 'include'` is
 *    set, no Authorization header. Used in same-site Next.js apps where
 *    the auth cookie travels with the request. RSC server fetches in the
 *    Phase Z migration generally use this mode.
 *
 * The two modes are not mutually exclusive — `useCookies: true` + a
 * `getToken()` is also valid (cookie + Bearer fallback).
 */

import { handleAuthError } from './auth';

export interface CreateApiFetchOptions {
  /** Base URL to prepend to all paths, e.g. `https://api-gateway.bsvibe.dev/api/v1`. */
  baseUrl: string;
  /** Resolver for the Bearer token. Return `null` to skip the header. */
  getToken?: () => Promise<string | null> | string | null;
  /** Send the `credentials: 'include'` flag (cookie-SSO mode). Default: false. */
  useCookies?: boolean;
  /**
   * Callback fired exactly once per logout episode when a 401 is received.
   * Typical implementation: `() => { window.location.href = `${authUrl}/login`; }`.
   * Internally guarded by the shared cascading-logout latch (see ./auth).
   */
  onUnauthorized?: () => void;
  /** Per-request timeout in ms. Default: 30_000. */
  timeoutMs?: number;
  /** Replace the global fetch (test injection). */
  fetchImpl?: typeof fetch;
}

export interface RequestOptions {
  headers?: Record<string, string>;
  /** Override the per-instance timeout for this request. */
  timeoutMs?: number;
  /** Pass a caller-supplied AbortSignal. Combined with the timeout signal. */
  signal?: AbortSignal;
}

const DEFAULT_TIMEOUT_MS = 30_000;

/**
 * Error thrown for non-2xx responses. Carries the parsed body so callers
 * can introspect FastAPI validation errors etc.
 */
export class ApiError extends Error {
  status: number;
  body: unknown;

  constructor(status: number, message: string, body: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }
}

interface ApiClient {
  get<T = unknown>(path: string, opts?: RequestOptions): Promise<T>;
  post<T = unknown>(path: string, body?: unknown, opts?: RequestOptions): Promise<T>;
  put<T = unknown>(path: string, body?: unknown, opts?: RequestOptions): Promise<T>;
  patch<T = unknown>(path: string, body?: unknown, opts?: RequestOptions): Promise<T>;
  delete<T = unknown>(path: string, opts?: RequestOptions): Promise<T>;
  request<T = unknown>(path: string, init: RequestInit, opts?: RequestOptions): Promise<T>;
}

function extractErrorMessage(body: unknown, fallback: string): string {
  if (body && typeof body === 'object') {
    const obj = body as Record<string, unknown>;
    // BSGateway/BSNexus envelope: { error: { message } }
    if (obj.error && typeof obj.error === 'object') {
      const errObj = obj.error as Record<string, unknown>;
      if (typeof errObj.message === 'string' && errObj.message.length > 0) {
        return errObj.message;
      }
    }
    // FastAPI envelope: { detail: "..." } or { detail: [...] }
    if (typeof obj.detail === 'string' && obj.detail.length > 0) {
      return obj.detail;
    }
    if (typeof obj.message === 'string' && obj.message.length > 0) {
      return obj.message;
    }
  }
  return fallback;
}

async function parseBody(response: Response): Promise<unknown> {
  const ct = response.headers.get('Content-Type') ?? '';
  if (ct.includes('application/json')) {
    try {
      return await response.json();
    } catch {
      return null;
    }
  }
  try {
    return await response.text();
  } catch {
    return null;
  }
}

export function createApiFetch(opts: CreateApiFetchOptions): ApiClient {
  const baseUrl = opts.baseUrl.replace(/\/+$/, '');
  const timeoutMs = opts.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const fetchImpl = opts.fetchImpl ?? globalThis.fetch;

  async function buildAuthHeader(): Promise<string | null> {
    if (!opts.getToken) return null;
    const token = await Promise.resolve(opts.getToken());
    if (!token) return null;
    return `Bearer ${token}`;
  }

  async function request<T>(
    path: string,
    init: RequestInit,
    reqOpts: RequestOptions = {},
  ): Promise<T> {
    const headers: Record<string, string> = {
      ...(init.headers as Record<string, string> | undefined),
      ...(reqOpts.headers ?? {}),
    };

    const auth = await buildAuthHeader();
    if (auth) headers['Authorization'] = auth;

    // Default content-type for write methods that have a body.
    if (init.body !== undefined && init.body !== null && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }

    const effectiveTimeout = reqOpts.timeoutMs ?? timeoutMs;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), effectiveTimeout);
    const callerSignal = reqOpts.signal;
    const onCallerAbort = () => controller.abort();
    if (callerSignal) {
      if (callerSignal.aborted) controller.abort();
      else callerSignal.addEventListener('abort', onCallerAbort, { once: true });
    }

    let response: Response;
    try {
      response = await fetchImpl(`${baseUrl}${path}`, {
        ...init,
        headers,
        credentials: opts.useCookies ? 'include' : init.credentials,
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeoutId);
      if (callerSignal) callerSignal.removeEventListener('abort', onCallerAbort);
    }

    if (!response.ok) {
      const body = await parseBody(response);
      const message = extractErrorMessage(body, response.statusText || `HTTP ${response.status}`);

      if (response.status === 401) {
        const fired = handleAuthError();
        if (fired && opts.onUnauthorized) {
          try {
            opts.onUnauthorized();
          } catch {
            /* swallow — fire-and-forget */
          }
        }
      }

      throw new ApiError(response.status, message, body);
    }

    if (response.status === 204) return undefined as unknown as T;
    return (await parseBody(response)) as T;
  }

  function withJsonBody(body: unknown): BodyInit | undefined {
    if (body === undefined) return undefined;
    return JSON.stringify(body);
  }

  return {
    get: <T>(path: string, opts?: RequestOptions) =>
      request<T>(path, { method: 'GET' }, opts),
    post: <T>(path: string, body?: unknown, opts?: RequestOptions) =>
      request<T>(path, { method: 'POST', body: withJsonBody(body) }, opts),
    put: <T>(path: string, body?: unknown, opts?: RequestOptions) =>
      request<T>(path, { method: 'PUT', body: withJsonBody(body) }, opts),
    patch: <T>(path: string, body?: unknown, opts?: RequestOptions) =>
      request<T>(path, { method: 'PATCH', body: withJsonBody(body) }, opts),
    delete: <T>(path: string, opts?: RequestOptions) =>
      request<T>(path, { method: 'DELETE' }, opts),
    request: <T>(path: string, init: RequestInit, opts?: RequestOptions) =>
      request<T>(path, init, opts),
  };
}

export type { ApiClient };
