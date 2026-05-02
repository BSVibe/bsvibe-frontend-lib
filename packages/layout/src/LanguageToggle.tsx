'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

export interface LanguageToggleOption {
  /** Stable identifier (e.g. "ko", "en"). Sent back via `onChange`. */
  value: string;
  /** Visible button label (e.g. "KO", "English"). */
  label: ReactNode;
}

export interface LanguageToggleProps {
  /** Currently active option value. */
  value: string;
  /** Available options. Order is preserved. */
  options: ReadonlyArray<LanguageToggleOption>;
  /** Fired with the next value when the user picks a different option. */
  onChange: (next: string) => void;
  /** ARIA label for the trigger and listbox. Default: "Language". */
  ariaLabel?: string;
  /**
   * Optional `data-testid` for the trigger button. When provided, each
   * listbox option is also given `data-testid="<dataTestId>-<value>"`.
   */
  dataTestId?: string;
  /** Extra class merged onto the root container. */
  className?: string;
}

/**
 * `<LanguageToggle>` — single-trigger dropdown that scales to many options.
 *
 * Renders one compact trigger button showing the current language label;
 * clicking it opens a listbox above (sidebar-footer use case) with every
 * option. This pattern stays usable when the locale set grows past 2-3
 * languages, where a side-by-side pill toggle would wrap or overflow the
 * sidebar width.
 *
 * Pure presentational: caller wires `value` + `onChange`. No `next/*`
 * imports so Astro / Vite consumers can use it too.
 *
 * Closes on: option selection, Escape key, and outside click.
 */
export function LanguageToggle({
  value,
  options,
  onChange,
  ariaLabel = 'Language',
  dataTestId,
  className,
}: LanguageToggleProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const current = options.find((opt) => opt.value === value) ?? options[0];

  // Outside click closes the dropdown — listening on mousedown so the
  // close fires before any focus/click handlers on the outside element.
  useEffect(() => {
    if (!open) return;
    const onMouseDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onMouseDown);
    return () => document.removeEventListener('mousedown', onMouseDown);
  }, [open]);

  // Escape closes the dropdown (keyboard a11y).
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  const rootCls = [
    'bsvibe-language-toggle relative inline-block',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const handleSelect = (next: string) => {
    if (next !== value) onChange(next);
    setOpen(false);
  };

  return (
    <div ref={rootRef} className={rootCls}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        data-testid={dataTestId}
        onClick={() => setOpen((prev) => !prev)}
        className="bsvibe-language-toggle__trigger min-h-[44px] inline-flex w-full items-center justify-between gap-2 rounded-full bg-gray-900 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-gray-200 transition-colors hover:bg-gray-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
      >
        <span className="bsvibe-language-toggle__current truncate">
          {current?.label}
        </span>
        <span aria-hidden="true" className="text-xs leading-none">
          ▾
        </span>
      </button>

      {open ? (
        <ul
          role="listbox"
          aria-label={ariaLabel}
          className="bsvibe-language-toggle__listbox absolute bottom-full left-0 right-0 mb-2 overflow-hidden rounded-md border border-gray-800 bg-gray-950 py-1 text-[10px] font-bold uppercase tracking-widest shadow-lg"
        >
          {options.map((opt) => {
            const active = opt.value === value;
            const optCls = [
              'bsvibe-language-toggle__option',
              'min-h-[44px] flex items-center justify-between px-3 py-1 cursor-pointer transition-colors',
              active
                ? 'bsvibe-language-toggle__option--active text-[color:var(--color-accent)]'
                : 'text-gray-300 hover:bg-gray-900 hover:text-gray-100',
            ]
              .filter(Boolean)
              .join(' ');
            return (
              <li
                key={opt.value}
                role="option"
                aria-selected={active}
                tabIndex={0}
                data-testid={dataTestId ? `${dataTestId}-${opt.value}` : undefined}
                onClick={() => handleSelect(opt.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleSelect(opt.value);
                  }
                }}
                className={optCls}
                style={
                  active
                    ? {
                        backgroundColor:
                          'color-mix(in srgb, var(--color-accent) 15%, transparent)',
                      }
                    : undefined
                }
              >
                <span>{opt.label}</span>
                {active ? (
                  <span aria-hidden="true" className="text-xs">
                    ✓
                  </span>
                ) : null}
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
