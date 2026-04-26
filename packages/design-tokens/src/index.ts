/**
 * @bsvibe/design-tokens — TypeScript source of truth.
 *
 * Mirrors `~/Docs/design_system.md` v0.1.0 verbatim. The Tailwind 4
 * `@theme {}` block in `styles/globals.css` mirrors the values below;
 * `pnpm tokens:verify` (or `pnpm --filter @bsvibe/design-tokens verify`)
 * catches drift in CI.
 *
 * Extracted from:
 *  - BSNexus `frontend/src/design-tokens.ts` (canonical SoT, 4-product palette)
 *  - BSGateway `frontend/tailwind.config.js` (Material 3 surface/role tokens)
 *
 * Phase A scope: 4 products + bsvibe-site + auth-app share this package.
 *
 * Usage (CSS-first):
 *   // app/layout.tsx (RSC) or src/main.tsx
 *   import "@bsvibe/design-tokens/css";
 *
 * Usage (TypeScript values, e.g. inline styles or chart libs):
 *   import { gray, brand, alias } from "@bsvibe/design-tokens";
 */

/* ──────────────────────────────────────────────────────────────────────── */
/* Gray scale (background / text / border) — 12 stops                      */
/* ──────────────────────────────────────────────────────────────────────── */

export const gray = {
  50: "#f2f3f7",
  100: "#e4e6ee",
  200: "#c8ccdb",
  300: "#a8adc6",
  400: "#8187a8",
  500: "#5a5f7d",
  600: "#3d4160",
  700: "#2a2d42",
  800: "#1e2033",
  850: "#181926",
  900: "#111218",
  950: "#0a0b0f",
} as const;

/* ──────────────────────────────────────────────────────────────────────── */
/* Brand accents (each product = one color, 500 is the canonical shade)    */
/* ──────────────────────────────────────────────────────────────────────── */

export const brand = {
  indigo: "#6366f1", // BSVibe (umbrella)
  blue: "#3b82f6", // BSNexus
  amber: "#f59e0b", // BSGateway
  rose: "#f43f5e", // BSupervisor
  emerald: "#10b981", // BSage
} as const;

/* ──────────────────────────────────────────────────────────────────────── */
/* Product → accent mapping. Each product overrides `--accent` to its hue. */
/* ──────────────────────────────────────────────────────────────────────── */

export const product = {
  bsvibe: brand.indigo,
  bsnexus: brand.blue,
  bsgateway: brand.amber,
  bsupervisor: brand.rose,
  bsage: brand.emerald,
} as const;

/* ──────────────────────────────────────────────────────────────────────── */
/* Semantic mapping (success/warning/error/info → brand)                   */
/* ──────────────────────────────────────────────────────────────────────── */

export const semantic = {
  success: brand.emerald,
  warning: brand.amber,
  error: brand.rose,
  info: brand.blue,
} as const;

/* ──────────────────────────────────────────────────────────────────────── */
/* Alias tokens — give roles to gray/brand stops                           */
/* ──────────────────────────────────────────────────────────────────────── */

export const alias = {
  bgBase: gray[950],
  bgSurface: gray[900],
  bgElevated: gray[850],
  bgHover: gray[800],
  bgActive: gray[700],

  textPrimary: gray[50],
  textSecondary: gray[400],
  textTertiary: gray[500],
  textDisabled: gray[600],
  textInverse: gray[950],

  borderDefault: gray[700],
  borderSubtle: gray[800],
  borderStrong: gray[600],

  /** Default accent. Each product overrides via `--accent` CSS var. */
  accentDefault: product.bsnexus,
} as const;

/* ──────────────────────────────────────────────────────────────────────── */
/* Radius scale                                                            */
/* ──────────────────────────────────────────────────────────────────────── */

export const radius = {
  sm: "4px",
  md: "8px",
  lg: "12px",
  xl: "16px",
  full: "9999px",
} as const;

/* ──────────────────────────────────────────────────────────────────────── */
/* Spacing (4px-based scale, Tailwind aligned)                             */
/* ──────────────────────────────────────────────────────────────────────── */

export const spacing = {
  "0.5": "2px",
  "1": "4px",
  "2": "8px",
  "3": "12px",
  "4": "16px",
  "6": "24px",
  "8": "32px",
  "12": "48px",
  "16": "64px",
  "24": "96px",
} as const;

/* ──────────────────────────────────────────────────────────────────────── */
/* Typography                                                              */
/* ──────────────────────────────────────────────────────────────────────── */

export const typography = {
  fontFamily: {
    sans: '"Plus Jakarta Sans", ui-sans-serif, system-ui, -apple-system, sans-serif',
    mono: '"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
  },
  scale: {
    xs: { size: "0.75rem", lineHeight: "1rem", weight: 400 },
    sm: { size: "0.875rem", lineHeight: "1.25rem", weight: 400 },
    base: { size: "1rem", lineHeight: "1.5rem", weight: 400 },
    lg: { size: "1.125rem", lineHeight: "1.75rem", weight: 500 },
    xl: { size: "1.25rem", lineHeight: "1.75rem", weight: 600 },
    "2xl": { size: "1.5rem", lineHeight: "2rem", weight: 600 },
    "3xl": { size: "1.875rem", lineHeight: "2.25rem", weight: 700 },
    "4xl": { size: "2.25rem", lineHeight: "2.5rem", weight: 700 },
  },
} as const;

/* ──────────────────────────────────────────────────────────────────────── */
/* Shadow / motion                                                         */
/* ──────────────────────────────────────────────────────────────────────── */

export const shadow = {
  sm: "0 1px 2px rgba(0, 0, 0, 0.3)",
  md: "0 4px 12px rgba(0, 0, 0, 0.4)",
  lg: "0 8px 24px rgba(0, 0, 0, 0.5)",
} as const;

export const motion = {
  durationFast: "100ms",
  durationNormal: "200ms",
  durationSlow: "300ms",
  easingDefault: "cubic-bezier(0.4, 0, 0.2, 1)",
  easingBounce: "cubic-bezier(0.34, 1.56, 0.64, 1)",
} as const;

/* ──────────────────────────────────────────────────────────────────────── */
/* Material 3 surface/role tokens (BSGateway Phase Z migration target).    */
/* These were hardcoded in BSGateway `tailwind.config.js`; lifting them    */
/* here so Phase Z can switch BSGateway to consume `@bsvibe/design-tokens` */
/* and the Material 3 amber dark theme keeps rendering identically.        */
/*                                                                          */
/* Naming follows Material 3 spec (`md.sys.color.*`) flattened to          */
/* CSS-friendly kebab. The CSS var prefix is `--m3-`.                       */
/* ──────────────────────────────────────────────────────────────────────── */

export const m3 = {
  primary: "#ffc174",
  primaryContainer: "#f59e0b",
  onPrimary: "#472a00",
  onPrimaryContainer: "#613b00",

  secondary: "#f0bd82",
  secondaryContainer: "#62400f",
  onSecondary: "#472a00",
  onSecondaryContainer: "#ddac72",

  tertiary: "#8fd5ff",
  tertiaryContainer: "#1abdff",
  onTertiary: "#00344a",
  onTertiaryContainer: "#004966",

  error: "#ffb4ab",
  errorContainer: "#93000a",
  onError: "#690005",
  onErrorContainer: "#ffdad6",

  surface: "#121317",
  surfaceDim: "#121317",
  surfaceBright: "#38393e",
  surfaceContainerLowest: "#0d0e12",
  surfaceContainerLow: "#1a1b20",
  surfaceContainer: "#1f1f24",
  surfaceContainerHigh: "#292a2e",
  surfaceContainerHighest: "#343439",
  surfaceVariant: "#343439",

  onSurface: "#e3e2e8",
  onSurfaceVariant: "#d8c3ad",
  onBackground: "#e3e2e8",

  outline: "#a08e7a",
  outlineVariant: "#534434",
  background: "#121317",

  inverseSurface: "#e3e2e8",
  inverseOnSurface: "#2f3035",
  inversePrimary: "#855300",
  surfaceTint: "#ffb95f",
} as const;

/* ──────────────────────────────────────────────────────────────────────── */
/* Type exports                                                            */
/* ──────────────────────────────────────────────────────────────────────── */

export type Gray = typeof gray;
export type Brand = typeof brand;
export type Product = typeof product;
export type Semantic = typeof semantic;
export type Alias = typeof alias;
export type Radius = typeof radius;
export type Spacing = typeof spacing;
export type Typography = typeof typography;
export type Shadow = typeof shadow;
export type Motion = typeof motion;
export type Material3 = typeof m3;

/* ──────────────────────────────────────────────────────────────────────── */
/* Bundle (single source of truth for verification)                        */
/* ──────────────────────────────────────────────────────────────────────── */

export const tokens = {
  gray,
  brand,
  product,
  semantic,
  alias,
  radius,
  spacing,
  typography,
  shadow,
  motion,
  m3,
} as const;

export type Tokens = typeof tokens;
