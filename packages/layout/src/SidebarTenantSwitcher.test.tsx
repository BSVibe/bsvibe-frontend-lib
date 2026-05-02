import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { SidebarTenantSwitcher } from './SidebarTenantSwitcher';

const TENANTS = [
  { id: 'p1', name: 'Personal' },
  { id: 'o1', name: 'Acme Corp' },
  { id: 'o2', name: 'BSVibe E2E' },
] as const;

describe('SidebarTenantSwitcher', () => {
  it('renders a single trigger button showing the active tenant name', () => {
    render(
      <SidebarTenantSwitcher
        tenants={TENANTS}
        activeTenantId="o2"
        onSwitchTenant={() => {}}
      />,
    );
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(1);
    expect(buttons[0]).toHaveTextContent('BSVibe E2E');
  });

  it('falls back to first tenant when activeTenantId is missing', () => {
    render(
      <SidebarTenantSwitcher
        tenants={TENANTS}
        activeTenantId={null}
        onSwitchTenant={() => {}}
      />,
    );
    expect(screen.getByRole('button')).toHaveTextContent('Personal');
  });

  it('does NOT render the listbox before the trigger is clicked', () => {
    render(
      <SidebarTenantSwitcher
        tenants={TENANTS}
        activeTenantId="o2"
        onSwitchTenant={() => {}}
      />,
    );
    expect(screen.queryByRole('listbox')).toBeNull();
  });

  it('opens listbox with one option per tenant', () => {
    render(
      <SidebarTenantSwitcher
        tenants={TENANTS}
        activeTenantId="o2"
        onSwitchTenant={() => {}}
      />,
    );
    fireEvent.click(screen.getByRole('button'));
    const listbox = screen.getByRole('listbox');
    expect(within(listbox).getAllByRole('option')).toHaveLength(3);
  });

  it('marks the active tenant with aria-selected=true', () => {
    render(
      <SidebarTenantSwitcher
        tenants={TENANTS}
        activeTenantId="o1"
        onSwitchTenant={() => {}}
      />,
    );
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByRole('option', { name: /Acme Corp/ })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(screen.getByRole('option', { name: /Personal/ })).toHaveAttribute(
      'aria-selected',
      'false',
    );
  });

  it('calls onSwitchTenant with the selected tenant id and closes', () => {
    const onSwitchTenant = vi.fn();
    render(
      <SidebarTenantSwitcher
        tenants={TENANTS}
        activeTenantId="o2"
        onSwitchTenant={onSwitchTenant}
      />,
    );
    fireEvent.click(screen.getByRole('button'));
    fireEvent.click(screen.getByRole('option', { name: /Personal/ }));
    expect(onSwitchTenant).toHaveBeenCalledWith('p1');
    expect(screen.queryByRole('listbox')).toBeNull();
  });

  it('does NOT call onSwitchTenant when the active tenant is re-selected', () => {
    const onSwitchTenant = vi.fn();
    render(
      <SidebarTenantSwitcher
        tenants={TENANTS}
        activeTenantId="o2"
        onSwitchTenant={onSwitchTenant}
      />,
    );
    fireEvent.click(screen.getByRole('button'));
    fireEvent.click(screen.getByRole('option', { name: /BSVibe E2E/ }));
    expect(onSwitchTenant).not.toHaveBeenCalled();
    expect(screen.queryByRole('listbox')).toBeNull();
  });

  it('closes on Escape', () => {
    render(
      <SidebarTenantSwitcher
        tenants={TENANTS}
        activeTenantId="o2"
        onSwitchTenant={() => {}}
      />,
    );
    fireEvent.click(screen.getByRole('button'));
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('listbox')).toBeNull();
  });

  it('renders nothing when tenants list is empty', () => {
    const { container } = render(
      <SidebarTenantSwitcher
        tenants={[]}
        activeTenantId={null}
        onSwitchTenant={() => {}}
      />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('forwards dataTestId to trigger and per-option', () => {
    render(
      <SidebarTenantSwitcher
        tenants={TENANTS}
        activeTenantId="o2"
        onSwitchTenant={() => {}}
        dataTestId="tenant-switcher"
      />,
    );
    expect(screen.getByTestId('tenant-switcher')).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('tenant-switcher'));
    expect(screen.getByTestId('tenant-switcher-p1')).toBeInTheDocument();
    expect(screen.getByTestId('tenant-switcher-o1')).toBeInTheDocument();
    expect(screen.getByTestId('tenant-switcher-o2')).toBeInTheDocument();
  });

  it('trigger and options meet 44px tap target', () => {
    render(
      <SidebarTenantSwitcher
        tenants={TENANTS}
        activeTenantId="o2"
        onSwitchTenant={() => {}}
      />,
    );
    expect(screen.getByRole('button').className).toMatch(/min-h-\[44px\]|min-h-11/);
    fireEvent.click(screen.getByRole('button'));
    expect(
      screen.getByRole('option', { name: /Personal/ }).className,
    ).toMatch(/min-h-\[44px\]|min-h-11/);
  });
});
