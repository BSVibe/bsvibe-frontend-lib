import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { AuditFilters } from './AuditFilters';
import { EMPTY_FILTER } from '../types';

describe('<AuditFilters>', () => {
  afterEach(cleanup);

  it('renders inputs for actor, since, until, event_types', () => {
    render(<AuditFilters value={EMPTY_FILTER} onChange={() => {}} />);
    expect(screen.getByLabelText(/actor id/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/since/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/until/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/event types/i)).toBeInTheDocument();
  });

  it('emits a new filter when actor is typed', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<AuditFilters value={EMPTY_FILTER} onChange={onChange} />);
    await user.type(screen.getByLabelText(/actor id/i), 'u42');
    // Each keystroke fires onChange. The final accumulated value is what matters.
    expect(onChange).toHaveBeenCalled();
    const last = onChange.mock.calls[onChange.mock.calls.length - 1][0];
    expect(last.actor_id).toBe('u42');
  });

  it('parses event_types from a comma-separated input', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<AuditFilters value={EMPTY_FILTER} onChange={onChange} />);
    await user.type(
      screen.getByLabelText(/event types/i),
      'auth.member.role_changed, nexus.project.created',
    );
    const last = onChange.mock.calls[onChange.mock.calls.length - 1][0];
    expect(last.event_types).toEqual([
      'auth.member.role_changed',
      'nexus.project.created',
    ]);
  });

  it('supports a Reset button that clears all fields', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(
      <AuditFilters
        value={{
          event_types: ['auth.foo.bar'],
          actor_id: 'u1',
          since: '2026-04-01',
          until: '2026-04-26',
        }}
        onChange={onChange}
      />,
    );
    await user.click(screen.getByRole('button', { name: /reset/i }));
    expect(onChange).toHaveBeenLastCalledWith(EMPTY_FILTER);
  });

  it('disables inputs when disabled=true', () => {
    render(<AuditFilters value={EMPTY_FILTER} onChange={() => {}} disabled />);
    expect(screen.getByLabelText(/actor id/i)).toBeDisabled();
    expect(screen.getByLabelText(/since/i)).toBeDisabled();
    expect(screen.getByLabelText(/event types/i)).toBeDisabled();
  });
});
