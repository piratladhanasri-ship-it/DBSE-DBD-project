import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { notifications as seedNotifications } from '../data/notifications';
import { mockSocket, SOCKET_EVENTS } from '../services/socket';
import * as notificationService from '../services/notificationService';
import { useAuth } from './AuthContext';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const { user } = useAuth();
  const [items, setItems] = useState(seedNotifications);

  const push = useCallback((notification) => {
    setItems((prev) => [
    {
      id: `n-${Date.now()}`,
      isRead: false,
      createdAt: new Date().toISOString(),
      ...notification
    },
    ...prev]
    );
  }, []);

  // Real-time feed: `notification`, plus bid/extension events turned into alerts.
  useEffect(() => {
    const onNotification = (payload) => push(payload);

    const onNewBid = ({ auctionId, bid }) => {
      if (!user) return;
      if (bid.userId === user.id) return;
      if (user.role === 'buyer') {
        push({
          userId: user.id,
          type: 'outbid',
          title: 'You have been outbid',
          message: `${bid.bidderName} placed a higher bid of ₹${bid.amount.toLocaleString('en-IN')}.`,
          link: `/auctions/${auctionId}`
        });
      } else if (user.role === 'seller') {
        push({
          userId: user.id,
          type: 'bid',
          title: 'New bid on your auction',
          message: `${bid.bidderName} bid ₹${bid.amount.toLocaleString('en-IN')}.`,
          link: `/seller/monitor/${auctionId}`
        });
      }
    };

    const onExtended = ({ auctionId, secondsAdded }) => {
      if (!user) return;
      push({
        userId: user.id,
        type: 'ending',
        title: 'Auction extended',
        message: `A late bid added ${secondsAdded} seconds to the auction close.`,
        link: `/auctions/${auctionId}`
      });
    };

    const onEnded = ({ auctionId, winnerId, winnerName, amount }) => {
      if (!user) return;
      const won = winnerId === user.id;
      push({
        userId: user.id,
        type: won ? 'won' : 'ended',
        title: won ? 'You won the auction' : 'Auction closed',
        message: won ?
        `Your winning bid of ₹${Number(amount).toLocaleString('en-IN')} was accepted. Payment is now due.` :
        `The auction closed at ₹${Number(amount).toLocaleString('en-IN')} to ${winnerName || 'another bidder'}.`,
        link: won ? '/buyer/won' : `/auctions/${auctionId}`
      });
    };

    mockSocket.on(SOCKET_EVENTS.NOTIFICATION, onNotification);
    mockSocket.on(SOCKET_EVENTS.NEW_BID, onNewBid);
    mockSocket.on(SOCKET_EVENTS.AUCTION_EXTENDED, onExtended);
    mockSocket.on(SOCKET_EVENTS.AUCTION_ENDED, onEnded);
    return () => {
      mockSocket.off(SOCKET_EVENTS.NOTIFICATION, onNotification);
      mockSocket.off(SOCKET_EVENTS.NEW_BID, onNewBid);
      mockSocket.off(SOCKET_EVENTS.AUCTION_EXTENDED, onExtended);
      mockSocket.off(SOCKET_EVENTS.AUCTION_ENDED, onEnded);
    };
  }, [user, push]);

  const myNotifications = useMemo(() => {
    if (!user) return [];
    return items.
    filter((n) => n.userId === user.id).
    sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [items, user]);

  const unreadCount = myNotifications.filter((n) => !n.isRead).length;

  const markRead = useCallback((id) => {
    notificationService.markRead(id);
    setItems((prev) => prev.map((n) => n.id === id ? { ...n, isRead: true } : n));
  }, []);

  const markAllRead = useCallback(() => {
    if (!user) return;
    notificationService.markAllRead(user.id);
    setItems((prev) => prev.map((n) => n.userId === user.id ? { ...n, isRead: true } : n));
  }, [user]);

  const value = useMemo(
    () => ({ notifications: myNotifications, unreadCount, markRead, markAllRead, push }),
    [myNotifications, unreadCount, markRead, markAllRead, push]
  );

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used inside <NotificationProvider>');
  return ctx;
}