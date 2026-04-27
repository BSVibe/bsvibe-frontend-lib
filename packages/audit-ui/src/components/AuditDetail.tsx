'use client';

import { Modal } from '@bsvibe/ui';

import type { AuditEvent } from '../types';

export interface AuditDetailProps {
  /** Event to inspect, or `null` to render nothing. */
  event: AuditEvent | null;
  /** Called when the user closes the modal. */
  onClose: () => void;
}

function formatTimestamp(iso: string): string {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

function actorLabel(event: AuditEvent): string {
  const { actor } = event;
  if (actor.email) return actor.email;
  return `${actor.type}:${actor.id}`;
}

/**
 * Modal that shows a single audit event in full: core fields + a JSON viewer
 * of `event_data`. Renders nothing when `event` is null so callers can leave
 * it mounted with state.
 */
export function AuditDetail({ event, onClose }: AuditDetailProps) {
  if (event === null) return null;

  let pretty: string;
  try {
    pretty = JSON.stringify(event.event_data, null, 2);
  } catch {
    pretty = String(event.event_data);
  }

  return (
    <Modal open={true} onClose={onClose} title={event.event_type} width={640}>
      <div className="flex flex-col gap-4">
        <dl className="grid grid-cols-[max-content_1fr] gap-x-4 gap-y-2 text-sm">
          <dt className="font-semibold text-gray-300">Occurred</dt>
          <dd className="text-gray-100">{formatTimestamp(event.occurred_at)}</dd>

          <dt className="font-semibold text-gray-300">Actor</dt>
          <dd className="text-gray-100">{actorLabel(event)}</dd>

          <dt className="font-semibold text-gray-300">Tenant</dt>
          <dd className="font-mono text-xs text-gray-300">{event.tenant_id}</dd>

          {event.trace_id ? (
            <>
              <dt className="font-semibold text-gray-300">Trace</dt>
              <dd className="font-mono text-xs text-gray-300">{event.trace_id}</dd>
            </>
          ) : null}
        </dl>

        <div className="flex flex-col gap-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">
            Event data
          </span>
          <pre
            data-testid="audit-detail-json"
            className="overflow-x-auto rounded-md bg-gray-950 p-3 text-xs text-gray-100"
          >
            {pretty}
          </pre>
        </div>
      </div>
    </Modal>
  );
}
