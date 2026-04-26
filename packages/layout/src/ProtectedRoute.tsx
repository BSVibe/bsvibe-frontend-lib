'use client';

import { useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@bsvibe/auth';

export interface ProtectedRouteProps {
  /** What to render once authenticated. */
  children: ReactNode;
  /** Where to send unauthenticated users. Default: `/login`. */
  redirectTo?: string;
  /**
   * Rendered while `useAuth()` is in its initial loading phase. Pass a
   * spinner / skeleton from your design system. Default: `null` (blank).
   */
  fallback?: ReactNode;
}

/**
 * ProtectedRoute is the children-receiving auth gate. It mirrors the
 * pattern used by BSNexus' Phase Z `ProtectedRoute` (when that lands)
 * and by every product's existing React-Router-based gate:
 *
 *   1. While auth is loading → render `fallback`.
 *   2. If user resolved → render `children`.
 *   3. If user is null and auth is settled → trigger `router.replace`
 *      from a `useEffect`, render nothing in the meantime.
 *
 * Why `useEffect + router.replace` and not `<Navigate to=… />` or a
 * direct `router.replace()` in the render body?
 *
 *   Calling navigation imperatively during a React render schedules a
 *   state update *while* React is rendering. In dev that's a warning;
 *   in production it's flaky (sometimes the navigation lands a tick
 *   late, sometimes the redirected page renders briefly before the
 *   replace lands). The Next.js docs flag this as "do not call
 *   router.push/replace in render" — it must come from an effect.
 *
 * This is the same pattern BSNexus' founder-metaphor PR codified;
 * we extract it here so all four products inherit it.
 */
export function ProtectedRoute({
  children,
  redirectTo = '/login',
  fallback = null,
}: ProtectedRouteProps) {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace(redirectTo);
    }
  }, [isLoading, user, redirectTo, router]);

  if (isLoading) return <>{fallback}</>;
  if (!user) return null; // wait for the effect-driven redirect to complete
  return <>{children}</>;
}
