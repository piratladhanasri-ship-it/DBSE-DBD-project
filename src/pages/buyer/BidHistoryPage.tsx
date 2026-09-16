import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../../components/PageHeader';
import { Panel, DataTable } from '../../components/DataTable';
import { StatusBadge } from '../../components/StatusBadge';
import { SearchBar } from '../../components/SearchBar';
import { useAuth } from '../../context/AuthContext';
import { useAuctions } from '../../context/AuctionContext';
import { formatCurrency, formatDateTime } from '../../utils/format';

export function BidHistoryPage() {
  const { user } = useAuth();
  const { bidsByUser, getAuction } = useAuctions();
  const [query, setQuery] = useState('');

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return bidsByUser(user.id).
    map((bid) => ({ ...bid, auction: getAuction(bid.auctionId) })).
    filter((bid) => !q ? true : (bid.auction?.title || '').toLowerCase().includes(q));
  }, [bidsByUser, getAuction, user.id, query]);

  const total = rows.reduce((sum, r) => sum + r.amount, 0);

  const columns = [
  {
    key: 'auction',
    header: 'Auction',
    render: (row) =>
    row.auction ?
    <Link to={`/auctions/${row.auctionId}`} className="font-medium text-navy-900 hover:text-navy-600">
            {row.auction.title}
          </Link> :

    <span className="text-navy-500">{row.auctionId}</span>

  },
  { key: 'bid_id', header: 'Bid ID', hideOnMobile: true, render: (row) => <span className="font-mono text-xs text-navy-400">{row.id}</span> },
  { key: 'amount', header: 'Bid amount', align: 'right', render: (row) => <span className="nums font-semibold">{formatCurrency(row.amount)}</span> },
  { key: 'placedAt', header: 'Date / time', render: (row) => <span className="nums text-navy-600">{formatDateTime(row.placedAt)}</span> },
  { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} withDot={false} /> }];


  return (
    <>
      <PageHeader
        title="Bid history"
        description="A complete, immutable log of every bid you have placed — one row per record in the bids table." />
      

      <div className="grid gap-4 sm:grid-cols-3">
        <Summary label="Bids placed" value={rows.length} />
        <Summary label="Total bid value" value={formatCurrency(total)} />
        <Summary label="Winning bids" value={rows.filter((r) => r.status === 'winning' || r.status === 'won').length} />
      </div>

      <Panel
        title="All bids"
        action={<SearchBar value={query} onChange={setQuery} placeholder="Search by lot" id="history-search" className="w-56" />}>
        
        <DataTable
          columns={columns}
          rows={rows}
          caption="Your bid history"
          empty={{ title: 'No bids found', description: 'Your bid log will appear here once you start bidding.', actionLabel: 'Browse auctions', actionTo: '/auctions' }} />
        
      </Panel>
    </>);

}

function Summary({ label, value }) {
  return (
    <div className="rounded-card border border-line bg-white p-4 shadow-card">
      <p className="text-sm text-navy-500">{label}</p>
      <p className="nums mt-1 text-xl font-semibold text-navy-900">{value}</p>
    </div>);

}