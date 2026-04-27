'use client';

import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { Button, Input } from '@bsvibe/ui';

import { EMPTY_FILTER, type AuditFilterState } from '../types';

export interface AuditFiltersProps {
  /** Initial / external filter state. Updates flow back via `onChange`. */
  value: AuditFilterState;
  /** Emitted on every keystroke / reset with the accumulated state. */
  onChange: (next: AuditFilterState) => void;
  /** Disable all inputs (e.g. while a query is in flight). */
  disabled?: boolean;
}

function parseEventTypes(raw: string): string[] {
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

function joinEventTypes(types: string[]): string {
  return types.join(', ');
}

interface InternalState {
  actor_id: string;
  since: string;
  until: string;
  /** Raw text of the comma-separated event-types input (preserves trailing
   *  comma/space while typing). */
  event_types_raw: string;
}

function fromExternal(value: AuditFilterState): InternalState {
  return {
    actor_id: value.actor_id,
    since: value.since,
    until: value.until,
    event_types_raw: joinEventTypes(value.event_types),
  };
}

function toExternal(state: InternalState): AuditFilterState {
  return {
    actor_id: state.actor_id,
    since: state.since,
    until: state.until,
    event_types: parseEventTypes(state.event_types_raw),
  };
}

/**
 * Filter form for the audit query UI. Maintains internal state so each
 * keystroke accumulates correctly even when the parent passes a fixed
 * `value` prop. Each change fires `onChange` with the parsed
 * `AuditFilterState`. The parent (typically `useAuditQuery`) can debounce.
 */
export function AuditFilters({ value, onChange, disabled = false }: AuditFiltersProps) {
  const [state, setState] = useState<InternalState>(() => fromExternal(value));

  // Re-sync when the parent supplies a new external value (e.g. Reset, hot
  // tenant switch). Compare the materialised external shape so we don't
  // clobber an in-flight `event_types_raw` containing a trailing comma.
  const externalRef = useRef(value);
  useEffect(() => {
    if (externalRef.current !== value) {
      externalRef.current = value;
      setState(fromExternal(value));
    }
  }, [value]);

  const update = (patch: Partial<InternalState>) => {
    setState((prev) => {
      const next = { ...prev, ...patch };
      onChange(toExternal(next));
      return next;
    });
  };

  const handleField =
    <K extends 'actor_id' | 'since' | 'until' | 'event_types_raw'>(field: K) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      update({ [field]: event.target.value } as Partial<InternalState>);
    };

  const handleReset = () => {
    const reset: InternalState = {
      actor_id: '',
      since: '',
      until: '',
      event_types_raw: '',
    };
    setState(reset);
    onChange(EMPTY_FILTER);
  };

  return (
    <form
      className="flex flex-col gap-3"
      onSubmit={(e) => e.preventDefault()}
      aria-label="Audit filters"
    >
      <Input
        label="Actor ID"
        value={state.actor_id}
        onChange={handleField('actor_id')}
        disabled={disabled}
        placeholder="user:abc123"
      />

      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Since"
          type="date"
          value={state.since}
          onChange={handleField('since')}
          disabled={disabled}
        />
        <Input
          label="Until"
          type="date"
          value={state.until}
          onChange={handleField('until')}
          disabled={disabled}
        />
      </div>

      <Input
        label="Event types"
        value={state.event_types_raw}
        onChange={handleField('event_types_raw')}
        disabled={disabled}
        helperText="Comma-separated, e.g. auth.member.role_changed, nexus.project.created"
        placeholder="auth.*, nexus.*"
      />

      <div className="flex justify-end">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleReset}
          disabled={disabled}
        >
          Reset
        </Button>
      </div>
    </form>
  );
}
