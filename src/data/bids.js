/**
 * Mock `bids` table. Mirrors the MySQL entity:
 * bids(bid_id, auction_id, user_id, amount, placed_at, status)
 * status: 'winning' | 'outbid' | 'won' | 'lost'
 */
const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const now = Date.now();
const ago = (offset) => new Date(now - offset).toISOString();

export const bids = [
// a-101 — Heuer Carrera (Rhea is currently the top bidder)
{ id: 'b-9001', auctionId: 'a-101', userId: 'u-1', bidderName: 'Rhea Kulkarni', amount: 246500, placedAt: ago(4 * MINUTE), status: 'winning' },
{ id: 'b-9002', auctionId: 'a-101', userId: 'u-4', bidderName: 'Arjun Mehta', amount: 244000, placedAt: ago(11 * MINUTE), status: 'outbid' },
{ id: 'b-9003', auctionId: 'a-101', userId: 'u-9', bidderName: 'Nikhil Bose', amount: 241500, placedAt: ago(26 * MINUTE), status: 'outbid' },
{ id: 'b-9004', auctionId: 'a-101', userId: 'u-1', bidderName: 'Rhea Kulkarni', amount: 238000, placedAt: ago(52 * MINUTE), status: 'outbid' },
{ id: 'b-9005', auctionId: 'a-101', userId: 'u-7', bidderName: 'Sara Fernandes', amount: 232000, placedAt: ago(2 * HOUR), status: 'outbid' },
{ id: 'b-9006', auctionId: 'a-101', userId: 'u-4', bidderName: 'Arjun Mehta', amount: 220000, placedAt: ago(6 * HOUR), status: 'outbid' },

// a-102 — Leica M3 (Rhea has been outbid)
{ id: 'b-9010', auctionId: 'a-102', userId: 'u-9', bidderName: 'Nikhil Bose', amount: 142000, placedAt: ago(38 * MINUTE), status: 'winning' },
{ id: 'b-9011', auctionId: 'a-102', userId: 'u-1', bidderName: 'Rhea Kulkarni', amount: 139000, placedAt: ago(1 * HOUR), status: 'outbid' },
{ id: 'b-9012', auctionId: 'a-102', userId: 'u-7', bidderName: 'Sara Fernandes', amount: 134500, placedAt: ago(3 * HOUR), status: 'outbid' },
{ id: 'b-9013', auctionId: 'a-102', userId: 'u-1', bidderName: 'Rhea Kulkarni', amount: 128000, placedAt: ago(9 * HOUR), status: 'outbid' },

// a-103 — Ochre Study
{ id: 'b-9020', auctionId: 'a-103', userId: 'u-1', bidderName: 'Rhea Kulkarni', amount: 88000, placedAt: ago(2 * HOUR), status: 'winning' },
{ id: 'b-9021', auctionId: 'a-103', userId: 'u-4', bidderName: 'Arjun Mehta', amount: 86000, placedAt: ago(5 * HOUR), status: 'outbid' },
{ id: 'b-9022', auctionId: 'a-103', userId: 'u-9', bidderName: 'Nikhil Bose', amount: 82000, placedAt: ago(14 * HOUR), status: 'outbid' },

// a-104 — Guitar
{ id: 'b-9030', auctionId: 'a-104', userId: 'u-7', bidderName: 'Sara Fernandes', amount: 155000, placedAt: ago(3 * HOUR), status: 'winning' },
{ id: 'b-9031', auctionId: 'a-104', userId: 'u-9', bidderName: 'Nikhil Bose', amount: 150000, placedAt: ago(8 * HOUR), status: 'outbid' },

// a-105 — Graded card
{ id: 'b-9040', auctionId: 'a-105', userId: 'u-4', bidderName: 'Arjun Mehta', amount: 71500, placedAt: ago(25 * MINUTE), status: 'winning' },
{ id: 'b-9041', auctionId: 'a-105', userId: 'u-1', bidderName: 'Rhea Kulkarni', amount: 70000, placedAt: ago(48 * MINUTE), status: 'outbid' },
{ id: 'b-9042', auctionId: 'a-105', userId: 'u-9', bidderName: 'Nikhil Bose', amount: 66000, placedAt: ago(4 * HOUR), status: 'outbid' },

// a-106 — Gold dinar
{ id: 'b-9050', auctionId: 'a-106', userId: 'u-9', bidderName: 'Nikhil Bose', amount: 268000, placedAt: ago(6 * HOUR), status: 'winning' },
{ id: 'b-9051', auctionId: 'a-106', userId: 'u-1', bidderName: 'Rhea Kulkarni', amount: 260000, placedAt: ago(11 * HOUR), status: 'outbid' },

// a-107 — Sneakers
{ id: 'b-9060', auctionId: 'a-107', userId: 'u-7', bidderName: 'Sara Fernandes', amount: 24500, placedAt: ago(16 * MINUTE), status: 'winning' },
{ id: 'b-9061', auctionId: 'a-107', userId: 'u-4', bidderName: 'Arjun Mehta', amount: 24000, placedAt: ago(40 * MINUTE), status: 'outbid' },

// a-109 — Laptop (ended, Rhea won)
{ id: 'b-9070', auctionId: 'a-109', userId: 'u-1', bidderName: 'Rhea Kulkarni', amount: 91000, placedAt: ago(26 * HOUR), status: 'won' },
{ id: 'b-9071', auctionId: 'a-109', userId: 'u-9', bidderName: 'Nikhil Bose', amount: 90000, placedAt: ago(27 * HOUR), status: 'lost' },

// a-110 — First edition (ended, Rhea lost)
{ id: 'b-9080', auctionId: 'a-110', userId: 'u-9', bidderName: 'Nikhil Bose', amount: 64500, placedAt: ago(25 * HOUR), status: 'won' },
{ id: 'b-9081', auctionId: 'a-110', userId: 'u-1', bidderName: 'Rhea Kulkarni', amount: 63000, placedAt: ago(26 * HOUR), status: 'lost' }];


export function bidsForAuction(auctionId) {
  return bids.
  filter((b) => b.auctionId === auctionId).
  sort((a, b) => new Date(b.placedAt) - new Date(a.placedAt));
}

export function bidsForUser(userId) {
  return bids.
  filter((b) => b.userId === userId).
  sort((a, b) => new Date(b.placedAt) - new Date(a.placedAt));
}