# @bsvibe/ui

BSVibe UI primitives — RSC-first, with `'use client'` only for interactive parts.

## Status

`0.2.0` — Phase B Batch 1 (mobile responsive).

## Components

- `<Button>` (variants: primary/secondary/ghost/danger, sizes: sm/md/lg, 44px tap target)
- `<Modal>` (Escape + backdrop close, full-screen on `< sm`, rounded card on `>= sm`)
- `<Badge>` (variants: info/success/warning/error/neutral)
- `<Input>` (label + helper text + error, 16px font + 44px height for iOS no-zoom)
- `<Card>` + `<CardHeader>` + `<CardBody>` + `<CardFooter>`
- `<ResponsiveTable>` (desktop `<table>`, mobile card stack via `sm:` breakpoint, optional `renderMobileCard`)

### Phase B Batch 1 — mobile responsive

* `<Button>` floors at `min-h-[44px]` regardless of size (WCAG 2.5.5 / iOS HIG).
* `<Input>` defaults to `text-base` (1rem ≈ 16px) so iOS Safari does NOT auto-zoom on focus, and ships a 44px tap height.
* `<Modal>` panel fills the viewport on `< sm` (`w-full h-full max-h-[100dvh]`), and constrains to `width` on `>= sm` via the `--bsvibe-modal-width` CSS variable.
* `<ResponsiveTable>` ships a `<table>` AND a card stack from one tree; Tailwind `sm:` breakpoint chooses which one is visible. Override mobile rendering with `renderMobileCard?: (row, index) => ReactNode`. Desktop table is wrapped in `overflow-x-auto` so wide tables scroll horizontally instead of breaking layout.

## Storybook (GitHub Pages, 결정 #13)

`pnpm --filter @bsvibe/ui storybook` (Phase A 후속 PR에서 추가).

`main` push → `.github/workflows/storybook.yml` → static build → GitHub Pages 배포.

## Design Tokens

This package consumes `@bsvibe/design-tokens` for all colors, spacing, and typography. Apps must import the token CSS:

```tsx
// app/layout.tsx
import "@bsvibe/design-tokens/css";
```
