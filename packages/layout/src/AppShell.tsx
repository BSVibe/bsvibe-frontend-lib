import type { ReactNode } from 'react';

export interface AppShellProps {
  /** Sidebar slot — typically `<ResponsiveSidebar … />`. Required. */
  sidebar: ReactNode;
  /** Optional top-bar slot — typically `<Header … />`. */
  header?: ReactNode;
  /** Page content rendered inside `<main>`. */
  children: ReactNode;
  /** Optional extra class on the root container (composition over recreation). */
  className?: string;
}

/**
 * AppShell is the root layout wrapper for an authed Next.js App Router page.
 *
 * It is intentionally a *server component* — it has no client state. All
 * interactive bits (sidebar collapse, user menu) live in the slotted
 * `sidebar` / `header` components, which can opt into `'use client'`
 * independently. This keeps the bulk of the layout tree as RSC.
 *
 * Layout shape:
 *
 *     ┌──────────────────────────────────────┐
 *     │ sidebar │       header (optional)    │
 *     │         │────────────────────────────│
 *     │         │                            │
 *     │         │   <main>{children}</main>  │
 *     │         │                            │
 *     └──────────────────────────────────────┘
 *
 * Note: this package does not ship Tailwind/CSS in 0.1.0. The class names
 * below are utility hooks that the consuming product's design-token CSS
 * (or its Tailwind config) maps to actual styling. Phase B will harden the
 * mobile responsive behaviour of the slotted `<ResponsiveSidebar>`.
 */
export function AppShell({
  sidebar,
  header,
  children,
  className,
}: AppShellProps) {
  const rootCls = ['bsvibe-appshell', className].filter(Boolean).join(' ');
  return (
    <div className={rootCls}>
      {sidebar}
      <div className="bsvibe-appshell__column">
        {header ?? null}
        <main className="bsvibe-appshell__main">{children}</main>
      </div>
    </div>
  );
}
