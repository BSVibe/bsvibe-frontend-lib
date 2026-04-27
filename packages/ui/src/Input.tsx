'use client';

import { forwardRef, useId } from 'react';
import type { InputHTMLAttributes, ReactNode } from 'react';
import { cn } from './cn.js';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Optional label rendered above the input. Auto-associates via id/htmlFor. */
  label?: ReactNode;
  /** Helper text under the input. Hidden when `error` is set. */
  helperText?: ReactNode;
  /** Error message under the input. Sets `aria-invalid`. */
  error?: ReactNode;
  /** ClassName applied to the outer wrapper (around label + input + helper). */
  wrapperClassName?: string;
}

// Phase B Batch 1 — mobile a11y:
//   • text-base (1rem / 16px) prevents iOS Safari auto-zoom on focus.
//   • min-h-[44px] hits WCAG 2.5.5 tap-target requirement.
const INPUT_BASE =
  'block w-full rounded-md bg-gray-900 text-gray-50 placeholder:text-gray-500 ' +
  'border border-gray-700 px-3 py-2 text-base min-h-[44px] ' +
  'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ' +
  'transition-colors disabled:opacity-50 disabled:cursor-not-allowed';

const INPUT_ERROR =
  'border-rose-500 focus:ring-rose-500';

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    label,
    helperText,
    error,
    wrapperClassName,
    className,
    id,
    type = 'text',
    ...rest
  },
  ref,
) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const helperId = `${inputId}-helper`;
  const errorId = `${inputId}-error`;
  const hasError = !!error;
  const describedBy = hasError ? errorId : helperText ? helperId : undefined;

  return (
    <div className={cn('flex flex-col gap-1', wrapperClassName)}>
      {label !== undefined && label !== null ? (
        <label htmlFor={inputId} className="text-sm font-medium text-gray-200">
          {label}
        </label>
      ) : null}
      <input
        id={inputId}
        ref={ref}
        type={type}
        aria-invalid={hasError || undefined}
        aria-describedby={describedBy}
        className={cn(INPUT_BASE, hasError && INPUT_ERROR, className)}
        {...rest}
      />
      {hasError ? (
        <p id={errorId} className="text-xs text-rose-500">
          {error}
        </p>
      ) : helperText ? (
        <p id={helperId} className="text-xs text-gray-400">
          {helperText}
        </p>
      ) : null}
    </div>
  );
});
