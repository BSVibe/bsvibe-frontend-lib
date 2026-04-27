'use client';

import { useCallback, useEffect, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export interface SidebarItem {
  /** App-router path. The link uses `next/link`. */
  href: string;
  /** Visible label. */
  label: ReactNode;
  /** Optional leading icon (e.g. material-symbols span). */
  icon?: ReactNode;
}

export interface ResponsiveSidebarProps {
  /** Required nav list. Order is preserved. */
  items: readonly SidebarItem[];
  /** Optional top-of-sidebar logo / brand slot. */
  logo?: ReactNode;
  /** Optional bottom-of-sidebar slot (user card, logout, etc). */
  footer?: ReactNode;
  /** ARIA label for the `<aside>`. Default: "Primary navigation". */
  ariaLabel?: string;
  /** Extra class merged onto the root `<aside>`. */
  className?: string;
  /**
   * Initial open state for uncontrolled usage (mobile drawer).
   * Ignored when `open` is provided. Default: `false`.
   */
  defaultOpen?: boolean;
  /**
   * Controlled open state. When provided, the component becomes a controlled
   * component and consumers MUST handle `onOpenChange`. Useful when the
   * hamburger toggle lives outside the sidebar (e.g. inside `<Header>`).
   */
  open?: boolean;
  /**
   * Notification fired whenever the open state should change. Always invoked
   * on user interactions (hamburger / link / backdrop / Escape / close button)
   * regardless of controlled / uncontrolled mode.
   */
  onOpenChange?: (open: boolean) => void;
}

function isActivePath(itemHref: string, pathname: string): boolean {
  // Root link is active only on exact match — otherwise every page would
  // mark "/" as active. Non-root links match exact OR child paths.
  if (itemHref === '/') return pathname === '/';
  return pathname === itemHref || pathname.startsWith(`${itemHref}/`);
}

/**
 * ResponsiveSidebar is the collapsible primary nav, built on
 * `next/link` + `next/navigation`. It is `'use client'` because it owns
 * the open/closed drawer state on mobile.
 *
 * Behaviour (Phase B Batch 1):
 *  - Mobile (< md): drawer overlay with backdrop. Hamburger opens, link/backdrop/Escape/close button closes.
 *  - Desktop (>= md): inline rail; the same DOM is reused but Tailwind utilities position it statically.
 *  - All interactive surfaces (hamburger, close, links) are ≥ 44px tap targets (WCAG 2.5.5).
 *  - `aria-hidden` mirrors the open state so the closed drawer is not announced.
 *  - Optional controlled mode via `open` + `onOpenChange` (lets `<Header>` host the hamburger).
 *  - `usePathname()` drives `aria-current="page"` on the active item.
 *
 * Class names are utility hooks (Tailwind 4) — see `bsvibe-sidebar*` selectors.
 * No custom CSS dependency: classNames are co-located with sensible Tailwind
 * defaults that the consuming product can override via design-tokens.
 */
export function ResponsiveSidebar({
  items,
  logo,
  footer,
  ariaLabel = 'Primary navigation',
  className,
  defaultOpen = false,
  open: openProp,
  onOpenChange,
}: ResponsiveSidebarProps) {
  const pathname = usePathname() ?? '/';
  const [internalOpen, setInternalOpen] = useState<boolean>(defaultOpen);

  const isControlled = openProp !== undefined;
  const open = isControlled ? !!openProp : internalOpen;

  const setOpen = useCallback(
    (next: boolean) => {
      if (!isControlled) setInternalOpen(next);
      onOpenChange?.(next);
    },
    [isControlled, onOpenChange],
  );

  // Escape key closes the drawer (matches Modal UX). Listener is only
  // active while open — avoids spurious work on every page.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, setOpen]);

  const asideCls = [
    'bsvibe-sidebar',
    // Mobile: fixed drawer; desktop (md+): inline rail.
    'fixed inset-y-0 left-0 z-40 w-64 bg-gray-950 border-r border-gray-800',
    'transform transition-transform duration-200 ease-out motion-reduce:transition-none',
    open ? 'translate-x-0 bsvibe-sidebar--open' : '-translate-x-full bsvibe-sidebar--closed',
    'md:static md:translate-x-0 md:flex md:flex-col',
    'flex flex-col',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const TAP_TARGET = 'min-h-[44px] min-w-[44px]';

  return (
    <>
      {/* Hamburger trigger — hidden on md+ (desktop has inline rail). */}
      <button
        type="button"
        aria-label="Open navigation"
        aria-expanded={open}
        aria-controls="bsvibe-sidebar-drawer"
        className={`bsvibe-sidebar__hamburger ${TAP_TARGET} md:hidden inline-flex items-center justify-center rounded-md text-gray-100 hover:bg-gray-800 active:bg-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500`}
        onClick={() => setOpen(true)}
      >
        <span aria-hidden="true">☰</span>
      </button>

      {/* Backdrop — only present when open (mobile only). Clicking closes. */}
      {open ? (
        <div
          data-testid="bsvibe-sidebar-backdrop"
          className="bsvibe-sidebar__backdrop fixed inset-0 z-30 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setOpen(false)}
          role="presentation"
        />
      ) : null}

      <aside
        id="bsvibe-sidebar-drawer"
        className={asideCls}
        aria-label={ariaLabel}
        aria-hidden={!open}
      >
        {/* Top row: logo (always) + close button (mobile only). */}
        <div className="bsvibe-sidebar__topbar flex items-center justify-between px-3 py-3 border-b border-gray-800">
          {logo !== undefined && logo !== null ? (
            <div className="bsvibe-sidebar__logo">{logo}</div>
          ) : (
            <span />
          )}
          <button
            type="button"
            aria-label="Close navigation"
            onClick={() => setOpen(false)}
            className={`bsvibe-sidebar__close ${TAP_TARGET} md:hidden inline-flex items-center justify-center rounded-md text-gray-100 hover:bg-gray-800 active:bg-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500`}
          >
            <span aria-hidden="true">✕</span>
          </button>
        </div>

        <nav
          className="bsvibe-sidebar__nav flex-1 overflow-y-auto px-2 py-2"
          aria-label={ariaLabel}
        >
          {items.map((item) => {
            const active = isActivePath(item.href, pathname);
            const itemCls = [
              'bsvibe-sidebar__item',
              TAP_TARGET,
              'flex items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-200',
              'hover:bg-gray-800 active:bg-gray-700',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500',
              active
                ? 'bsvibe-sidebar__item--active bg-gray-800 text-gray-50 font-semibold'
                : null,
            ]
              .filter(Boolean)
              .join(' ');
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                aria-current={active ? 'page' : undefined}
                className={itemCls}
              >
                {item.icon !== undefined && item.icon !== null ? (
                  <span className="bsvibe-sidebar__item-icon">{item.icon}</span>
                ) : null}
                <span className="bsvibe-sidebar__item-label">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {footer !== undefined && footer !== null ? (
          <div className="bsvibe-sidebar__footer px-3 py-3 border-t border-gray-800">
            {footer}
          </div>
        ) : null}
      </aside>
    </>
  );
}
