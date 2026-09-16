import React from 'react';
import { Link } from 'react-router-dom';
import { Logo } from './Logo';

const COLUMNS = [
{
  title: 'Marketplace',
  links: [
  { label: 'Browse auctions', to: '/auctions' },
  { label: 'How it works', to: '/how-it-works' },
  { label: 'Start selling', to: '/register' },
  { label: 'Payment & settlement', to: '/payment-flow' }]

},
{
  title: 'Account',
  links: [
  { label: 'Log in', to: '/login' },
  { label: 'Create account', to: '/register' },
  { label: 'Notifications', to: '/notifications' },
  { label: 'Profile', to: '/profile' }]

},
{
  title: 'Platform',
  links: [
  { label: 'Buyer protection', to: '/how-it-works' },
  { label: 'Anti-sniping policy', to: '/how-it-works' },
  { label: 'Dispute process', to: '/how-it-works' },
  { label: 'Settings', to: '/settings' }]

}];


export function Footer() {
  return (
    <footer className="border-t border-line bg-white">
      <div className="mx-auto max-w-shell px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div>
            <Logo />
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-navy-500">
              A timed-auction marketplace for watches, art, collectibles and rare objects — with verified sellers, live bidding and
              escrowed settlement.
            </p>
          </div>
          {COLUMNS.map((col) =>
          <nav key={col.title} aria-label={col.title}>
              <h2 className="text-xs font-semibold uppercase tracking-wide text-navy-400">{col.title}</h2>
              <ul className="mt-3 space-y-2">
                {col.links.map((link) =>
              <li key={link.label}>
                    <Link
                  to={link.to}
                  className="text-sm text-navy-600 transition-colors duration-150 ease-out hover:text-navy-900">
                  
                      {link.label}
                    </Link>
                  </li>
              )}
              </ul>
            </nav>
          )}
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-line pt-6 text-xs text-navy-400 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} BidVault. Academic project — DBSE &amp; DBD.</p>
          <p>Built with React, Vite, Tailwind CSS, Socket.io · Node/Express + MySQL backend ready</p>
        </div>
      </div>
    </footer>);

}