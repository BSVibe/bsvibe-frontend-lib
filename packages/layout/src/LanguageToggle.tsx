'use client';

import type { ReactNode } from 'react';

export interface LanguageToggleOption {
  /** Stable identifier (e.g. "ko", "en"). Sent back via `onChange`. */
  value: string;
  /** Visible button label (e.g. "KO", "EN"). */
  label: ReactNode;
}

export interface LanguageToggleProps {
  /** Currently active option value. */
  value: string;
  /** Available options. Order is preserved. */
  options: ReadonlyArray<LanguageToggleOption>;
  /** Fired with the next value when the user picks a different option. */
  onChange: (next: string) => void;
  /** ARIA label for the toggle group. Default: "Language". */
  ariaLabel?: string;
  /**
   * Optional `data-testid` for the group container. When provided, each
   * option button is also given `data-testid="<dataTestId>-<value>"`.
   */
  dataTestId?: string;
  /** Extra class merged onto the group container. */
  className?: string;
}

/**
 * `<LanguageToggle>` — pill toggle group, designed for sidebar footer use.
 *
 * Pure presentational: no router / no i18n library coupling. Callers wire
 * their own state and onChange (next-intl, react-i18next, path-based, etc.).
 * Free of `next/*` imports so Astro / Vite consumers can use it too.
 */
export function LanguageToggle({
  value,
  options,
  onChange,
  ariaLabel = 'Language',
  dataTestId,
  className,
}: LanguageToggleProps) {
  const groupCls = [
    'bsvibe-language-toggle',
    'inline-flex items-center gap-1 rounded-full bg-gray-900 p-1',
    'text-[10px] font-bold uppercase tracking-widest',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className={groupCls}
      data-testid={dataTestId}
    >
      {options.map((opt) => {
        const active = opt.value === value;
        const btnCls = [
          'bsvibe-language-toggle__btn',
          'min-h-[44px] min-w-[44px] rounded-full px-2 py-1 transition-colors',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500',
          active
            ? 'bsvibe-language-toggle__btn--active text-[color:var(--color-accent)]'
            : 'text-gray-400 hover:text-gray-200',
        ]
          .filter(Boolean)
          .join(' ');
        return (
          <button
            key={opt.value}
            type="button"
            aria-pressed={active}
            data-testid={dataTestId ? `${dataTestId}-${opt.value}` : undefined}
            onClick={() => {
              if (active) return;
              onChange(opt.value);
            }}
            className={btnCls}
            style={
              active
                ? {
                    backgroundColor:
                      'color-mix(in srgb, var(--color-accent) 15%, transparent)',
                  }
                : undefined
            }
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
