import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';

import { AuditEmptyState } from './AuditEmptyState';

describe('<AuditEmptyState>', () => {
  afterEach(cleanup);

  it('renders the default empty message', () => {
    render(<AuditEmptyState reason="no-results" />);
    expect(screen.getByText(/no audit events/i)).toBeInTheDocument();
  });

  it('renders an upgrade prompt when reason=plan', () => {
    render(<AuditEmptyState reason="plan" />);
    expect(screen.getByText(/enterprise/i)).toBeInTheDocument();
  });

  it('renders a permission prompt when reason=permission', () => {
    render(<AuditEmptyState reason="permission" />);
    expect(screen.getByText(/permission/i)).toBeInTheDocument();
    expect(screen.getByText(/core\.audit\.read/)).toBeInTheDocument();
  });

  it('renders custom title/description when provided', () => {
    render(
      <AuditEmptyState reason="no-results" title="My title" description="My description" />,
    );
    expect(screen.getByText('My title')).toBeInTheDocument();
    expect(screen.getByText('My description')).toBeInTheDocument();
  });
});
