import React from 'react';
import { cn } from '../utils/cn';
import { SkeletonRows } from './LoadingSpinner';
import { EmptyState, ErrorState } from './EmptyState';

/**
 * Responsive table. On screens below `md` each row collapses into a stacked
 * card with the column headers as labels, so tables stay readable on mobile
 * instead of scrolling sideways.
 *
 * columns: [{ key, header, render?, align?, hideOnMobile?, className? }]
 */
export function DataTable({
  columns,
  rows,
  keyField = 'id',
  loading = false,
  error = null,
  onRetry,
  empty = {},
  caption,
  className
}) {
  if (loading) return <SkeletonRows rows={6} className="p-4" />;
  if (error) return <ErrorState message={error} onRetry={onRetry} />;
  if (!rows?.length) {
    return <EmptyState title={empty.title || 'Nothing here yet'} description={empty.description} actionLabel={empty.actionLabel} actionTo={empty.actionTo} />;
  }

  return (
    <div className={cn('w-full', className)}>
      {/* Desktop / tablet */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full border-collapse text-left text-sm">
          {caption ? <caption className="sr-only">{caption}</caption> : null}
          <thead>
            <tr className="border-b border-line">
              {columns.map((col) =>
              <th
                key={col.key}
                scope="col"
                className={cn(
                  'whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide text-navy-400',
                  col.align === 'right' && 'text-right',
                  col.align === 'center' && 'text-center'
                )}>
                
                  {col.header}
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) =>
            <tr key={row[keyField]} className="border-b border-line last:border-0">
                {columns.map((col) =>
              <td
                key={col.key}
                className={cn(
                  'px-4 py-3.5 align-middle text-navy-700',
                  col.align === 'right' && 'text-right',
                  col.align === 'center' && 'text-center',
                  col.className
                )}>
                
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
              )}
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile */}
      <ul className="divide-y divide-line md:hidden">
        {rows.map((row) =>
        <li key={row[keyField]} className="space-y-2.5 px-4 py-4">
            {columns.
          filter((col) => !col.hideOnMobile).
          map((col) =>
          <div key={col.key} className="flex items-start justify-between gap-4">
                  <span className="text-xs font-semibold uppercase tracking-wide text-navy-400">{col.header}</span>
                  <span className="min-w-0 flex-1 text-right text-sm text-navy-700">
                    {col.render ? col.render(row) : row[col.key]}
                  </span>
                </div>
          )}
          </li>
        )}
      </ul>
    </div>);

}

/** Card shell used around tables and dashboard panels. */
export function Panel({ title, description, action, children, className, bodyClassName }) {
  return (
    <section className={cn('overflow-hidden rounded-card border border-line bg-white shadow-card', className)}>
      {title || action ?
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-3.5 sm:px-5">
          <div>
            <h2 className="text-sm font-semibold text-navy-900">{title}</h2>
            {description ? <p className="mt-0.5 text-xs text-navy-500">{description}</p> : null}
          </div>
          {action}
        </header> :
      null}
      <div className={bodyClassName}>{children}</div>
    </section>);

}