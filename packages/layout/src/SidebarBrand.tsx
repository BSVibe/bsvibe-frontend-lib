import type { ReactNode } from 'react';
import Link from 'next/link';

export interface SidebarBrandProps {
  /** Leading brand icon (16x16 or 24x24 SVG / span). */
  icon: ReactNode;
  /** Product name (e.g. "BSGateway", "BSage"). Rendered in the accent color. */
  name: string;
  /** Optional uppercase tagline (e.g. "AI SENTINEL"). Rendered muted. */
  tagline?: string;
  /** Click target. Default: `/`. */
  href?: string;
}

/**
 * `<SidebarBrand>` — sidebar header logo + product name + tagline.
 *
 * Pairs with `<ResponsiveSidebar logo={...}>`. Each product passes its own
 * brand icon and uses the `--color-accent` CSS variable for the name color
 * (per-product `:root` override sets the signature hue).
 *
 * Accessibility: the wrapping `<Link>` carries an `aria-label` combining
 * name + tagline so screen readers announce the brand identity once.
 */
export function SidebarBrand({
  icon,
  name,
  tagline,
  href = '/',
}: SidebarBrandProps) {
  const ariaLabel = tagline ? `${name}, ${tagline}` : name;

  return (
    <Link
      href={href}
      aria-label={ariaLabel}
      className="bsvibe-sidebar-brand flex items-center gap-2 no-underline"
    >
      <span className="bsvibe-sidebar-brand__icon inline-flex items-center justify-center">
        {icon}
      </span>
      <span className="bsvibe-sidebar-brand__text flex flex-col leading-tight">
        <span
          className="bsvibe-sidebar-brand__name font-bold text-base"
          style={{ color: 'var(--color-accent)' }}
        >
          {name}
        </span>
        {tagline ? (
          <span className="bsvibe-sidebar-brand__tagline text-xs uppercase tracking-widest text-gray-400">
            {tagline}
          </span>
        ) : null}
      </span>
    </Link>
  );
}
