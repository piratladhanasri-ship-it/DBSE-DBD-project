import React from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../../components/PageHeader';
import { Panel, DataTable } from '../../components/DataTable';
import { StatusBadge } from '../../components/StatusBadge';
import { DashboardCard } from '../../components/DashboardCard';
import { useAuth } from '../../context/AuthContext';
import { usePayments } from '../../context/PaymentContext';
import { formatCurrency, formatDateTime } from '../../utils/format';

export function SoldItems() {
  const { user } = useAuth();
  const { forSeller } = usePayments();
  const rows = forSeller(user.id);

  const paid = rows.filter((r) => r.status === 'paid');
  const settled = rows.filter((r) => r.settlementStatus === 'settled');

  const columns = [
  {
    key: 'auctionTitle',
    header: 'Product',
    render: (row) =>
    <Link to={`/auctions/${row.auctionId}`} className="font-medium text-navy-900 hover:text-navy-600">
          {row.auctionTitle}
        </Link>

  },
  { key: 'buyerName', header: 'Winner', render: (row) => row.buyerName },
  { key: 'amount', header: 'Winning amount', align: 'right', render: (row) => <span className="nums font-semibold">{formatCurrency(row.amount)}</span> },
  {
    key: 'net',
    header: 'Net payout',
    align: 'right',
    hideOnMobile: true,
    render: (row) => <span className="nums text-navy-600">{formatCurrency(row.amount - row.platformFee)}</span>
  },
  { key: 'status', header: 'Payment status', render: (row) => <StatusBadge status={row.status} /> },
  { key: 'settlement', header: 'Settlement', render: (row) => <StatusBadge status={row.settlementStatus} /> },
  {
    key: 'date',
    header: 'Paid on',
    hideOnMobile: true,
    render: (row) => <span className="nums text-navy-600">{row.paidAt ? formatDateTime(row.paidAt) : '—'}</span>
  }];


  return (
    <>
      <PageHeader title="Sold items" description="Completed sales with buyer payment and payout state." />

      <div className="grid gap-4 sm:grid-cols-3">
        <DashboardCard label="Items sold" value={rows.length} meta={`${paid.length} paid in full`} />
        <DashboardCard label="Gross sales" value={formatCurrency(rows.reduce((s, r) => s + r.amount, 0))} meta="Before platform fee" />
        <DashboardCard
          label="Awaiting settlement"
          value={formatCurrency(rows.filter((r) => r.settlementStatus !== 'settled').reduce((s, r) => s + (r.amount - r.platformFee), 0))}
          meta={`${settled.length} of ${rows.length} settled`}
          tone={rows.length - settled.length > 0 ? 'negative' : 'default'} />
        
      </div>

      <Panel title="Sales ledger">
        <DataTable
          columns={columns}
          rows={rows}
          caption="Items you have sold"
          empty={{ title: 'No sales yet', description: 'Completed sales appear here once an auction closes with a winning bid.', actionLabel: 'Create auction', actionTo: '/seller/create' }} />
        
      </Panel>
    </>);

}