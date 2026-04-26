# @bsvibe/types

Shared TypeScript types for BSVibe products.

## Status

Placeholder (Phase A bootstrap, 2026-04-26). Implementation lands in subsequent PR.

## Planned Exports (Phase A)

- `User` — basic user identity (id, email, displayName)
- `Tenant`, `TenantMembership` — multi-tenant identity
- `Permission` — `<resource>.<action>` namespaced strings
- `ServiceTokenPayload` — P0.7 audience-scoped service JWT claims
- `SessionEnvelope` — full SSO session shape (user + tenants + active_tenant_id)
- `BsvibeJwtClaims` — full JWT claim type from BSVibe-Auth `js/` v0.4.0

## Source of Truth

Initial extraction copies from [`BSVibe-Auth/js/src/types.ts`](https://github.com/BSVibe/BSVibe-Auth) (v0.4.0). After extraction, this package becomes the SoT and BSVibe-Auth re-exports.
