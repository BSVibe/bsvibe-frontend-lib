import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { AuditDetail } from './AuditDetail';
import type { AuditEvent } from '../types';

const event: AuditEvent = {
  id: 'evt-99',
  event_type: 'nexus.project.created',
  occurred_at: '2026-04-26T10:00:00Z',
  ingested_at: '2026-04-26T10:00:01Z',
  tenant_id: 't1',
  actor: { type: 'user', id: 'u1', email: 'alice@example.com' },
  event_data: { name: 'demo', slug: 'demo-1' },
  trace_id: 'trace-zz',
};

describe('<AuditDetail>', () => {
  afterEach(cleanup);

  it('renders nothing when event is null', () => {
    const { container } = render(<AuditDetail event={null} onClose={() => {}} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders core fields and JSON viewer when event is present', () => {
    render(<AuditDetail event={event} onClose={() => {}} />);
    expect(screen.getByText('nexus.project.created')).toBeInTheDocument();
    expect(screen.getByText('alice@example.com')).toBeInTheDocument();
    expect(screen.getByText('trace-zz')).toBeInTheDocument();
    // JSON content should appear somewhere in a code block.
    const codeBlock = screen.getByTestId('audit-detail-json');
    expect(codeBlock.textContent).toContain('demo-1');
  });

  it('calls onClose on close button', async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(<AuditDetail event={event} onClose={onClose} />);
    await user.click(screen.getByRole('button', { name: /close/i }));
    expect(onClose).toHaveBeenCalled();
  });
});
