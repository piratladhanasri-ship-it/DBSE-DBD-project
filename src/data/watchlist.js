/**
 * Mock `watchlist` table. Mirrors the MySQL entity:
 * watchlist(watchlist_id, user_id, auction_id, added_at)
 */
const HOUR = 60 * 60 * 1000;
const now = Date.now();

export const watchlist = [
{ id: 'w-201', userId: 'u-1', auctionId: 'a-101', addedAt: new Date(now - 30 * HOUR).toISOString() },
{ id: 'w-202', userId: 'u-1', auctionId: 'a-106', addedAt: new Date(now - 12 * HOUR).toISOString() },
{ id: 'w-203', userId: 'u-1', auctionId: 'a-108', addedAt: new Date(now - 4 * HOUR).toISOString() },
{ id: 'w-204', userId: 'u-1', auctionId: 'a-105', addedAt: new Date(now - 2 * HOUR).toISOString() }];


export function watchlistForUser(userId) {
  return watchlist.filter((w) => w.userId === userId);
}