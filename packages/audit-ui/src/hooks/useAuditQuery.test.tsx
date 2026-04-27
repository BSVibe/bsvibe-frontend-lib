import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import { useEffect } from 'react';
import type { ReactNode } from 'react';

import { useAuditQuery } from './useAuditQuery';
import type { AuditEvent, AuditQueryResponse } from '../types';

function makeEvent(id: string, occurredAt: string): AuditEvent {
  return {
    id,
    event_type: 'auth.member.role_changed',
    occurred_at: occurredAt,
    ingested_at: occurredAt,
    tenant_id: 't1',
    actor: { type: 'user', id: 'u1', email: 'a@b.c' },
    event_data: {},
    trace_id: null,
  };
}

interface MockClient {
  post: ReturnType<typeof vi.fn>;
}

interface ProbeProps {
  client: MockClient;
  tenantId: string;
  filter?: Parameters<typeof useAuditQuery>[0]['filter'];
  onState: (state: ReturnType<typeof useAuditQuery>) => void;
}

function Probe({ client, tenantId, filter, onState }: ProbeProps): ReactNode {
  const state = useAuditQuery({
    apiClient: client as unknown as Parameters<typeof useAuditQuery>[0]['apiClient'],
    tenantId,
    filter,
  });
  // Surface state every render so tests can observe transitions.
  useEffect(() => {
    onState(state);
  });
  return (
    <div>
      <span data-testid="loading">{String(state.isLoading)}</span>
      <span data-testid="count">{state.events.length}</span>
      <span data-testid="error">{state.error?.message ?? ''}</span>
      <span data-testid="cursor">{state.nextCursor ?? ''}</span>
      <button type="button" onClick={() => state.loadMore()}>
        loadMore
      </button>
      <button type="button" onClick={() => state.refresh()}>
        refresh
      </button>
    </div>
  );
}

describe('useAuditQuery', () => {
  let client: MockClient;
  beforeEach(() => {
    client = { post: vi.fn() };
  });

  it('fetches the first page on mount with tenant_id + filter', async () => {
    const resp: AuditQueryResponse = {
      events: [makeEvent('e1', '2026-04-26T10:00:00Z')],
      next_cursor: null,
    };
    client.post.mockResolvedValueOnce(resp);

    render(
      <Probe
        client={client}
        tenantId="t1"
        filter={{
          event_types: ['auth.member.role_changed'],
          actor_id: '',
          since: '',
          until: '',
        }}
        onState={() => {}}
      />,
    );

    await waitFor(() => expect(screen.getByTestId('count')).toHaveTextContent('1'));
    expect(client.post).toHaveBeenCalledWith('/api/audit/query', {
      tenant_id: 't1',
      event_types: ['auth.member.role_changed'],
    });
    expect(screen.getByTestId('loading')).toHaveTextContent('false');
    expect(screen.getByTestId('cursor')).toHaveTextContent('');
  });

  it('omits empty filter fields from the request body', async () => {
    client.post.mockResolvedValueOnce({ events: [], next_cursor: null });

    render(
      <Probe
        client={client}
        tenantId="t9"
        filter={{ event_types: [], actor_id: '', since: '', until: '' }}
        onState={() => {}}
      />,
    );
    await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('false'));
    expect(client.post).toHaveBeenCalledWith('/api/audit/query', {
      tenant_id: 't9',
    });
  });

  it('includes actor + time_range when provided', async () => {
    client.post.mockResolvedValueOnce({ events: [], next_cursor: null });

    render(
      <Probe
        client={client}
        tenantId="t1"
        filter={{
          event_types: [],
          actor_id: 'u42',
          since: '2026-04-01T00:00:00Z',
          until: '2026-04-26T23:59:59Z',
        }}
        onState={() => {}}
      />,
    );
    await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('false'));
    expect(client.post).toHaveBeenCalledWith('/api/audit/query', {
      tenant_id: 't1',
      actor: { id: 'u42' },
      time_range: {
        since: '2026-04-01T00:00:00Z',
        until: '2026-04-26T23:59:59Z',
      },
    });
  });

  it('exposes an error when the request rejects', async () => {
    client.post.mockRejectedValueOnce(new Error('boom'));

    render(
      <Probe
        client={client}
        tenantId="t1"
        filter={{ event_types: [], actor_id: '', since: '', until: '' }}
        onState={() => {}}
      />,
    );
    await waitFor(() => expect(screen.getByTestId('error')).toHaveTextContent('boom'));
    expect(screen.getByTestId('loading')).toHaveTextContent('false');
    expect(screen.getByTestId('count')).toHaveTextContent('0');
  });

  it('appends events on loadMore using the cursor', async () => {
    const page1: AuditQueryResponse = {
      events: [makeEvent('e1', '2026-04-26T10:00:00Z')],
      next_cursor: '2026-04-26T10:00:00Z',
    };
    const page2: AuditQueryResponse = {
      events: [makeEvent('e2', '2026-04-25T09:00:00Z')],
      next_cursor: null,
    };
    client.post.mockResolvedValueOnce(page1).mockResolvedValueOnce(page2);

    render(
      <Probe
        client={client}
        tenantId="t1"
        filter={{ event_types: [], actor_id: '', since: '', until: '' }}
        onState={() => {}}
      />,
    );
    await waitFor(() => expect(screen.getByTestId('count')).toHaveTextContent('1'));
    expect(screen.getByTestId('cursor')).toHaveTextContent('2026-04-26T10:00:00Z');

    await act(async () => {
      screen.getByText('loadMore').click();
    });

    await waitFor(() => expect(screen.getByTestId('count')).toHaveTextContent('2'));
    expect(screen.getByTestId('cursor')).toHaveTextContent('');
    expect(client.post).toHaveBeenLastCalledWith('/api/audit/query', {
      tenant_id: 't1',
      cursor: '2026-04-26T10:00:00Z',
    });
  });

  it('refresh resets to page 1 ignoring the cursor', async () => {
    const initial: AuditQueryResponse = {
      events: [makeEvent('e1', '2026-04-26T10:00:00Z')],
      next_cursor: '2026-04-26T10:00:00Z',
    };
    const refreshed: AuditQueryResponse = {
      events: [makeEvent('e9', '2026-04-26T11:00:00Z')],
      next_cursor: null,
    };
    client.post.mockResolvedValueOnce(initial).mockResolvedValueOnce(refreshed);

    render(
      <Probe
        client={client}
        tenantId="t1"
        filter={{ event_types: [], actor_id: '', since: '', until: '' }}
        onState={() => {}}
      />,
    );
    await waitFor(() => expect(screen.getByTestId('cursor')).toHaveTextContent('2026-04-26T10:00:00Z'));

    await act(async () => {
      screen.getByText('refresh').click();
    });

    await waitFor(() => expect(screen.getByTestId('count')).toHaveTextContent('1'));
    expect(client.post).toHaveBeenLastCalledWith('/api/audit/query', { tenant_id: 't1' });
  });

  it('does not fetch when tenantId is empty', async () => {
    render(
      <Probe
        client={client}
        tenantId=""
        filter={{ event_types: [], actor_id: '', since: '', until: '' }}
        onState={() => {}}
      />,
    );
    // Yield a tick so any (incorrect) effect would have a chance to fire.
    await new Promise((r) => setTimeout(r, 0));
    expect(client.post).not.toHaveBeenCalled();
    expect(screen.getByTestId('loading')).toHaveTextContent('false');
  });
});
