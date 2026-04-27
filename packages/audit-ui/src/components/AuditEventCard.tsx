'use client';

import { Card, CardBody } from '@bsvibe/ui';

import type { AuditEvent } from '../types';

export interface AuditEventCardProps {
  /** The audit event row to render. */
  event: AuditEvent;
  /** When provided, the card becomes activatable and fires this callback. */
  onSelect?: (event: AuditEvent) => void;
}

function formatTimestamp(iso: string): string {
  // Best-effort locale string. We don't assert a specific format in tests —
  // we only require the year to appear so the timestamp is human-readable.
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

function formatActor(event: AuditEvent): string {
  const { actor } = event;
  if (actor.email) return actor.email;
  return actor.id;
}

/**
 * Compact summary of a single audit event. Used in the list view.
 * When `onSelect` is provided the entire card becomes a button (`role=button`)
 * exposed via `aria-label="Audit event …"` so the list can wire row clicks
 * to a detail modal without nesting interactive controls.
 */
export function AuditEventCard({ event, onSelect }: AuditEventCardProps) {
  const clickable = typeof onSelect === 'function';
  const ariaLabel = clickable ? `Audit event ${event.event_type}` : undefined;

  // event_data preview: pretty-print, but cap at a reasonable length so a
  // single huge payload doesn't blow up the list row.
  let preview: string;
  try {
    preview = JSON.stringify(event.event_data, null, 2);
  } catch {
    preview = String(event.event_data);
  }
  if (preview.length > 400) {
    preview = `${preview.slice(0, 400)}…`;
  }

  return (
    <Card
      clickable={clickable}
      onClick={clickable ? () => onSelect?.(event) : undefined}
      aria-label={ariaLabel}
    >
      <CardBody>
        <div className="flex flex-col gap-2">
          <div className="flex items-baseline justify-between gap-3">
            <span className="font-mono text-sm font-semibold text-gray-50">
              {event.event_type}
            </span>
            <span className="text-xs text-gray-400">
              {formatTimestamp(event.occurred_at)}
            </span>
          </div>
          <div className="text-xs text-gray-300">{formatActor(event)}</div>
          <pre className="overflow-x-auto rounded-md bg-gray-950 p-2 text-xs text-gray-300">
            {preview}
          </pre>
        </div>
      </CardBody>
    </Card>
  );
}
