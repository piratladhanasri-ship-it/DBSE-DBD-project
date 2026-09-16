import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../../components/PageHeader';
import { Panel, DataTable } from '../../components/DataTable';
import { StatusBadge } from '../../components/StatusBadge';
import { CountdownTimer } from '../../components/CountdownTimer';
import { SelectInput } from '../../components/ui/Field';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import { useAuctions } from '../../context/AuctionContext';
import { formatCurrency } from '../../utils/format';

export function MyBids() {
  const { user } = useAuth();
  const { bidsByUser, getAuction, bidsFor } = useAuctions();
  const [filter, setFilter] = useState('all');

  const rows = useMemo(() => {
    const myBids = bidsByUser(user.id);
    const byAuction = new Map();
    myBids.forEach((bid) => {
      const existing = byAuction.get(bid.auctionId);
      if (!existing || bid.amount > existing.myHighest) {
        byAuction.set(bid.auctionId, { auctionId: bid.auctionId, myHighest: bid.amount, placedAt: bid.placedAt });
      }
    });

    return [...byAuction.values()].
    map((entry) => {
      const auction = getAuction(entry.auctionId);
      if (!auction) return null;
      const top = bidsFor(auction.id)[0];
      const leading = top?.userId === user.id;
      const result =
      auction.status === 'ended' ? auction.winnerId === user.id ? 'won' : 'lost' : leading ? 'winning' : 'outbid';
      return { id: auction.id, auction, myHighest: entry.myHighest, result };
    }).
    filter(Boolean).
    filter((row) => {
      if (filter === 'all') return true;
      if (filter === 'active') return row.auction.status === 'live';
      if (filter === 'winning') return row.result === 'winning';
      if (filter === 'outbid') return row.result === 'outbid';
      return row.auction.status === 'ended';
    }).
    sort((a, b) => new Date(a.auction.endAt) - new Date(b.auction.endAt));
  }, [bidsByUser, getAuction, bidsFor, user.id, filter]);

  const columns = [
  {
    key: 'auction',
    header: 'Auction',
    render: (row) =>
    <Link to={`/auctions/${row.auction.id}`} className="font-medium text-navy-900 hover:text-navy-600">
          {row.auction.title}
        </Link>

  },
  { key: 'category', header: 'Category', hideOnMobile: true, render: (row) => row.auction.category },
  {
    key: 'current',
    header: 'Current bid',
    align: 'right',
    render: (row) => <span className="nums font-medium">{formatCurrency(row.auction.currentBid || row.auction.startingPrice)}</span>
  },
  {
    key: 'mine',
    header: 'My highest bid',
    align: 'right',
    render: (row) => <span className="nums font-semibold text-navy-900">{formatCurrency(row.myHighest)}</span>
  },
  { key: 'status', header: 'Auction status', render: (row) => <StatusBadge status={row.auction.status} /> },
  {
    key: 'time',
    header: 'Time remaining',
    render: (row) => <CountdownTimer endAt={row.auction.endAt} status={row.auction.status} />
  },
  { key: 'result', header: 'Result', render: (row) => <StatusBadge status={row.result} withDot={false} /> },
  {
    key: 'action',
    header: '',
    align: 'right',
    render: (row) =>
    <Button to={`/auctions/${row.auction.id}`} variant="outline" size="sm">
          {row.auction.status === 'live' ? 'Bid again' : 'View'}
        </Button>

  }];


  return (
    <>
      <PageHeader title="My bids" description="Every lot you have bid on, with your highest bid and current standing." />

      <Panel
        title={`${rows.length} auctions`}
        action={
        <div className="w-44">
            <label htmlFor="bid-filter" className="sr-only">
              Filter bids
            </label>
            <SelectInput id="bid-filter" value={filter} onChange={(e) => setFilter(e.target.value)} className="h-9 py-1.5 text-sm">
              <option value="all">All bids</option>
              <option value="active">Active auctions</option>
              <option value="winning">Currently winning</option>
              <option value="outbid">Outbid</option>
              <option value="ended">Closed auctions</option>
            </SelectInput>
          </div>
        }>
        
        <DataTable
          columns={columns}
          rows={rows}
          caption="Auctions you have bid on"
          empty={{
            title: 'No bids in this view',
            description: 'Try a different filter, or place a bid on a live lot.',
            actionLabel: 'Browse auctions',
            actionTo: '/auctions'
          }} />
        
      </Panel>
    </>);

}