import React from 'react';
import { Link } from 'react-router-dom';
import { CreditCardIcon } from 'lucide-react';
import { PageHeader } from '../../components/PageHeader';
import { Panel, DataTable } from '../../components/DataTable';
import { StatusBadge } from '../../components/StatusBadge';
import { Button } from '../../components/ui/Button';
import { DashboardCard } from '../../components/DashboardCard';
import { useAuth } from '../../context/AuthContext';
import { usePayments } from '../../context/PaymentContext';
import { formatCurrency, formatDateTime } from '../../utils/format';

export function Payments() {
  const { user } = useAuth();
  const { forBuyer } = usePayments();
  const rows = forBuyer(user.id);

  const paid = rows.filter((p) => p.status === 'paid');
  const due = rows.filter((p) => p.status !== 'paid');

  const columns = [
  {
    key: 'auction',
    header: 'Product',
    render: (row) =>
    <Link to={`/auctions/${row.auctionId}`} className="font-medium text-navy-900 hover:text-navy-600">
          {row.auctionTitle}
        </Link>

  },
  { key: 'id', header: 'Payment ID', hideOnMobile: true, render: (row) => <span className="font-mono text-xs text-navy-400">{row.id}</span> },
  { key: 'amount', header: 'Amount', align: 'right', render: (row) => <span className="nums font-semibold">{formatCurrency(row.amount)}</span> },
  { key: 'status', header: 'Payment status', render: (row) => <StatusBadge status={row.status} /> },
  {
    key: 'date',
    header: 'Payment date',
    render: (row) =>
    <span className="nums text-navy-600">{row.paidAt ? formatDateTime(row.paidAt) : `Due ${formatDateTime(row.dueAt)}`}</span>

  },
  { key: 'method', header: 'Method', hideOnMobile: true, render: (row) => row.method || '—' },
  {
    key: 'action',
    header: '',
    align: 'right',
    render: (row) =>
    row.status === 'paid' ?
    <span className="text-xs text-navy-400">Settled</span> :

    <Button to={`/buyer/payments/${row.id}`} size="sm" variant="gold">
            Pay now
          </Button>

  }];


  return (
    <>
      <PageHeader title="Payments" description="Invoices raised against your winning bids, with their settlement state." />

      <div className="grid gap-4 sm:grid-cols-3">
        <DashboardCard
          label="Amount due"
          value={formatCurrency(due.reduce((s, p) => s + p.amount, 0))}
          meta={due.length ? `${due.length} open invoice${due.length > 1 ? 's' : ''}` : 'Nothing outstanding'}
          icon={CreditCardIcon}
          emphasis={due.length > 0} />
        
        <DashboardCard label="Total paid" value={formatCurrency(paid.reduce((s, p) => s + p.amount, 0))} meta={`${paid.length} completed payments`} />
        <DashboardCard label="Payment methods" value="Card · UPI" meta="Processed by Stripe" />
      </div>

      <Panel title="Transaction history">
        <DataTable
          columns={columns}
          rows={rows}
          caption="Your payments"
          empty={{ title: 'No payments yet', description: 'Payments appear here after you win an auction.', actionLabel: 'Browse auctions', actionTo: '/auctions' }} />
        
      </Panel>

      <p className="text-xs text-navy-400">
        Card details are collected by Stripe Elements and never touch this application or the project database. Only the payment id,
        status and masked method are stored.
      </p>
    </>);

}