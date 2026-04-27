'use client';

import type { ReactNode } from 'react';
import { cn } from './cn.js';

export interface ResponsiveTableColumn<TRow> {
  /** Stable key — also used as a React key when rendering header/cell pairs. */
  key: string;
  /** Column header label. */
  header: ReactNode;
  /** Cell renderer. Receives the row, must return a ReactNode. */
  cell: (row: TRow) => ReactNode;
  /** Optional className applied to the desktop `<td>` cell. */
  cellClassName?: string;
}

export interface ResponsiveTableProps<TRow> {
  /** Column definitions — order is preserved on desktop AND mobile. */
  columns: readonly ResponsiveTableColumn<TRow>[];
  /** Row data. */
  rows: readonly TRow[];
  /** Stable key for each row (used as React key + mobile card test id). */
  rowKey: (row: TRow) => string;
  /**
   * Optional override for the mobile card layout. When provided, replaces the
   * default "key/value list per column" rendering with whatever you return.
   * Receiving the index lets you alternate styles or render a separator.
   */
  renderMobileCard?: (row: TRow, index: number) => ReactNode;
  /** Empty-state copy. Default: localized "No data". */
  emptyMessage?: ReactNode;
  /** Optional extra className applied to the wrapper container. */
  className?: string;
}

const TABLE_CLS =
  // Desktop layout — visible at sm breakpoint and up.
  'hidden sm:table w-full text-sm text-left text-gray-100 ' +
  'border-collapse';

const THEAD_CLS = 'bg-gray-900 text-gray-300 uppercase text-xs';
const TH_CLS = 'px-4 py-3 font-semibold border-b border-gray-800';
const TR_CLS =
  'border-b border-gray-800 hover:bg-gray-900/60 transition-colors';
const TD_CLS = 'px-4 py-3 align-middle';

/**
 * ResponsiveTable renders the SAME row data twice — a `<table>` for >= sm
 * and a stack of `<article>` cards for < sm — and lets the consuming
 * Tailwind config (sm: breakpoint) choose which one is visible.
 *
 * Why two trees instead of one? On phones, dense tables either:
 *   • horizontally scroll (preserves data, kills scannability), or
 *   • collapse to a stacked layout (one card per row).
 *
 * Phase A surveys (BSGateway / BSupervisor / BSNexus / BSage) showed all 4
 * products rolling their own variant. We pick the card-stack approach as
 * the default since it matches the SoT and is the most "mobile-native"
 * pattern. Consumers that want full control (e.g. analytics rows that need
 * a media-rich layout) pass `renderMobileCard`.
 *
 * Horizontal scroll fallback: the desktop table is wrapped in an
 * `overflow-x-auto` container so columns that don't fit in the viewport
 * still scroll instead of breaking layout.
 */
export function ResponsiveTable<TRow>({
  columns,
  rows,
  rowKey,
  renderMobileCard,
  emptyMessage,
  className,
}: ResponsiveTableProps<TRow>) {
  const wrapperCls = cn('bsvibe-responsive-table flex flex-col gap-3', className);

  if (rows.length === 0) {
    return (
      <div className={wrapperCls}>
        <div
          data-testid="bsvibe-table-empty"
          className="rounded-md border border-dashed border-gray-700 px-4 py-8 text-center text-sm text-gray-400"
        >
          {emptyMessage ?? 'No data'}
        </div>
      </div>
    );
  }

  return (
    <div className={wrapperCls}>
      {/* Desktop: standard table inside an overflow-x-auto wrapper. */}
      <div
        data-testid="bsvibe-table-scroll"
        className="hidden sm:block overflow-x-auto"
      >
        <table className={TABLE_CLS}>
          <thead className={THEAD_CLS}>
            <tr>
              {columns.map((col) => (
                <th key={col.key} className={TH_CLS} scope="col">
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={rowKey(row)} className={TR_CLS}>
                {columns.map((col) => (
                  <td key={col.key} className={cn(TD_CLS, col.cellClassName)}>
                    {col.cell(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile: card stack visible below sm breakpoint. */}
      <div
        data-testid="bsvibe-table-mobile"
        className="sm:hidden flex flex-col gap-2"
        role="list"
      >
        {rows.map((row, index) => {
          const key = rowKey(row);
          if (renderMobileCard) {
            return <div key={key}>{renderMobileCard(row, index)}</div>;
          }
          return (
            <article
              key={key}
              data-testid="bsvibe-table-card"
              role="listitem"
              className="rounded-md border border-gray-800 bg-gray-900 p-3 flex flex-col gap-1"
            >
              {columns.map((col) => (
                <div
                  key={col.key}
                  className="flex items-baseline justify-between gap-3 text-sm"
                >
                  <dt className="text-xs uppercase tracking-wide text-gray-400">
                    {col.header}
                  </dt>
                  <dd className="text-gray-100 text-right">{col.cell(row)}</dd>
                </div>
              ))}
            </article>
          );
        })}
      </div>
    </div>
  );
}
