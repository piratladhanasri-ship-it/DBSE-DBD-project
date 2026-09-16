import React, { useEffect, useState } from 'react';
import { GavelIcon, LockIcon } from 'lucide-react';
import { Button } from './ui/Button';
import { Field, TextInput } from './ui/Field';
import { formatCurrency } from '../utils/format';
import { validateBid } from '../utils/validation';

/**
 * Bidding panel. Validation runs on the frontend for immediate feedback; the
 * backend must re-validate before writing to the `bids` table.
 */
export function BidForm({ auction, onPlaceBid, disabled = false, canBid = true, signedIn = true }) {
  const minimum = (auction.currentBid || auction.startingPrice) + auction.bidIncrement;
  const [amount, setAmount] = useState(String(minimum));
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setAmount(String(minimum));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [minimum]);

  const quickBids = [0, 1, 2].map((i) => minimum + i * auction.bidIncrement);

  async function handleSubmit(e) {
    e.preventDefault();
    const message = validateBid(amount, {
      currentBid: auction.currentBid || auction.startingPrice,
      minIncrement: auction.bidIncrement,
      status: auction.status === 'ended' ? 'ended' : 'live'
    });
    if (message) {
      setError(message);
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      await onPlaceBid(Number(amount));
      setAmount(String(Number(amount) + auction.bidIncrement));
    } catch (err) {
      setError(err?.message || 'We could not place your bid. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (!signedIn) {
    return (
      <div className="rounded-card border border-line bg-mist p-4">
        <p className="flex items-center gap-2 text-sm font-semibold text-navy-900">
          <LockIcon className="h-4 w-4" aria-hidden="true" />
          Sign in to place a bid
        </p>
        <p className="mt-1 text-sm text-navy-500">Bidding requires a verified buyer account.</p>
        <div className="mt-3 flex gap-2">
          <Button to="/login" size="sm">
            Log in
          </Button>
          <Button to="/register" size="sm" variant="outline">
            Create account
          </Button>
        </div>
      </div>);

  }

  if (!canBid) {
    return (
      <div className="rounded-card border border-line bg-mist p-4 text-sm text-navy-600">
        You are signed in as a {auction.sellerId ? 'seller/admin' : 'non-buyer'} account. Only buyer accounts can place bids on this
        auction.
      </div>);

  }

  if (disabled) {
    return (
      <div className="rounded-card border border-line bg-mist p-4">
        <p className="text-sm font-semibold text-navy-900">Bidding is closed</p>
        <p className="mt-1 text-sm text-navy-500">
          This auction ended at {formatCurrency(auction.currentBid || auction.startingPrice)}. Browse similar lots to keep bidding.
        </p>
        <Button to="/auctions" size="sm" variant="outline" className="mt-3">
          Browse auctions
        </Button>
      </div>);

  }

  return (
    <form onSubmit={handleSubmit} className="rounded-card border border-line bg-white p-4 shadow-card" noValidate>
      <div className="flex flex-wrap gap-2">
        {quickBids.map((value) =>
        <button
          key={value}
          type="button"
          onClick={() => {
            setAmount(String(value));
            setError('');
          }}
          className="nums rounded-lg border border-line px-3 py-1.5 text-sm font-medium text-navy-700 transition-colors duration-150 ease-out hover:border-navy-400 hover:bg-navy-50">
          
            {formatCurrency(value)}
          </button>
        )}
      </div>

      <Field
        label="Your bid"
        htmlFor="bid-amount"
        error={error}
        hint={`Minimum bid ${formatCurrency(minimum)} · increments of ${formatCurrency(auction.bidIncrement)}`}
        className="mt-4">
        
        <div className="relative">
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-medium text-navy-400">₹</span>
          <TextInput
            id="bid-amount"
            type="number"
            inputMode="numeric"
            min={minimum}
            step={auction.bidIncrement}
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value);
              setError('');
            }}
            invalid={Boolean(error)}
            className="nums pl-7 text-base font-semibold" />
          
        </div>
      </Field>

      <Button type="submit" variant="gold" size="lg" loading={submitting} className="mt-4 w-full">
        <GavelIcon className="h-4 w-4" aria-hidden="true" />
        Place bid
      </Button>
      <p className="mt-2.5 text-center text-xs text-navy-400">
        Bids are binding. A bid in the final minute extends the auction by 30 seconds.
      </p>
    </form>);

}