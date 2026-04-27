import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { AuditEventList } from './AuditEventList';
import type { AuditEvent } from '../types';

function evt(id: string, eventType = 'auth.member.role_changed'): AuditEvent {
  return {
    id,
    event_type: eventType,
    occurred_at: '2026-04-26T10:00:00Z',
    ingested_at: '2026-04-26T10:00:01Z',
    tenant_id: 't1',
    actor: { type: 'user', id: 'u1', email: 'a@b.c' },
    event_data: {},
    trace_id: null,
  };
}

describe('<AuditEventList>', () => {
  afterEach(cleanup);

  it('shows loading skeleton while isLoading=true and no events', () => {
    render(
      <AuditEventList
        events={[]}
        isLoading
        error={null}
        onLoadMore={() => {}}
        nextCursor={null}
      />,
    );
    expect(screen.getByText(/loading audit events/i)).toBeInTheDocument();
  });

  it('shows error banner when error is present', () => {
    render(
      <AuditEventList
        events={[]}
        isLoading={false}
        error={new Error('upstream 502')}
        onLoadMore={() => {}}
        nextCursor={null}
      />,
    );
    expect(screen.getByText(/upstream 502/)).toBeInTheDocument();
  });

  it('renders empty state when no events and not loading', () => {
    render(
      <AuditEventList
        events={[]}
        isLoading={false}
        error={null}
        onLoadMore={() => {}}
        nextCursor={null}
      />,
    );
    expect(screen.getByText(/no audit events/i)).toBeInTheDocument();
  });

  it('renders one card per event', () => {
    render(
      <AuditEventList
        events={[evt('e1'), evt('e2', 'nexus.project.created')]}
        isLoading={false}
        error={null}
        onLoadMore={() => {}}
        nextCursor={null}
      />,
    );
    expect(screen.getByText('auth.member.role_changed')).toBeInTheDocument();
    expect(screen.getByText('nexus.project.created')).toBeInTheDocument();
  });

  it('shows a Load more button when nextCursor is non-null', async () => {
    const onLoadMore = vi.fn();
    const user = userEvent.setup();
    render(
      <AuditEventList
        events={[evt('e1')]}
        isLoading={false}
        error={null}
        onLoadMore={onLoadMore}
        nextCursor="2026-04-26T10:00:00Z"
      />,
    );
    await user.click(screen.getByRole('button', { name: /load more/i }));
    expect(onLoadMore).toHaveBeenCalled();
  });

  it('hides Load more when nextCursor is null', () => {
    render(
      <AuditEventList
        events={[evt('e1')]}
        isLoading={false}
        error={null}
        onLoadMore={() => {}}
        nextCursor={null}
      />,
    );
    expect(screen.queryByRole('button', { name: /load more/i })).not.toBeInTheDocument();
  });

  it('forwards onSelect from card to caller', async () => {
    const onSelect = vi.fn();
    const user = userEvent.setup();
    render(
      <AuditEventList
        events={[evt('e1')]}
        isLoading={false}
        error={null}
        onLoadMore={() => {}}
        nextCursor={null}
        onSelectEvent={onSelect}
      />,
    );
    await user.click(screen.getByRole('button', { name: /audit event/i }));
    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ id: 'e1' }));
  });
});
