/**
 * @bsvibe/layout — shared App Router layouts for the BSVibe ecosystem.
 *
 * Phase A surface (Next.js 15 App Router, React 19):
 *  - <AppShell>           sidebar + (optional) header + main slot (RSC-eligible)
 *  - <Header>             title + right-slot banner (RSC)
 *  - <ResponsiveSidebar>  next/link + usePathname-driven nav (Client)
 *  - <ProtectedRoute>     useAuth() gate with useEffect + router.replace (BSNexus Phase Z pattern)
 *  - makeAuthedLayout()   factory composing ProtectedRoute + AppShell into a Next.js (authed)/layout.tsx
 *
 * SoT: 4개 제품의 ~80 LOC 동일 보일러플레이트 (BSGateway/BSNexus가 가장 풍부).
 */

export { AppShell } from './AppShell';
export type { AppShellProps } from './AppShell';

export { Header } from './Header';
export type { HeaderProps } from './Header';

export { ResponsiveSidebar } from './ResponsiveSidebar';
export type { ResponsiveSidebarProps, SidebarItem } from './ResponsiveSidebar';

export { SidebarBrand } from './SidebarBrand';
export type { SidebarBrandProps } from './SidebarBrand';

export { SidebarUserCard } from './SidebarUserCard';
export type { SidebarUserCardProps } from './SidebarUserCard';

export { ProtectedRoute } from './ProtectedRoute';
export type { ProtectedRouteProps } from './ProtectedRoute';

export { makeAuthedLayout } from './makeAuthedLayout';
export type { MakeAuthedLayoutOptions } from './makeAuthedLayout';
