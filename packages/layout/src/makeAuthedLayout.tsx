'use client';

import type { ComponentType, ReactNode } from 'react';
import { AppShell } from './AppShell';
import { ProtectedRoute } from './ProtectedRoute';

export interface MakeAuthedLayoutOptions {
  /** Sidebar slot for `<AppShell>` — typically `<ResponsiveSidebar … />`. */
  sidebar: ReactNode;
  /** Optional header slot for `<AppShell>` — typically `<Header … />`. */
  header?: ReactNode;
  /** Where to send unauthenticated users. Default: `/login`. */
  redirectTo?: string;
  /** Loading fallback while `useAuth()` resolves. Default: `null`. */
  fallback?: ReactNode;
  /** Extra class merged onto the `<AppShell>` root. */
  className?: string;
}

/**
 * makeAuthedLayout builds the canonical Next.js `(authed)/layout.tsx`
 * route-group layout: authentication gate + AppShell composition.
 *
 * Usage in a product's `app/(authed)/layout.tsx`:
 *
 *     import { makeAuthedLayout, ResponsiveSidebar } from '@bsvibe/layout';
 *     import { NAV_ITEMS } from '../_lib/nav';
 *
 *     const AuthedLayout = makeAuthedLayout({
 *       sidebar: <ResponsiveSidebar items={NAV_ITEMS} />,
 *       header: <Header title="BSNexus" />,
 *     });
 *     export default AuthedLayout;
 *
 * The (authed) route-group lets a product keep `app/login/page.tsx`
 * and `app/(authed)/dashboard/page.tsx` side-by-side without nesting
 * the auth gate at the root layout. This is the BSNexus + BSupervisor
 * Phase Z pattern.
 *
 * Why a factory and not a component? Because the sidebar / header are
 * product-specific (nav items, branding) but the *composition* is
 * universal. The factory captures the product-specific parts at module
 * load and returns a server-eligible component that takes only
 * `children` — exactly the Next.js layout signature.
 */
export function makeAuthedLayout(
  opts: MakeAuthedLayoutOptions,
): ComponentType<{ children: ReactNode }> {
  const { sidebar, header, redirectTo, fallback, className } = opts;

  function AuthedLayout({ children }: { children: ReactNode }) {
    return (
      <ProtectedRoute redirectTo={redirectTo} fallback={fallback}>
        <AppShell sidebar={sidebar} header={header} className={className}>
          {children}
        </AppShell>
      </ProtectedRoute>
    );
  }

  AuthedLayout.displayName = 'AuthedLayout';
  return AuthedLayout;
}
