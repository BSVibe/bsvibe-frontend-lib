import { useEffect } from "react";

export interface DemoBannerProps {
  /**
   * Where the "Sign up" CTA leads. Defaults to the central BSVibe Auth signup page.
   */
  signupUrl?: string;
  /**
   * Optional product name (shown in copy). Defaults to "BSVibe demo".
   */
  productName?: string;
  /**
   * Optional locale; only "ko" and "en" supported. Defaults to "en".
   */
  locale?: "ko" | "en";
}

const COPY = {
  ko: {
    label: "데모 모드",
    msg: (name: string) =>
      `이건 ${name} 공개 샌드박스입니다. 작업은 2시간 후 자동 삭제됩니다.`,
    cta: "가입해서 본격적으로 사용하기 →",
  },
  en: {
    label: "Demo mode",
    msg: (name: string) =>
      `You're in the public ${name} sandbox. Work is wiped after 2h of inactivity.`,
    cta: "Sign up to keep your work →",
  },
};

// Styles are injected via a single `<style>` tag instead of inline `style`
// so we can use `@media` for the mobile/desktop variant. The banner used
// to be `position: sticky; top: 0; z-index: 9999`, which on mobile sat
// directly over the app-shell hamburger button (`fixed top-3 left-3 z-50`
// in `@bsvibe/layout`'s ResponsiveSidebar). Visitors couldn't open the
// drawer until they scrolled. The mobile variant now sticks to the
// bottom of the viewport so the top stays clear; desktop keeps the
// classic top banner.
const STYLE_ID = "bsvibe-demo-banner-styles";
const CSS = `
.bsvibe-demo-banner {
  position: sticky;
  top: 0;
  z-index: 40;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  background-color: #1f2937;
  border-bottom: 1px solid #374151;
  color: #f9fafb;
  font-size: 13px;
  line-height: 1.5;
}
.bsvibe-demo-banner__badge {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 4px;
  background-color: #3b82f6;
  color: #fff;
  font-weight: 700;
  font-size: 11px;
  letter-spacing: 0.4px;
  flex-shrink: 0;
}
.bsvibe-demo-banner__msg {
  flex: 1;
  color: #cbd5e1;
}
.bsvibe-demo-banner__cta {
  color: #60a5fa;
  font-weight: 600;
  text-decoration: none;
  flex-shrink: 0;
}
@media (max-width: 768px) {
  .bsvibe-demo-banner {
    position: fixed;
    top: auto;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 60;
    border-bottom: none;
    border-top: 1px solid #374151;
    padding: 8px 12px;
    font-size: 12px;
  }
  /* Reserve space at the bottom of the document so fixed-bottom banner
     never covers the page's last interactive row. Apps that already use
     a bottom-fixed bar can override this per-page. */
  body { padding-bottom: 56px; }
}
`;

function useInjectedStyle() {
  useEffect(() => {
    if (typeof document === "undefined") return;
    if (document.getElementById(STYLE_ID)) return;
    const el = document.createElement("style");
    el.id = STYLE_ID;
    el.textContent = CSS;
    document.head.appendChild(el);
  }, []);
}

/**
 * Sticky top banner shown on every page of a demo deployment. Keep
 * mounted at the layout root so it persists across navigations.
 */
export function DemoBanner({
  signupUrl = "https://auth.bsvibe.dev/signup",
  productName = "BSVibe",
  locale = "en",
}: DemoBannerProps) {
  useInjectedStyle();
  const c = COPY[locale];
  return (
    <div role="status" className="bsvibe-demo-banner">
      <span className="bsvibe-demo-banner__badge">{c.label}</span>
      <span className="bsvibe-demo-banner__msg">{c.msg(productName)}</span>
      <a
        href={signupUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="bsvibe-demo-banner__cta"
      >
        {c.cta}
      </a>
    </div>
  );
}
