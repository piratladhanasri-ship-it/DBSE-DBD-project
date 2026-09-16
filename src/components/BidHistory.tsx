import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { formatCurrency, formatDateTime, initials, relativeTime } from '../utils/format';
import { StatusBadge } from './StatusBadge';
import { EmptyState } from './EmptyState';
import { cn } from '../utils/cn';

/**
 * Live bid ledger. New rows arrive through the `newBid` socket event and slide
 * in at the top without a page refresh.
 */
export function BidHistory({ bids, currentUserId, limit, showStatus = true, className }) {
  const rows = limit ? bids.slice(0, limit) : bids;

  if (!rows.length) {
    return <EmptyState title="No bids yet" description="Be the first to open the bidding on this lot." />;
  }

  return (
    <ul className={cn('divide-y divide-line', className)}>
      <AnimatePresence initial={false}>
        {rows.map((bid, index) => {
          const mine = bid.userId === currentUserId;
          return (
            <motion.li
              key={bid.id}
              layout
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
              className="flex items-center gap-3 px-4 py-3">
              
              <span
                className={cn(
                  'flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold',
                  mine ? 'bg-navy-900 text-white' : 'bg-navy-50 text-navy-500'
                )}
                aria-hidden="true">
                
                {initials(bid.bidderName)}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-navy-900">
                  {mine ? 'You' : maskName(bid.bidderName)}
                  {index === 0 ? <span className="ml-2 text-xs font-semibold text-gold-600">Highest</span> : null}
                </p>
                <p className="text-xs text-navy-400" title={formatDateTime(bid.placedAt)}>
                  {relativeTime(bid.placedAt)}
                </p>
              </div>
              <div className="text-right">
                <p className="nums text-sm font-semibold text-navy-900">{formatCurrency(bid.amount)}</p>
                {showStatus ? <StatusBadge status={bid.status} withDot={false} className="mt-1" /> : null}
              </div>
            </motion.li>);

        })}
      </AnimatePresence>
    </ul>);

}

/** Bidder identities are partially masked, as on real auction platforms. */
function maskName(name = '') {
  const [first, last] = name.split(' ');
  return last ? `${first} ${last[0]}.` : first;
}