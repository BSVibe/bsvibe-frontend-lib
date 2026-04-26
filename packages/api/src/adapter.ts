/**
 * Vercel `(req, res)` handler → Next.js Route Handler adapter.
 *
 * Phase Z migration trap: products' API handlers were originally written
 * against the `@vercel/node` `(req, res)` signature so they could be
 * unit-tested with lightweight req/res shims (`makeReq`/`makeRes`). Migrating
 * to Next.js 15 Route Handlers means exporting `GET/POST/...` functions that
 * receive a `Request` and return a `Response` — a different shape entirely.
 *
 * Rather than rewrite (and re-test) every handler, we wrap each Vercel-style
 * handler with `createRouteAdapter()`. The unit tests keep using the original
 * factories (`createSessionHandler({ ... })`) with `makeReq`/`makeRes`, while
 * production traffic flows through the Next.js Route Handler.
 *
 * Extracted from the BSVibe-Auth PoC `auth-app/app/api/_adapter.ts` (~150
 * LoC). The PoC's vitest suite continues to exercise the underlying handlers
 * directly — this adapter is wire-compatible with the same handler shape.
 *
 * Supports: cookies, headers (lowercased), query params, body (JSON or
 * form-urlencoded), redirects, status codes, multi-value Set-Cookie.
 */

interface VercelLikeReq {
  method: string;
  headers: Record<string, string>;
  query: Record<string, string>;
  body: unknown;
  cookies: Record<string, string>;
  url?: string;
}

interface CapturedRes {
  statusCode: number;
  headers: Record<string, string | string[]>;
  body: unknown;
  ended: boolean;
  redirectLocation?: string;
  bodyIsJson: boolean;
}

interface VercelLikeRes {
  setHeader: (name: string, value: string | string[]) => VercelLikeRes;
  getHeader: (name: string) => string | string[] | undefined;
  status: (code: number) => VercelLikeRes;
  json: (body: unknown) => VercelLikeRes;
  send: (body: unknown) => VercelLikeRes;
  end: (body?: unknown) => VercelLikeRes;
  redirect: (statusOrUrl: number | string, maybeUrl?: string) => VercelLikeRes;
}

export type VercelStyleHandler = (
  req: VercelLikeReq,
  res: VercelLikeRes,
) => Promise<unknown> | unknown;

function parseCookieHeader(header: string | null): Record<string, string> {
  if (!header) return {};
  const out: Record<string, string> = {};
  for (const pair of header.split(';')) {
    const trimmed = pair.trim();
    if (!trimmed) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const k = trimmed.slice(0, eqIdx);
    const v = trimmed.slice(eqIdx + 1);
    if (k) out[k] = v;
  }
  return out;
}

async function buildVercelReq(req: Request): Promise<VercelLikeReq> {
  const headers: Record<string, string> = {};
  req.headers.forEach((value, key) => {
    headers[key.toLowerCase()] = value;
  });

  const url = new URL(req.url);
  const query: Record<string, string> = {};
  url.searchParams.forEach((value, key) => {
    query[key] = value;
  });

  let body: unknown = undefined;
  if (req.method !== 'GET' && req.method !== 'HEAD' && req.method !== 'OPTIONS') {
    const contentType = headers['content-type'] || '';
    if (contentType.includes('application/json')) {
      try {
        body = await req.json();
      } catch {
        body = undefined;
      }
    } else if (contentType.includes('application/x-www-form-urlencoded')) {
      const text = await req.text();
      const parsed = new URLSearchParams(text);
      const obj: Record<string, string> = {};
      parsed.forEach((v, k) => {
        obj[k] = v;
      });
      body = obj;
    } else {
      try {
        body = await req.text();
      } catch {
        body = undefined;
      }
    }
  }

  const cookies = parseCookieHeader(headers['cookie'] || null);

  return {
    method: req.method,
    headers,
    query,
    body,
    cookies,
    url: req.url,
  };
}

function makeCapturingRes(): { res: VercelLikeRes; captured: CapturedRes } {
  const captured: CapturedRes = {
    statusCode: 200,
    headers: {},
    body: undefined,
    ended: false,
    bodyIsJson: false,
  };

  const res: VercelLikeRes = {
    setHeader(name, value) {
      captured.headers[name] = value;
      return res;
    },
    getHeader(name) {
      return captured.headers[name];
    },
    status(code) {
      captured.statusCode = code;
      return res;
    },
    json(body) {
      captured.body = body;
      captured.bodyIsJson = true;
      captured.ended = true;
      return res;
    },
    send(body) {
      captured.body = body;
      captured.ended = true;
      return res;
    },
    end(body) {
      if (body !== undefined) captured.body = body;
      captured.ended = true;
      return res;
    },
    redirect(statusOrUrl, maybeUrl) {
      if (typeof statusOrUrl === 'number' && typeof maybeUrl === 'string') {
        captured.statusCode = statusOrUrl;
        captured.redirectLocation = maybeUrl;
      } else if (typeof statusOrUrl === 'string') {
        captured.statusCode = 302;
        captured.redirectLocation = statusOrUrl;
      }
      captured.ended = true;
      return res;
    },
  };

  return { res, captured };
}

function buildResponse(captured: CapturedRes): Response {
  const responseHeaders = new Headers();

  for (const [name, value] of Object.entries(captured.headers)) {
    if (Array.isArray(value)) {
      for (const v of value) responseHeaders.append(name, v);
    } else {
      responseHeaders.set(name, value);
    }
  }

  if (captured.redirectLocation) {
    responseHeaders.set('Location', captured.redirectLocation);
    return new Response(null, {
      status: captured.statusCode || 302,
      headers: responseHeaders,
    });
  }

  if (captured.bodyIsJson) {
    if (!responseHeaders.has('Content-Type')) {
      responseHeaders.set('Content-Type', 'application/json');
    }
    return new Response(JSON.stringify(captured.body ?? null), {
      status: captured.statusCode,
      headers: responseHeaders,
    });
  }

  if (captured.body === undefined || captured.body === null) {
    return new Response(null, {
      status: captured.statusCode,
      headers: responseHeaders,
    });
  }

  if (typeof captured.body === 'string') {
    return new Response(captured.body, {
      status: captured.statusCode,
      headers: responseHeaders,
    });
  }

  return new Response(JSON.stringify(captured.body), {
    status: captured.statusCode,
    headers: responseHeaders,
  });
}

/**
 * Wrap a Vercel-style `(req, res)` handler so Next.js can call it as a
 * Route Handler.
 *
 *   // app/api/session/route.ts
 *   import sessionHandler from '@/api/session';
 *   import { createRouteAdapter } from '@bsvibe/api';
 *   const route = createRouteAdapter(sessionHandler);
 *   export const GET = route;
 *   export const POST = route;
 */
export function createRouteAdapter(
  handler: VercelStyleHandler,
): (req: Request) => Promise<Response> {
  return async (req: Request) => {
    const vercelReq = await buildVercelReq(req);
    const { res, captured } = makeCapturingRes();
    await handler(vercelReq, res);
    return buildResponse(captured);
  };
}

/**
 * Backwards-compat alias matching the BSVibe-Auth PoC export name.
 * Prefer `createRouteAdapter` in new code.
 */
export const vercelToRoute = createRouteAdapter;

export type { VercelLikeReq, VercelLikeRes };
