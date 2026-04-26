'use client';

import { forwardRef } from 'react';
import type { HTMLAttributes, KeyboardEvent } from 'react';
import { cn } from './cn.js';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Add a hover-state affordance (cursor + bg shift). */
  hover?: boolean;
  /**
   * Make the entire card behave like a button:
   * adds `role=button`, `tabIndex=0`, and triggers `onClick` on Enter/Space.
   * Implies `hover`.
   */
  clickable?: boolean;
}

const BASE =
  'bg-gray-900 border border-gray-800 rounded-lg transition-colors';

export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  { hover, clickable, className, onClick, onKeyDown, children, ...rest },
  ref,
) {
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event);
    if (clickable && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      onClick?.(event as unknown as React.MouseEvent<HTMLDivElement>);
    }
  };

  const interactive = clickable || hover;

  return (
    <div
      ref={ref}
      className={cn(
        BASE,
        interactive && 'hover:border-gray-700 hover:bg-gray-850',
        clickable && 'cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500',
        className,
      )}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
      onClick={onClick}
      onKeyDown={clickable ? handleKeyDown : onKeyDown}
      {...rest}
    >
      {children}
    </div>
  );
});

export const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function CardHeader({ className, children, ...rest }, ref) {
    return (
      <div
        ref={ref}
        className={cn('px-4 py-3 border-b border-gray-800', className)}
        {...rest}
      >
        {children}
      </div>
    );
  },
);

export const CardBody = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function CardBody({ className, children, ...rest }, ref) {
    return (
      <div ref={ref} className={cn('px-4 py-3', className)} {...rest}>
        {children}
      </div>
    );
  },
);

export const CardFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function CardFooter({ className, children, ...rest }, ref) {
    return (
      <div
        ref={ref}
        className={cn('px-4 py-3 border-t border-gray-800', className)}
        {...rest}
      >
        {children}
      </div>
    );
  },
);
