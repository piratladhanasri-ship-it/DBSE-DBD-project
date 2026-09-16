import { api, withFallback } from './api';
import { auctions, findAuction } from '../data/auctions';

/** GET /api/auctions */
export async function listAuctions(params = {}) {
  return withFallback(() => api.get('/auctions', { params }), () => auctions);
}

/** GET /api/auctions/:id */
export async function getAuction(id) {
  return withFallback(() => api.get(`/auctions/${id}`), () => findAuction(id) || null);
}

/** GET /api/auctions?seller_id= */
export async function listSellerAuctions(sellerId) {
  return withFallback(
    () => api.get('/auctions', { params: { seller_id: sellerId } }),
    () => auctions.filter((a) => a.sellerId === sellerId)
  );
}

/** GET /api/auctions?status=pending — admin verification queue */
export async function listPendingAuctions() {
  return withFallback(
    () => api.get('/auctions', { params: { status: 'pending' } }),
    () => auctions.filter((a) => a.status === 'pending')
  );
}

/** POST /api/auctions */
export async function createAuction(payload) {
  return withFallback(() => api.post('/auctions', payload), () => ({
    ...payload,
    id: `a-${Math.floor(Math.random() * 900 + 100)}`,
    status: 'pending',
    currentBid: 0,
    bidCount: 0,
    watchers: 0,
    submittedAt: new Date().toISOString()
  }));
}

/** PUT /api/auctions/:id */
export async function updateAuction(id, payload) {
  return withFallback(() => api.put(`/auctions/${id}`, payload), () => ({ id, ...payload }));
}

/** DELETE /api/auctions/:id */
export async function deleteAuction(id) {
  return withFallback(() => api.delete(`/auctions/${id}`), { id, deleted: true });
}

/** PATCH /api/auctions/:id/status — approve, reject or suspend */
export async function setAuctionStatus(id, status, note = '') {
  return withFallback(() => api.patch(`/auctions/${id}/status`, { status, note }), { id, status, note });
}

/** GET /api/auctions/:id/watchers */
export async function toggleWatchlist(auctionId, watching) {
  return withFallback(
    () => watching ? api.post('/watchlist', { auctionId }) : api.delete(`/watchlist/${auctionId}`),
    { auctionId, watching }
  );
}