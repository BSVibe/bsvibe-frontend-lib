/**
 * Phase A cleanup — accent override drift guard.
 *
 * Each of the four products + bsvibe-site brands its UI with a different
 * accent colour. The canonical override mechanism is the Tailwind 4
 * `@theme {}` shadow-vars pattern, which makes `bg-accent`, `text-accent`,
 * etc. work as Tailwind utilities (not just `var(--accent)` consumers).
 *
 * This test pins both halves of that contract:
 *
 *   1. `styles/globals.css` declares `--color-accent` and
 *      `--color-accent-hover` inside an `@theme {}` block so Tailwind 4
 *      generates the utility classes.
 *   2. `README.md` shows the canonical product override snippet so every
 *      Phase A consumer copies the same pattern.
 *
 * Without this guard the override mechanism drifts back into per-product
 * `:root` hacks that don't generate Tailwind utilities.
 */
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const PKG_ROOT = resolve(__dirname, "..");

function readRepoFile(rel: string): string {
  return readFileSync(resolve(PKG_ROOT, rel), "utf8");
}

describe("accent override @theme contract", () => {
  it("exposes --color-accent in the @theme block of globals.css", () => {
    const raw = readRepoFile("styles/globals.css");
    // Strip CSS block comments first — the @theme docs comment contains a
    // nested `@theme { ... }` example that would otherwise close our outer
    // capture early.
    const css = raw.replace(/\/\*[\s\S]*?\*\//g, "");
    const themeBlock = css.match(/@theme\s*\{([\s\S]*?)\n\}/);
    expect(themeBlock, "globals.css must declare an @theme {} block").not.toBeNull();
    expect(themeBlock![1]).toMatch(/--color-accent\s*:/);
    expect(themeBlock![1]).toMatch(/--color-accent-hover\s*:/);
  });

  it("documents the canonical accent override pattern in README.md", () => {
    const readme = readRepoFile("README.md");
    // The README must show the @theme shadow-vars approach so consumers
    // copy the same pattern. We check for the literal token names rather
    // than full snippets to keep the guard cheap.
    expect(readme).toMatch(/@theme\s*\{/);
    expect(readme).toMatch(/--color-accent\s*:/);
    expect(readme).toMatch(/--color-accent-hover\s*:/);
  });
});
