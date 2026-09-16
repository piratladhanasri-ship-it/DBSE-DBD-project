import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { payments as seedPayments, sellerEarnings } from '../data/payments';
import * as paymentService from '../services/paymentService';

/**
 * Holds the payments / settlements state so the buyer checkout, seller sold
 * items and admin transaction monitor all read the same rows.
 */
const PaymentContext = createContext(null);

export function PaymentProvider({ children }) {
  const [payments, setPayments] = useState(seedPayments);

  const forBuyer = useCallback((buyerId) => payments.filter((p) => p.buyerId === buyerId), [payments]);
  const forSeller = useCallback((sellerId) => payments.filter((p) => p.sellerId === sellerId), [payments]);
  const getPayment = useCallback((id) => payments.find((p) => p.id === id), [payments]);

  /** Completes a payment after Stripe confirmation. */
  const payNow = useCallback(async (paymentId) => {
    const result = await paymentService.confirmPayment(paymentId);
    setPayments((prev) => prev.map((p) => p.id === paymentId ? { ...p, ...result } : p));
    return result;
  }, []);

  const releaseSettlement = useCallback(async (paymentId) => {
    const result = await paymentService.releaseSettlement(paymentId);
    setPayments((prev) => prev.map((p) => p.id === paymentId ? { ...p, ...result } : p));
    return result;
  }, []);

  /** Creates the payment row for a newly won auction. */
  const createPaymentForWin = useCallback((auction, buyer) => {
    const id = `pay-${Date.now().toString().slice(-4)}`;
    setPayments((prev) => [
    {
      id,
      auctionId: auction.id,
      auctionTitle: auction.title,
      buyerId: buyer.id,
      buyerName: buyer.name,
      sellerId: auction.sellerId,
      sellerName: auction.sellerName,
      amount: auction.currentBid,
      platformFee: Math.round(auction.currentBid * 0.05),
      status: 'pending',
      method: null,
      paidAt: null,
      dueAt: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString(),
      settlementStatus: 'awaiting_payment'
    },
    ...prev]
    );
    return id;
  }, []);

  const value = useMemo(
    () => ({ payments, forBuyer, forSeller, getPayment, payNow, releaseSettlement, createPaymentForWin, sellerEarnings }),
    [payments, forBuyer, forSeller, getPayment, payNow, releaseSettlement, createPaymentForWin]
  );

  return <PaymentContext.Provider value={value}>{children}</PaymentContext.Provider>;
}

export function usePayments() {
  const ctx = useContext(PaymentContext);
  if (!ctx) throw new Error('usePayments must be used inside <PaymentProvider>');
  return ctx;
}