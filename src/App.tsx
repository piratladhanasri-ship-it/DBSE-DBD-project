import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AuctionProvider } from './context/AuctionContext';
import { NotificationProvider } from './context/NotificationContext';
import { PaymentProvider } from './context/PaymentContext';
import { ToastProvider } from './context/ToastContext';
import { AppRoutes } from './routes/AppRoutes';

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <AuctionProvider>
            <PaymentProvider>
              <ToastProvider>
                <AppRoutes />
              </ToastProvider>
            </PaymentProvider>
          </AuctionProvider>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>);

}