import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import type { ComponentProps } from 'react';
import { ResponsiveSidebar, type SidebarItem } from './ResponsiveSidebar';

// next/navigation is the only Next.js coupling — we mock it for tests.
const mockUsePathname = vi.fn<() => string>();
vi.mock('next/navigation', () => ({
  usePathname: () => mockUsePathname(),
}));

// next/link renders a plain <a> in tests, preserving any extra props
// (notably `aria-current`) that the component sets.
vi.mock('next/link', () => ({
  default: ({
    href,
    children,
    ...rest
  }: ComponentProps<'a'> & { href: string }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

const ITEMS: SidebarItem[] = [
  { href: '/', label: 'Dashboard' },
  { href: '/projects', label: 'Projects' },
  { href: '/settings', label: 'Settings' },
];

describe('ResponsiveSidebar', () => {
  beforeEach(() => {
    mockUsePathname.mockReset();
    mockUsePathname.mockReturnValue('/');
  });

  it('renders all nav items as links to their href', () => {
    render(<ResponsiveSidebar items={ITEMS} />);
    expect(screen.getByRole('link', { name: 'Dashboard' })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: 'Projects' })).toHaveAttribute('href', '/projects');
    expect(screen.getByRole('link', { name: 'Settings' })).toHaveAttribute('href', '/settings');
  });

  it('marks the item matching the current pathname as active (aria-current=page)', () => {
    mockUsePathname.mockReturnValue('/projects');
    render(<ResponsiveSidebar items={ITEMS} />);
    const projectsLink = screen.getByRole('link', { name: 'Projects' });
    expect(projectsLink).toHaveAttribute('aria-current', 'page');
    // Non-matching items must not be marked current.
    const dashLink = screen.getByRole('link', { name: 'Dashboard' });
    expect(dashLink).not.toHaveAttribute('aria-current', 'page');
  });

  it('marks the dashboard link active only on exact match', () => {
    mockUsePathname.mockReturnValue('/projects');
    render(<ResponsiveSidebar items={ITEMS} />);
    expect(screen.getByRole('link', { name: 'Dashboard' })).not.toHaveAttribute(
      'aria-current',
      'page',
    );
  });

  it('treats nested routes under a non-root item as active (prefix match)', () => {
    mockUsePathname.mockReturnValue('/projects/abc/settings');
    render(<ResponsiveSidebar items={ITEMS} />);
    expect(screen.getByRole('link', { name: 'Projects' })).toHaveAttribute(
      'aria-current',
      'page',
    );
  });

  it('renders the optional logo + footer slots', () => {
    render(
      <ResponsiveSidebar
        items={ITEMS}
        logo={<div data-testid="logo">L</div>}
        footer={<div data-testid="footer">F</div>}
      />,
    );
    expect(screen.getByTestId('logo')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });

  it('starts collapsed on mobile (no backdrop) and exposes a hamburger toggle', () => {
    render(<ResponsiveSidebar items={ITEMS} />);
    // No backdrop visible by default.
    expect(screen.queryByTestId('bsvibe-sidebar-backdrop')).toBeNull();
    // Hamburger trigger is rendered.
    const trigger = screen.getByRole('button', { name: /open navigation/i });
    expect(trigger).toBeInTheDocument();
  });

  it('opens the sidebar (shows backdrop) when hamburger is clicked', () => {
    render(<ResponsiveSidebar items={ITEMS} />);
    fireEvent.click(screen.getByRole('button', { name: /open navigation/i }));
    expect(screen.getByTestId('bsvibe-sidebar-backdrop')).toBeInTheDocument();
  });

  it('closes the sidebar when the backdrop is clicked', () => {
    render(<ResponsiveSidebar items={ITEMS} />);
    fireEvent.click(screen.getByRole('button', { name: /open navigation/i }));
    fireEvent.click(screen.getByTestId('bsvibe-sidebar-backdrop'));
    expect(screen.queryByTestId('bsvibe-sidebar-backdrop')).toBeNull();
  });

  it('closes the sidebar when a nav link is clicked (mobile UX)', () => {
    render(<ResponsiveSidebar items={ITEMS} />);
    fireEvent.click(screen.getByRole('button', { name: /open navigation/i }));
    expect(screen.getByTestId('bsvibe-sidebar-backdrop')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('link', { name: 'Projects' }));
    expect(screen.queryByTestId('bsvibe-sidebar-backdrop')).toBeNull();
  });
});
