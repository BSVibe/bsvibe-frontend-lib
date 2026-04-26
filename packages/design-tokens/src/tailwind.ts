/**
 * @bsvibe/design-tokens/tailwind — Tailwind 4 preset entry.
 *
 * Tailwind 4 is CSS-first — there is no JS preset object like in v3.
 * The canonical way to consume our tokens in Tailwind 4 is to import
 * the `@theme {}` block from CSS:
 *
 *   // app/globals.css (or src/index.css)
 *   @import "tailwindcss";
 *   @import "@bsvibe/design-tokens/css";
 *
 * That single line gives every product the full token set (gray scale,
 * brand accents, alias roles, M3 surface tokens, radius, spacing, motion).
 *
 * This module exists as an explicit subpath export (`./tailwind`) so
 * tooling can resolve the CSS file path at runtime if it needs to do
 * something fancier (e.g. a Storybook preset, a Next.js plugin).
 */

import { tokens } from "./index.js";

/**
 * Absolute path of the canonical CSS file inside the published package.
 * Equivalent to the `./css` subpath export.
 *
 * Note: this is a pnpm/npm subpath, not a filesystem path. Tools that
 * need a real path should `require.resolve("@bsvibe/design-tokens/css")`.
 */
export const TAILWIND_CSS_SUBPATH = "@bsvibe/design-tokens/css" as const;

/**
 * The token bundle, re-exported for tools that want to compute Tailwind
 * config programmatically (e.g. generate matching JS values for a
 * non-Tailwind consumer like a chart library).
 */
export const tailwindTokens = tokens;

export type TailwindTokens = typeof tailwindTokens;
