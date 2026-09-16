import React from 'react';
import { Link } from 'react-router-dom';
import { GavelIcon, HeartIcon } from 'lucide-react';
import { CountdownTimer } from './CountdownTimer';
import { StatusBadge } from './StatusBadge';
import { formatCurrency, formatDateTime } from '../utils/format';
import { auctionCover } from '../data/auctions';
import { cn } from '../utils/cn';

export function AuctionCard({ auction, watched = false, onToggleWatch, className }) {
  const live = auction.status === 'live';
  const price = live || auction.status === 'ended' ? auction.currentBid || auction.startingPrice : auction.startingPrice;

  return (
    <article
      className={cn(
        'group flex h-full flex-col overflow-hidden rounded-card border border-line bg-white shadow-card transition-colors duration-150 ease-out hover:border-navy-200',
        className
      )}>
      
      <div className="relative aspect-[4/3] overflow-hidden bg-mist">
        <Link to={`/auctions/${auction.id}`} tabIndex={-1} aria-hidden="true">
          <img
            src={auctionCover(auction)}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.02]" />
          
        </Link>
        <div className="absolute left-3 top-3">
          <StatusBadge status={auction.status} />
        </div>
        {onToggleWatch ?
        <button
          type="button"
          onClick={() => onToggleWatch(auction.id)}
          aria-label={watched ? `Remove ${auction.title} from watchlist` : `Add ${auction.title} to watchlist`}
          aria-pressed={watched}
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-navy-500 shadow-card transition-colors duration-150 ease-out hover:text-navy-900">
          
            <HeartIcon className={cn('h-4 w-4', watched && 'fill-negative text-negative')} aria-hidden="true" />
          </button> :
        null}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-navy-400">{auction.category}</p>
        <h3 className="mt-1.5 text-base font-semibold leading-snug text-navy-900">
          <Link to={`/auctions/${auction.id}`} className="transition-colors duration-150 ease-out hover:text-navy-600">
            {auction.title}
          </Link>
        </h3>

        <div className="mt-3 flex items-end justify-between gap-3 border-t border-line pt-3">
          <div>
            <p className="text-xs text-navy-400">{live ? 'Current bid' : auction.status === 'ended' ? 'Final bid' : 'Starting price'}</p>
            <p className="nums text-lg font-semibold text-navy-900">{formatCurrency(price)}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-navy-400">Start</p>
            <p className="nums text-sm font-medium text-navy-500">{formatCurrency(auction.startingPrice)}</p>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between gap-2 text-sm">
          <span className="inline-flex items-center gap-1.5 text-navy-500">
            <GavelIcon className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="nums">{auction.bidCount}</span> bids
          </span>
          {auction.status === 'upcoming' ?
          <span className="text-sm text-navy-500">Opens {formatDateTime(auction.startAt).split(',')[0]}</span> :

          <CountdownTimer endAt={auction.endAt} status={auction.status} />
          }
        </div>

        <div className="mt-auto pt-4">
          <Link
            to={`/auctions/${auction.id}`}
            className="flex h-10 w-full items-center justify-center rounded-lg border border-navy-200 text-sm font-semibold text-navy-800 transition-colors duration-150 ease-out hover:border-navy-900 hover:bg-navy-900 hover:text-white">
            
            View auction
          </Link>
        </div>
      </div>
    </article>);

}