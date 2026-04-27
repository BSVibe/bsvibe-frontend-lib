'use client';

import { useAuth } from '@bsvibe/auth';
import {
  AUDIT_READ_PERMISSION,
  AUDIT_REQUIRED_PLAN,
} from '../types';

/**
 * Result returned by `useAuditPermission`.
 *
 *  - `canRead` is the single boolean callers should gate on. It collapses
 *    plan + permission into one decision.
 *  - The other fields are surfaced so the empty-state component can
 *    render the correct CTA (upgrade vs. ask-an-admin).
 */
export interface UseAuditPermissionResult {
  /** True iff plan ≥ enterprise AND `core.audit.read` is granted. */
  canRead: boolean;
  /** True iff active tenant plan satisfies `AUDIT_REQUIRED_PLAN`. */
  planAllows: boolean;
  /** True iff `hasPermission('core.audit.read')` returned true. */
  permissionGranted: boolean;
  /** The plan threshold ('enterprise'). Surfaced for the empty-state CTA. */
  requiredPlan: string;
  /** The permission name. Surfaced for the empty-state CTA. */
  requiredPermission: string;
}

/**
 * `useAuditPermission` — gate hook for the enterprise audit query UI.
 *
 * Two gates collapse into one boolean:
 *
 *  1. Plan gate. The audit UI is enterprise-only (BSVibe_Audit_Design.md
 *     §5.3, §11). We *also* check the tenant plan client-side so a tenant
 *     that downgrades doesn't briefly see the UI before the server 403s.
 *
 *  2. Permission gate. `core.audit.read` is the bsvibe-authz permission
 *     enforced by `POST /api/audit/query` (BSVibe-Auth phase0 PR #3
 *     `defaultHasAuditReadPermission`). Owner/admin of the tenant get
 *     it via the role mapping; everyone else doesn't.
 *
 * Server (OpenFGA) is authoritative — this hook is purely for UX gating
 * (hiding nav entries, rendering the upgrade CTA, etc.).
 *
 * @example
 * function AuditPage() {
 *   const { canRead, planAllows } = useAuditPermission();
 *   if (!canRead) {
 *     return <AuditEmptyState reason={planAllows ? 'permission' : 'plan'} />;
 *   }
 *   return <AuditEventList … />;
 * }
 */
export function useAuditPermission(): UseAuditPermissionResult {
  const { activeTenant, hasPermission } = useAuth();

  if (!activeTenant) {
    return {
      canRead: false,
      planAllows: false,
      permissionGranted: false,
      requiredPlan: AUDIT_REQUIRED_PLAN,
      requiredPermission: AUDIT_READ_PERMISSION,
    };
  }

  const planAllows = activeTenant.plan === AUDIT_REQUIRED_PLAN;
  const permissionGranted = hasPermission(AUDIT_READ_PERMISSION);

  return {
    canRead: planAllows && permissionGranted,
    planAllows,
    permissionGranted,
    requiredPlan: AUDIT_REQUIRED_PLAN,
    requiredPermission: AUDIT_READ_PERMISSION,
  };
}
