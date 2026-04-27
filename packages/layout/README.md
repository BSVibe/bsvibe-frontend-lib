# @bsvibe/layout

Next.js 15 App Router layout primitives shared by every BSVibe product.

## What's in 0.2.0

| Export | Kind | Purpose |
|---|---|---|
| `<AppShell>` | RSC | Root wrapper: sidebar slot + optional header slot + `<main>{children}</main>`. No client state. |
| `<Header>` | RSC | Banner row with title + right slot (user menu, status pill, etc). |
| `<ResponsiveSidebar>` | Client | Collapsible primary nav. `next/link` + `usePathname` based active state. Mobile drawer (overlay + 44px tap targets + Escape close + controlled mode), inline rail on `md:`+. |
| `<ProtectedRoute>` | Client | Auth gate. `useEffect + router.replace` (never navigates during render). |
| `makeAuthedLayout({...})` | factory | Returns the canonical `app/(authed)/layout.tsx` component (auth gate + AppShell composition). |

### Phase B Batch 1 — mobile responsive

`<ResponsiveSidebar>` is now a real mobile drawer:

* below the `md:` breakpoint the aside is `fixed inset-y-0 left-0 -translate-x-full` and slides in via a `transform` transition;
* an overlay backdrop, an explicit Close button, the Escape key, and clicking any nav link all close it;
* every interactive surface (hamburger, close, nav links) is a `min-h-[44px] min-w-[44px]` tap target (WCAG 2.5.5);
* `defaultOpen` opens the drawer at mount; pass `open` + `onOpenChange` for fully controlled mode (e.g. when the hamburger lives inside `<Header>`).

## Usage

### Per-product `app/(authed)/layout.tsx`

```tsx
// app/(authed)/layout.tsx
import { makeAuthedLayout, ResponsiveSidebar, Header } from '@bsvibe/layout';

const NAV = [
  { href: '/', label: 'Dashboard' },
  { href: '/projects', label: 'Projects' },
  { href: '/settings', label: 'Settings' },
];

export default makeAuthedLayout({
  sidebar: <ResponsiveSidebar items={NAV} logo={<BrandLogo />} footer={<UserCard />} />,
  header: <Header title="BSNexus" rightSlot={<NotificationsButton />} />,
  redirectTo: '/login',
  fallback: <BootSpinner />,
});
```

### Standalone `<AppShell>`

```tsx
import { AppShell, ResponsiveSidebar, Header } from '@bsvibe/layout';

export default function Page() {
  return (
    <AppShell sidebar={<ResponsiveSidebar items={[]} />} header={<Header title="x" />}>
      <article>…</article>
    </AppShell>
  );
}
```

### Standalone `<ProtectedRoute>` (without AppShell)

```tsx
'use client';
import { ProtectedRoute } from '@bsvibe/layout';

export default function Wrapped({ children }: { children: React.ReactNode }) {
  return <ProtectedRoute redirectTo="/login">{children}</ProtectedRoute>;
}
```

## Phase Z auth-gate pattern (why useEffect + router.replace)

Calling `router.replace()` directly inside a render schedules a navigation
*during* React's render phase — in dev that's a warning, in production it
flickers. Always do it from a `useEffect`, with `null` as the placeholder
return until the redirect lands. `<ProtectedRoute>` enforces that pattern
so every product inherits it without re-discovering the trap.

## Styling

`@bsvibe/layout` ships **no CSS** in 0.1.0. Class names like
`bsvibe-appshell`, `bsvibe-sidebar`, `bsvibe-sidebar--open`,
`bsvibe-sidebar__hamburger` are utility hooks — your product's
Tailwind / design-token CSS provides the actual styling. This keeps the
package tree-shakeable and lets every product own its visual identity.

## Phase B (next)

- 44px+ touch targets on `<ResponsiveSidebar>`
- Swipe-to-close gesture
- `prefers-reduced-motion` honoring
- `<ResponsiveTable>` (Phase B addition)

## Tests

```bash
pnpm --filter @bsvibe/layout test
pnpm --filter @bsvibe/layout test:coverage
```

Phase A baseline: 28 tests, 100% line / function / statement coverage,
93.6% branch coverage. Threshold: 80% on every dimension.
