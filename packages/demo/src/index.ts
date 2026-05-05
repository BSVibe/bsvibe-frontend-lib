/**
 * @bsvibe/demo — Frontend SDK for the BSVibe public interactive-demo stack.
 *
 * Public API:
 * - {@link DemoBanner} — sticky top banner shown only when running on a
 *   demo deployment. Exposes a "Sign up to keep your work" CTA.
 * - {@link useAutoDemoSession} — React hook that automatically creates a
 *   demo session on first mount. Returns loading / error / tenantId state.
 * - {@link isDemoMode} — checks the build-time demo flag.
 */

export { DemoBanner } from "./DemoBanner";
export type { DemoBannerProps } from "./DemoBanner";
export { useAutoDemoSession } from "./useAutoDemoSession";
export type { DemoSessionState } from "./useAutoDemoSession";
export { isDemoMode } from "./flag";
