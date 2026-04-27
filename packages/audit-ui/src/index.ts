/**
 * @bsvibe/audit-ui — public exports.
 *
 * Components + hooks for the enterprise audit query UI. See README for the
 * usage pattern in product apps.
 */

// Components
export { AuditDetail } from './components/AuditDetail.js';
export type { AuditDetailProps } from './components/AuditDetail.js';

export { AuditEmptyState } from './components/AuditEmptyState.js';
export type {
  AuditEmptyStateProps,
  AuditEmptyReason,
} from './components/AuditEmptyState.js';

export { AuditEventCard } from './components/AuditEventCard.js';
export type { AuditEventCardProps } from './components/AuditEventCard.js';

export { AuditEventList } from './components/AuditEventList.js';
export type { AuditEventListProps } from './components/AuditEventList.js';

export { AuditFilters } from './components/AuditFilters.js';
export type { AuditFiltersProps } from './components/AuditFilters.js';

// Hooks
export { useAuditQuery } from './hooks/useAuditQuery.js';
export type {
  UseAuditQueryOptions,
  UseAuditQueryResult,
} from './hooks/useAuditQuery.js';

export { useAuditPermission } from './hooks/useAuditPermission.js';
export type { UseAuditPermissionResult } from './hooks/useAuditPermission.js';

// Types — re-export the runtime envelope so consumers can stay on
// `@bsvibe/audit-ui` without pulling `./types` directly.
export type {
  AuditActor,
  AuditActorType,
  AuditActorFilter,
  AuditEvent,
  AuditFilterState,
  AuditQueryRequest,
  AuditQueryResponse,
  AuditTimeRange,
} from './types.js';
export { AUDIT_READ_PERMISSION, AUDIT_REQUIRED_PLAN, EMPTY_FILTER } from './types.js';
