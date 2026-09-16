import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../../components/PageHeader';
import { Panel, DataTable } from '../../components/DataTable';
import { StatusBadge } from '../../components/StatusBadge';
import { SearchBar } from '../../components/SearchBar';
import { SelectInput } from '../../components/ui/Field';
import { Button } from '../../components/ui/Button';
import { DashboardCard } from '../../components/DashboardCard';
import { usePayments } from '../../context/PaymentContext';
import { useToast } from '../../context/ToastContext';
import { formatCurrency, formatDateTime } from '../../utils/format';

export function Transactions() {
  const { payments, releaseSettlement } = usePayments();
  const toast = useToast();
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return payments.
    filter((p) => status === 'all' ? true : p.status === status).
    filter((p) => !q ? true : `${p.id} ${p.auctionTitle} ${p.buyerName} ${p.sellerName}`.toLowerCase().includes(q));
  }, [payments, query, status]);

  const paidTotal = payments.filter((p) => p.status === 'paid').reduce((s, p) => s + p.amount, 0);
  const feeTotal = payments.filter((p) => p.status === 'paid').reduce((s, p) => s + p.platformFee, 0);
  const pendingSettlements = payments.filter((p) => p.status === 'paid' && p.settlementStatus !== 'settled');

  async function handleRelease(row) {
    await releaseSettlement(row.id);
    toast.success('Settlement released', `${row.sellerName} will receive ${formatCurrency(row.amount - row.platformFee)}.`);
  }

  const columns = [
  { key: 'id', header: 'Transaction ID', render: (row) => <span className="font-mono text-xs font-semibold text-navy-800">{row.id}</span> },
  {
    key: 'auction',
    header: 'Auction',
    render: (row) =>
    <Link to={`/auctions/${row.auctionId}`} className="font-medium text-navy-900 hover:text-navy-600">
          {row.auctionTitle}
        </Link>

  },
  { key: 'buyer', header: 'Buyer', render: (row) => <span className="text-navy-600">{row.buyerName}</span> },
  { key: 'seller', header: 'Seller', hideOnMobile: true, render: (row) => <span className="text-navy-600">{row.sellerName}</span> },
  { key: 'amount', header: 'Amount', align: 'right', render: (row) => <span className="nums font-semibold">{formatCurrency(row.amount)}</span> },
  { key: 'status', header: 'Payment', render: (row) => <StatusBadge status={row.status} /> },
  { key: 'settlement', header: 'Settlement', render: (row) => <StatusBadge status={row.settlementStatus} /> },
  { key: 'date', header: 'Date', hideOnMobile: true, render: (row) => <span className="nums text-navy-600">{row.paidAt ? formatDateTime(row.paidAt) : `Due ${formatDateTime(row.dueAt)}`}</span> },
  {
    key: 'action',
    header: '',
    align: 'right',
    render: (row) =>
    row.status === 'paid' && row.settlementStatus !== 'settled' ?
    <Button size="sm" variant="outline" onClick={() => handleRelease(row)}>
            Release
          </Button> :
    null
  }];


  return (
    <>
      <PageHeader title="Transaction monitoring" description="Every payment and settlement recorded on the platform." />

      <div className="grid gap-4 sm:grid-cols-3">
        <DashboardCard label="Cleared payments" value={formatCurrency(paidTotal)} meta={`${payments.filter((p) => p.status === 'paid').length} transactions`} emphasis />
        <DashboardCard label="Platform fees earned" value={formatCurrency(feeTotal)} meta="5% of cleared sales" />
        <DashboardCard
          label="Settlements to release"
          value={pendingSettlements.length}
          meta={formatCurrency(pendingSettlements.reduce((s, p) => s + (p.amount - p.platformFee), 0))}
          tone={pendingSettlements.length ? 'negative' : 'default'} />
        
      </div>

      <Panel
        title={`${rows.length} transactions`}
        action={
        <div className="flex flex-wrap items-center gap-2">
            <SearchBar value={query} onChange={setQuery} placeholder="Search id, lot or party" id="txn-search" className="w-56" />
            <div className="w-36">
              <label htmlFor="txn-status" className="sr-only">
                Filter by payment status
              </label>
              <SelectInput id="txn-status" value={status} onChange={(e) => setStatus(e.target.value)} className="h-9 py-1.5 text-sm">
                <option value="all">All payments</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </SelectInput>
            </div>
          </div>
        }>
        
        <DataTable columns={columns} rows={rows} caption="Transactions" empty={{ title: 'No transactions match', description: 'Adjust the search or status filter.' }} />
      </Panel>
    </>);

}