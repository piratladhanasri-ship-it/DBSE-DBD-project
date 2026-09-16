import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { EyeIcon, BanIcon } from 'lucide-react';
import { PageHeader } from '../../components/PageHeader';
import { Panel, DataTable } from '../../components/DataTable';
import { StatusBadge } from '../../components/StatusBadge';
import { CountdownTimer } from '../../components/CountdownTimer';
import { SearchBar } from '../../components/SearchBar';
import { SelectInput } from '../../components/ui/Field';
import { Button } from '../../components/ui/Button';
import { ConfirmationDialog } from '../../components/ConfirmationDialog';
import { useAuctions } from '../../context/AuctionContext';
import { useToast } from '../../context/ToastContext';
import { setAuctionStatus } from '../../services/auctionService';
import { formatCurrency } from '../../utils/format';

export function AdminAuctions() {
  const { auctions, patchAuction } = useAuctions();
  const toast = useToast();
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [suspending, setSuspending] = useState(null);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return auctions.
    filter((a) => status === 'all' ? true : a.status === status).
    filter((a) => !q ? true : `${a.title} ${a.sellerName} ${a.category}`.toLowerCase().includes(q)).
    sort((a, b) => new Date(b.startAt) - new Date(a.startAt));
  }, [auctions, query, status]);

  async function confirmSuspend() {
    await setAuctionStatus(suspending.id, 'rejected', 'Suspended by administrator');
    patchAuction(suspending.id, { status: 'rejected' });
    toast.success('Listing suspended', `${suspending.title} is no longer publicly visible.`);
    setSuspending(null);
  }

  const columns = [
  {
    key: 'title',
    header: 'Auction',
    render: (row) =>
    <div className="min-w-0">
          <Link to={`/auctions/${row.id}`} className="font-medium text-navy-900 hover:text-navy-600">
            {row.title}
          </Link>
          <p className="text-xs text-navy-400">
            {row.id} · {row.category}
          </p>
        </div>

  },
  { key: 'seller', header: 'Seller', render: (row) => <span className="text-navy-600">{row.sellerName}</span> },
  { key: 'bid', header: 'Highest bid', align: 'right', render: (row) => <span className="nums">{row.currentBid ? formatCurrency(row.currentBid) : '—'}</span> },
  { key: 'bids', header: 'Bids', align: 'right', hideOnMobile: true, render: (row) => <span className="nums">{row.bidCount}</span> },
  { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
  { key: 'time', header: 'Closes in', render: (row) => <CountdownTimer endAt={row.endAt} status={row.status} /> },
  {
    key: 'actions',
    header: 'Actions',
    align: 'right',
    render: (row) =>
    <div className="flex justify-end gap-1.5">
          <Button to={`/auctions/${row.id}`} variant="ghost" size="icon" aria-label={`Monitor ${row.title}`}>
            <EyeIcon className="h-4 w-4" aria-hidden="true" />
          </Button>
          <Button
        variant="ghost"
        size="icon"
        className="text-negative hover:bg-negative/5"
        onClick={() => setSuspending(row)}
        disabled={row.status === 'rejected' || row.status === 'ended'}
        aria-label={`Suspend ${row.title}`}>
        
            <BanIcon className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>

  }];


  return (
    <>
      <PageHeader
        title="Manage auctions"
        description="Monitor every listing on the platform and suspend anything that breaches the listing policy." />
      

      <Panel
        title={`${rows.length} auctions`}
        action={
        <div className="flex flex-wrap items-center gap-2">
            <SearchBar value={query} onChange={setQuery} placeholder="Search lot or seller" id="admin-auction-search" className="w-52" />
            <div className="w-40">
              <label htmlFor="status-filter" className="sr-only">
                Filter by status
              </label>
              <SelectInput id="status-filter" value={status} onChange={(e) => setStatus(e.target.value)} className="h-9 py-1.5 text-sm">
                <option value="all">All statuses</option>
                <option value="live">Live</option>
                <option value="upcoming">Upcoming</option>
                <option value="pending">Pending review</option>
                <option value="ended">Ended</option>
                <option value="rejected">Rejected</option>
              </SelectInput>
            </div>
          </div>
        }>
        
        <DataTable columns={columns} rows={rows} caption="All auctions" empty={{ title: 'No auctions match', description: 'Adjust the search or status filter.' }} />
      </Panel>

      <ConfirmationDialog
        open={Boolean(suspending)}
        onClose={() => setSuspending(null)}
        onConfirm={confirmSuspend}
        title="Suspend this listing?"
        message={`“${suspending?.title}” will be hidden from the catalogue and the seller will be notified. Existing bids are retained for the audit trail.`}
        confirmLabel="Suspend listing"
        tone="danger" />
      
    </>);

}