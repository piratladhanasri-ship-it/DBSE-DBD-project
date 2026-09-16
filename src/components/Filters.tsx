import React, { useState } from 'react';
import { SlidersHorizontalIcon, XIcon } from 'lucide-react';
import { categories } from '../data/auctions';
import { SelectInput, Field } from './ui/Field';
import { Button } from './ui/Button';
import { cn } from '../utils/cn';

export const PRICE_BANDS = [
{ value: 'all', label: 'Any price' },
{ value: '0-50000', label: 'Under ₹50,000' },
{ value: '50000-150000', label: '₹50,000 – ₹1,50,000' },
{ value: '150000-300000', label: '₹1,50,000 – ₹3,00,000' },
{ value: '300000-', label: 'Above ₹3,00,000' }];


export const SORT_OPTIONS = [
{ value: 'ending-soon', label: 'Ending soonest' },
{ value: 'newest', label: 'Recently listed' },
{ value: 'price-low', label: 'Price: low to high' },
{ value: 'price-high', label: 'Price: high to low' },
{ value: 'most-bids', label: 'Most bids' }];


export const STATUS_OPTIONS = [
{ value: 'all', label: 'All statuses' },
{ value: 'live', label: 'Live now' },
{ value: 'upcoming', label: 'Upcoming' },
{ value: 'ended', label: 'Ended' }];


export function Filters({ value, onChange, resultCount, onReset }) {
  const [open, setOpen] = useState(false);
  const activeCount = ['category', 'status', 'price'].filter((k) => value[k] && value[k] !== 'all').length;

  const controls =
  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <Field label="Category" htmlFor="filter-category">
        <SelectInput id="filter-category" value={value.category} onChange={(e) => onChange({ ...value, category: e.target.value })}>
          <option value="all">All categories</option>
          {categories.map((c) =>
        <option key={c} value={c}>
              {c}
            </option>
        )}
        </SelectInput>
      </Field>

      <Field label="Auction status" htmlFor="filter-status">
        <SelectInput id="filter-status" value={value.status} onChange={(e) => onChange({ ...value, status: e.target.value })}>
          {STATUS_OPTIONS.map((o) =>
        <option key={o.value} value={o.value}>
              {o.label}
            </option>
        )}
        </SelectInput>
      </Field>

      <Field label="Price range" htmlFor="filter-price">
        <SelectInput id="filter-price" value={value.price} onChange={(e) => onChange({ ...value, price: e.target.value })}>
          {PRICE_BANDS.map((o) =>
        <option key={o.value} value={o.value}>
              {o.label}
            </option>
        )}
        </SelectInput>
      </Field>

      <Field label="Sort by" htmlFor="filter-sort">
        <SelectInput id="filter-sort" value={value.sort} onChange={(e) => onChange({ ...value, sort: e.target.value })}>
          {SORT_OPTIONS.map((o) =>
        <option key={o.value} value={o.value}>
              {o.label}
            </option>
        )}
        </SelectInput>
      </Field>
    </div>;


  return (
    <div className="space-y-3">
      {/* Mobile toggle */}
      <div className="flex items-center justify-between gap-3 lg:hidden">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="inline-flex h-10 items-center gap-2 rounded-lg border border-line bg-white px-3 text-sm font-semibold text-navy-800"
          aria-expanded={open}>
          
          {open ? <XIcon className="h-4 w-4" aria-hidden="true" /> : <SlidersHorizontalIcon className="h-4 w-4" aria-hidden="true" />}
          Filters
          {activeCount ?
          <span className="nums rounded-full bg-navy-900 px-1.5 py-0.5 text-[11px] font-semibold text-white">{activeCount}</span> :
          null}
        </button>
        <p className="nums text-sm text-navy-500">{resultCount} results</p>
      </div>

      <div className={cn('rounded-card border border-line bg-white p-4 shadow-card', !open && 'hidden lg:block')}>
        {controls}
        <div className="mt-3 flex items-center justify-between gap-3 border-t border-line pt-3">
          <p className="nums hidden text-sm text-navy-500 lg:block">{resultCount} auctions match your filters</p>
          <Button variant="ghost" size="sm" onClick={onReset} className="ml-auto">
            Reset filters
          </Button>
        </div>
      </div>
    </div>);

}