/**
 * Mock `payments` / `settlements` tables. Mirrors the MySQL entities:
 * payments(payment_id, auction_id, buyer_id, seller_id, amount, status, method, paid_at)
 * settlements(settlement_id, payment_id, seller_id, payout_amount, status, settled_at)
 */
const DAY = 24 * 60 * 60 * 1000;
const now = Date.now();
const ago = (n) => new Date(now - n * DAY).toISOString();

export const payments = [
{
  id: 'pay-5001',
  auctionId: 'a-109',
  auctionTitle: '14-inch Aluminium Laptop, 1TB (Sealed)',
  buyerId: 'u-1',
  buyerName: 'Rhea Kulkarni',
  sellerId: 'u-2',
  sellerName: 'Devansh Rao',
  amount: 91000,
  platformFee: 4550,
  status: 'pending',
  method: null,
  paidAt: null,
  dueAt: new Date(now + 2 * DAY).toISOString(),
  settlementStatus: 'awaiting_payment'
},
{
  id: 'pay-5002',
  auctionId: 'a-110',
  auctionTitle: 'Leather-Bound First Edition, 1902',
  buyerId: 'u-9',
  buyerName: 'Nikhil Bose',
  sellerId: 'u-5',
  sellerName: 'Ananya Nair',
  amount: 64500,
  platformFee: 3225,
  status: 'paid',
  method: 'Card •••• 4242',
  paidAt: ago(0.5),
  dueAt: ago(0.5),
  settlementStatus: 'pending'
},
{
  id: 'pay-4997',
  auctionId: 'a-090',
  auctionTitle: 'Brass Ship Chronometer, 1948',
  buyerId: 'u-1',
  buyerName: 'Rhea Kulkarni',
  sellerId: 'u-2',
  sellerName: 'Devansh Rao',
  amount: 58000,
  platformFee: 2900,
  status: 'paid',
  method: 'Card •••• 4242',
  paidAt: ago(12),
  dueAt: ago(13),
  settlementStatus: 'settled'
},
{
  id: 'pay-4990',
  auctionId: 'a-084',
  auctionTitle: 'Mid-century Teak Writing Desk',
  buyerId: 'u-1',
  buyerName: 'Rhea Kulkarni',
  sellerId: 'u-5',
  sellerName: 'Ananya Nair',
  amount: 37500,
  platformFee: 1875,
  status: 'paid',
  method: 'UPI',
  paidAt: ago(34),
  dueAt: ago(35),
  settlementStatus: 'settled'
},
{
  id: 'pay-4982',
  auctionId: 'a-077',
  auctionTitle: 'Silver Pocket Watch, Swiss Lever',
  buyerId: 'u-4',
  buyerName: 'Arjun Mehta',
  sellerId: 'u-2',
  sellerName: 'Devansh Rao',
  amount: 42000,
  platformFee: 2100,
  status: 'failed',
  method: 'Card •••• 1881',
  paidAt: null,
  dueAt: ago(3),
  settlementStatus: 'awaiting_payment'
},
{
  id: 'pay-4975',
  auctionId: 'a-071',
  auctionTitle: 'Signed Cricket Bat, 2011 Squad',
  buyerId: 'u-7',
  buyerName: 'Sara Fernandes',
  sellerId: 'u-2',
  sellerName: 'Devansh Rao',
  amount: 78000,
  platformFee: 3900,
  status: 'paid',
  method: 'Card •••• 7781',
  paidAt: ago(48),
  dueAt: ago(49),
  settlementStatus: 'settled'
}];


/** Seller-side earnings summary derived from the payments above. */
export const sellerEarnings = {
  totalEarnings: 1246300,
  completedSettlements: 1104500,
  pendingSettlements: 141800,
  nextPayoutAt: new Date(now + 3 * DAY).toISOString(),
  monthly: [
  { month: 'Apr', earnings: 112000 },
  { month: 'May', earnings: 148500 },
  { month: 'Jun', earnings: 96000 },
  { month: 'Jul', earnings: 204000 },
  { month: 'Aug', earnings: 176500 },
  { month: 'Sep', earnings: 232000 }]

};

export function paymentsForBuyer(buyerId) {
  return payments.filter((p) => p.buyerId === buyerId);
}

export function paymentsForSeller(sellerId) {
  return payments.filter((p) => p.sellerId === sellerId);
}