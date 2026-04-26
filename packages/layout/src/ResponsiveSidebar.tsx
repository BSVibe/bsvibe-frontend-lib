'use client';

import { useState, type ReactNode } from 'react';
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
 * the open/closed state for mobile.
 *
 * Behaviour (Phase A):
 *  - Hamburger toggles open state.
 *  - Backdrop click closes.
 *  - Clicking any nav link closes (mobile UX — matches all 4 products' SoT).
 *  - `usePathname()` drives `aria-current="page"` on the active item.
 *
 * Phase B will harden the mobile reactive behaviour (44px touch targets,
 * swipe-to-close, motion-reduced animation). Class names are utility hooks
 * that the consuming product's Tailwind/design-token CSS styles. Phase A
 * does not ship CSS in this package.
 */
export function ResponsiveSidebar({
  items,
  logo,
  footer,
  ariaLabel = 'Primary navigation',
  className,
}: ResponsiveSidebarProps) {
  const pathname = usePathname() ?? '/';
  const [open, setOpen] = useState(false);

  const asideCls = [
    'bsvibe-sidebar',
    open ? 'bsvibe-sidebar--open' : 'bsvibe-sidebar--closed',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <>
      {/* Hamburger trigger — typically hidden via CSS on >= md breakpoint. */}
      <button
        type="button"
        aria-label="Open navigation"
        aria-expanded={open}
        className="bsvibe-sidebar__hamburger"
        onClick={() => setOpen(true)}
      >
        <span aria-hidden="true">☰</span>
      </button>

      {/* Backdrop — only present when open. Clicking closes. */}
      {open ? (
        <div
          data-testid="bsvibe-sidebar-backdrop"
          className="bsvibe-sidebar__backdrop"
          onClick={() => setOpen(false)}
          role="presentation"
        />
      ) : null}

      <aside className={asideCls} aria-label={ariaLabel}>
        {logo !== undefined && logo !== null ? (
          <div className="bsvibe-sidebar__logo">{logo}</div>
        ) : null}

        <nav className="bsvibe-sidebar__nav" aria-label={ariaLabel}>
          {items.map((item) => {
            const active = isActivePath(item.href, pathname);
            const itemCls = [
              'bsvibe-sidebar__item',
              active ? 'bsvibe-sidebar__item--active' : null,
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
          <div className="bsvibe-sidebar__footer">{footer}</div>
        ) : null}
      </aside>
    </>
  );
}
