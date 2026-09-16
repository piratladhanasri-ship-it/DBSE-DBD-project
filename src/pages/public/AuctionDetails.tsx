import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  HeartIcon,
  ShieldCheckIcon,
  MapPinIcon,
  StarIcon,
  TimerResetIcon,
  RadioIcon,
  ChevronLeftIcon,
  DatabaseIcon } from
'lucide-react';
import { CountdownTimer } from '../../components/CountdownTimer';
import { BidForm } from '../../components/BidForm';
import { BidHistory } from '../../components/BidHistory';
import { StatusBadge } from '../../components/StatusBadge';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/EmptyState';
import { Panel } from '../../components/DataTable';
import { useAuctions } from '../../context/AuctionContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { mockSocket, SOCKET_EVENTS } from '../../services/socket';
import { auctionImages } from '../../data/auctions';
import { formatCurrency, formatDateTime } from '../../utils/format';
import { cn } from '../../utils/cn';

export function AuctionDetails() {
  const { auctionId } = useParams();
  const { getAuction, bidsFor, placeBid, isWatched, toggleWatch, watchLiveAuction, simulateRivalBid } = useAuctions();
  const { user, isAuthenticated } = useAuth();
  const toast = useToast();

  const auction = getAuction(auctionId);
  const bids = bidsFor(auctionId);
  const images = useMemo(() => auction ? auctionImages(auction) : [], [auction]);
  const [activeImage, setActiveImage] = useState(0);
  const [extension, setExtension] = useState(null);

  // Join the auction room and start the simulated bid stream for the demo.
  useEffect(() => {
    if (!auction || auction.status !== 'live') return undefined;
    const stop = watchLiveAuction(auction.id);
    return stop;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auction?.id, auction?.status]);

  // Real-time listeners: `newBid` and `auctionExtended`.
  useEffect(() => {
    const onNewBid = ({ auctionId: id, bid }) => {
      if (id !== auctionId) return;
      if (bid.userId !== user?.id) {
        toast.info('New bid received', `${bid.bidderName} bid ${formatCurrency(bid.amount)}.`);
      }
    };
    const onExtended = ({ auctionId: id, secondsAdded }) => {
      if (id !== auctionId) return;
      setExtension({ secondsAdded, at: Date.now() });
      setTimeout(() => setExtension(null), 8000);
    };
    mockSocket.on(SOCKET_EVENTS.NEW_BID, onNewBid);
    mockSocket.on(SOCKET_EVENTS.AUCTION_EXTENDED, onExtended);
    return () => {
      mockSocket.off(SOCKET_EVENTS.NEW_BID, onNewBid);
      mockSocket.off(SOCKET_EVENTS.AUCTION_EXTENDED, onExtended);
    };
  }, [auctionId, user, toast]);

  if (!auction) {
    return (
      <div className="mx-auto max-w-shell px-4 py-16">
        <EmptyState
          title="Auction not found"
          description="This lot may have been removed by the seller or an administrator."
          actionLabel="Back to auctions"
          actionTo="/auctions" />
        
      </div>);

  }

  const ended = auction.status === 'ended';
  const watched = isWatched(auction.id);
  const topBid = bids[0];
  const myTopBid = bids.find((b) => b.userId === user?.id);
  const uniqueBidders = new Set(bids.map((b) => b.userId)).size;

  async function handlePlaceBid(amount) {
    const result = await placeBid(auction.id, amount);
    toast.success('Bid placed', `You are the highest bidder at ${formatCurrency(amount)}.`);
    if (result.extendedTo) {
      toast.info('Auction extended', '30 seconds were added because the bid landed in the final minute.');
    }
  }

  function handleWatch() {
    const nowWatching = toggleWatch(auction.id);
    toast.success(nowWatching ? 'Added to watchlist' : 'Removed from watchlist', auction.title);
  }

  return (
    <div className="mx-auto max-w-shell px-4 py-8 sm:px-6 lg:px-8">
      <Link
        to="/auctions"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-navy-500 transition-colors duration-150 ease-out hover:text-navy-900">
        
        <ChevronLeftIcon className="h-4 w-4" aria-hidden="true" />
        All auctions
      </Link>

      <div className="mt-5 grid gap-8 lg:grid-cols-[1.35fr_1fr] lg:gap-10">
        {/* ------------------------------------------------------ left column */}
        <div className="min-w-0">
          <div className="overflow-hidden rounded-card border border-line bg-mist">
            <div className="relative aspect-[4/3]">
              <img src={images[activeImage]} alt={auction.title} className="h-full w-full object-cover" />
              <span className="absolute left-4 top-4">
                <StatusBadge status={auction.status} />
              </span>
            </div>
          </div>
          {images.length > 1 ?
          <div className="mt-3 flex gap-3" role="tablist" aria-label="Product images">
              {images.map((src, i) =>
            <button
              key={src}
              type="button"
              role="tab"
              aria-selected={activeImage === i}
              onClick={() => setActiveImage(i)}
              className={cn(
                'h-20 w-24 overflow-hidden rounded-lg border-2 transition-colors duration-150 ease-out',
                activeImage === i ? 'border-navy-900' : 'border-line hover:border-navy-300'
              )}>
              
                  <img src={src} alt={`${auction.title} view ${i + 1}`} className="h-full w-full object-cover" />
                </button>
            )}
            </div> :
          null}

          <div className="mt-8">
            <p className="text-xs font-semibold uppercase tracking-wide text-gold-600">{auction.category}</p>
            <h1 className="mt-2 font-display text-3xl leading-tight text-navy-900 sm:text-4xl">{auction.title}</h1>

            <dl className="mt-5 grid grid-cols-2 gap-4 rounded-card border border-line bg-white p-4 shadow-card sm:grid-cols-4">
              <Stat label="Starting price" value={formatCurrency(auction.startingPrice)} />
              <Stat label="Current bid" value={formatCurrency(auction.currentBid || auction.startingPrice)} accent />
              <Stat label="Bids" value={auction.bidCount} />
              <Stat label="Bidders" value={uniqueBidders} />
            </dl>

            <section className="mt-8">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-navy-400">Description</h2>
              <p className="mt-3 whitespace-pre-line text-[15px] leading-relaxed text-navy-700">{auction.description}</p>
              <ul className="mt-5 grid gap-2 text-sm text-navy-600 sm:grid-cols-2">
                <li>
                  <span className="text-navy-400">Condition:</span> {auction.condition}
                </li>
                <li>
                  <span className="text-navy-400">Bid increment:</span> {formatCurrency(auction.bidIncrement)}
                </li>
                <li>
                  <span className="text-navy-400">Opened:</span> {formatDateTime(auction.startAt)}
                </li>
                <li>
                  <span className="text-navy-400">Closes:</span> {formatDateTime(auction.endAt)}
                </li>
              </ul>
            </section>

            <section className="mt-8 rounded-card border border-line bg-white p-5 shadow-card">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-navy-400">Seller</h2>
              <div className="mt-3 flex flex-wrap items-center gap-4">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-navy-900 text-sm font-semibold text-white">
                  {auction.sellerName.split(' ').map((p) => p[0]).join('')}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-navy-900">{auction.sellerStore}</p>
                  <p className="text-sm text-navy-500">{auction.sellerName}</p>
                </div>
                <div className="ml-auto flex flex-wrap items-center gap-4 text-sm text-navy-600">
                  <span className="inline-flex items-center gap-1.5">
                    <StarIcon className="h-4 w-4 text-gold-500" aria-hidden="true" />
                    4.9 seller rating
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <MapPinIcon className="h-4 w-4 text-navy-300" aria-hidden="true" />
                    {auction.location}
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-positive">
                    <ShieldCheckIcon className="h-4 w-4" aria-hidden="true" />
                    Verified
                  </span>
                </div>
              </div>
            </section>

            {/* DBSE view: the exact row this page maps to */}
            <section className="mt-6 rounded-card border border-dashed border-navy-200 bg-mist p-4">
              <h2 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-navy-500">
                <DatabaseIcon className="h-3.5 w-3.5" aria-hidden="true" />
                auctions record
              </h2>
              <div className="mt-2.5 grid gap-x-6 gap-y-1.5 font-mono text-xs text-navy-600 sm:grid-cols-2">
                <p>auction_id: {auction.id}</p>
                <p>seller_id: {auction.sellerId}</p>
                <p>status: {auction.status}</p>
                <p>current_bid: {auction.currentBid}</p>
                <p>bid_count: {auction.bidCount}</p>
                <p>end_at: {new Date(auction.endAt).toISOString()}</p>
              </div>
            </section>
          </div>
        </div>

        {/* ----------------------------------------------------- right column */}
        <div className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          <CountdownTimer endAt={auction.endAt} status={auction.status} variant="panel" />

          {/* Anti-sniping banner */}
          <AnimatePresence>
            {extension ?
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.24, ease: [0.23, 1, 0.32, 1] }}
              className="flex items-start gap-2.5 rounded-card border border-gold-200 bg-gold-50 p-3.5"
              role="status">
              
                <TimerResetIcon className="mt-0.5 h-4 w-4 shrink-0 text-gold-600" aria-hidden="true" />
                <p className="text-sm font-semibold text-gold-600">
                  Auction extended — {extension.secondsAdded} seconds added.
                  <span className="mt-0.5 block font-normal text-navy-600">
                    A bid landed inside the final minute, so the close was pushed back to keep bidding fair.
                  </span>
                </p>
              </motion.div> :
            null}
          </AnimatePresence>

          {myTopBid ?
          <div className="flex items-center justify-between gap-3 rounded-card border border-line bg-white px-4 py-3 shadow-card">
              <div>
                <p className="text-xs text-navy-400">Your highest bid</p>
                <p className="nums text-base font-semibold text-navy-900">{formatCurrency(myTopBid.amount)}</p>
              </div>
              <StatusBadge status={topBid?.userId === user?.id ? 'winning' : 'outbid'} />
            </div> :
          null}

          <BidForm
            auction={auction}
            onPlaceBid={handlePlaceBid}
            disabled={ended}
            signedIn={isAuthenticated}
            canBid={!isAuthenticated || user.role === 'buyer'} />
          

          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={isAuthenticated ? handleWatch : undefined}
              to={isAuthenticated ? undefined : '/login'}
              aria-pressed={watched}>
              
              <HeartIcon className={cn('h-4 w-4', watched && 'fill-negative text-negative')} aria-hidden="true" />
              {watched ? 'In watchlist' : 'Add to watchlist'}
            </Button>
          </div>

          {auction.status === 'live' ?
          <div className="rounded-card border border-dashed border-navy-200 bg-white p-4">
              <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-navy-500">
                <RadioIcon className="h-3.5 w-3.5 text-positive" aria-hidden="true" />
                Real-time demo
              </p>
              <p className="mt-2 text-sm text-navy-500">
                Competing bids arrive automatically every few seconds over the socket channel. Trigger one now to see the bid, the
                ledger and the notification badge update without a refresh.
              </p>
              <Button variant="subtle" size="sm" className="mt-3 w-full" onClick={() => simulateRivalBid(auction.id)}>
                Simulate incoming bid
              </Button>
            </div> :
          null}

          <Panel title="Bid history" description={`${bids.length} bids · updates live`} bodyClassName="max-h-[420px] overflow-y-auto">
            <BidHistory bids={bids} currentUserId={user?.id} />
          </Panel>
        </div>
      </div>
    </div>);

}

function Stat({ label, value, accent = false }) {
  return (
    <div>
      <dt className="text-xs text-navy-400">{label}</dt>
      <dd className={cn('nums mt-1 font-semibold', accent ? 'text-xl text-navy-900' : 'text-base text-navy-700')}>{value}</dd>
    </div>);

}