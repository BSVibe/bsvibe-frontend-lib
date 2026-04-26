/**
 * @bsvibe/auth — BSVibe authentication SDK.
 *
 * Phase A: extracted from BSVibe-Auth `js/` (v0.4.0) as the single source of truth.
 *
 * Exports:
 * - `BSVibeAuth` — legacy single-tenant token-in-localStorage client (redirect SSO).
 * - `AuthProvider` + `useAuth()` — multi-tenant React hook (Phase 0 P0.6).
 * - `hasPermission()` — client-side RBAC hint.
 * - `switchTenant()` — POST `/api/session/switch_tenant`.
 *
 * Type-only re-exports come from `@bsvibe/types`.
 */

// Legacy single-tenant token-in-localStorage client.
export { BSVibeAuth } from './client';

// Phase 0 P0.6 — multi-tenant React hook + helpers.
export { AuthProvider, useAuth } from './useAuth';
export type { UseAuthValue } from './useAuth';
export { hasPermission } from './permissions';
export { switchTenant } from './switchTenant';
export type { SwitchTenantOptions } from './switchTenant';

// Re-export shared public types from @bsvibe/types so existing
// `import { User, Tenant, ... } from '@bsvibe/auth'` paths keep working.
export type {
  BSVibeAuthConfig,
  BSVibeUser,
  Permission,
  SessionEnvelope,
  SwitchTenantResponse,
  Tenant,
  TenantPlan,
  TenantRole,
  TenantType,
  Plan,
  Type,
  User,
} from '@bsvibe/types';
