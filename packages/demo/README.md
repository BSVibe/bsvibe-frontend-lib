# @bsvibe/demo

Frontend SDK for the BSVibe public interactive-demo stack.

Companion to the Python `bsvibe-demo` package which runs on the demo
backend. This frontend package provides:

- `<DemoBanner>` — sticky top banner shown only on demo deployments
- `useAutoDemoSession(apiBaseUrl)` — auto-bootstraps a demo session on
  first mount (POSTs `/api/v1/demo/session` and stores the JWT cookie)
- `isDemoMode()` — checks the build-time `VITE_BSVIBE_DEMO=1` /
  `NEXT_PUBLIC_BSVIBE_DEMO=1` flag

## Install (per product)

Add to the product frontend's `package.json`:

```json
{
  "dependencies": {
    "@bsvibe/demo": "0.1.0"
  }
}
```

For local dev against this worktree, use a `pnpm workspace:*` reference
or path link.

## Integration recipe — Vite SPA (BSGateway, BSNexus, BSage)

In your top-level shell (e.g. `AppShell.tsx`):

```tsx
import { DemoBanner, useAutoDemoSession, isDemoMode } from "@bsvibe/demo";

function ShellInner({ children }) {
  if (isDemoMode()) {
    const { loading, error } = useAutoDemoSession(import.meta.env.VITE_API_URL);
    if (loading) return <Splash text="Setting up your demo..." />;
    if (error) return <Splash text={`Demo unavailable: ${error}`} />;

    return (
      <>
        <DemoBanner productName="BSGateway" locale="en" />
        <Layout>{children}</Layout>
      </>
    );
  }

  // Existing prod auth flow unchanged
  const { isAuthenticated, ... } = useAuth();
  if (!isAuthenticated) return <LoginPage />;
  return <Layout>{children}</Layout>;
}
```

Build-time env (Vercel demo project):

```
VITE_BSVIBE_DEMO=1
VITE_API_URL=https://api-demo-gateway.bsvibe.dev
```

## Integration recipe — Next App Router (bsvibe-site / future)

```tsx
"use client";
import { DemoBanner, useAutoDemoSession, isDemoMode } from "@bsvibe/demo";

export function DemoShell({ children }: { children: React.ReactNode }) {
  if (!isDemoMode()) return <>{children}</>;
  const { loading, error } = useAutoDemoSession(process.env.NEXT_PUBLIC_API_URL!);
  if (loading) return <Splash />;
  if (error) return <p>Demo unavailable: {error}</p>;
  return (
    <>
      <DemoBanner productName="BSGateway" locale="en" />
      {children}
    </>
  );
}
```

Build-time env (Vercel demo project):

```
NEXT_PUBLIC_BSVIBE_DEMO=1
NEXT_PUBLIC_API_URL=https://api-demo-gateway.bsvibe.dev
```

## CORS note

The demo session uses cookies. Backend must respond with
`Access-Control-Allow-Credentials: true` and the demo frontend's exact
origin (no wildcard). The fetch call in `useAutoDemoSession` already
sends `credentials: "include"`.

## Rollout per product

| Product | Frontend stack | Path |
|---|---|---|
| BSGateway | Vite + React 19 | `frontend/src/components/layout/AppShell.tsx` |
| BSNexus | Vite + React 19 | `frontend/src/components/layout/Layout.tsx` |
| BSupervisor | Next.js + React 19 | `app/[locale]/(protected)/layout.tsx` (wrap with DemoShell) |
| BSage | Vite SPA | `app/page.tsx` (in ClientApp) |

Each product needs:
1. Add `@bsvibe/demo` to its `package.json`
2. Wrap its top-level shell with the integration above
3. Add a Vercel demo project with the env vars
4. Map `demo-{product}.bsvibe.dev` to the demo project
