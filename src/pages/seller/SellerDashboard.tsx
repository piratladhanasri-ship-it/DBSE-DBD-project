import React from 'react';
import { Link } from 'react-router-dom';
import { PackageIcon, RadioIcon, TrophyIcon, BanknoteIcon, PlusCircleIcon, ArrowRightIcon } from 'lucide-react';
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

export function SellerDashboard() {
  const { user } = useAuth();
  const { auctions, bids } = useAuctions();
  const { forSeller, sellerEarnings } = usePayments();

  const mine = auctions.filter((a) => a.sellerId === user.id);
  const active = mine.filter((a) => a.status === 'live');
  const sold = mine.filter((a) => a.status === 'ended' && a.winnerId);
  const pending = mine.filter((a) => a.status === 'pending');
  const payouts = forSeller(user.id);

  const myAuctionIds = mine.map((a) => a.id);
  const recentBids = bids.
  filter((b) => myAuctionIds.includes(b.auctionId)).
  sort((a, b) => new Date(b.placedAt) - new Date(a.placedAt)).
  slice(0, 6);

  return (
    <>
      <PageHeader
        title={`${user.storeName || 'Your store'}`}
        description="Auction performance, live bidding activity and settlement status."
        actions={
        <Button to="/seller/create" size="sm">
            <PlusCircleIcon className="h-4 w-4" aria-hidden="true" />
            Create auction
          </Button>
        } />
      

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <DashboardCard
          label="Total earnings"
          value={formatCurrency(sellerEarnings.totalEarnings)}
          meta={`${formatCurrency(sellerEarnings.pendingSettlements)} pending settlement`}
          icon={BanknoteIcon}
          to="/seller/earnings"
          emphasis />
        
        <DashboardCard label="Total auctions" value={mine.length} meta={`${pending.length} awaiting verification`} icon={PackageIcon} to="/seller/auctions" />
        <DashboardCard label="Active auctions" value={active.length} meta="Currently accepting bids" icon={RadioIcon} to="/seller/monitor" />
        <DashboardCard label="Sold items" value={sold.length} meta={`${payouts.filter((p) => p.settlementStatus === 'settled').length} settled`} icon={TrophyIcon} to="/seller/sold" />
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.15fr_1fr]">
        <Panel
          title="Live auctions"
          description="Lots currently open, closing soonest first"
          action={
          <Link to="/seller/monitor" className="text-xs font-semibold text-navy-600 hover:text-navy-900">
              Monitor bids
            </Link>
          }>
          
          {active.length === 0 ?
          <EmptyState
            icon={PackageIcon}
            title="No live auctions"
            description="Create a listing and it will appear here once an administrator approves it."
            actionLabel="Create auction"
            actionTo="/seller/create" /> :


          <ul className="divide-y divide-line">
              {[...active].
            sort((a, b) => new Date(a.endAt) - new Date(b.endAt)).
            map((auction) =>
            <li key={auction.id} className="flex items-center gap-4 px-4 py-3.5">
                    <div className="min-w-0 flex-1">
                      <Link to={`/seller/monitor/${auction.id}`} className="truncate text-sm font-medium text-navy-900 hover:text-navy-600">
                        {auction.title}
                      </Link>
                      <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-navy-500">
                        <span className="nums">{auction.bidCount} bids</span>
                        <CountdownTimer endAt={auction.endAt} status={auction.status} />
                      </div>
                    </div>
                    <p className="nums text-sm font-semibold text-navy-900">{formatCurrency(auction.currentBid)}</p>
                  </li>
            )}
            </ul>
          }
        </Panel>

        <Panel title="Recent activity" description="Latest bids across your lots">
          {recentBids.length === 0 ?
          <EmptyState title="No bids yet" description="Bidding activity on your lots will show up here in real time." /> :

          <ul className="divide-y divide-line">
              {recentBids.map((bid) => {
              const auction = auctions.find((a) => a.id === bid.auctionId);
              return (
                <li key={bid.id} className="flex items-center gap-4 px-4 py-3.5">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-navy-900">{bid.bidderName}</p>
                      <p className="truncate text-xs text-navy-400">
                        {auction?.title} · {relativeTime(bid.placedAt)}
                      </p>
                    </div>
                    <p className="nums text-sm font-semibold text-navy-900">{formatCurrency(bid.amount)}</p>
                    <StatusBadge status={bid.status} withDot={false} />
                  </li>);

            })}
            </ul>
          }
        </Panel>
      </div>

      {pending.length ?
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-card border border-gold-200 bg-gold-50 p-4">
          <div>
            <p className="text-sm font-semibold text-gold-600">{pending.length} listing(s) awaiting verification</p>
            <p className="mt-0.5 text-sm text-navy-600">
              An administrator reviews condition reports and provenance before a lot goes live. This usually takes under 24 hours.
            </p>
          </div>
          <Button to="/seller/auctions" variant="outline" size="sm">
            Review listings
            <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div> :
      null}
    </>);

}