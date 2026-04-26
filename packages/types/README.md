# @bsvibe/types

Shared TypeScript types for BSVibe products.

## Status

Phase A initial extraction (2026-04-26) — extracted from BSVibe-Auth `js/src/types.ts` (v0.4.0). This package is now the source of truth.

## Exports

- `User` — basic user identity (`id`, `email`, `name?`, `avatar_url?`)
- `Tenant` — multi-tenant identity (`id`, `name`, `type`, `role`, `plan`)
- `TenantRole` — `'owner' | 'admin' | 'member' | 'viewer'`
- `TenantPlan` (alias `Plan`) — `'free' | 'pro' | 'team' | 'enterprise'`
- `TenantType` (alias `Type`) — `'personal' | 'org'`
- `Permission` — `<product>.<resource>.<action>` namespaced strings
- `SessionEnvelope` — `/api/session` response shape
- `SwitchTenantResponse` — `/api/session/switch_tenant` response
- `BSVibeAuthConfig`, `BSVibeUser` — legacy single-tenant types

## Roadmap

- Phase 0 P0.7 will add `ServiceTokenPayload` (audience-scoped service JWT claims).

## Consumers

- `@bsvibe/auth` (workspace dep)
- 4 products + bsvibe-site + auth-app (after Phase A migration)
