# @bsvibe/api

BSVibe API client for Next.js 15 + legacy Vite consumers. Phase A
extraction. Replaces the ~40 LoC fetch/axios wrapper duplicated across
BSGateway, BSNexus, BSage, and BSupervisor with a single shared
implementation.

## Public Surface

```ts
import {
  ApiError,
  createApiFetch,
  createServerAction,
  createRouteAdapter,
  readDualEnv,
  setOnAuthError,
  resetAuthErrorGuard,
} from "@bsvibe/api";
```

## `createApiFetch`

Unified Server / RSC / Client fetch wrapper. Two modes:

- **Bearer mode** (default) — caller supplies `getToken()`. Used by current
  BSGateway / BSNexus / BSage / BSupervisor.
- **Cookie-SSO mode** (`useCookies: true`) — `credentials: 'include'` is set,
  no Authorization header. Used by Next.js App Router server components when
  the auth cookie is on the same site.

```ts
const api = createApiFetch({
  baseUrl: readDualEnv("API_URL", { fallback: "/api/v1" }),
  getToken: async () => getCachedAccessToken(),
  onUnauthorized: () => {
    window.location.href = `${authUrl}/login`;
  },
});

const projects = await api.get<Project[]>("/projects");
await api.post("/projects", { name: "demo" });
```

Throws `ApiError` on non-2xx with `.status`, `.message`, and `.body` populated
(parsed JSON or text). Recognises envelope shapes `{ error: { message } }`
(BSGateway/BSNexus) and `{ detail }` (FastAPI).

## `createServerAction`

Wrap a handler so Server Actions return a typed envelope instead of throwing,
which would otherwise crash the React tree.

```ts
"use server";
export const updateProject = createServerAction(async (input: UpdateInput) => {
  return await api.put<Project>(`/projects/${input.id}`, input);
});

// usage
const result = await updateProject(input);
if (!result.ok) toast.error(result.error.message);
```

## `createRouteAdapter`

Wrap a Vercel-style `(req, res)` handler so Next.js can call it as a Route
Handler. Extracted from the BSVibe-Auth PoC `_adapter.ts`.

```ts
// app/api/session/route.ts
import sessionHandler from "@/api/session";
import { createRouteAdapter } from "@bsvibe/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const route = createRouteAdapter(sessionHandler);
export const GET = route;
export const POST = route;
export const DELETE = route;
export const OPTIONS = route;
```

The wrapped handler keeps the original `makeReq`/`makeRes` vitest test
compatibility — handler unit tests are unchanged. The PoC export name
`vercelToRoute` is also re-exported as an alias.

## `readDualEnv`

Phase Z migration helper. Reads `NEXT_PUBLIC_<NAME>` first, falls back to
`VITE_<NAME>`, then to a default. Strips a single trailing `/` by default.

```ts
const apiUrl = readDualEnv("API_URL", {
  fallback: "/api/v1",
});
```

## 401 cascading-logout guard

When a session expires, every in-flight request 401s. Without a guard, each
fires its own `onUnauthorized`, redirecting the browser through several
login URLs in a row.

`createApiFetch` and `createServerAction` both invoke a shared latch
internally — `onUnauthorized` fires exactly once per logout episode. Reset
after a successful silent re-login:

```ts
import { setOnAuthError, resetAuthErrorGuard } from "@bsvibe/api";

setOnAuthError(() => {
  window.location.href = `${authUrl}/login`;
});

// after silent token refresh:
resetAuthErrorGuard();
```
