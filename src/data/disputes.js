/**
 * Mock `disputes` and `reviews` tables.
 * disputes(dispute_id, auction_id, raised_by, against, reason, details, status, created_at, resolved_at)
 * reviews(review_id, auction_id, reviewer_id, seller_id, rating, comment, created_at)
 */
const DAY = 24 * 60 * 60 * 1000;
const now = Date.now();
const ago = (n) => new Date(now - n * DAY).toISOString();

export const disputes = [
{
  id: 'DSP-3001',
  auctionId: 'a-077',
  auctionTitle: 'Silver Pocket Watch, Swiss Lever',
  raisedBy: 'Arjun Mehta',
  raisedByRole: 'buyer',
  against: 'Devansh Rao',
  reason: 'Item not as described',
  details: 'Listing stated the case was unpolished; the delivered watch shows machine polishing on the lugs.',
  status: 'open',
  createdAt: ago(2),
  resolvedAt: null,
  amount: 42000
},
{
  id: 'DSP-3002',
  auctionId: 'a-084',
  auctionTitle: 'Mid-century Teak Writing Desk',
  raisedBy: 'Rhea Kulkarni',
  raisedByRole: 'buyer',
  against: 'Ananya Nair',
  reason: 'Damaged in transit',
  details: 'One leg arrived cracked. Photographs and the courier condition note were uploaded on collection day.',
  status: 'under_review',
  createdAt: ago(5),
  resolvedAt: null,
  amount: 37500
},
{
  id: 'DSP-2998',
  auctionId: 'a-071',
  auctionTitle: 'Signed Cricket Bat, 2011 Squad',
  raisedBy: 'Sara Fernandes',
  raisedByRole: 'buyer',
  against: 'Devansh Rao',
  reason: 'Authenticity questioned',
  details: 'Buyer requested a second opinion on the signature. Independent verification confirmed authenticity.',
  status: 'resolved',
  createdAt: ago(19),
  resolvedAt: ago(14),
  amount: 78000
},
{
  id: 'DSP-2994',
  auctionId: 'a-065',
  auctionTitle: 'Enamel Advertising Sign, 1930s',
  raisedBy: 'Kabir Sheth',
  raisedByRole: 'seller',
  against: 'Nikhil Bose',
  reason: 'Non-payment after win',
  details: 'Winning bidder did not complete payment within the 72 hour window. Seller requested relisting.',
  status: 'resolved',
  createdAt: ago(28),
  resolvedAt: ago(25),
  amount: 21000
}];


export const reviews = [
{
  id: 'r-401',
  auctionId: 'a-090',
  auctionTitle: 'Brass Ship Chronometer, 1948',
  reviewerId: 'u-1',
  reviewerName: 'Rhea Kulkarni',
  sellerId: 'u-2',
  sellerName: 'Devansh Rao',
  rating: 5,
  comment: 'Packed exceptionally well and exactly as described. Service records were a nice touch.',
  createdAt: ago(11)
},
{
  id: 'r-402',
  auctionId: 'a-084',
  auctionTitle: 'Mid-century Teak Writing Desk',
  reviewerId: 'u-1',
  reviewerName: 'Rhea Kulkarni',
  sellerId: 'u-5',
  sellerName: 'Ananya Nair',
  rating: 3,
  comment: 'Lovely piece but the crating could have been sturdier for a desk of this size.',
  createdAt: ago(33)
},
{
  id: 'r-403',
  auctionId: 'a-071',
  auctionTitle: 'Signed Cricket Bat, 2011 Squad',
  reviewerId: 'u-7',
  reviewerName: 'Sara Fernandes',
  sellerId: 'u-2',
  sellerName: 'Devansh Rao',
  rating: 5,
  comment: 'Responsive to every question before the close and shipped the next morning.',
  createdAt: ago(46)
}];


export const adminStats = {
  totalUsers: 1284,
  totalAuctions: 476,
  activeAuctions: 38,
  completedAuctions: 402,
  totalTransactions: 361,
  pendingDisputes: 2,
  transactionVolume: 18742500,
  weekly: [
  { day: 'Mon', auctions: 6, bids: 142 },
  { day: 'Tue', auctions: 9, bids: 186 },
  { day: 'Wed', auctions: 4, bids: 121 },
  { day: 'Thu', auctions: 11, bids: 244 },
  { day: 'Fri', auctions: 8, bids: 198 },
  { day: 'Sat', auctions: 13, bids: 302 },
  { day: 'Sun', auctions: 7, bids: 164 }]

};