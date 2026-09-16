/**
 * Mock `notifications` table. Mirrors the MySQL entity:
 * notifications(notification_id, user_id, type, title, message, link, is_read, created_at)
 */
const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const now = Date.now();
const ago = (n) => new Date(now - n).toISOString();

export const notifications = [
{
  id: 'n-701',
  userId: 'u-1',
  type: 'outbid',
  title: 'You have been outbid',
  message: 'Nikhil B. bid ₹1,42,000 on Leica M3 Double Stroke Body, 1955.',
  link: '/auctions/a-102',
  isRead: false,
  createdAt: ago(38 * MINUTE)
},
{
  id: 'n-702',
  userId: 'u-1',
  type: 'ending',
  title: 'Auction ending soon',
  message: '1969 Heuer Carrera Chronograph closes in under 3 minutes.',
  link: '/auctions/a-101',
  isRead: false,
  createdAt: ago(6 * MINUTE)
},
{
  id: 'n-703',
  userId: 'u-1',
  type: 'won',
  title: 'You won the auction',
  message: 'You won 14-inch Aluminium Laptop, 1TB at ₹91,000. Payment is due in 2 days.',
  link: '/buyer/won',
  isRead: false,
  createdAt: ago(2 * HOUR)
},
{
  id: 'n-704',
  userId: 'u-1',
  type: 'payment',
  title: 'Payment successful',
  message: 'Your payment of ₹58,000 for Brass Ship Chronometer was received.',
  link: '/buyer/payments',
  isRead: true,
  createdAt: ago(12 * 24 * HOUR)
},
{
  id: 'n-705',
  userId: 'u-2',
  type: 'approved',
  title: 'Auction approved',
  message: 'Graded Rookie Card, PSA 9 Slab was approved and is now live.',
  link: '/seller/auctions',
  isRead: false,
  createdAt: ago(5 * HOUR)
},
{
  id: 'n-706',
  userId: 'u-2',
  type: 'bid',
  title: 'New bid on your auction',
  message: 'Rhea K. bid ₹2,46,500 on 1969 Heuer Carrera Chronograph.',
  link: '/seller/monitor/a-101',
  isRead: false,
  createdAt: ago(4 * MINUTE)
},
{
  id: 'n-707',
  userId: 'u-2',
  type: 'payment',
  title: 'Settlement scheduled',
  message: 'Payout of ₹86,450 for the laptop sale is scheduled for 14 Sep.',
  link: '/seller/earnings',
  isRead: true,
  createdAt: ago(20 * HOUR)
},
{
  id: 'n-708',
  userId: 'u-3',
  type: 'dispute',
  title: 'Dispute updated',
  message: 'Dispute DSP-3002 has a new response from the seller.',
  link: '/admin/disputes',
  isRead: false,
  createdAt: ago(90 * MINUTE)
},
{
  id: 'n-709',
  userId: 'u-3',
  type: 'pending',
  title: '2 auctions await verification',
  message: 'Art Deco Silver Tea Service and Modern Abstract Canvas were submitted for review.',
  link: '/admin/verify',
  isRead: false,
  createdAt: ago(6 * HOUR)
}];


export function notificationsForUser(userId) {
  return notifications.
  filter((n) => n.userId === userId).
  sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}