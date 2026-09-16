import { api, withFallback } from './api';
import { bidsForAuction, bidsForUser } from '../data/bids';

/** GET /api/bids?auction_id= */
export async function listAuctionBids(auctionId) {
  return withFallback(
    () => api.get('/bids', { params: { auction_id: auctionId } }),
    () => bidsForAuction(auctionId)
  );
}

/** GET /api/bids?user_id= */
export async function listUserBids(userId) {
  return withFallback(() => api.get('/bids', { params: { user_id: userId } }), () => bidsForUser(userId));
}

/**
 * POST /api/bids
 * The backend is the source of truth for bid validity; it should also emit the
 * `newBid` socket event so every connected client updates without refreshing.
 */
export async function placeBid({ auctionId, amount, userId, bidderName }) {
  return withFallback(() => api.post('/bids', { auctionId, amount }), () => ({
    id: `b-${Date.now()}`,
    auctionId,
    userId,
    bidderName,
    amount: Number(amount),
    placedAt: new Date().toISOString(),
    status: 'winning'
  }));
}