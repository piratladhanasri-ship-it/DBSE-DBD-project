import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { HeartIcon, Trash2Icon } from 'lucide-react';
import { PageHeader } from '../../components/PageHeader';
import { Panel } from '../../components/DataTable';
import { CountdownTimer } from '../../components/CountdownTimer';
import { StatusBadge } from '../../components/StatusBadge';
import { EmptyState } from '../../components/EmptyState';
import { Button } from '../../components/ui/Button';
import { ConfirmationDialog } from '../../components/ConfirmationDialog';
import { useAuctions } from '../../context/AuctionContext';
import { useToast } from '../../context/ToastContext';
import { formatCurrency } from '../../utils/format';
import { auctionCover } from '../../data/auctions';

export function Watchlist() {
  const { watchlistAuctions, toggleWatch } = useAuctions();
  const toast = useToast();
  const [pendingRemoval, setPendingRemoval] = useState(null);

  function confirmRemove() {
    toggleWatch(pendingRemoval.id);
    toast.success('Removed from watchlist', pendingRemoval.title);
    setPendingRemoval(null);
  }

  return (
    <>
      <PageHeader
        title="Watchlist"
        description="Saved lots with live pricing and closing times. You are notified before a watched lot closes."
        actions={
        <Button to="/auctions" variant="outline" size="sm">
            Find more lots
          </Button>
        } />
      

      <Panel title={`${watchlistAuctions.length} saved lots`}>
        {watchlistAuctions.length === 0 ?
        <EmptyState
          icon={HeartIcon}
          title="Your watchlist is empty"
          description="Tap the heart on any auction card to track it here and get a reminder before it closes."
          actionLabel="Browse auctions"
          actionTo="/auctions" /> :


        <ul className="divide-y divide-line">
            {watchlistAuctions.map(({ id, auction }) =>
          <li key={id} className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
                <img src={auctionCover(auction)} alt="" className="h-24 w-full rounded-lg object-cover sm:h-16 sm:w-20" />

                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-navy-400">{auction.category}</p>
                  <Link to={`/auctions/${auction.id}`} className="mt-0.5 block truncate text-sm font-semibold text-navy-900 hover:text-navy-600">
                    {auction.title}
                  </Link>
                  <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1">
                    <span className="nums text-sm text-navy-600">
                      Current bid <span className="font-semibold text-navy-900">{formatCurrency(auction.currentBid || auction.startingPrice)}</span>
                    </span>
                    <CountdownTimer endAt={auction.endAt} status={auction.status} />
                    <StatusBadge status={auction.status} />
                  </div>
                </div>

                <div className="flex shrink-0 gap-2">
                  <Button to={`/auctions/${auction.id}`} size="sm">
                    View auction
                  </Button>
                  <Button
                variant="danger"
                size="sm"
                onClick={() => setPendingRemoval(auction)}
                aria-label={`Remove ${auction.title} from watchlist`}>
                
                    <Trash2Icon className="h-4 w-4" aria-hidden="true" />
                    Remove
                  </Button>
                </div>
              </li>
          )}
          </ul>
        }
      </Panel>

      <ConfirmationDialog
        open={Boolean(pendingRemoval)}
        onClose={() => setPendingRemoval(null)}
        onConfirm={confirmRemove}
        title="Remove from watchlist?"
        message={`You will stop receiving closing reminders for “${pendingRemoval?.title}”. You can add it back at any time.`}
        confirmLabel="Remove"
        tone="danger" />
      
    </>);

}