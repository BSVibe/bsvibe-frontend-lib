'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { ApiClient } from '@bsvibe/api';

import type {
  AuditEvent,
  AuditFilterState,
  AuditQueryRequest,
  AuditQueryResponse,
} from '../types';

export interface UseAuditQueryOptions {
  /** Pre-built `@bsvibe/api` client. Required so 401 cascade + dual-env are reused. */
  apiClient: ApiClient;
  /** Active tenant id. Empty string short-circuits the request. */
  tenantId: string;
  /** UI filter state. Empty fields are stripped from the request body. */
  filter?: AuditFilterState;
  /** Page size hint forwarded to the endpoint. Default: server default (100). */
  limit?: number;
  /** Override the endpoint path (defaults to `/api/audit/query`). */
  path?: string;
}

export interface UseAuditQueryResult {
  events: AuditEvent[];
  isLoading: boolean;
  error: Error | null;
  /** ISO 8601 cursor — null when no further pages. */
  nextCursor: string | null;
  /** Append the next page using `nextCursor`. No-op if `nextCursor` is null. */
  loadMore: () => Promise<void>;
  /** Reset to the first page (drop cursor + accumulated events). */
  refresh: () => Promise<void>;
}

const DEFAULT_PATH = '/api/audit/query';

/**
 * Build the JSON body for `POST /api/audit/query` from the UI filter state.
 *
 * The endpoint validates each field (`auth-app/api/audit/query.ts`):
 *   - rejects unknown actor shapes
 *   - rejects empty `actor.id` strings
 *   - rejects empty `event_types` strings
 *
 * So the safe move is to **omit** any field the user hasn't filled in,
 * rather than send `actor: {}` or `event_types: []`.
 */
function buildBody(
  tenantId: string,
  filter: AuditFilterState | undefined,
  cursor: string | null,
  limit: number | undefined,
): AuditQueryRequest {
  const body: AuditQueryRequest = { tenant_id: tenantId };
  if (filter) {
    if (filter.event_types.length > 0) {
      body.event_types = filter.event_types;
    }
    if (filter.actor_id.length > 0) {
      body.actor = { id: filter.actor_id };
    }
    if (filter.since.length > 0 || filter.until.length > 0) {
      const range: AuditQueryRequest['time_range'] = {};
      if (filter.since) range.since = filter.since;
      if (filter.until) range.until = filter.until;
      body.time_range = range;
    }
  }
  if (typeof limit === 'number' && Number.isFinite(limit) && limit > 0) {
    body.limit = limit;
  }
  if (cursor) {
    body.cursor = cursor;
  }
  return body;
}

/**
 * `useAuditQuery` — POST `/api/audit/query` with cursor pagination.
 *
 * Design choices:
 *  - **No external state library.** react-query / SWR would add a peer
 *    dep + a provider requirement; this hook is small enough to live
 *    on `useState` + `useEffect`.
 *  - **Cancellation guard.** A monotonic `requestSeq` ref prevents a
 *    stale page-1 fetch from overwriting a fresh page-2 result if the
 *    user filters quickly.
 *  - **Cursor is opaque** to the UI. The endpoint encodes it as the
 *    `occurred_at` of the last seen row.
 *  - **Empty `tenantId` short-circuits** because the auth provider may
 *    not have settled the active tenant yet on first render.
 */
export function useAuditQuery({
  apiClient,
  tenantId,
  filter,
  limit,
  path = DEFAULT_PATH,
}: UseAuditQueryOptions): UseAuditQueryResult {
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);

  const requestSeq = useRef(0);

  const fetchPage = useCallback(
    async (cursor: string | null, append: boolean) => {
      if (!tenantId) return;
      const seq = ++requestSeq.current;
      setIsLoading(true);
      setError(null);
      try {
        const body = buildBody(tenantId, filter, cursor, limit);
        const resp = await apiClient.post<AuditQueryResponse>(path, body);
        if (seq !== requestSeq.current) return;
        setEvents((prev) =>
          append ? [...prev, ...(resp.events ?? [])] : (resp.events ?? []),
        );
        setNextCursor(resp.next_cursor ?? null);
      } catch (e) {
        if (seq !== requestSeq.current) return;
        setError(e instanceof Error ? e : new Error(String(e)));
      } finally {
        if (seq === requestSeq.current) setIsLoading(false);
      }
    },
    [apiClient, tenantId, filter, limit, path],
  );

  // Page 1 fetch on mount + whenever tenant/filter/limit change.
  useEffect(() => {
    if (!tenantId) {
      setEvents([]);
      setNextCursor(null);
      return;
    }
    void fetchPage(null, false);
  }, [tenantId, filter, limit, fetchPage]);

  const refresh = useCallback(async () => {
    await fetchPage(null, false);
  }, [fetchPage]);

  const loadMore = useCallback(async () => {
    if (!nextCursor) return;
    await fetchPage(nextCursor, true);
  }, [fetchPage, nextCursor]);

  return { events, isLoading, error, nextCursor, loadMore, refresh };
}
