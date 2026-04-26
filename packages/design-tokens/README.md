# @bsvibe/design-tokens

BSVibe shared design tokens — TypeScript source of truth + Tailwind 4
`@theme` CSS variables. Single source consumed by all four products
(BSGateway, BSNexus, BSupervisor, BSage), the marketing site
`bsvibe-site`, and `BSVibe-Auth/auth-app`.

## Status

Phase A — `0.1.0`. Extracted from:

- BSNexus `frontend/src/design-tokens.ts` (canonical 4-product palette,
  matches `~/Docs/design_system.md` v0.1.0).
- BSGateway `frontend/tailwind.config.js` (Material 3 surface/role
  tokens — `--m3-*` namespace).

## What's in the box

| Namespace          | Examples                                                                | Purpose                                       |
| ------------------ | ----------------------------------------------------------------------- | --------------------------------------------- |
| `gray` (12 stops)  | `gray-50` ... `gray-950` plus `850` mid-step                            | Backgrounds, text, borders                    |
| `brand` (5 colors) | `indigo`, `blue`, `amber`, `rose`, `emerald`                            | One color per product                         |
| `product`          | `product.bsnexus → blue`                                                | Product → accent mapping                      |
| `semantic`         | `success`, `warning`, `error`, `info`                                   | Brand-derived (no novel colors)               |
| `alias`            | `bgBase`, `textPrimary`, `borderDefault`, `accentDefault`               | Role-based aliases                            |
| `radius`           | `sm` 4px ... `xl` 16px, `full` pill                                     | Corner radii                                  |
| `spacing`          | `0.5` 2px ... `24` 96px                                                 | 4px-based spacing scale                       |
| `typography`       | Plus Jakarta Sans + JetBrains Mono, 8 type-scale stops                  | Font stacks + sizes                           |
| `shadow`           | `sm`, `md`, `lg`                                                        | Dark-theme depth                              |
| `motion`           | `durationFast/Normal/Slow`, `easingDefault/Bounce`                      | Transition timing                             |
| `m3`               | `primary`, `surface`, `surfaceContainerLowest`, `outlineVariant`, ...   | Material 3 dark amber (BSGateway compat)      |

## Usage

### Tailwind 4 (CSS-first config) — recommended

Add a single `@import` to your global CSS file:

```css
/* app/globals.css (Next.js) or src/index.css (Vite) */
@import "tailwindcss";
@import "@bsvibe/design-tokens/css";
```

That's it. The package's `styles/globals.css` declares all tokens inside
a Tailwind 4 `@theme {}` block, so utilities like `bg-gray-900`,
`text-gray-50`, `border-gray-700`, `rounded-md`, `shadow-md` work
immediately. Role aliases (`var(--bg-surface)`, `var(--accent)`,
`var(--m3-surface-container)`) are exposed via `:root {}`.

### Per-product accent override (canonical Phase A pattern)

The package exposes two accent slots — `--color-accent` and
`--color-accent-hover` — inside its `@theme {}` block. Override them in
your product's global CSS to repaint `bg-accent`, `text-accent`,
`hover:bg-accent-hover`, etc. across the entire app. Defaults to BSNexus
blue if omitted.

```css
/* app/globals.css (Next.js) or src/index.css (Vite) */
@import "tailwindcss";
@import "@bsvibe/design-tokens/css";

@theme {
  --color-accent: #f59e0b;       /* BSGateway amber-500 */
  --color-accent-hover: #d97706; /* amber-600 */
}
```

The Tailwind 4 `@theme {}` block "shadow-vars" the package's defaults at
build time, so `bg-accent`, `text-accent`, `border-accent`,
`hover:bg-accent-hover` are all generated as utility classes. No
`tailwind.config.js` is required.

#### Per-product accent table

| Product       | `--color-accent` | `--color-accent-hover` |
| ------------- | ---------------- | ---------------------- |
| BSNexus       | `#3b82f6` (blue-500)    | `#2563eb` (blue-600)    |
| BSGateway     | `#f59e0b` (amber-500)   | `#d97706` (amber-600)   |
| BSupervisor   | `#f43f5e` (rose-500)    | `#e11d48` (rose-600)    |
| BSage         | `#10b981` (emerald-500) | `#059669` (emerald-600) |
| BSVibe / site | `#6366f1` (indigo-500)  | `#4f46e5` (indigo-600)  |

#### Legacy `:root { --accent }` pattern (consumer-side CSS only)

For hand-written CSS that reads `var(--accent)` directly (e.g. auth-app,
which has no Tailwind), the package also exposes a plain `:root --accent`
variable. This is independent of the `@theme` shadow-vars pattern above
and only affects `var(--accent)` references — it does NOT generate
`bg-accent` Tailwind utilities. Use the `@theme {}` block above for
Tailwind 4 consumers.

```css
:root { --accent: #f43f5e; } /* legacy hand-written CSS only */
```

### TypeScript values (chart libs, inline styles)

```ts
import { brand, alias, gray, m3 } from "@bsvibe/design-tokens";

const chartColors = [brand.blue, brand.amber, brand.emerald, brand.rose];

const cardStyle = {
  backgroundColor: alias.bgSurface,
  border: `1px solid ${alias.borderSubtle}`,
};
```

### Tailwind 4 explicit subpath

```ts
import { TAILWIND_CSS_SUBPATH, tailwindTokens } from "@bsvibe/design-tokens/tailwind";
// Same `tokens` bundle, plus the canonical CSS subpath constant for tooling.
```

## 4-product migration patterns

### BSNexus (already on the canonical token set)

```diff
- /* frontend/src/index.css */
- @tailwind base; @tailwind components; @tailwind utilities;
- @layer base { :root { --gray-950: #0a0b0f; ... } }
+ @import "tailwindcss";
+ @import "@bsvibe/design-tokens/css";
+ /* keep the BSNexus-specific component classes (.sb, .btn-*, .badge, etc.) below */
```

Then delete `frontend/src/design-tokens.ts` and replace imports with
`from "@bsvibe/design-tokens"`. The `pnpm tokens:verify` script in
BSNexus is replaced by the package-level `pnpm --filter @bsvibe/design-tokens verify`.

### BSGateway (currently hardcoded Material 3 in tailwind.config.js)

```diff
- // frontend/tailwind.config.js
- export default {
-   theme: {
-     extend: {
-       colors: {
-         primary: '#ffc174',
-         'primary-container': '#f59e0b',
-         /* ... 30+ Material 3 tokens hardcoded ... */
-         gray: { 50: '#e3e2e8', ... },
-       },
-     },
-   },
- }
+ /* frontend/src/index.css */
+ @import "tailwindcss";
+ @import "@bsvibe/design-tokens/css";
+ :root { --accent: #f59e0b; } /* BSGateway amber */
+ /* tailwind.config.js is no longer required (Tailwind 4 CSS-first). */
```

Components that referenced `bg-primary`, `bg-surface-container-lowest`,
etc. should switch to `style={{ background: 'var(--m3-primary)' }}` or
add a thin Tailwind 4 utility layer that maps `bg-m3-primary` →
`var(--m3-primary)` (Tailwind 4 supports arbitrary `--` lookup natively).

### BSupervisor / BSage (already on CSS variables, simpler migration)

```diff
- /* frontend/src/index.css */
- :root { /* hand-maintained CSS vars copied from design_system.md */ }
+ @import "tailwindcss";
+ @import "@bsvibe/design-tokens/css";
+ :root { --accent: #f43f5e; } /* BSupervisor */
```

### bsvibe-site (Astro 6 + Tailwind 4 + React island)

```diff
- /* src/styles/global.css */
- :root { --accent: #6366f1; ... 50 LOC of vars ... }
+ @import "tailwindcss";
+ @import "@bsvibe/design-tokens/css";
+ /* :root --accent already defaults to BSNexus blue; bsvibe-site override: */
+ :root { --accent: #6366f1; }
```

### BSVibe-Auth `auth-app` (no Tailwind today, plain CSS)

`auth-app` doesn't use Tailwind, but it can still consume the role
aliases:

```css
/* auth-app/src/styles/tokens.css */
@import "@bsvibe/design-tokens/css";
/* Now var(--bg-surface), var(--accent), var(--m3-*) are available. */
```

When auth-app adopts Tailwind 4 (per Phase A D6), it switches to the
full `@theme` import.

## Drift guard

The TypeScript SoT (`src/index.ts`) and the static CSS file
(`styles/globals.css`) are both generated/edited by hand and must stay
in sync. The drift guard runs on every PR:

```bash
pnpm --filter @bsvibe/design-tokens build      # produces dist/index.js
pnpm --filter @bsvibe/design-tokens verify     # checks every TS value is in CSS
```

Pattern adopted from BSNexus `frontend/scripts/verify-design-tokens.mjs`.

## Versioning

- `0.1.0` — Phase A initial extraction (BSNexus tokens + BSGateway M3).
- `0.2.x` — minor token additions (e.g. light-theme alias set).
- `1.0.0` — first stable release after all 4 products consume the
  package and BSGateway hardcoded `tailwind.config.js` is deleted.

Breaking changes (renaming a TS export, removing a CSS variable) require
a major bump and a synchronized PR across every consumer.
