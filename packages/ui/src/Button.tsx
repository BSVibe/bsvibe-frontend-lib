'use client';

import { forwardRef } from 'react';
import type { ButtonHTMLAttributes } from 'react';
import { cn } from './cn.js';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual emphasis. Default: `primary`. */
  variant?: ButtonVariant;
  /** Size. Default: `md`. */
  size?: ButtonSize;
  /** Show a spinner and disable interaction. */
  loading?: boolean;
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  // primary uses brand accent (BSNexus default; per-product override via :root --accent)
  primary:
    'bg-blue-500 text-gray-50 hover:opacity-90 active:opacity-80 shadow-sm focus-visible:ring-blue-500',
  secondary:
    'bg-gray-700 text-gray-50 hover:bg-gray-600 active:bg-gray-700 border border-gray-600 focus-visible:ring-gray-400',
  danger:
    'bg-rose-500 text-gray-50 hover:opacity-90 active:opacity-80 shadow-sm focus-visible:ring-rose-500',
  ghost:
    'bg-transparent text-gray-200 hover:bg-gray-800 active:bg-gray-700 focus-visible:ring-gray-400',
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-5 py-2.5 text-base',
};

// Phase B Batch 1: every interactive button gets a 44px tap target by default
// (WCAG 2.5.5 / iOS HIG). Visual height stays controlled by SIZE_CLASSES'
// padding — the min-h floor only kicks in when content+padding < 44px (sm).
const BASE =
  'inline-flex items-center justify-center gap-2 rounded-md font-semibold transition-all ' +
  'min-h-[44px] ' +
  'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-950 ' +
  'disabled:opacity-50 disabled:cursor-not-allowed';

function Spinner() {
  return (
    <svg
      className="animate-spin h-4 w-4"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
      data-testid="button-spinner"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled,
    type,
    className,
    children,
    ...rest
  },
  ref,
) {
  return (
    <button
      ref={ref}
      // Default to type=button — prevents accidental form submission when
      // the button is rendered inside a <form> with no explicit type set.
      type={type ?? 'button'}
      disabled={disabled || loading}
      className={cn(BASE, VARIANT_CLASSES[variant], SIZE_CLASSES[size], className)}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading ? <Spinner /> : null}
      {children}
    </button>
  );
});
