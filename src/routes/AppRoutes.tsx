import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { PublicLayout } from '../layouts/PublicLayout';
import { AuthLayout } from '../layouts/AuthLayout';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { ProtectedRoute } from './ProtectedRoute';

/* Public */
import { Home } from '../pages/public/Home';
import { BrowseAuctions } from '../pages/public/BrowseAuctions';
import { AuctionDetails } from '../pages/public/AuctionDetails';
import { HowItWorks } from '../pages/public/HowItWorks';
import { PaymentFlow } from '../pages/public/PaymentFlow';
import { Login } from '../pages/public/Login';
import { Register } from '../pages/public/Register';
import { ForgotPassword } from '../pages/public/ForgotPassword';
import { NotFound } from '../pages/public/NotFound';
import { Unauthorized } from '../pages/public/Unauthorized';

/* Shared (any signed-in role) */
import { Notifications } from '../pages/shared/Notifications';
import { Profile } from '../pages/shared/Profile';
import { Settings } from '../pages/shared/Settings';

/* Buyer */
import { BuyerDashboard } from '../pages/buyer/BuyerDashboard';
import { MyBids } from '../pages/buyer/MyBids';
import { BidHistoryPage } from '../pages/buyer/BidHistoryPage';
import { Watchlist } from '../pages/buyer/Watchlist';
import { WonAuctions } from '../pages/buyer/WonAuctions';
import { Payments } from '../pages/buyer/Payments';
import { Checkout } from '../pages/buyer/Checkout';

/* Seller */
import { SellerDashboard } from '../pages/seller/SellerDashboard';
import { CreateAuction } from '../pages/seller/CreateAuction';
import { ManageAuctions } from '../pages/seller/ManageAuctions';
import { MonitorBids } from '../pages/seller/MonitorBids';
import { SoldItems } from '../pages/seller/SoldItems';
import { Earnings } from '../pages/seller/Earnings';

/* Admin */
import { AdminDashboard } from '../pages/admin/AdminDashboard';
import { VerifyAuctions } from '../pages/admin/VerifyAuctions';
import { ManageUsers } from '../pages/admin/ManageUsers';
import { AdminAuctions } from '../pages/admin/AdminAuctions';
import { Disputes } from '../pages/admin/Disputes';
import { Transactions } from '../pages/admin/Transactions';

export function AppRoutes() {
  return (
    <Routes>
      {/* ---------------------------------------------------------- public */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/auctions" element={<BrowseAuctions />} />
        <Route path="/auctions/:auctionId" element={<AuctionDetails />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
        <Route path="/payment-flow" element={<PaymentFlow />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="*" element={<NotFound />} />
      </Route>

      {/* ------------------------------------------------------------ auth */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
      </Route>

      {/* ------------------------------------------- signed in, any role */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Route>

      {/* ----------------------------------------------------------- buyer */}
      <Route element={<ProtectedRoute allow={['buyer']} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/buyer" element={<BuyerDashboard />} />
          <Route path="/buyer/bids" element={<MyBids />} />
          <Route path="/buyer/history" element={<BidHistoryPage />} />
          <Route path="/buyer/watchlist" element={<Watchlist />} />
          <Route path="/buyer/won" element={<WonAuctions />} />
          <Route path="/buyer/payments" element={<Payments />} />
          <Route path="/buyer/payments/:paymentId" element={<Checkout />} />
        </Route>
      </Route>

      {/* ---------------------------------------------------------- seller */}
      <Route element={<ProtectedRoute allow={['seller']} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/seller" element={<SellerDashboard />} />
          <Route path="/seller/create" element={<CreateAuction />} />
          <Route path="/seller/auctions" element={<ManageAuctions />} />
          <Route path="/seller/monitor" element={<MonitorBids />} />
          <Route path="/seller/monitor/:auctionId" element={<MonitorBids />} />
          <Route path="/seller/sold" element={<SoldItems />} />
          <Route path="/seller/earnings" element={<Earnings />} />
        </Route>
      </Route>

      {/* ----------------------------------------------------------- admin */}
      <Route element={<ProtectedRoute allow={['admin']} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/verify" element={<VerifyAuctions />} />
          <Route path="/admin/users" element={<ManageUsers />} />
          <Route path="/admin/auctions" element={<AdminAuctions />} />
          <Route path="/admin/disputes" element={<Disputes />} />
          <Route path="/admin/transactions" element={<Transactions />} />
        </Route>
      </Route>

      <Route path="/dashboard" element={<Navigate to="/buyer" replace />} />
    </Routes>);

}