# @bsvibe/layout

BSVibe shared layout components for Next.js 15 App Router.

## Status

Placeholder (Phase A bootstrap). Phase A 후속에서 4개 제품 `ResponsiveSidebar` 보일러플레이트(~80 LOC × 4) 통합.

## Planned Exports

```tsx
import { AppShell, ResponsiveSidebar, ResponsiveTable } from "@bsvibe/layout";

// Server Component
<AppShell sidebar={<Nav />} header={<Header />}>
  {children}
</AppShell>

// Client Component
<ResponsiveSidebar logo={<Logo />} items={navItems} footer={<UserMenu />} />

// Server Component (with Client interactive parts)
<ResponsiveTable columns={...} rows={...} />
```

Phase B 강화: terminal 가로 스크롤, sticky 첫 컬럼, swipe-to-close 검증, 터치 타겟 44px+.
