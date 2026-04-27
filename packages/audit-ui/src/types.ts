/**
 * @bsvibe/audit-ui — public type surface.
 *
 * Wire-compatible with the BSVibe-Auth `POST /api/audit/query` response
 * (PR #3 commit `1adfe0a` — `auth-app/api/audit/query.ts`). The response
 * shape returned by Supabase PostgREST is:
 *
 *   {
 *     events: AuditEvent[],
 *     next_cursor: string | null,   // ISO 8601 occurred_at of the last row
 *   }
 *
 * Each row mirrors the columns selected from the `audit_events` table:
 *   id, event_type, occurred_at, ingested_at,
 *   tenant_id, actor (jsonb), event_data (jsonb), trace_id
 *
 * Producer-side schema lives in the `bsvibe-audit` Python package
 * (`schemas/auth/*` + `schemas/domain/<product>/*`). This UI package
 * intentionally consumes the *runtime envelope* shape, not those Pydantic
 * models, because event_data is permanently free-form JSON.
 */

/** Actor type — see BSVibe_Audit_Design.md §2.2. */
export type AuditActorType = 'user' | 'service' | 'system';

/** Standard actor envelope. `email` is optional and only present for users. */
export interface AuditActor {
  type: AuditActorType;
  id: string;
  email?: string | null;
}

/**
 * Single audit event row as returned by `POST /api/audit/query`.
 *
 * `event_data` is the merged `before / after / metadata` payload — the
 * shape varies per `event_type` (see Pydantic registry on the producer
 * side). Treat as opaque JSON in the UI; render via the JSON viewer.
 */
export interface AuditEvent {
  id: string;
  event_type: string;
  occurred_at: string;
  ingested_at: string;
  tenant_id: string;
  actor: AuditActor;
  event_data: Record<string, unknown>;
  trace_id?: string | null;
}

/** Time-range filter sub-object. ISO 8601 strings. Both bounds optional. */
export interface AuditTimeRange {
  since?: string;
  until?: string;
}

/** Actor filter sub-object. Only `id` is supported by the v0.1 endpoint. */
export interface AuditActorFilter {
  id?: string;
}

/** Request body for `POST /api/audit/query`. */
export interface AuditQueryRequest {
  tenant_id: string;
  event_types?: string[];
  actor?: AuditActorFilter;
  time_range?: AuditTimeRange;
  limit?: number;
  cursor?: string;
}

/** Response envelope from `POST /api/audit/query`. */
export interface AuditQueryResponse {
  events: AuditEvent[];
  next_cursor: string | null;
}

/**
 * Filter state held by the `<AuditFilters>` form. Mirrors the request body
 * minus `tenant_id` (which is fixed per page), `limit`, and `cursor`.
 */
export interface AuditFilterState {
  event_types: string[];
  actor_id: string;
  since: string;
  until: string;
}

/** Default empty filter state. */
export const EMPTY_FILTER: AuditFilterState = {
  event_types: [],
  actor_id: '',
  since: '',
  until: '',
};

/**
 * The single permission gating enterprise audit access.
 * Mirrors BSVibe_Audit_Design.md §5.2 + bsvibe-authz P0.4.
 */
export const AUDIT_READ_PERMISSION = 'core.audit.read';

/**
 * Required tenant plan to surface the audit UI in product apps.
 * Mirrors BSVibe_Auth_Design.md §3 (Plan model). Below this, the empty
 * state CTA points to the upgrade page instead of triggering a query.
 */
export const AUDIT_REQUIRED_PLAN = 'enterprise';
