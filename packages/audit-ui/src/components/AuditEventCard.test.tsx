import { describe, it, expect, vi } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach } from 'vitest';

import { AuditEventCard } from './AuditEventCard';
import type { AuditEvent } from '../types';

const userEvent_: AuditEvent = {
  id: 'evt-1',
  event_type: 'auth.member.role_changed',
  occurred_at: '2026-04-26T10:00:00Z',
  ingested_at: '2026-04-26T10:00:01Z',
  tenant_id: 't1',
  actor: { type: 'user', id: 'u1', email: 'alice@example.com' },
  event_data: { from_role: 'member', to_role: 'admin' },
  trace_id: 'trace-abc',
};

const systemEvent: AuditEvent = {
  ...userEvent_,
  id: 'evt-2',
  actor: { type: 'system', id: 'cron', email: null },
  event_type: 'authz.schema.deployed',
};

describe('<AuditEventCard>', () => {
  afterEach(cleanup);

  it('renders the event_type and occurred_at', () => {
    render(<AuditEventCard event={userEvent_} />);
    expect(screen.getByText('auth.member.role_changed')).toBeInTheDocument();
    // Date should appear somewhere; we don't assert exact format.
    expect(screen.getByText(/2026/)).toBeInTheDocument();
  });

  it('renders actor email when present', () => {
    render(<AuditEventCard event={userEvent_} />);
    expect(screen.getByText('alice@example.com')).toBeInTheDocument();
  });

  it('falls back to actor id when email is missing', () => {
    render(<AuditEventCard event={systemEvent} />);
    expect(screen.getByText(/cron/)).toBeInTheDocument();
  });

  it('shows a JSON preview of event_data', () => {
    render(<AuditEventCard event={userEvent_} />);
    expect(screen.getByText(/from_role/)).toBeInTheDocument();
    expect(screen.getByText(/admin/)).toBeInTheDocument();
  });

  it('fires onSelect when the card is activated', async () => {
    const onSelect = vi.fn();
    const user = userEvent.setup();
    render(<AuditEventCard event={userEvent_} onSelect={onSelect} />);
    await user.click(screen.getByRole('button', { name: /audit event/i }));
    expect(onSelect).toHaveBeenCalledWith(userEvent_);
  });

  it('does not render as a button when onSelect is omitted', () => {
    render(<AuditEventCard event={userEvent_} />);
    expect(screen.queryByRole('button', { name: /audit event/i })).not.toBeInTheDocument();
  });
});
