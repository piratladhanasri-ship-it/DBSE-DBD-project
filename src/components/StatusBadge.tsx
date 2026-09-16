import React from 'react';
import { cn } from '../utils/cn';

const STYLES = {
  live: { label: 'Live', className: 'bg-navy-900 text-white', dot: 'bg-gold-400' },
  upcoming: { label: 'Upcoming', className: 'bg-navy-50 text-navy-600', dot: 'bg-navy-300' },
  ended: { label: 'Ended', className: 'bg-navy-100 text-navy-500', dot: 'bg-navy-300' },
  pending: { label: 'Pending review', className: 'bg-gold-50 text-gold-600', dot: 'bg-gold-400' },
  rejected: { label: 'Rejected', className: 'bg-negative/10 text-negative', dot: 'bg-negative' },
  suspended: { label: 'Suspended', className: 'bg-negative/10 text-negative', dot: 'bg-negative' },
  approved: { label: 'Approved', className: 'bg-positive/10 text-positive', dot: 'bg-positive' },
  active: { label: 'Active', className: 'bg-positive/10 text-positive', dot: 'bg-positive' },
  paid: { label: 'Paid', className: 'bg-positive/10 text-positive', dot: 'bg-positive' },
  failed: { label: 'Failed', className: 'bg-negative/10 text-negative', dot: 'bg-negative' },
  settled: { label: 'Settled', className: 'bg-positive/10 text-positive', dot: 'bg-positive' },
  awaiting_payment: { label: 'Awaiting payment', className: 'bg-navy-50 text-navy-500', dot: 'bg-navy-300' },
  winning: { label: 'Winning', className: 'bg-positive/10 text-positive', dot: 'bg-positive' },
  outbid: { label: 'Outbid', className: 'bg-negative/10 text-negative', dot: 'bg-negative' },
  won: { label: 'Won', className: 'bg-positive/10 text-positive', dot: 'bg-positive' },
  lost: { label: 'Lost', className: 'bg-navy-100 text-navy-500', dot: 'bg-navy-300' },
  open: { label: 'Open', className: 'bg-negative/10 text-negative', dot: 'bg-negative' },
  under_review: { label: 'Under review', className: 'bg-gold-50 text-gold-600', dot: 'bg-gold-400' },
  resolved: { label: 'Resolved', className: 'bg-positive/10 text-positive', dot: 'bg-positive' }
};

export function StatusBadge({ status, label, withDot = true, className }) {
  const style = STYLES[status] || { label: status, className: 'bg-navy-50 text-navy-600', dot: 'bg-navy-300' };
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold',
        style.className,
        className
      )}>
      
      {withDot ? <span className={cn('h-1.5 w-1.5 shrink-0 rounded-full', style.dot)} aria-hidden="true" /> : null}
      {label || style.label}
    </span>);

}