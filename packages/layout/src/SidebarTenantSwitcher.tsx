'use client';

import { useEffect, useRef, useState } from 'react';

export interface SidebarTenant {
  /** Stable identifier (uuid). */
  id: string;
  /** Display name shown in trigger + listbox. */
  name: string;
  /** Optional role label (owner / admin / member) shown next to name. */
  role?: string;
}

export interface SidebarTenantSwitcherProps {
  /** Available tenants for the current user. Order is preserved. */
  tenants: ReadonlyArray<SidebarTenant>;
  /** Currently active tenant id. Falls back to first tenant when null. */
  activeTenantId: string | null;
  /** Fired with the next tenant id when a non-active option is picked. */
  onSwitchTenant: (next: string) => void;
  /** ARIA label for trigger + listbox. Default: "Workspace". */
  ariaLabel?: string;
  /**
   * Optional `data-testid` for the trigger; each option also gets
   * `data-testid="<dataTestId>-<id>"`.
   */
  dataTestId?: string;
  /** Extra class merged onto the root container. */
  className?: string;
}

/**
 * `<SidebarTenantSwitcher>` — single-trigger dropdown for the active
 * workspace (tenant). Mirrors the visual + a11y shape of LanguageToggle
 * so consumers get a familiar control:
 *
 *   [ Workspace · Acme Corp ▾ ]
 *      ↳ Personal
 *      ↳ Acme Corp        ✓
 *      ↳ BSVibe E2E
 *
 * Closes on option select, Escape, or outside click. Renders nothing
 * when the tenants list is empty (no auth context yet) so consumers
 * can drop it in unconditionally.
 */
export function SidebarTenantSwitcher({
  tenants,
  activeTenantId,
  onSwitchTenant,
  ariaLabel = 'Workspace',
  dataTestId,
  className,
}: SidebarTenantSwitcherProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const activeTenant =
    tenants.find((t) => t.id === activeTenantId) ?? tenants[0];

  useEffect(() => {
    if (!open) return;
    const onMouseDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onMouseDown);
    return () => document.removeEventListener('mousedown', onMouseDown);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  if (tenants.length === 0) return null;

  const handleSelect = (next: string) => {
    if (next !== activeTenantId) onSwitchTenant(next);
    setOpen(false);
  };

  const rootCls = [
    'bsvibe-sidebar-tenant-switcher relative inline-block w-full',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div ref={rootRef} className={rootCls}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        data-testid={dataTestId}
        onClick={() => setOpen((prev) => !prev)}
        className="bsvibe-sidebar-tenant-switcher__trigger min-h-[44px] inline-flex w-full items-center justify-between gap-2 rounded-md bg-gray-900 px-3 py-2 text-left text-sm text-gray-100 transition-colors hover:bg-gray-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
      >
        <span className="bsvibe-sidebar-tenant-switcher__current min-w-0 flex-1 truncate font-medium">
          {activeTenant?.name ?? ''}
        </span>
        <span aria-hidden="true" className="text-xs leading-none text-gray-400">
          ▾
        </span>
      </button>

      {open ? (
        <ul
          role="listbox"
          aria-label={ariaLabel}
          className="bsvibe-sidebar-tenant-switcher__listbox absolute bottom-full left-0 right-0 mb-2 overflow-hidden rounded-md border border-gray-800 bg-gray-950 py-1 shadow-lg"
        >
          {tenants.map((tenant) => {
            const active = tenant.id === activeTenantId;
            const optCls = [
              'bsvibe-sidebar-tenant-switcher__option',
              'min-h-[44px] flex items-center justify-between gap-2 px-3 py-2 cursor-pointer text-sm transition-colors',
              active
                ? 'bsvibe-sidebar-tenant-switcher__option--active text-[color:var(--color-accent)]'
                : 'text-gray-200 hover:bg-gray-900',
            ]
              .filter(Boolean)
              .join(' ');
            return (
              <li
                key={tenant.id}
                role="option"
                aria-selected={active}
                tabIndex={0}
                data-testid={dataTestId ? `${dataTestId}-${tenant.id}` : undefined}
                onClick={() => handleSelect(tenant.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleSelect(tenant.id);
                  }
                }}
                className={optCls}
                style={
                  active
                    ? {
                        backgroundColor:
                          'color-mix(in srgb, var(--color-accent) 12%, transparent)',
                      }
                    : undefined
                }
              >
                <span className="min-w-0 flex-1 truncate font-medium">
                  {tenant.name}
                </span>
                {tenant.role ? (
                  <span className="bsvibe-sidebar-tenant-switcher__role text-[10px] uppercase tracking-widest text-gray-500">
                    {tenant.role}
                  </span>
                ) : null}
                {active ? (
                  <span aria-hidden="true" className="text-xs">
                    ✓
                  </span>
                ) : null}
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
