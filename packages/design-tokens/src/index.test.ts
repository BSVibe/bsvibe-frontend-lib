/**
 * @bsvibe/design-tokens — TS source-of-truth shape & value invariants.
 *
 * These are unit-level guards. The cross-file drift guard between TS and
 * CSS lives in `tools/verify-tokens.mjs` and runs as `pnpm verify`.
 */
import { describe, expect, it } from "vitest";
import {
  alias,
  brand,
  gray,
  m3,
  motion,
  product,
  radius,
  semantic,
  shadow,
  spacing,
  tokens,
  typography,
} from "./index.js";

describe("@bsvibe/design-tokens TS source of truth", () => {
  it("has 12 gray stops including 850 mid-step", () => {
    const keys = Object.keys(gray);
    expect(keys).toHaveLength(12);
    expect(gray[950]).toBe("#0a0b0f");
    expect(gray[850]).toBe("#181926");
    expect(gray[50]).toBe("#f2f3f7");
  });

  it("brand 5-color palette matches design_system.md v0.1.0", () => {
    expect(brand.indigo).toBe("#6366f1");
    expect(brand.blue).toBe("#3b82f6");
    expect(brand.amber).toBe("#f59e0b");
    expect(brand.rose).toBe("#f43f5e");
    expect(brand.emerald).toBe("#10b981");
  });

  it("product mapping points each product at its brand color", () => {
    expect(product.bsvibe).toBe(brand.indigo);
    expect(product.bsnexus).toBe(brand.blue);
    expect(product.bsgateway).toBe(brand.amber);
    expect(product.bsupervisor).toBe(brand.rose);
    expect(product.bsage).toBe(brand.emerald);
  });

  it("semantic mapping is brand-derived (no novel colors)", () => {
    expect(semantic.success).toBe(brand.emerald);
    expect(semantic.warning).toBe(brand.amber);
    expect(semantic.error).toBe(brand.rose);
    expect(semantic.info).toBe(brand.blue);
  });

  it("alias roles use values from the gray scale (no orphans)", () => {
    const grayValues = new Set(Object.values(gray));
    expect(grayValues.has(alias.bgBase)).toBe(true);
    expect(grayValues.has(alias.bgSurface)).toBe(true);
    expect(grayValues.has(alias.textPrimary)).toBe(true);
    expect(grayValues.has(alias.borderDefault)).toBe(true);
  });

  it("alias.accentDefault is BSNexus blue (the canonical default)", () => {
    expect(alias.accentDefault).toBe(brand.blue);
  });

  it("radius scale follows 4-8-12-16 progression + full pill", () => {
    expect(radius.sm).toBe("4px");
    expect(radius.md).toBe("8px");
    expect(radius.lg).toBe("12px");
    expect(radius.xl).toBe("16px");
    expect(radius.full).toBe("9999px");
  });

  it("spacing scale is 4px-based with named stops", () => {
    expect(spacing["1"]).toBe("4px");
    expect(spacing["4"]).toBe("16px");
    expect(spacing["24"]).toBe("96px");
  });

  it("typography lists 8 type-scale stops xs..4xl", () => {
    const stops = Object.keys(typography.scale);
    expect(stops).toEqual(["xs", "sm", "base", "lg", "xl", "2xl", "3xl", "4xl"]);
  });

  it("Plus Jakarta Sans is the canonical UI font", () => {
    expect(typography.fontFamily.sans).toContain("Plus Jakarta Sans");
    expect(typography.fontFamily.mono).toContain("JetBrains Mono");
  });

  it("shadow & motion scales exist with sm/md/lg + fast/normal/slow", () => {
    expect(shadow.sm).toMatch(/^0 1px 2px/);
    expect(shadow.lg).toMatch(/^0 8px 24px/);
    expect(motion.durationFast).toBe("100ms");
    expect(motion.easingDefault).toContain("cubic-bezier");
  });

  it("Material 3 tokens cover BSGateway dark amber theme verbatim", () => {
    // Spot-check the values BSGateway tailwind.config.js had hardcoded —
    // these MUST stay byte-identical or BSGateway's dark theme regresses
    // when it migrates to consume @bsvibe/design-tokens.
    expect(m3.primary).toBe("#ffc174");
    expect(m3.primaryContainer).toBe("#f59e0b");
    expect(m3.surface).toBe("#121317");
    expect(m3.surfaceContainerLowest).toBe("#0d0e12");
    expect(m3.surfaceContainerHighest).toBe("#343439");
    expect(m3.outlineVariant).toBe("#534434");
  });

  it("`tokens` bundle exposes every namespace", () => {
    expect(Object.keys(tokens).sort()).toEqual(
      [
        "alias",
        "brand",
        "gray",
        "m3",
        "motion",
        "product",
        "radius",
        "semantic",
        "shadow",
        "spacing",
        "typography",
      ].sort(),
    );
  });
});
