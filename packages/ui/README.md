# @bsvibe/ui

BSVibe UI primitives — RSC-first, with `'use client'` only for interactive parts.

## Status

Placeholder (Phase A bootstrap). Phase A 후속 PR에서 본 구현 + Storybook config.

## Planned Components (Phase A, D3)

- `<Button>` (variants: primary/secondary/ghost/danger, sizes: sm/md/lg)
- `<Modal>` (Radix Dialog 래핑, RSC가 children에 server data 전달 가능)
- `<Badge>` (variants: info/success/warning/error)
- `<Input>` + `<Textarea>` + `<Select>`
- `<Card>` + `<CardHeader>` + `<CardBody>` + `<CardFooter>`
- `<LoadingSpinner>`, `<ErrorBanner>`

## Storybook (GitHub Pages, 결정 #13)

`pnpm --filter @bsvibe/ui storybook` (Phase A 후속 PR에서 추가).

`main` push → `.github/workflows/storybook.yml` → static build → GitHub Pages 배포.

## Design Tokens

This package consumes `@bsvibe/design-tokens` for all colors, spacing, and typography. Apps must import the token CSS:

```tsx
// app/layout.tsx
import "@bsvibe/design-tokens/css";
```
