import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SidebarUserCard } from './SidebarUserCard';

describe('SidebarUserCard', () => {
  it('renders the email', () => {
    render(<SidebarUserCard email="alice@example.com" onSignOut={() => {}} />);
    expect(screen.getByText('alice@example.com')).toBeInTheDocument();
  });

  it('renders the role when provided', () => {
    render(
      <SidebarUserCard email="alice@example.com" role="admin" onSignOut={() => {}} />,
    );
    expect(screen.getByText('admin')).toBeInTheDocument();
  });

  it('does NOT render a role element when role is omitted', () => {
    const { container } = render(
      <SidebarUserCard email="alice@example.com" onSignOut={() => {}} />,
    );
    expect(container.querySelector('.bsvibe-sidebar-user__role')).toBeNull();
  });

  it('computes initials from the email local-part (first 2 chars, uppercase)', () => {
    render(<SidebarUserCard email="alice@example.com" onSignOut={() => {}} />);
    expect(screen.getByText('AL')).toBeInTheDocument();
  });

  it('uses provided initials when given (overrides email-derived default)', () => {
    render(
      <SidebarUserCard
        email="alice@example.com"
        initials="AB"
        onSignOut={() => {}}
      />,
    );
    expect(screen.getByText('AB')).toBeInTheDocument();
  });

  it('calls onSignOut when the sign-out button is clicked', () => {
    const onSignOut = vi.fn();
    render(<SidebarUserCard email="alice@example.com" onSignOut={onSignOut} />);
    const button = screen.getByRole('button', { name: /sign out/i });
    fireEvent.click(button);
    expect(onSignOut).toHaveBeenCalledTimes(1);
  });

  it('respects a custom signOutLabel', () => {
    render(
      <SidebarUserCard
        email="alice@example.com"
        onSignOut={() => {}}
        signOutLabel="Log out"
      />,
    );
    expect(screen.getByRole('button', { name: /log out/i })).toBeInTheDocument();
  });

  it('renders a default sign-out label when not provided', () => {
    render(<SidebarUserCard email="alice@example.com" onSignOut={() => {}} />);
    expect(screen.getByRole('button', { name: /sign out/i })).toBeInTheDocument();
  });

  it('sign-out button has min 44px tap target (touch a11y)', () => {
    render(<SidebarUserCard email="alice@example.com" onSignOut={() => {}} />);
    const button = screen.getByRole('button', { name: /sign out/i });
    expect(button.className).toMatch(/min-h-\[44px\]|min-h-11/);
  });
});
