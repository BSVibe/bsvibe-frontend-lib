# @bsvibe/auth

BSVibe authentication SDK — multi-tenant `useAuth` hook + `AuthProvider` + RBAC helper + tenant switching, plus the legacy `BSVibeAuth` redirect client.

## Status

Phase A initial extraction (2026-04-26, v1.0.0-alpha.0) — extracted from BSVibe-Auth `js/` (v0.4.0). This package is now the source of truth (D9). The standalone `BSVibe-Auth/js/` package will be migrated to a re-export shim in a follow-up PR.

## Surface

```tsx
// React app — wrap once at the root.
import { AuthProvider, useAuth } from "@bsvibe/auth";

<AuthProvider authUrl="https://auth.bsvibe.dev">{children}</AuthProvider>;

function Profile() {
  const { user, activeTenant, hasPermission, switchTenant } = useAuth();
  if (!user) return null;
  return (
    <div>
      {user.email} on {activeTenant?.name}
      {hasPermission("bsage.note.write") && <NewNoteButton />}
    </div>
  );
}
```

```ts
// Imperative tenant switch (also exposed via useAuth().switchTenant).
import { switchTenant } from "@bsvibe/auth";
await switchTenant({ authUrl: "https://auth.bsvibe.dev", tenantId: "t-123" });

// Client-side RBAC hint (server OpenFGA remains authoritative).
import { hasPermission } from "@bsvibe/auth";
hasPermission(user, activeTenant, "core.tenant.manage");

// Legacy redirect client (token-in-localStorage flow).
import { BSVibeAuth } from "@bsvibe/auth";
const auth = new BSVibeAuth({ authUrl: "https://auth.bsvibe.dev" });
auth.checkSession();
```

## Peer dependencies

- `react >= 19`
- `react-dom >= 19`

## Tests

33 vitest tests covering `hasPermission`, `switchTenant`, and `useAuth` (`AuthProvider` lifecycle, 401 handling, tenant switch, error propagation).

```bash
pnpm --filter @bsvibe/auth test
```
