'use client';

import { Button } from '@bsvibe/ui';

import type { AuditEvent } from '../types';
import { AuditEmptyState } from './AuditEmptyState';
import { AuditEventCard } from './AuditEventCard';

export interface AuditEventListProps {
  /** Events accumulated so far (across paginated pages). */
  events: AuditEvent[];
  /** True while a query is in flight. */
  isLoading: boolean;
  /** Most recent error from the query, or null. */
  error: Error | null;
  /** Cursor for the next page, or null when there is no next page. */
  nextCursor: string | null;
  /** Called when the user clicks "Load more". */
  onLoadMore: () => void;
  /** Optional: forwarded to each card. When set, cards become activatable. */
  onSelectEvent?: (event: AuditEvent) => void;
}

/**
 * Renders the audit query result envelope. Handles four states:
 *   1. error      → banner with the error message
 *   2. loading + empty → skeleton text
 *   3. empty + not loading → `<AuditEmptyState reason="no-results">`
 *   4. has events → one `<AuditEventCard>` per row, optional Load more
 */
export function AuditEventList({
  events,
  isLoading,
  error,
  nextCursor,
  onLoadMore,
  onSelectEvent,
}: AuditEventListProps) {
  if (error) {
    return (
      <div
        role="alert"
        className="rounded-md border border-rose-700 bg-rose-950/40 p-3 text-sm text-rose-200"
      >
        {error.message}
      </div>
    );
  }

  if (isLoading && events.length === 0) {
    return (
      <div className="py-8 text-center text-sm text-gray-400">
        Loading audit events…
      </div>
    );
  }

  if (events.length === 0) {
    return <AuditEmptyState reason="no-results" />;
  }

  return (
    <div className="flex flex-col gap-2">
      {events.map((event) => (
        <AuditEventCard key={event.id} event={event} onSelect={onSelectEvent} />
      ))}

      {nextCursor !== null ? (
        <div className="flex justify-center pt-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={onLoadMore}
            disabled={isLoading}
          >
            {isLoading ? 'Loading…' : 'Load more'}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
