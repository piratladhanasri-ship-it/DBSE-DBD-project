import React, { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { MenuIcon, ExternalLinkIcon } from 'lucide-react';
import { Sidebar } from '../components/Sidebar';
import { NotificationDropdown } from '../components/NotificationDropdown';
import { useAuth } from '../context/AuthContext';

const ROLE_LABEL = {
  buyer: 'Buyer workspace',
  seller: 'Seller workspace',
  admin: 'Administration'
};

export function DashboardLayout() {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();

  return (
    <div className="flex min-h-screen w-full bg-mist">
      <Sidebar open={open} onClose={() => setOpen(false)} />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-line bg-white px-4 sm:px-6">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-navy-700 transition-colors duration-150 ease-out hover:bg-navy-50 lg:hidden"
            aria-label="Open menu">
            
            <MenuIcon className="h-5 w-5" aria-hidden="true" />
          </button>

          <p className="text-sm font-semibold text-navy-900">{ROLE_LABEL[user?.role] || 'Workspace'}</p>

          <div className="ml-auto flex items-center gap-1.5">
            <Link
              to="/auctions"
              className="hidden h-10 items-center gap-1.5 rounded-lg px-3 text-sm font-medium text-navy-600 transition-colors duration-150 ease-out hover:bg-navy-50 hover:text-navy-900 sm:inline-flex">
              
              Public site
              <ExternalLinkIcon className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
            <NotificationDropdown />
          </div>
        </header>

        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <div className="mx-auto max-w-6xl space-y-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>);

}