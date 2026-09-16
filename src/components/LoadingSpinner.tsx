import React from 'react';
import { cn } from '../utils/cn';

const SIZES = { sm: 'h-4 w-4 border-2', md: 'h-6 w-6 border-2', lg: 'h-9 w-9 border-[3px]' };

export function LoadingSpinner({ size = 'md', tone = 'dark', className, label }) {
  return (
    <span className={cn('inline-flex items-center gap-2', className)} role="status">
      <span
        className={cn(
          'animate-spin rounded-full border-current border-t-transparent',
          SIZES[size],
          tone === 'light' ? 'text-white/80' : 'text-navy-300'
        )}
        aria-hidden="true" />
      
      {label ? <span className="text-sm text-navy-500">{label}</span> : null}
      <span className="sr-only">Loading</span>
    </span>);

}

/** Full-section loading placeholder used while a service call resolves. */
export function LoadingBlock({ label = 'Loading…', className }) {
  return (
    <div className={cn('flex min-h-[220px] w-full flex-col items-center justify-center gap-3', className)}>
      <LoadingSpinner size="lg" />
      <p className="text-sm text-navy-500">{label}</p>
    </div>);

}

/** Skeleton rows for tables and lists. */
export function SkeletonRows({ rows = 5, className }) {
  return (
    <div className={cn('space-y-2', className)} aria-hidden="true">
      {Array.from({ length: rows }).map((_, i) =>
      <div key={i} className="h-12 w-full animate-pulse rounded-lg bg-mist" />
      )}
    </div>);

}