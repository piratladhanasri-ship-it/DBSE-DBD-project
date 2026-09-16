import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRightIcon } from 'lucide-react';
import { cn } from '../utils/cn';

/**
 * Small statistic card used across the buyer, seller and admin dashboards.
 * `emphasis` marks the single metric that matters most on a screen so the grid
 * is not a wall of identical tiles.
 */
export function DashboardCard({ label, value, meta, icon: Icon, to, emphasis = false, tone = 'default', className }) {
  const body =
  <>
      <div className="flex items-start justify-between gap-3">
        <p className={cn('text-sm font-medium', emphasis ? 'text-navy-200' : 'text-navy-500')}>{label}</p>
        {Icon ?
      <span
        className={cn(
          'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
          emphasis ? 'bg-white/10 text-gold-300' : 'bg-navy-50 text-navy-400'
        )}>
        
            <Icon className="h-4 w-4" aria-hidden="true" />
          </span> :
      null}
      </div>
      <p
      className={cn(
        'nums mt-3 font-semibold tracking-tight',
        emphasis ? 'text-3xl text-white' : 'text-2xl text-navy-900',
        tone === 'negative' && !emphasis && 'text-negative'
      )}>
      
        {value}
      </p>
      {meta ?
    <p className={cn('mt-1 text-xs', emphasis ? 'text-navy-300' : 'text-navy-400')}>{meta}</p> :
    null}
      {to ?
    <span
      className={cn(
        'mt-3 inline-flex items-center gap-1 text-xs font-semibold',
        emphasis ? 'text-gold-300' : 'text-navy-600'
      )}>
      
          View
          <ArrowUpRightIcon className="h-3.5 w-3.5" aria-hidden="true" />
        </span> :
    null}
    </>;


  const classes = cn(
    'block rounded-card border p-5 transition-colors duration-150 ease-out',
    emphasis ? 'border-navy-900 bg-navy-900' : 'border-line bg-white shadow-card',
    to && (emphasis ? 'hover:bg-navy-800' : 'hover:border-navy-200'),
    className
  );

  if (to) {
    return (
      <Link to={to} className={classes}>
        {body}
      </Link>);

  }
  return <div className={classes}>{body}</div>;
}