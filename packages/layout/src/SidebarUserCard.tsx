export interface SidebarUserCardProps {
  /** Authenticated user email. Always rendered. */
  email: string;
  /** Optional role label (e.g. "owner", "admin", "member"). */
  role?: string;
  /**
   * Optional avatar initials. Defaults to the first 2 characters of the
   * email's local-part, uppercased.
   */
  initials?: string;
  /** Required sign-out handler — wired to the button below the card. */
  onSignOut: () => void;
  /** Visible button label. Default: "Sign out". */
  signOutLabel?: string;
}

function deriveInitials(email: string): string {
  const local = email.split('@')[0] ?? '';
  return local.slice(0, 2).toUpperCase();
}

/**
 * `<SidebarUserCard>` — pairs with `<ResponsiveSidebar footer={...}>`.
 *
 * Layout: a subtle bg card containing `[avatar][email + role stack]`,
 * followed by a sign-out button below the card with a 44px tap target
 * (WCAG 2.5.5 — matches the rest of `ResponsiveSidebar`).
 *
 * The avatar uses `var(--color-accent)` so each product's signature hue
 * shines through automatically.
 */
export function SidebarUserCard({
  email,
  role,
  initials,
  onSignOut,
  signOutLabel = 'Sign out',
}: SidebarUserCardProps) {
  const computedInitials = (initials ?? deriveInitials(email)).slice(0, 2).toUpperCase();

  return (
    <div className="bsvibe-sidebar-user">
      <div className="bsvibe-sidebar-user__card flex items-center gap-3 rounded-md bg-gray-900 px-3 py-2">
        <div
          className="bsvibe-sidebar-user__avatar flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white"
          style={{ backgroundColor: 'var(--color-accent)' }}
          aria-hidden="true"
        >
          {computedInitials}
        </div>
        <div className="bsvibe-sidebar-user__meta flex min-w-0 flex-col">
          <span className="bsvibe-sidebar-user__email truncate text-sm text-gray-100">
            {email}
          </span>
          {role ? (
            <span className="bsvibe-sidebar-user__role truncate text-xs text-gray-400">
              {role}
            </span>
          ) : null}
        </div>
      </div>
      <button
        type="button"
        onClick={onSignOut}
        className="bsvibe-sidebar-user__signout mt-2 inline-flex w-full min-h-[44px] min-w-[44px] items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-200 hover:bg-gray-800 active:bg-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
      >
        <span aria-hidden="true">⏏</span>
        <span className="bsvibe-sidebar-user__signout-label">{signOutLabel}</span>
      </button>
    </div>
  );
}
