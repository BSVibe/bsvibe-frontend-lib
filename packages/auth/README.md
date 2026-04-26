# @bsvibe/auth

BSVibe authentication SDK for Next.js 15 App Router. Wraps `auth.bsvibe.dev` SSO with middleware, Server Actions, and Client Hooks.

## Status

Placeholder (Phase A bootstrap, 2026-04-26). Implementation lands in subsequent PR per Lockin §A1.

## Planned Surface (Phase A)

```ts
// Client Component
import { useAuth, getAccessToken, hasPermission } from "@bsvibe/auth";

// Server Component / Server Action
import { getServerUser, requirePermission } from "@bsvibe/auth/server";

// Next.js middleware
import { createAuthMiddleware } from "@bsvibe/auth/middleware";
```

## Migration from `BSVibe-Auth/js`

This package absorbs the existing standalone `@bsvibe/auth` v0.4.0 SDK published from `BSVibe/BSVibe-Auth/js/`. Phase A first PR replaces v0.4.0 → v1.0.0 (major bump per D9). Old redirect-based API stays available with `@deprecated` JSDoc tags.
