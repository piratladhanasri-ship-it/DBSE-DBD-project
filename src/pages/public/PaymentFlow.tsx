import React, { useState } from 'react';
import { CheckIcon, LockIcon } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/StatusBadge';
import { formatCurrency, formatDateTime } from '../../utils/format';
import { cn } from '../../utils/cn';

const SAMPLE = {
  auctionId: 'a-109',
  auctionTitle: '14-inch Aluminium Laptop, 1TB (Sealed)',
  winner: 'Rhea Kulkarni',
  seller: 'Devansh Rao',
  amount: 91000,
  fee: 4550,
  paymentId: 'pay-5001',
  transactionId: 'txn_9f4c21'
};

const STAGES = [
{
  key: 'ended',
  title: 'Auction ends',
  caption: 'The clock stops after the anti-sniping window closes.',
  detail: [
  ['auction_id', SAMPLE.auctionId],
  ['final_bid', formatCurrency(SAMPLE.amount)],
  ['status', 'ended']]

},
{
  key: 'winner',
  title: 'Winner selected',
  caption: 'The highest valid bid in the bids table becomes the winning row.',
  detail: [
  ['winner', SAMPLE.winner],
  ['bid_status', 'won'],
  ['runner_up_status', 'lost']]

},
{
  key: 'request',
  title: 'Payment request',
  caption: 'A payments row is created with a 72 hour due window and the buyer is notified.',
  detail: [
  ['payment_id', SAMPLE.paymentId],
  ['status', 'pending'],
  ['due_in', '72 hours']]

},
{
  key: 'stripe',
  title: 'Stripe payment',
  caption: 'The backend creates a PaymentIntent with the secret key; the browser only ever sees the client secret.',
  detail: [
  ['intent', 'pi_••••_secret'],
  ['method', 'Card / UPI'],
  ['amount', formatCurrency(SAMPLE.amount)]]

},
{
  key: 'verify',
  title: 'Payment verification',
  caption: 'A Stripe webhook confirms capture before anything is marked paid.',
  detail: [
  ['webhook', 'payment_intent.succeeded'],
  ['verified', 'true'],
  ['status', 'paid']]

},
{
  key: 'record',
  title: 'Transaction recorded',
  caption: 'The payment, platform fee and receipt are written to the transactions ledger.',
  detail: [
  ['transaction_id', SAMPLE.transactionId],
  ['platform_fee', formatCurrency(SAMPLE.fee)],
  ['net_to_seller', formatCurrency(SAMPLE.amount - SAMPLE.fee)]]

},
{
  key: 'settle',
  title: 'Seller settlement',
  caption: 'Funds are released to the seller once no dispute is open.',
  detail: [
  ['settlement_status', 'settled'],
  ['payout_to', SAMPLE.seller],
  ['settled_at', formatDateTime(new Date().toISOString())]]

}];


export function PaymentFlow() {
  const [active, setActive] = useState(3);

  return (
    <div className="mx-auto max-w-shell px-4 py-12 sm:px-6 lg:px-8">
      <header className="max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold-600">Payment &amp; settlement</p>
        <h1 className="mt-3 font-display text-4xl leading-tight text-navy-900 sm:text-5xl">From a closed auction to a settled seller</h1>
        <p className="mt-4 text-base leading-relaxed text-navy-600">
          Every completed lot moves through seven recorded stages. Select a stage to see the data written at that point.
        </p>
      </header>

      {/* Stage rail */}
      <ol className="mt-10 grid gap-3 lg:grid-cols-7">
        {STAGES.map((stage, i) => {
          const done = i < active;
          const current = i === active;
          return (
            <li key={stage.key}>
              <button
                type="button"
                onClick={() => setActive(i)}
                aria-current={current ? 'step' : undefined}
                className={cn(
                  'h-full w-full rounded-card border p-3.5 text-left transition-colors duration-150 ease-out',
                  current ? 'border-navy-900 bg-navy-900' : done ? 'border-line bg-white' : 'border-line bg-mist'
                )}>
                
                <span
                  className={cn(
                    'nums flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-semibold',
                    current ? 'bg-gold-400 text-navy-900' : done ? 'bg-positive/15 text-positive' : 'bg-white text-navy-400'
                  )}>
                  
                  {done ? <CheckIcon className="h-3 w-3" aria-hidden="true" /> : i + 1}
                </span>
                <span className={cn('mt-2.5 block text-sm font-semibold', current ? 'text-white' : 'text-navy-900')}>
                  {stage.title}
                </span>
              </button>
            </li>);

        })}
      </ol>

      {/* Active stage */}
      <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-card border border-line bg-white p-6 shadow-card">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-display text-2xl text-navy-900">{STAGES[active].title}</h2>
            <StatusBadge status={active >= 4 ? 'paid' : active >= 2 ? 'awaiting_payment' : 'ended'} />
          </div>
          <p className="mt-2 text-sm leading-relaxed text-navy-600">{STAGES[active].caption}</p>

          <dl className="mt-5 divide-y divide-line rounded-lg border border-line">
            {STAGES[active].detail.map(([key, value]) =>
            <div key={key} className="flex items-center justify-between gap-4 px-4 py-3">
                <dt className="font-mono text-xs text-navy-400">{key}</dt>
                <dd className="text-sm font-medium text-navy-900">{value}</dd>
              </div>
            )}
          </dl>

          <div className="mt-5 flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setActive((a) => Math.max(0, a - 1))} disabled={active === 0}>
              Previous stage
            </Button>
            <Button
              size="sm"
              onClick={() => setActive((a) => Math.min(STAGES.length - 1, a + 1))}
              disabled={active === STAGES.length - 1}>
              
              Next stage
            </Button>
          </div>
        </section>

        <aside className="space-y-4">
          <div className="rounded-card border border-line bg-white p-5 shadow-card">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-navy-400">Sample transaction</h2>
            <p className="mt-3 text-base font-semibold text-navy-900">{SAMPLE.auctionTitle}</p>
            <dl className="mt-4 space-y-2.5 text-sm">
              <Row label="Winning bid" value={formatCurrency(SAMPLE.amount)} />
              <Row label="Platform fee (5%)" value={`− ${formatCurrency(SAMPLE.fee)}`} />
              <Row label="Net to seller" value={formatCurrency(SAMPLE.amount - SAMPLE.fee)} emphasis />
              <Row label="Buyer" value={SAMPLE.winner} />
              <Row label="Seller" value={SAMPLE.seller} />
            </dl>
          </div>

          <div className="rounded-card border border-line bg-mist p-5">
            <p className="flex items-center gap-2 text-sm font-semibold text-navy-900">
              <LockIcon className="h-4 w-4" aria-hidden="true" />
              Key handling
            </p>
            <p className="mt-2 text-sm leading-relaxed text-navy-600">
              Only the Stripe publishable key belongs in the frontend. Secret keys, webhook secrets and database credentials stay in
              the Express server environment and are never bundled into this app.
            </p>
          </div>
        </aside>
      </div>
    </div>);

}

function Row({ label, value, emphasis = false }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="text-navy-500">{label}</dt>
      <dd className={cn('nums font-medium', emphasis ? 'text-base font-semibold text-navy-900' : 'text-navy-800')}>{value}</dd>
    </div>);

}