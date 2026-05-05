import type { CSSProperties } from "react";

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

const STYLES: Record<string, CSSProperties> = {
  wrapper: {
    position: "sticky",
    top: 0,
    zIndex: 9999,
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "10px 16px",
    backgroundColor: "#1f2937",
    borderBottom: "1px solid #374151",
    color: "#f9fafb",
    fontSize: 13,
    lineHeight: 1.5,
  },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    padding: "2px 8px",
    borderRadius: 4,
    backgroundColor: "#3b82f6",
    color: "#fff",
    fontWeight: 700,
    fontSize: 11,
    letterSpacing: 0.4,
    flexShrink: 0,
  },
  msg: {
    flex: 1,
    color: "#cbd5e1",
  },
  cta: {
    color: "#60a5fa",
    fontWeight: 600,
    textDecoration: "none",
    flexShrink: 0,
  },
};

/**
 * Sticky top banner shown on every page of a demo deployment. Keep
 * mounted at the layout root so it persists across navigations.
 */
export function DemoBanner({
  signupUrl = "https://auth.bsvibe.dev/signup",
  productName = "BSVibe",
  locale = "en",
}: DemoBannerProps) {
  const c = COPY[locale];
  return (
    <div role="status" style={STYLES.wrapper}>
      <span style={STYLES.badge}>{c.label}</span>
      <span style={STYLES.msg}>{c.msg(productName)}</span>
      <a href={signupUrl} target="_blank" rel="noopener noreferrer" style={STYLES.cta}>
        {c.cta}
      </a>
    </div>
  );
}
