import type { ReactNode } from 'react';

export interface HeaderProps {
  /** Page or section title. Rendered as an `<h1>` if provided. */
  title?: ReactNode;
  /** Right-aligned slot — user menu, notifications, status pill, etc. */
  rightSlot?: ReactNode;
  /** Extra class merged onto the root `<header>`. */
  className?: string;
}

/**
 * Header is a minimal banner row used at the top of an `<AppShell>`'s main
 * column. It is a server component — pass interactive children (e.g. a
 * user-menu dropdown) as `rightSlot` and let *those* opt into `'use client'`.
 *
 * Phase A keeps this intentionally tiny. The 4 product surveys showed:
 *  - BSGateway has no header in `<Layout>` (sidebar only).
 *  - BSupervisor has a rich header with status pills + search.
 *  - BSage has a header with connection state + pending count.
 *  - BSNexus has no header.
 *
 * So we ship the smallest common surface (title + right slot) and let
 * products compose richer banners on top. Anything more would over-fit.
 */
export function Header({ title, rightSlot, className }: HeaderProps) {
  const cls = ['bsvibe-header', className].filter(Boolean).join(' ');
  return (
    <header className={cls}>
      {title !== undefined && title !== null ? (
        <h1 className="bsvibe-header__title">{title}</h1>
      ) : null}
      {rightSlot !== undefined && rightSlot !== null ? (
        <div className="bsvibe-header__right">{rightSlot}</div>
      ) : null}
    </header>
  );
}
