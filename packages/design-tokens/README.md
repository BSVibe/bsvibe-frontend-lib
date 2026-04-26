# @bsvibe/design-tokens

BSVibe shared design tokens — Tailwind 4 preset + CSS variables.

## Status

Placeholder (Phase A bootstrap). Phase A 후속에서 BSNexus `design-tokens.ts`를 SoT로 추출.

## Planned Exports

```ts
import preset from "@bsvibe/design-tokens";

// tailwind.config.ts
export default {
  presets: [preset],
};
```

```css
/* layout.tsx (RSC) */
import "@bsvibe/design-tokens/css";
```

## Tokens

- `--stitch-primary` (indigo #6366f1)
- `--stitch-bg` / `--stitch-bg-soft` / `--stitch-fg` / `--stitch-fg-muted`
- `--stitch-border`
- Typography scale (Plus Jakarta Sans)
- Spacing / radius scale
