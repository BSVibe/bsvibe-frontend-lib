import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from './cn.js';

export type BadgeVariant = 'neutral' | 'info' | 'success' | 'warning' | 'error';
export type BadgeSize = 'sm' | 'md';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  /** Tone. Default: `neutral`. */
  variant?: BadgeVariant;
  /** Size. Default: `md`. */
  size?: BadgeSize;
  /** Render a leading status dot. */
  dot?: boolean;
  children: ReactNode;
}

const VARIANT_CLASSES: Record<BadgeVariant, string> = {
  neutral: 'bg-gray-700 text-gray-100',
  info: 'bg-blue-500/15 text-blue-500 border border-blue-500/30',
  success: 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/30',
  warning: 'bg-amber-500/15 text-amber-500 border border-amber-500/30',
  error: 'bg-rose-500/15 text-rose-500 border border-rose-500/30',
};

// Dot color maps to the variant accent (bg-*-500)
const DOT_CLASSES: Record<BadgeVariant, string> = {
  neutral: 'bg-gray-300',
  info: 'bg-blue-500',
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  error: 'bg-rose-500',
};

const SIZE_CLASSES: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-xs',
};

const BASE =
  'inline-flex items-center gap-1.5 rounded-full font-medium whitespace-nowrap';

export function Badge({
  variant = 'neutral',
  size = 'md',
  dot = false,
  className,
  children,
  ...rest
}: BadgeProps) {
  return (
    <span
      className={cn(BASE, VARIANT_CLASSES[variant], SIZE_CLASSES[size], className)}
      {...rest}
    >
      {dot ? (
        <span
          data-bsvibe-dot
          aria-hidden="true"
          className={cn('inline-block h-1.5 w-1.5 rounded-full', DOT_CLASSES[variant])}
        />
      ) : null}
      {children}
    </span>
  );
}
