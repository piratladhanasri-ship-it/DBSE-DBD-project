import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '../utils/cn';

/** Wordmark: a gold gavel mark plus the platform name. */
export function Logo({ to = '/', tone = 'dark', className }) {
  return (
    <Link to={to} className={cn('inline-flex items-center gap-2.5', className)} aria-label="BidVault home">
      <span className="flex h-8 w-8 items-center justify-center rounded-md bg-navy-900">
        <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
          <path
            d="M4 20h10M6.5 13.5l5-5M9 6l6 6M13 3l8 8-2.5 2.5L10.5 5.5 13 3Z"
            fill="none"
            stroke="#CFAC3C"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round" />
          
        </svg>
      </span>
      <span className={cn('font-display text-xl leading-none', tone === 'light' ? 'text-white' : 'text-navy-900')}>
        BidVault
      </span>
    </Link>);

}