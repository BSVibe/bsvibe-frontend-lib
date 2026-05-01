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
    // defaultOpen so aria-hidden=false and links are exposed in the a11y tree.
    render(<ResponsiveSidebar items={ITEMS} defaultOpen />);
    expect(screen.getByRole('link', { name: 'Dashboard' })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: 'Projects' })).toHaveAttribute('href', '/projects');
    expect(screen.getByRole('link', { name: 'Settings' })).toHaveAttribute('href', '/settings');
  });

  it('marks the item matching the current pathname as active (aria-current=page)', () => {
    mockUsePathname.mockReturnValue('/projects');
    render(<ResponsiveSidebar items={ITEMS} defaultOpen />);
    const projectsLink = screen.getByRole('link', { name: 'Projects' });
    expect(projectsLink).toHaveAttribute('aria-current', 'page');
    // Non-matching items must not be marked current.
    const dashLink = screen.getByRole('link', { name: 'Dashboard' });
    expect(dashLink).not.toHaveAttribute('aria-current', 'page');
  });

  it('marks the dashboard link active only on exact match', () => {
    mockUsePathname.mockReturnValue('/projects');
    render(<ResponsiveSidebar items={ITEMS} defaultOpen />);
    expect(screen.getByRole('link', { name: 'Dashboard' })).not.toHaveAttribute(
      'aria-current',
      'page',
    );
  });

  it('treats nested routes under a non-root item as active (prefix match)', () => {
    mockUsePathname.mockReturnValue('/projects/abc/settings');
    render(<ResponsiveSidebar items={ITEMS} defaultOpen />);
    expect(screen.getByRole('link', { name: 'Projects' })).toHaveAttribute(
      'aria-current',
      'page',
    );
  });

  it('renders the optional logo + footer slots', () => {
    render(
      <ResponsiveSidebar
        items={ITEMS}
        defaultOpen
        logo={<div data-testid="logo">L</div>}
        footer={<div data-testid="footer">F</div>}
      />,
    );
    // testid queries always match (regardless of a11y tree visibility),
    // but here defaultOpen also keeps the drawer announced.
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

  // Phase B Batch 1 — mobile responsive enhancements

  it('closes the sidebar when Escape is pressed (mobile UX)', () => {
    render(<ResponsiveSidebar items={ITEMS} />);
    fireEvent.click(screen.getByRole('button', { name: /open navigation/i }));
    expect(screen.getByTestId('bsvibe-sidebar-backdrop')).toBeInTheDocument();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByTestId('bsvibe-sidebar-backdrop')).toBeNull();
  });

  it('does NOT close on Escape when sidebar is closed (no spurious onClose)', () => {
    // No throw, no state change — the listener should be a no-op while closed.
    render(<ResponsiveSidebar items={ITEMS} />);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByTestId('bsvibe-sidebar-backdrop')).toBeNull();
  });

  it('hamburger button has min 44px tap target (touch a11y)', () => {
    render(<ResponsiveSidebar items={ITEMS} />);
    const trigger = screen.getByRole('button', { name: /open navigation/i });
    // Apply a Tailwind utility that guarantees ≥ 44px tap area on mobile.
    expect(trigger.className).toMatch(/min-h-\[44px\]|min-h-11/);
    expect(trigger.className).toMatch(/min-w-\[44px\]|min-w-11/);
  });

  it('nav links have min 44px tap target (touch a11y)', () => {
    render(<ResponsiveSidebar items={ITEMS} defaultOpen />);
    const link = screen.getByRole('link', { name: 'Projects' });
    expect(link.className).toMatch(/min-h-\[44px\]|min-h-11/);
  });

  it('renders an explicit close button inside the open drawer', () => {
    render(<ResponsiveSidebar items={ITEMS} />);
    fireEvent.click(screen.getByRole('button', { name: /open navigation/i }));
    const closeBtn = screen.getByRole('button', { name: /close navigation/i });
    expect(closeBtn).toBeInTheDocument();
    fireEvent.click(closeBtn);
    expect(screen.queryByTestId('bsvibe-sidebar-backdrop')).toBeNull();
  });

  it('aside has aria-hidden true while closed (drawer mode) and false while open', () => {
    const { container } = render(<ResponsiveSidebar items={ITEMS} />);
    // Direct DOM query — aria-hidden=true makes the aside invisible to a11y
    // role queries. We still want to assert the attribute toggles on state.
    const aside = container.querySelector('aside') as HTMLElement;
    expect(aside).not.toBeNull();
    // Closed default: drawer is offscreen and not announced.
    expect(aside).toHaveAttribute('aria-hidden', 'true');
    fireEvent.click(screen.getByRole('button', { name: /open navigation/i }));
    expect(aside).toHaveAttribute('aria-hidden', 'false');
  });

  it('respects controlled mode (defaultOpen forces aside aria-hidden=false)', () => {
    render(<ResponsiveSidebar items={ITEMS} defaultOpen />);
    const aside = screen.getByRole('complementary', { name: 'Primary navigation' });
    expect(aside).toHaveAttribute('aria-hidden', 'false');
  });

  it('forwards open + onOpenChange when used as a controlled component', () => {
    const handler = vi.fn<(open: boolean) => void>();
    const { rerender } = render(
      <ResponsiveSidebar items={ITEMS} open={false} onOpenChange={handler} />,
    );
    fireEvent.click(screen.getByRole('button', { name: /open navigation/i }));
    expect(handler).toHaveBeenCalledWith(true);
    rerender(<ResponsiveSidebar items={ITEMS} open onOpenChange={handler} />);
    fireEvent.click(screen.getByTestId('bsvibe-sidebar-backdrop'));
    expect(handler).toHaveBeenCalledWith(false);
  });

  // Sidebar unification — Stage L additions

  it('renders topAction node between the topbar and the nav when provided', () => {
    const { container } = render(
      <ResponsiveSidebar
        items={ITEMS}
        defaultOpen
        topAction={<button data-testid="cta">+ New Session</button>}
      />,
    );
    expect(screen.getByTestId('cta')).toBeInTheDocument();
    // Wrapper class ensures positioning between topbar and nav.
    const wrapper = container.querySelector('.bsvibe-sidebar__top-action');
    expect(wrapper).not.toBeNull();
  });

  it('does NOT render the topAction wrapper when topAction is omitted', () => {
    const { container } = render(<ResponsiveSidebar items={ITEMS} defaultOpen />);
    expect(container.querySelector('.bsvibe-sidebar__top-action')).toBeNull();
  });

  it('emits a group label header before the first item of a new group', () => {
    const grouped: SidebarItem[] = [
      { href: '/dashboard', label: 'Dashboard' },
      { href: '/projects/a', label: 'Project A', groupLabel: 'Projects' },
      { href: '/projects/b', label: 'Project B', groupLabel: 'Projects' },
      { href: '/projects/new', label: 'New Project', groupLabel: 'Projects' },
    ];
    const { container } = render(<ResponsiveSidebar items={grouped} defaultOpen />);
    // Exactly one group header — same groupLabel does not repeat.
    const headers = container.querySelectorAll('.bsvibe-sidebar__group-label');
    expect(headers).toHaveLength(1);
    expect(headers[0]).toHaveTextContent('Projects');
  });

  it('emits a new group label header at every group boundary', () => {
    const grouped: SidebarItem[] = [
      { href: '/a', label: 'A', groupLabel: 'Group One' },
      { href: '/b', label: 'B', groupLabel: 'Group Two' },
    ];
    const { container } = render(<ResponsiveSidebar items={grouped} defaultOpen />);
    const headers = container.querySelectorAll('.bsvibe-sidebar__group-label');
    expect(headers).toHaveLength(2);
    expect(headers[0]).toHaveTextContent('Group One');
    expect(headers[1]).toHaveTextContent('Group Two');
  });

  it('does NOT inject a header for items without a groupLabel', () => {
    const { container } = render(<ResponsiveSidebar items={ITEMS} defaultOpen />);
    expect(container.querySelectorAll('.bsvibe-sidebar__group-label')).toHaveLength(0);
  });

  it('active item uses the border-l-4 + accent var pattern (no bg-gray-800 on active)', () => {
    mockUsePathname.mockReturnValue('/projects');
    render(<ResponsiveSidebar items={ITEMS} defaultOpen />);
    const projectsLink = screen.getByRole('link', { name: 'Projects' });
    expect(projectsLink.className).toMatch(/border-l-4/);
    expect(projectsLink.className).toMatch(/border-\[var\(--color-accent\)\]/);
    // Active state must NOT use the legacy bg-gray-800 utility.
    expect(projectsLink.className).not.toMatch(/(?:^|\s)bg-gray-800(?:$|\s)/);
  });

  it('inactive items get a transparent border to prevent layout shift', () => {
    mockUsePathname.mockReturnValue('/projects');
    render(<ResponsiveSidebar items={ITEMS} defaultOpen />);
    const dashLink = screen.getByRole('link', { name: 'Dashboard' });
    expect(dashLink.className).toMatch(/border-l-4/);
    expect(dashLink.className).toMatch(/border-transparent/);
  });
});
