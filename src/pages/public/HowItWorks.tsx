import React from 'react';
import { Link } from 'react-router-dom';
import { TimerResetIcon, ShieldCheckIcon, ScaleIcon, DatabaseIcon } from 'lucide-react';
import { Button } from '../../components/ui/Button';

const BUYER_STEPS = [
{ title: 'Register as a buyer', text: 'Create an account and confirm your email. Bidding is limited to verified buyer accounts.' },
{ title: 'Browse and watch lots', text: 'Filter the catalogue and save lots to your watchlist to get closing reminders.' },
{ title: 'Place a bid', text: 'Bid above the current high by at least the lot increment. Every bid is recorded against your account.' },
{ title: 'Win and pay', text: 'If you hold the highest bid at the close, pay through the secure checkout within 72 hours.' }];


const SELLER_STEPS = [
{ title: 'Register as a seller', text: 'Set up your store name and payout details.' },
{ title: 'Submit a lot', text: 'Add images, a condition report, a starting price, and the open and close times.' },
{ title: 'Admin verification', text: 'An administrator reviews the listing before it becomes visible on the catalogue.' },
{ title: 'Monitor and settle', text: 'Watch bids arrive live, then receive your payout after the buyer payment clears.' }];


const POLICIES = [
{
  icon: TimerResetIcon,
  title: 'Anti-sniping',
  text: 'Any bid placed in the final 60 seconds extends the close by 30 seconds. The auction only ends once a full minute passes with no new bid, so a last-second snipe cannot win unchallenged.'
},
{
  icon: ShieldCheckIcon,
  title: 'Listing verification',
  text: 'Lots stay in a pending state until an administrator approves them. Rejected listings are returned to the seller with a reason.'
},
{
  icon: ScaleIcon,
  title: 'Disputes',
  text: 'Either party can raise a dispute within 7 days of delivery. Seller settlement is held while a dispute is under review.'
}];


const ENTITIES = [
{ name: 'users', text: 'Buyers, sellers and administrators with role and account status.' },
{ name: 'auctions', text: 'One row per lot: pricing, timing, status and the owning seller.' },
{ name: 'bids', text: 'Every bid with amount, bidder and timestamp — the auction audit trail.' },
{ name: 'payments', text: 'Winning-bid payments with method, status and settlement state.' },
{ name: 'watchlist', text: 'Saved lots per buyer, used for closing reminders.' },
{ name: 'notifications', text: 'Outbid, closing, win, payment and moderation alerts.' },
{ name: 'disputes', text: 'Raised cases with reason, status and resolution.' },
{ name: 'reviews', text: 'Buyer ratings of sellers after a completed sale.' }];


export function HowItWorks() {
  return (
    <div className="mx-auto max-w-shell px-4 py-12 sm:px-6 lg:px-8">
      <header className="max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold-600">The process</p>
        <h1 className="mt-3 font-display text-4xl leading-tight text-navy-900 sm:text-5xl">How bidding works on BidVault</h1>
        <p className="mt-4 text-base leading-relaxed text-navy-600">
          Every auction follows the same timed cycle: verification, open bidding, a fair close, payment, then seller settlement.
        </p>
      </header>

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <StepColumn title="For buyers" steps={BUYER_STEPS} />
        <StepColumn title="For sellers" steps={SELLER_STEPS} />
      </div>

      <section className="mt-12">
        <h2 className="font-display text-3xl text-navy-900">Platform policies</h2>
        <ul className="mt-5 grid gap-5 md:grid-cols-3">
          {POLICIES.map((p) =>
          <li key={p.title} className="rounded-card border border-line bg-white p-5 shadow-card">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-navy-50 text-navy-600">
                <p.icon className="h-4 w-4" aria-hidden="true" />
              </span>
              <h3 className="mt-3.5 text-sm font-semibold text-navy-900">{p.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-navy-500">{p.text}</p>
            </li>
          )}
        </ul>
      </section>

      <section className="mt-12 rounded-card border border-line bg-mist p-6">
        <h2 className="flex items-center gap-2 font-display text-2xl text-navy-900">
          <DatabaseIcon className="h-5 w-5 text-navy-500" aria-hidden="true" />
          Data model behind the screens
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-navy-600">
          Each screen maps directly onto a relational table, so the frontend can be pointed at the Express API and MySQL schema
          without restructuring.
        </p>
        <dl className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {ENTITIES.map((e) =>
          <div key={e.name} className="rounded-lg border border-line bg-white p-4">
              <dt className="font-mono text-sm font-semibold text-navy-900">{e.name}</dt>
              <dd className="mt-1 text-xs leading-relaxed text-navy-500">{e.text}</dd>
            </div>
          )}
        </dl>
      </section>

      <section className="mt-12 flex flex-wrap items-center justify-between gap-4 rounded-card border border-line bg-white p-6 shadow-card">
        <div>
          <h2 className="text-lg font-semibold text-navy-900">Ready to bid?</h2>
          <p className="mt-1 text-sm text-navy-500">
            See the settlement journey in{' '}
            <Link to="/payment-flow" className="font-semibold text-navy-800 underline-offset-2 hover:underline">
              payment &amp; settlement
            </Link>
            , or jump straight into the live catalogue.
          </p>
        </div>
        <Button to="/auctions" size="lg">
          Browse auctions
        </Button>
      </section>
    </div>);

}

function StepColumn({ title, steps }) {
  return (
    <section className="rounded-card border border-line bg-white p-6 shadow-card">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-navy-400">{title}</h2>
      <ol className="mt-4 space-y-5">
        {steps.map((step, i) =>
        <li key={step.title} className="flex gap-4">
            <span className="nums flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-navy-200 text-xs font-semibold text-navy-700">
              {i + 1}
            </span>
            <div>
              <p className="text-sm font-semibold text-navy-900">{step.title}</p>
              <p className="mt-1 text-sm leading-relaxed text-navy-500">{step.text}</p>
            </div>
          </li>
        )}
      </ol>
    </section>);

}