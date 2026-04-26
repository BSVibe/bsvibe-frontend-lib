#!/usr/bin/env node
/**
 * @bsvibe/design-tokens — drift guard.
 *
 * Verifies that every value in `src/index.ts` (TypeScript source of
 * truth) is present in `styles/globals.css`. The SoT is JS — if you
 * change it, you must update the CSS file too. This script catches
 * the inverse direction: someone hand-edited the CSS and forgot the TS.
 *
 * Strategy: load the built `dist/index.js` (or compile on the fly via
 * tsc), pull out every `(name, hex|px|ms|...)` pair we care about, then
 * grep the raw CSS for an exact substring `<value>`. If any TS value
 * isn't found in the CSS, fail.
 *
 * Borrowed from BSNexus `frontend/scripts/verify-design-tokens.mjs`,
 * adapted for the package layout (TS → CSS instead of MD → TS).
 *
 * Run: `node tools/verify-tokens.mjs` (after `pnpm build`).
 */
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PKG_ROOT = resolve(__dirname, "..");
const CSS_PATH = resolve(PKG_ROOT, "styles/globals.css");
const DIST_INDEX = resolve(PKG_ROOT, "dist/index.js");

if (!existsSync(DIST_INDEX)) {
  console.error(
    `verify-tokens: dist/index.js not found. Run 'pnpm build' first.`,
  );
  process.exit(2);
}
if (!existsSync(CSS_PATH)) {
  console.error(`verify-tokens: styles/globals.css not found.`);
  process.exit(2);
}

const mod = await import(pathToFileURL(DIST_INDEX).href);
const css = readFileSync(CSS_PATH, "utf8");

/**
 * Each check returns `[label, list of (name, value) pairs]`. The
 * verifier asserts that the `value` substring exists somewhere in the
 * CSS — we don't pin the exact `--var-name` because that would
 * double-couple TS naming and CSS naming, and we want the freedom to
 * rename one without churn.
 */
const checks = [
  ["gray", Object.entries(mod.gray)],
  ["brand", Object.entries(mod.brand)],
  ["radius", Object.entries(mod.radius)],
  ["spacing", Object.entries(mod.spacing)],
  ["shadow", Object.entries(mod.shadow)],
  ["motion", Object.entries(mod.motion)],
  ["m3", Object.entries(mod.m3)],
];

const errors = [];
for (const [label, pairs] of checks) {
  for (const [name, value] of pairs) {
    if (typeof value !== "string") continue; // skip nested (typography)
    if (!css.includes(value)) {
      errors.push(`  ${label}.${name}: TS value '${value}' missing from CSS`);
    }
  }
}

// Alias tokens are derived references; we still want them present.
for (const [name, value] of Object.entries(mod.alias)) {
  if (typeof value !== "string") continue;
  if (!css.includes(value)) {
    errors.push(`  alias.${name}: TS value '${value}' missing from CSS`);
  }
}

if (errors.length) {
  console.error(`design-tokens drift: TS source-of-truth → CSS file:`);
  for (const line of errors) console.error(line);
  process.exit(1);
}

const total = checks.reduce((n, [, p]) => n + p.length, 0);
console.log(
  `design-tokens: TS ↔ CSS in sync (${total} values + ${
    Object.keys(mod.alias).length
  } alias).`,
);
