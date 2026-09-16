import React from 'react';
import { Link } from 'react-router-dom';
import { GavelIcon, TrophyIcon, HeartIcon, CreditCardIcon, ArrowRightIcon } from 'lucide-react';
import { PageHeader } from '../../components/PageHeader';
import { DashboardCard } from '../../components/DashboardCard';
import { Panel } from '../../components/DataTable';
import { StatusBadge } from '../../components/StatusBadge';
import { CountdownTimer } from '../../components/CountdownTimer';
import { EmptyState } from '../../components/EmptyState';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import { useAuctions } from '../../context/AuctionContext';
import { usePayments } from '../../context/PaymentContext';
import { formatCurrency, relativeTime } from '../../utils/format';
import { auctionCover } from '../../data/auctions';

export function BuyerDashboard() {
  const { user } = useAuth();
  const { auctions, bidsByUser, watchlistAuctions, getAuction } = useAuctions();
  const { forBuyer } = usePayments();

  const myBids = bidsByUser(user.id);
  const activeAuctionIds = [
  ...new Set(myBids.filter((b) => getAuction(b.auctionId)?.status === 'live').map((b) => b.auctionId))];

  const won = auctions.filter((a) => a.status === 'ended' && a.winnerId === user.id);
  const payments = forBuyer(user.id);
  const pendingPayments = payments.filter((p) => p.status === 'pending' || p.status === 'failed');

  // The lot that needs attention first: closing soonest where the buyer leads.
  const leading = activeAuctionIds.
  map((id) => getAuction(id)).
  filter((a) => a).
  sort((a, b) => new Date(a.endAt) - new Date(b.endAt))[0];

  return (
    <>
      <PageHeader
        title={`Welcome back, ${user.name.split(' ')[0]}`}
        description="Your live bids, saved lots and outstanding payments in one place."
        actions={
        <Button to="/auctions" size="sm">
            Browse auctions
          </Button>
        } />
      

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <DashboardCard
          label="Active bids"
          value={activeAuctionIds.length}
          meta={`${myBids.length} bids placed in total`}
          icon={GavelIcon}
          to="/buyer/bids"
          emphasis />
        
        <DashboardCard label="Auctions won" value={won.length} meta="Across all categories" icon={TrophyIcon} to="/buyer/won" />
        <DashboardCard
          label="Watchlist"
          value={watchlistAuctions.length}
          meta="Lots you are tracking"
          icon={HeartIcon}
          to="/buyer/watchlist" />
        
        <DashboardCard
          label="Pending payments"
          value={formatCurrency(pendingPayments.reduce((s, p) => s + p.amount, 0))}
          meta={pendingPayments.length ? `${pendingPayments.length} awaiting action` : 'All settled'}
          icon={CreditCardIcon}
          to="/buyer/payments"
          tone={pendingPayments.length ? 'negative' : 'default'} />
        
      </div>

      {leading ?
      <section className="overflow-hidden rounded-card border border-line bg-white shadow-card">
          <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center">
            <img
            src={auctionCover(leading)}
            alt=""
            className="h-28 w-full rounded-lg object-cover sm:h-24 sm:w-32" />
          
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-gold-600">Closing soonest</p>
              <h2 className="mt-1 truncate text-base font-semibold text-navy-900">{leading.title}</h2>
              <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-sm">
                <span className="text-navy-500">
                  Current bid <span className="nums font-semibold text-navy-900">{formatCurrency(leading.currentBid)}</span>
                </span>
                <CountdownTimer endAt={leading.endAt} status={leading.status} />
                <StatusBadge
                status={
                myBids.find((b) => b.auctionId === leading.id && b.status === 'winning') ? 'winning' : 'outbid'
                } />
              
              </div>
            </div>
            <Button to={`/auctions/${leading.id}`} size="sm" className="sm:shrink-0">
              Open auction
              <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
        </section> :
      null}

      <div className="grid gap-5 lg:grid-cols-[1.3fr_1fr]">
        <Panel
          title="Recent bidding activity"
          description="Your last bids across all lots"
          action={
          <Link to="/buyer/history" className="text-xs font-semibold text-navy-600 hover:text-navy-900">
              Full history
            </Link>
          }>
          
          {myBids.length === 0 ?
          <EmptyState title="No bids yet" description="Place your first bid to see your activity here." actionLabel="Browse auctions" actionTo="/auctions" /> :

          <ul className="divide-y divide-line">
              {myBids.slice(0, 6).map((bid) => {
              const auction = getAuction(bid.auctionId);
              return (
                <li key={bid.id} className="flex items-center gap-4 px-4 py-3.5">
                    <div className="min-w-0 flex-1">
                      <Link
                      to={`/auctions/${bid.auctionId}`}
                      className="truncate text-sm font-medium text-navy-900 hover:text-navy-600">
                      
                        {auction?.title || bid.auctionId}
                      </Link>
                      <p className="mt-0.5 text-xs text-navy-400">{relativeTime(bid.placedAt)}</p>
                    </div>
                    <p className="nums text-sm font-semibold text-navy-900">{formatCurrency(bid.amount)}</p>
                    <StatusBadge status={bid.status} withDot={false} />
                  </li>);

            })}
            </ul>
          }
        </Panel>

        <Panel title="Watchlist" description={`${watchlistAuctions.length} saved lots`}>
          {watchlistAuctions.length === 0 ?
          <EmptyState icon={HeartIcon} title="Nothing saved" description="Save lots to get reminders before they close." actionLabel="Browse auctions" actionTo="/auctions" /> :

          <ul className="divide-y divide-line">
              {watchlistAuctions.slice(0, 5).map(({ id, auction }) =>
            <li key={id} className="flex items-center gap-3 px-4 py-3">
                  <img src={auctionCover(auction)} alt="" className="h-11 w-11 shrink-0 rounded object-cover" />
                  <div className="min-w-0 flex-1">
                    <Link to={`/auctions/${auction.id}`} className="truncate text-sm font-medium text-navy-900 hover:text-navy-600">
                      {auction.title}
                    </Link>
                    <p className="nums mt-0.5 text-xs text-navy-500">{formatCurrency(auction.currentBid || auction.startingPrice)}</p>
                  </div>
                  <CountdownTimer endAt={auction.endAt} status={auction.status} />
                </li>
            )}
            </ul>
          }
        </Panel>
      </div>
    </>);

}