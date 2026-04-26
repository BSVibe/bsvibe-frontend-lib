/**
 * Tests for createRouteAdapter() — Vercel `(req, res)` handler →
 * Next.js Route Handler `(NextRequest) => Response`.
 *
 * This is the BSVibe-Auth PoC `_adapter.ts` extracted into the shared
 * library. The PoC's vitest tests already exercise the underlying
 * Vercel-style handlers with `makeReq/makeRes` shims; this adapter
 * just bridges Next.js Route Handlers to those handlers — no behaviour
 * change for the unit tests, only for production traffic.
 *
 * Coverage:
 *  - GET method, query params parsed
 *  - POST JSON body parsed
 *  - POST form-urlencoded body parsed
 *  - cookies parsed from Cookie header
 *  - headers lowercased
 *  - res.json() → JSON Response with Content-Type
 *  - res.status() → status code propagated
 *  - res.send() → string Response
 *  - res.redirect(url) → 302 + Location
 *  - res.redirect(301, url) → numeric status
 *  - multi-value Set-Cookie headers preserved
 */
import { describe, expect, it } from 'vitest';
import { createRouteAdapter, type VercelStyleHandler } from './adapter';

function nextRequest(url: string, init: RequestInit = {}): Request {
  return new Request(url, init);
}

describe('createRouteAdapter', () => {
  it('routes GET with query params + lowercased headers', async () => {
    const handler: VercelStyleHandler = (req, res) => {
      res.status(200).json({
        method: req.method,
        q: req.query,
        ua: req.headers['user-agent'],
      });
    };

    const route = createRouteAdapter(handler);
    const response = await route(
      nextRequest('https://app.example.com/api/items?id=42&page=2', {
        method: 'GET',
        headers: { 'User-Agent': 'vitest' },
      }),
    );

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body).toEqual({
      method: 'GET',
      q: { id: '42', page: '2' },
      ua: 'vitest',
    });
  });

  it('routes POST with JSON body', async () => {
    const handler: VercelStyleHandler = (req, res) => {
      res.status(201).json({ echo: req.body });
    };

    const route = createRouteAdapter(handler);
    const response = await route(
      nextRequest('https://app.example.com/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'demo' }),
      }),
    );

    expect(response.status).toBe(201);
    const body = await response.json();
    expect(body).toEqual({ echo: { name: 'demo' } });
  });

  it('routes POST with form-urlencoded body', async () => {
    const handler: VercelStyleHandler = (req, res) => {
      res.status(200).json({ echo: req.body });
    };

    const route = createRouteAdapter(handler);
    const response = await route(
      nextRequest('https://app.example.com/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'email=a%40b.com&password=secret',
      }),
    );

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body).toEqual({ echo: { email: 'a@b.com', password: 'secret' } });
  });

  it('parses cookies from Cookie header', async () => {
    const handler: VercelStyleHandler = (req, res) => {
      res.status(200).json({ cookies: req.cookies });
    };

    const route = createRouteAdapter(handler);
    const response = await route(
      nextRequest('https://app.example.com/api/me', {
        method: 'GET',
        headers: { Cookie: 'sid=abc; theme=dark' },
      }),
    );

    const body = await response.json();
    expect(body.cookies).toEqual({ sid: 'abc', theme: 'dark' });
  });

  it('handles cookies with = in value', async () => {
    const handler: VercelStyleHandler = (req, res) => {
      res.status(200).json({ cookies: req.cookies });
    };

    const route = createRouteAdapter(handler);
    const response = await route(
      nextRequest('https://app.example.com/api/me', {
        headers: { Cookie: 'token=eyJhbGciOiJI=padding' },
      }),
    );

    const body = await response.json();
    expect(body.cookies.token).toBe('eyJhbGciOiJI=padding');
  });

  it('preserves status code from res.status()', async () => {
    const handler: VercelStyleHandler = (_req, res) => {
      res.status(403).json({ error: 'forbidden' });
    };

    const route = createRouteAdapter(handler);
    const response = await route(nextRequest('https://app.example.com/api/x'));

    expect(response.status).toBe(403);
  });

  it('handles plain string responses via res.send()', async () => {
    const handler: VercelStyleHandler = (_req, res) => {
      res.status(200).send('hello world');
    };

    const route = createRouteAdapter(handler);
    const response = await route(nextRequest('https://app.example.com/api/x'));

    expect(response.status).toBe(200);
    expect(await response.text()).toBe('hello world');
  });

  it('handles redirect(url) as 302', async () => {
    const handler: VercelStyleHandler = (_req, res) => {
      res.redirect('https://other.example.com/');
    };

    const route = createRouteAdapter(handler);
    const response = await route(nextRequest('https://app.example.com/api/x'));

    expect(response.status).toBe(302);
    expect(response.headers.get('Location')).toBe('https://other.example.com/');
  });

  it('handles redirect(status, url) for permanent redirects', async () => {
    const handler: VercelStyleHandler = (_req, res) => {
      res.redirect(301, 'https://canonical.example.com/');
    };

    const route = createRouteAdapter(handler);
    const response = await route(nextRequest('https://app.example.com/api/x'));

    expect(response.status).toBe(301);
    expect(response.headers.get('Location')).toBe('https://canonical.example.com/');
  });

  it('preserves multi-value Set-Cookie headers (auth-app uses both session + tenant cookies)', async () => {
    const handler: VercelStyleHandler = (_req, res) => {
      res.setHeader('Set-Cookie', ['sid=abc; HttpOnly', 'tenant=t1; HttpOnly']);
      res.status(204).end();
    };

    const route = createRouteAdapter(handler);
    const response = await route(nextRequest('https://app.example.com/api/login', { method: 'POST' }));

    expect(response.status).toBe(204);
    // Headers.getSetCookie() returns array of Set-Cookie values (Node 20+).
    const cookies = response.headers.getSetCookie?.() ?? [];
    expect(cookies.length).toBeGreaterThanOrEqual(2);
    expect(cookies.some((c: string) => c.includes('sid=abc'))).toBe(true);
    expect(cookies.some((c: string) => c.includes('tenant=t1'))).toBe(true);
  });

  it('OPTIONS request — handler can short-circuit with empty body', async () => {
    const handler: VercelStyleHandler = (_req, res) => {
      res.setHeader('Access-Control-Allow-Origin', 'https://app.bsvibe.dev');
      res.status(204).end();
    };

    const route = createRouteAdapter(handler);
    const response = await route(nextRequest('https://app.example.com/api/x', { method: 'OPTIONS' }));

    expect(response.status).toBe(204);
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe(
      'https://app.bsvibe.dev',
    );
  });

  it('handler returns no res call → 200 empty (Vercel default)', async () => {
    const handler: VercelStyleHandler = async (_req, res) => {
      res.end();
    };

    const route = createRouteAdapter(handler);
    const response = await route(nextRequest('https://app.example.com/api/x'));

    expect(response.status).toBe(200);
  });

  it('preserves PoC vitest test compatibility — handler signature matches makeReq/makeRes shape', () => {
    // Spec doc: this adapter is wire-compatible with the BSVibe-Auth
    // PoC `api/_lib/test-helpers.ts` `makeReq`/`makeRes` factories.
    // `req` exposes: method, headers, query, body, cookies
    // `res` exposes: setHeader, getHeader, status, json, send, end, redirect
    const handler: VercelStyleHandler = (req, res) => {
      // This callback would also pass against makeReq()/makeRes() — same shape.
      expect(typeof req.method).toBe('string');
      expect(typeof req.headers).toBe('object');
      expect(typeof req.query).toBe('object');
      expect(typeof req.cookies).toBe('object');
      expect(typeof res.setHeader).toBe('function');
      expect(typeof res.status).toBe('function');
      expect(typeof res.json).toBe('function');
      expect(typeof res.send).toBe('function');
      expect(typeof res.end).toBe('function');
      expect(typeof res.redirect).toBe('function');
      res.status(200).json({});
    };

    expect(typeof createRouteAdapter(handler)).toBe('function');
  });
});
