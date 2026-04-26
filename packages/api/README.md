# @bsvibe/api

BSVibe API client wrapper for Next.js 15 — server-side fetch for RSC, Server Action helpers, and adapters for legacy Vercel Edge Function patterns.

## Status

Placeholder (Phase A bootstrap). Phase A 후속에서 4개 제품의 axios/fetch 401 핸들러 통합.

## Planned Surface

```ts
// RSC
import { createServerFetch } from "@bsvibe/api/server";
const fetchApi = createServerFetch({ baseUrl: "https://api.bsvibe.dev" });
const data = await fetchApi("/projects");

// Server Action
import { createServerAction } from "@bsvibe/api/server";
export const updateProject = createServerAction(async (input) => {
  /* ... */
});

// Client Hook (편의용)
import { useApi } from "@bsvibe/api/client";
```

## Vercel → Route Handler Adapter

Migration helper for converting Vercel Edge Functions (legacy `api/*.ts`) to Next.js Route Handlers (`app/api/*/route.ts`).
