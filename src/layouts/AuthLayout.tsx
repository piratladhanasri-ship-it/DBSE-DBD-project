import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { ShieldCheckIcon, GavelIcon, BanknoteIcon } from 'lucide-react';
import { Logo } from '../components/Logo';

const POINTS = [
{ icon: ShieldCheckIcon, title: 'Verified listings', text: 'Every lot is reviewed by an administrator before it goes live.' },
{ icon: GavelIcon, title: 'Live bidding', text: 'Bids and countdowns update in real time over a socket connection.' },
{ icon: BanknoteIcon, title: 'Escrowed settlement', text: 'Payments clear before a seller payout is released.' }];


export function AuthLayout() {
  return (
    <div className="grid min-h-screen w-full lg:grid-cols-2">
      <div className="flex flex-col px-4 py-8 sm:px-8">
        <div className="mx-auto w-full max-w-md">
          <Logo />
        </div>
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-8">
          <Outlet />
        </div>
        <p className="mx-auto w-full max-w-md text-xs text-navy-400">
          <Link to="/" className="transition-colors duration-150 ease-out hover:text-navy-700">
            ← Back to home
          </Link>
        </p>
      </div>

      <aside className="hidden flex-col justify-between bg-navy-900 p-10 lg:flex">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold-300">BidVault marketplace</p>
        <div>
          <h2 className="font-display text-4xl leading-tight text-white">
            Where collectors and sellers
            <br />
            meet at the close.
          </h2>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-navy-200">
            Timed auctions for watches, art, coins and rare objects. Bid transparently, settle securely.
          </p>
          <ul className="mt-10 space-y-5">
            {POINTS.map((p) =>
            <li key={p.title} className="flex gap-3.5">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-navy-800 text-gold-300">
                  <p.icon className="h-4 w-4" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-white">{p.title}</p>
                  <p className="mt-0.5 text-sm text-navy-300">{p.text}</p>
                </div>
              </li>
            )}
          </ul>
        </div>
        <p className="text-xs text-navy-400">Academic project · DBSE &amp; DBD · React + Node/Express + MySQL</p>
      </aside>
    </div>);

}