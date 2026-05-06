import { useEffect, useRef, useState } from "react";

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
    cta: "가입하기 →",
    dismiss: "데모 알림 닫기",
  },
  en: {
    label: "Demo mode",
    msg: (name: string) =>
      `You're in the public ${name} sandbox. Work is wiped after 2h of inactivity.`,
    cta: "Sign up →",
    dismiss: "Dismiss demo notice",
  },
};

// The banner stays at the top of every page, but it has to coexist with
// `@bsvibe/layout`'s ResponsiveSidebar hamburger button (rendered as
// `position: fixed; top: 12px; left: 12px; z-index: 50`). Two coupled
// fixes ship here:
//
// 1. While the banner is mounted, body gets `bsvibe-demo-banner-active`
//    and `--bsvibe-demo-banner-height` is updated to the measured height
//    on every resize. CSS pushes any element with the
//    `bsvibe-sidebar__hamburger` class down by that height, so the
//    hamburger appears just below the banner instead of behind it.
// 2. Visitors can dismiss the banner with the × button. Dismissal is
//    persisted in localStorage so the choice survives reload — once
//    they've understood the demo notice, they shouldn't keep paying for
//    the vertical real estate.
const STYLE_ID = "bsvibe-demo-banner-styles";
const STORAGE_KEY = "bsvibe-demo-banner-dismissed";
const BODY_ACTIVE_CLASS = "bsvibe-demo-banner-active";
const HEIGHT_VAR = "--bsvibe-demo-banner-height";

const CSS = `
.bsvibe-demo-banner {
  position: sticky;
  top: 0;
  z-index: 100;
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
  min-width: 0;
  color: #cbd5e1;
}
.bsvibe-demo-banner__cta {
  color: #60a5fa;
  font-weight: 600;
  text-decoration: none;
  flex-shrink: 0;
}
.bsvibe-demo-banner__dismiss {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  color: #9ca3af;
  font-size: 18px;
  line-height: 1;
  cursor: pointer;
  border-radius: 6px;
}
.bsvibe-demo-banner__dismiss:hover,
.bsvibe-demo-banner__dismiss:focus-visible {
  background-color: rgba(148, 163, 184, 0.15);
  color: #f9fafb;
  outline: none;
}
@media (max-width: 768px) {
  .bsvibe-demo-banner {
    padding: 8px 12px;
    gap: 8px;
    font-size: 12px;
  }
  /* Hide the message text on narrow phones — badge + CTA + × already
     communicate "demo, sign up, or close" without the long sentence. */
  .bsvibe-demo-banner__msg {
    display: none;
  }
}
/* Push @bsvibe/layout's hamburger trigger below the banner while it's
   shown. The trigger is "fixed top-3 left-3" (12px) by default. */
body.${BODY_ACTIVE_CLASS} .bsvibe-sidebar__hamburger {
  top: calc(var(${HEIGHT_VAR}, 0px) + 12px) !important;
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
 *
 * - Visitors can dismiss with the × button; dismissal persists in
 *   localStorage and survives reload.
 * - While mounted, the document gets a CSS variable with the banner's
 *   measured height so co-living sticky elements (notably the
 *   `@bsvibe/layout` hamburger) shift down to stay tappable.
 */
export function DemoBanner({
  signupUrl = "https://auth.bsvibe.dev/signup",
  productName = "BSVibe",
  locale = "en",
}: DemoBannerProps) {
  useInjectedStyle();

  // `dismissed` defaults to true on first render so we don't paint the
  // banner before reading localStorage. The effect below corrects it on
  // mount. SSR-safe: `localStorage` is only read inside useEffect.
  const [dismissed, setDismissed] = useState(true);
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    setDismissed(window.localStorage.getItem(STORAGE_KEY) === "1");
    setHydrated(true);
  }, []);

  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (typeof document === "undefined") return;
    if (dismissed) {
      document.body.classList.remove(BODY_ACTIVE_CLASS);
      document.documentElement.style.removeProperty(HEIGHT_VAR);
      return;
    }
    document.body.classList.add(BODY_ACTIVE_CLASS);

    const el = ref.current;
    if (!el) return;
    const update = () => {
      document.documentElement.style.setProperty(HEIGHT_VAR, `${el.offsetHeight}px`);
    };
    update();
    let observer: ResizeObserver | undefined;
    if (typeof ResizeObserver !== "undefined") {
      observer = new ResizeObserver(update);
      observer.observe(el);
    }
    window.addEventListener("resize", update);
    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", update);
      document.body.classList.remove(BODY_ACTIVE_CLASS);
      document.documentElement.style.removeProperty(HEIGHT_VAR);
    };
  }, [dismissed]);

  if (!hydrated || dismissed) return null;

  const c = COPY[locale];
  const handleDismiss = () => {
    try {
      window.localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // localStorage may be unavailable (private mode, quota) — degrade
      // gracefully: still hide for this page lifetime.
    }
    setDismissed(true);
  };

  return (
    <div ref={ref} role="status" className="bsvibe-demo-banner">
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
      <button
        type="button"
        onClick={handleDismiss}
        aria-label={c.dismiss}
        className="bsvibe-demo-banner__dismiss"
      >
        ×
      </button>
    </div>
  );
}
