'use client';

import { useCallback, useEffect, useId } from 'react';
import type { ReactNode, MouseEvent } from 'react';
import { cn } from './cn.js';

export interface ModalProps {
  /** Whether the modal is shown. */
  open: boolean;
  /** Called when the user requests close (Escape, backdrop click, close button). */
  onClose: () => void;
  /** Title in the header. */
  title: ReactNode;
  /** Body content. */
  children: ReactNode;
  /** Optional footer (typically action buttons). */
  footer?: ReactNode;
  /** Hide the close button in the header. Default: false. */
  hideCloseButton?: boolean;
  /** Disable Escape key close. Default: false. */
  disableEscape?: boolean;
  /** Disable backdrop click close. Default: false. */
  disableBackdropClose?: boolean;
  /** Pixel width of the panel. Default 520. */
  width?: number;
  /** ClassName for the panel element. */
  panelClassName?: string;
}

const PANEL_BASE =
  'relative bg-gray-900 rounded-xl shadow-lg border border-gray-800 ' +
  'w-[90vw] max-h-[85vh] flex flex-col';

const HEADER =
  'flex items-center justify-between px-6 py-4 border-b border-gray-800';

const BODY = 'px-6 py-4 overflow-y-auto flex-1';

const FOOTER =
  'flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-800';

export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  hideCloseButton = false,
  disableEscape = false,
  disableBackdropClose = false,
  width = 520,
  panelClassName,
}: ModalProps) {
  const titleId = useId();

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !disableEscape) {
        onClose();
      }
    },
    [onClose, disableEscape],
  );

  useEffect(() => {
    if (!open) return;
    document.addEventListener('keydown', handleKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, handleKeyDown]);

  if (!open) return null;

  const handleBackdropClick = (e: MouseEvent<HTMLDivElement>) => {
    // Only fire when the click target IS the backdrop, not bubbled from panel.
    if (disableBackdropClose) return;
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        data-testid="bsvibe-modal-backdrop"
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleBackdropClick}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={cn(PANEL_BASE, panelClassName)}
        style={{ width }}
      >
        <div className={HEADER}>
          <h2 id={titleId} className="text-lg font-bold text-gray-50">
            {title}
          </h2>
          {!hideCloseButton ? (
            <button
              type="button"
              aria-label="Close"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-50 hover:bg-gray-800 rounded-md p-1 transition-colors"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </button>
          ) : null}
        </div>
        <div className={BODY}>{children}</div>
        {footer ? <div className={FOOTER}>{footer}</div> : null}
      </div>
    </div>
  );
}
