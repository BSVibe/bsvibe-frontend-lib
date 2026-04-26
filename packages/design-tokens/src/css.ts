/**
 * @bsvibe/design-tokens/css.ts — programmatic CSS variable generator.
 *
 * For most consumers, `import "@bsvibe/design-tokens/css"` (which loads
 * `styles/globals.css`) is enough — that file declares all CSS variables
 * inside a Tailwind 4 `@theme {}` block and a `:root` block.
 *
 * This module is for the rare case where a consumer needs to *generate*
 * the CSS at build time (e.g. inline it into a non-Tailwind app like
 * BSVibe-Auth's auth-app, or a Storybook decorator).
 *
 * It returns a string that, when written to disk, is byte-equivalent to
 * the canonical `styles/globals.css` `@theme` block (modulo whitespace).
 * `pnpm tokens:verify` checks this stays in sync.
 */

import { alias, brand, gray, m3, motion, radius, shadow, spacing } from "./index.js";

/**
 * Build the `@theme {}` body — the lines that go between the braces.
 * Tailwind 4 reads each `--*` line as a token and exposes matching
 * utilities (e.g. `--color-gray-500: ...` → `bg-gray-500`).
 */
export function buildThemeBlockBody(): string {
  const lines: string[] = [];

  // Gray scale → Tailwind 4 `--color-gray-*`
  for (const [k, v] of Object.entries(gray)) {
    lines.push(`  --color-gray-${k}: ${v};`);
  }

  // Brand accents → Tailwind 4 color tokens (`--color-indigo-500`, etc.)
  for (const [name, hex] of Object.entries(brand)) {
    lines.push(`  --color-${name}-500: ${hex};`);
  }

  // Radius
  for (const [k, v] of Object.entries(radius)) {
    lines.push(`  --radius-${k}: ${v};`);
  }

  // Spacing (Tailwind 4 also exposes `--spacing` as the base unit, but we
  // provide explicit named stops for clarity)
  for (const [k, v] of Object.entries(spacing)) {
    lines.push(`  --spacing-${k}: ${v};`);
  }

  // Shadow
  for (const [k, v] of Object.entries(shadow)) {
    lines.push(`  --shadow-${k}: ${v};`);
  }

  return lines.join("\n");
}

/**
 * Build the `:root` body — the application-level role tokens
 * (alias / motion / fonts / Material 3 surface). These are *not* in
 * `@theme` because they're consumed by hand-written CSS, not Tailwind
 * utility generation.
 */
export function buildRootBlockBody(): string {
  const lines: string[] = [];

  // Alias roles (background / text / border / accent)
  lines.push(`  --bg-base: ${alias.bgBase};`);
  lines.push(`  --bg-surface: ${alias.bgSurface};`);
  lines.push(`  --bg-elevated: ${alias.bgElevated};`);
  lines.push(`  --bg-hover: ${alias.bgHover};`);
  lines.push(`  --bg-active: ${alias.bgActive};`);

  lines.push(`  --text-primary: ${alias.textPrimary};`);
  lines.push(`  --text-secondary: ${alias.textSecondary};`);
  lines.push(`  --text-tertiary: ${alias.textTertiary};`);
  lines.push(`  --text-disabled: ${alias.textDisabled};`);
  lines.push(`  --text-inverse: ${alias.textInverse};`);

  lines.push(`  --border-default: ${alias.borderDefault};`);
  lines.push(`  --border-subtle: ${alias.borderSubtle};`);
  lines.push(`  --border-strong: ${alias.borderStrong};`);

  lines.push(`  --accent: ${alias.accentDefault};`);

  // Motion
  lines.push(`  --duration-fast: ${motion.durationFast};`);
  lines.push(`  --duration-normal: ${motion.durationNormal};`);
  lines.push(`  --duration-slow: ${motion.durationSlow};`);
  lines.push(`  --easing-default: ${motion.easingDefault};`);
  lines.push(`  --easing-bounce: ${motion.easingBounce};`);

  // Material 3 surface/role tokens (BSGateway compat)
  for (const [k, v] of Object.entries(m3)) {
    const kebab = k.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);
    lines.push(`  --m3-${kebab}: ${v};`);
  }

  return lines.join("\n");
}

/**
 * Return the full CSS file content (theme block + root block + base
 * font/scrollbar reset). Byte-equivalent to `styles/globals.css`.
 */
export function buildGlobalsCss(): string {
  return [
    "/* @bsvibe/design-tokens — generated. Do not edit by hand.",
    " * Canonical TS source: packages/design-tokens/src/index.ts",
    " * Drift guard: `pnpm --filter @bsvibe/design-tokens verify`",
    " */",
    "",
    "@theme {",
    buildThemeBlockBody(),
    "}",
    "",
    ":root {",
    buildRootBlockBody(),
    "}",
    "",
  ].join("\n");
}
