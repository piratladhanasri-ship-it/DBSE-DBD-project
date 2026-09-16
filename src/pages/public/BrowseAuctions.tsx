import React, { useMemo, useState } from 'react';
import { GavelIcon } from 'lucide-react';
import { SearchBar } from '../../components/SearchBar';
import { Filters } from '../../components/Filters';
import { AuctionCard } from '../../components/AuctionCard';
import { EmptyState } from '../../components/EmptyState';
import { LoadingBlock } from '../../components/LoadingSpinner';
import { useAuctions } from '../../context/AuctionContext';
import { useAuth } from '../../context/AuthContext';

const DEFAULT_FILTERS = { category: 'all', status: 'all', price: 'all', sort: 'ending-soon' };

export function BrowseAuctions() {
  const { auctions, isWatched, toggleWatch } = useAuctions();
  const { isAuthenticated, user } = useAuth();
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [loading] = useState(false);

  const results = useMemo(() => {
    const [min, max] = filters.price === 'all' ? [0, Infinity] : filters.price.split('-').map((v) => v ? Number(v) : Infinity);
    const q = query.trim().toLowerCase();

    const filtered = auctions.
    filter((a) => a.status !== 'pending' && a.status !== 'rejected').
    filter((a) => filters.category === 'all' ? true : a.category === filters.category).
    filter((a) => filters.status === 'all' ? true : a.status === filters.status).
    filter((a) => {
      const price = a.currentBid || a.startingPrice;
      return price >= (min || 0) && price <= (max ?? Infinity);
    }).
    filter((a) =>
    !q ? true : [a.title, a.category, a.sellerName, a.sellerStore].join(' ').toLowerCase().includes(q)
    );

    const sorters = {
      'ending-soon': (a, b) => new Date(a.endAt) - new Date(b.endAt),
      newest: (a, b) => new Date(b.startAt) - new Date(a.startAt),
      'price-low': (a, b) => (a.currentBid || a.startingPrice) - (b.currentBid || b.startingPrice),
      'price-high': (a, b) => (b.currentBid || b.startingPrice) - (a.currentBid || a.startingPrice),
      'most-bids': (a, b) => b.bidCount - a.bidCount
    };
    return [...filtered].sort(sorters[filters.sort] || sorters['ending-soon']);
  }, [auctions, filters, query]);

  return (
    <div className="mx-auto max-w-shell px-4 py-10 sm:px-6 lg:px-8">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="font-display text-4xl text-navy-900">Browse auctions</h1>
          <p className="mt-1.5 text-sm text-navy-500">
            {auctions.filter((a) => a.status === 'live').length} lots open for bidding ·{' '}
            {auctions.filter((a) => a.status === 'upcoming').length} opening soon
          </p>
        </div>
        <SearchBar value={query} onChange={setQuery} className="w-full lg:max-w-sm" />
      </header>

      <div className="mt-6">
        <Filters value={filters} onChange={setFilters} resultCount={results.length} onReset={() => setFilters(DEFAULT_FILTERS)} />
      </div>

      {loading ?
      <LoadingBlock label="Loading auctions…" /> :
      results.length === 0 ?
      <div className="mt-6 rounded-card border border-line bg-white">
          <EmptyState
          icon={GavelIcon}
          title="No auctions match these filters"
          description="Try widening the price band, clearing the category, or searching for a different keyword."
          actionLabel="Reset filters"
          onAction={() => {
            setFilters(DEFAULT_FILTERS);
            setQuery('');
          }} />
        
        </div> :

      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {results.map((auction) =>
        <AuctionCard
          key={auction.id}
          auction={auction}
          watched={isWatched(auction.id)}
          onToggleWatch={isAuthenticated && user.role === 'buyer' ? toggleWatch : undefined} />

        )}
        </div>
      }
    </div>);

}