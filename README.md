# bsvibe-frontend-lib

BSVibe shared frontend libraries — pnpm workspace targeting Next.js 15 App Router + React 19 + Tailwind 4 + TypeScript.

Published to GitHub Packages under the `@bsvibe` org scope.

## Packages

| Package | Status | Purpose |
|---------|--------|---------|
| `@bsvibe/types` | placeholder | Shared TypeScript types (User, Tenant, Permission, ServiceTokenPayload, SessionEnvelope) |
| `@bsvibe/auth` | placeholder | Next.js middleware + Server Action `getServerUser()` + Client Hook `useAuth()`. Phase A 후속에서 BSVibe-Auth `js/` (`@bsvibe/auth` v0.4.0) 본 구현 통합 |
| `@bsvibe/design-tokens` | placeholder | Tailwind preset + CSS variables (BSNexus design-tokens.ts SoT 후속 추출) |
| `@bsvibe/layout` | placeholder | `<AppShell>`, `<ResponsiveSidebar>`, `<ResponsiveTable>` (Phase B 강화) |
| `@bsvibe/ui` | placeholder | UI primitives (Button/Modal/Badge/Input/Card) + Storybook (GitHub Pages) |
| `@bsvibe/api` | placeholder | Server fetch (RSC) + Server Action wrapper + Vercel→Route Handler adapter |
| `@bsvibe/i18n` | placeholder | `next-intl` wrapper + ko/en namespace base |

## Status

Phase A bootstrap (2026-04-26) — workspace + 7 package placeholders + CI.

Each package is a placeholder with empty exports. Implementations follow in subsequent PRs per [BSVibe_Shared_Library_Roadmap.md](https://github.com/BSVibe/BSVibe-Auth/blob/main/) §4-5.

Extraction order (per Lockin §A1-A4):
1. `@bsvibe/types` — User, Tenant, Permission, ServiceTokenPayload, SessionEnvelope
2. `@bsvibe/auth` — absorb `BSVibe-Auth/js` v0.4.0 + Next.js middleware/RSC helpers
3. `@bsvibe/design-tokens` — extract BSNexus `design-tokens.ts` as SoT
4. `@bsvibe/layout` — `<AppShell>` + `<ResponsiveSidebar>`
5. `@bsvibe/ui` — Button/Modal/Badge/Input/Card + Storybook
6. `@bsvibe/api` — server fetch + Server Action wrapper
7. `@bsvibe/i18n` — `next-intl` wrapper

## Development

Requires Node.js 20+ and pnpm 10+.

```bash
# Install all packages
pnpm install

# Build all
pnpm build

# Lint all
pnpm lint

# Test all
pnpm test
```

## Installation in consumer apps

Configure `.npmrc` in the consumer repo to authenticate with GitHub Packages:

```ini
@bsvibe:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${NPM_TOKEN}
```

Set `NPM_TOKEN` environment variable to a GitHub PAT with `read:packages` scope. For Vercel deployments, add `NPM_TOKEN` to project environment variables.

```bash
pnpm add @bsvibe/auth @bsvibe/ui @bsvibe/design-tokens
```

## Publishing

Tagged releases (`vX.Y.Z`) trigger `.github/workflows/publish.yml`, which publishes all packages to GitHub Packages.

A repo-level `NPM_TOKEN` secret with `write:packages` scope (org-scoped PAT) is required.

## License

[MIT](./LICENSE)
