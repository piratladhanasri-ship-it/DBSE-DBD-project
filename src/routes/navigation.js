import {
  LayoutDashboardIcon,
  GavelIcon,
  HeartIcon,
  TrophyIcon,
  CreditCardIcon,
  BellIcon,
  UserIcon,
  PlusCircleIcon,
  PackageIcon,
  ActivityIcon,
  BanknoteIcon,
  ShieldCheckIcon,
  UsersIcon,
  AlertTriangleIcon,
  ReceiptIcon,
  ListIcon,
  HomeIcon,
  SettingsIcon } from
'lucide-react';

/** Top-level navigation for signed-out visitors. */
export const guestNav = [
{ label: 'Home', to: '/', icon: HomeIcon },
{ label: 'Auctions', to: '/auctions', icon: GavelIcon }];


/** Role-based dashboard navigation rendered in the sidebar. */
export const roleNav = {
  buyer: [
  { label: 'Dashboard', to: '/buyer', icon: LayoutDashboardIcon, end: true },
  { label: 'Browse auctions', to: '/auctions', icon: GavelIcon },
  { label: 'My bids', to: '/buyer/bids', icon: ListIcon },
  { label: 'Bid history', to: '/buyer/history', icon: ActivityIcon },
  { label: 'Watchlist', to: '/buyer/watchlist', icon: HeartIcon },
  { label: 'Won auctions', to: '/buyer/won', icon: TrophyIcon },
  { label: 'Payments', to: '/buyer/payments', icon: CreditCardIcon },
  { label: 'Notifications', to: '/notifications', icon: BellIcon },
  { label: 'Profile', to: '/profile', icon: UserIcon },
  { label: 'Settings', to: '/settings', icon: SettingsIcon }],

  seller: [
  { label: 'Dashboard', to: '/seller', icon: LayoutDashboardIcon, end: true },
  { label: 'Create auction', to: '/seller/create', icon: PlusCircleIcon },
  { label: 'My auctions', to: '/seller/auctions', icon: PackageIcon },
  { label: 'Monitor bids', to: '/seller/monitor', icon: ActivityIcon },
  { label: 'Sold items', to: '/seller/sold', icon: TrophyIcon },
  { label: 'Earnings', to: '/seller/earnings', icon: BanknoteIcon },
  { label: 'Notifications', to: '/notifications', icon: BellIcon },
  { label: 'Profile', to: '/profile', icon: UserIcon },
  { label: 'Settings', to: '/settings', icon: SettingsIcon }],

  admin: [
  { label: 'Dashboard', to: '/admin', icon: LayoutDashboardIcon, end: true },
  { label: 'Verify auctions', to: '/admin/verify', icon: ShieldCheckIcon },
  { label: 'Users', to: '/admin/users', icon: UsersIcon },
  { label: 'Auctions', to: '/admin/auctions', icon: GavelIcon },
  { label: 'Disputes', to: '/admin/disputes', icon: AlertTriangleIcon },
  { label: 'Transactions', to: '/admin/transactions', icon: ReceiptIcon },
  { label: 'Profile', to: '/profile', icon: UserIcon },
  { label: 'Settings', to: '/settings', icon: SettingsIcon }]

};

export const dashboardHome = {
  buyer: '/buyer',
  seller: '/seller',
  admin: '/admin'
};

export function navForRole(role) {
  return roleNav[role] || [];
}