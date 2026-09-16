import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { auctions as seedAuctions, auctionImages, auctionCover } from '../data/auctions';
import { bids as seedBids } from '../data/bids';
import { watchlist as seedWatchlist } from '../data/watchlist';
import { mockSocket, SOCKET_EVENTS } from '../services/socket';
import * as bidService from '../services/bidService';
import * as auctionService from '../services/auctionService';
import { useAuth } from './AuthContext';

/**
 * Holds the live auction state for the whole app: auctions, bids, watchlist and
 * the anti-sniping extensions. Every mutation also emits the matching Socket.io
 * event name through `mockSocket`, so replacing the mock emitter with the real
 * server events requires no changes in the screens themselves.
 */
const AuctionContext = createContext(null);

const RIVAL_BIDDERS = [
{ id: 'u-4', name: 'Arjun Mehta' },
{ id: 'u-7', name: 'Sara Fernandes' },
{ id: 'u-9', name: 'Nikhil Bose' }];


export const ANTI_SNIPE_WINDOW_MS = 60 * 1000;
export const ANTI_SNIPE_EXTENSION_MS = 30 * 1000;

export function AuctionProvider({ children }) {
  const { user } = useAuth();
  const [auctions, setAuctions] = useState(seedAuctions);
  const [bids, setBids] = useState(seedBids);
  const [watchlist, setWatchlist] = useState(seedWatchlist);
  const [extensions, setExtensions] = useState({});
  const [liveFeed, setLiveFeed] = useState([]);
  const simulationRef = useRef(null);

  /* ---------------------------------------------------------------- helpers */

  const getAuction = useCallback((id) => auctions.find((a) => a.id === id), [auctions]);

  const bidsFor = useCallback(
    (auctionId) =>
    bids.
    filter((b) => b.auctionId === auctionId).
    sort((a, b) => new Date(b.placedAt) - new Date(a.placedAt)),
    [bids]
  );

  const bidsByUser = useCallback(
    (userId) =>
    bids.
    filter((b) => b.userId === userId).
    sort((a, b) => new Date(b.placedAt) - new Date(a.placedAt)),
    [bids]
  );

  const isWatched = useCallback(
    (auctionId) => watchlist.some((w) => w.auctionId === auctionId && w.userId === (user?.id || 'u-1')),
    [watchlist, user]
  );

  const watchlistAuctions = useMemo(() => {
    const userId = user?.id || 'u-1';
    return watchlist.
    filter((w) => w.userId === userId).
    map((w) => ({ ...w, auction: auctions.find((a) => a.id === w.auctionId) })).
    filter((w) => w.auction);
  }, [watchlist, auctions, user]);

  const applyBid = useCallback((bid, { extendedTo } = {}) => {
    setBids((prev) => [
    bid,
    ...prev.map((b) => b.auctionId === bid.auctionId && b.status === 'winning' ? { ...b, status: 'outbid' } : b)]
    );
    setAuctions((prev) =>
    prev.map((a) =>
    a.id === bid.auctionId ?
    {
      ...a,
      currentBid: bid.amount,
      bidCount: a.bidCount + 1,
      reserveMet: true,
      endAt: extendedTo || a.endAt
    } :
    a
    )
    );
    setLiveFeed((prev) => [{ ...bid, kind: 'bid' }, ...prev].slice(0, 20));
  }, []);

  /* ------------------------------------------------------- bidding + sockets */

  const placeBid = useCallback(
    async (auctionId, amount, bidder) => {
      const auction = auctions.find((a) => a.id === auctionId);
      if (!auction) throw new Error('Auction not found.');

      const actor = bidder || { id: user?.id || 'u-1', name: user?.name || 'Rhea Kulkarni' };
      const bid = await bidService.placeBid({
        auctionId,
        amount: Number(amount),
        userId: actor.id,
        bidderName: actor.name
      });

      // Anti-sniping: a bid inside the final minute pushes the close out.
      const remaining = new Date(auction.endAt).getTime() - Date.now();
      let extendedTo = null;
      if (remaining > 0 && remaining <= ANTI_SNIPE_WINDOW_MS) {
        extendedTo = new Date(new Date(auction.endAt).getTime() + ANTI_SNIPE_EXTENSION_MS).toISOString();
      }

      applyBid(bid, { extendedTo });
      mockSocket.emit(SOCKET_EVENTS.NEW_BID, { auctionId, bid, currentBid: bid.amount });

      if (extendedTo) {
        setExtensions((prev) => ({
          ...prev,
          [auctionId]: { secondsAdded: ANTI_SNIPE_EXTENSION_MS / 1000, at: Date.now(), endAt: extendedTo }
        }));
        mockSocket.emit(SOCKET_EVENTS.AUCTION_EXTENDED, {
          auctionId,
          endAt: extendedTo,
          secondsAdded: ANTI_SNIPE_EXTENSION_MS / 1000
        });
      }

      return { bid, extendedTo };
    },
    [auctions, user, applyBid]
  );

  /** Places a bid from a competing bidder — drives the real-time demo. */
  const simulateRivalBid = useCallback(
    (auctionId) => {
      const auction = auctions.find((a) => a.id === auctionId);
      if (!auction || auction.status !== 'live') return;
      const rival = RIVAL_BIDDERS[Math.floor(Math.random() * RIVAL_BIDDERS.length)];
      const steps = 1 + Math.floor(Math.random() * 2);
      placeBid(auctionId, auction.currentBid + auction.bidIncrement * steps, rival);
    },
    [auctions, placeBid]
  );

  /** Called by the auction details page to begin/stop the simulated bid stream. */
  const watchLiveAuction = useCallback(
    (auctionId) => {
      if (simulationRef.current) clearInterval(simulationRef.current);
      simulationRef.current = setInterval(() => {
        simulateRivalBid(auctionId);
      }, 16000);
      return () => {
        if (simulationRef.current) clearInterval(simulationRef.current);
        simulationRef.current = null;
      };
    },
    [simulateRivalBid]
  );

  /* -------------------------------------------------------- auction lifecycle */

  // One shared clock closes auctions whose end time has passed.
  useEffect(() => {
    const id = setInterval(() => {
      setAuctions((prev) => {
        let changed = false;
        const next = prev.map((a) => {
          if (a.status === 'live' && new Date(a.endAt).getTime() <= Date.now()) {
            changed = true;
            const top = seedTopBidder(a.id);
            mockSocket.emit(SOCKET_EVENTS.AUCTION_ENDED, {
              auctionId: a.id,
              winnerId: top?.userId,
              winnerName: top?.bidderName,
              amount: a.currentBid
            });
            return { ...a, status: 'ended', winnerId: top?.userId, winnerName: top?.bidderName };
          }
          if (a.status === 'upcoming' && new Date(a.startAt).getTime() <= Date.now()) {
            changed = true;
            return { ...a, status: 'live' };
          }
          return a;
        });
        return changed ? next : prev;
      });
    }, 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bids]);

  function seedTopBidder(auctionId) {
    return bids.
    filter((b) => b.auctionId === auctionId).
    sort((a, b) => b.amount - a.amount)[0];
  }

  /* ------------------------------------------------------------- mutations */

  const toggleWatch = useCallback(
    (auctionId) => {
      const userId = user?.id || 'u-1';
      const exists = watchlist.some((w) => w.auctionId === auctionId && w.userId === userId);
      auctionService.toggleWatchlist(auctionId, !exists);
      setWatchlist((prev) =>
      exists ?
      prev.filter((w) => !(w.auctionId === auctionId && w.userId === userId)) :
      [...prev, { id: `w-${Date.now()}`, userId, auctionId, addedAt: new Date().toISOString() }]
      );
      return !exists;
    },
    [watchlist, user]
  );

  const addAuction = useCallback((auction) => {
    setAuctions((prev) => [{ ...auction, images: auction.images?.length ? auction.images : ['watch'] }, ...prev]);
  }, []);

  const patchAuction = useCallback((id, patch) => {
    setAuctions((prev) => prev.map((a) => a.id === id ? { ...a, ...patch } : a));
    mockSocket.emit(SOCKET_EVENTS.AUCTION_UPDATED, { auctionId: id, ...patch });
  }, []);

  const removeAuction = useCallback((id) => {
    setAuctions((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const value = useMemo(
    () => ({
      auctions,
      bids,
      liveFeed,
      extensions,
      getAuction,
      bidsFor,
      bidsByUser,
      isWatched,
      watchlistAuctions,
      placeBid,
      simulateRivalBid,
      watchLiveAuction,
      toggleWatch,
      addAuction,
      patchAuction,
      removeAuction,
      auctionImages,
      auctionCover
    }),
    [
    auctions,
    bids,
    liveFeed,
    extensions,
    getAuction,
    bidsFor,
    bidsByUser,
    isWatched,
    watchlistAuctions,
    placeBid,
    simulateRivalBid,
    watchLiveAuction,
    toggleWatch,
    addAuction,
    patchAuction,
    removeAuction]

  );

  return <AuctionContext.Provider value={value}>{children}</AuctionContext.Provider>;
}

export function useAuctions() {
  const ctx = useContext(AuctionContext);
  if (!ctx) throw new Error('useAuctions must be used inside <AuctionProvider>');
  return ctx;
}