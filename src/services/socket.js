import { io } from 'socket.io-client';
import { API_BASE_URL, getToken } from './api';

/**
 * Socket.io client wrapper.
 *
 * Server events the frontend is prepared for:
 *   newBid          { auctionId, bid, currentBid, bidCount }
 *   auctionUpdated  { auctionId, ...changedFields }
 *   auctionExtended { auctionId, endAt, secondsAdded }   // anti-sniping
 *   auctionEnded    { auctionId, winnerId, winnerName, amount }
 *   notification    { id, userId, type, title, message, link, createdAt }
 *
 * Client events the backend should accept:
 *   joinAuction / leaveAuction  { auctionId }
 *   placeBid                    { auctionId, amount }
 *
 * Until a Socket.io server is running, `mockSocket` below drives the same
 * event names so the real-time UI is fully demonstrable.
 */
export const SOCKET_EVENTS = {
  NEW_BID: 'newBid',
  AUCTION_UPDATED: 'auctionUpdated',
  AUCTION_EXTENDED: 'auctionExtended',
  AUCTION_ENDED: 'auctionEnded',
  NOTIFICATION: 'notification'
};

let socket = null;

export function connectSocket() {
  if (socket) return socket;
  socket = io(API_BASE_URL, {
    transports: ['websocket'],
    auth: { token: getToken() },
    autoConnect: true,
    reconnectionAttempts: 2,
    timeout: 4000
  });
  return socket;
}

export function getSocket() {
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

export function joinAuctionRoom(auctionId) {
  socket?.emit('joinAuction', { auctionId });
}

export function leaveAuctionRoom(auctionId) {
  socket?.emit('leaveAuction', { auctionId });
}

/**
 * Tiny in-memory event bus with the same surface as a Socket.io client.
 * AuctionContext publishes simulated `newBid` / `auctionExtended` events through
 * it, so swapping in the real socket is a one-line change.
 */
function createMockSocket() {
  const handlers = new Map();
  return {
    connected: true,
    mock: true,
    on(event, handler) {
      if (!handlers.has(event)) handlers.set(event, new Set());
      handlers.get(event).add(handler);
      return this;
    },
    off(event, handler) {
      handlers.get(event)?.delete(handler);
      return this;
    },
    emit(event, payload) {
      handlers.get(event)?.forEach((handler) => handler(payload));
      return this;
    }
  };
}

export const mockSocket = createMockSocket();