import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { PageHeader } from '../../components/PageHeader';
import { Panel, DataTable } from '../../components/DataTable';
import { DashboardCard } from '../../components/DashboardCard';
import { StatusBadge } from '../../components/StatusBadge';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import { usePayments } from '../../context/PaymentContext';
import { useToast } from '../../context/ToastContext';
import { formatCurrency, formatDate, formatDateTime } from '../../utils/format';

export function Earnings() {
  const { user } = useAuth();
  const { forSeller, sellerEarnings, releaseSettlement } = usePayments();
  const toast = useToast();
  const rows = forSeller(user.id);

  async function handleRelease(row) {
    await releaseSettlement(row.id);
    toast.success('Settlement released', `${formatCurrency(row.amount - row.platformFee)} is on its way to your account.`);
  }

  const columns = [
  { key: 'id', header: 'Transaction', render: (row) => <span className="font-mono text-xs text-navy-500">{row.id}</span> },
  { key: 'auctionTitle', header: 'Product', render: (row) => <span className="font-medium text-navy-900">{row.auctionTitle}</span> },
  { key: 'amount', header: 'Sale amount', align: 'right', render: (row) => <span className="nums">{formatCurrency(row.amount)}</span> },
  { key: 'fee', header: 'Platform fee', align: 'right', hideOnMobile: true, render: (row) => <span className="nums text-navy-500">− {formatCurrency(row.platformFee)}</span> },
  { key: 'net', header: 'Net', align: 'right', render: (row) => <span className="nums font-semibold text-navy-900">{formatCurrency(row.amount - row.platformFee)}</span> },
  { key: 'settlement', header: 'Settlement', render: (row) => <StatusBadge status={row.settlementStatus} /> },
  { key: 'date', header: 'Date', hideOnMobile: true, render: (row) => <span className="nums text-navy-600">{row.paidAt ? formatDate(row.paidAt) : '—'}</span> },
  {
    key: 'action',
    header: '',
    align: 'right',
    render: (row) =>
    row.status === 'paid' && row.settlementStatus === 'pending' ?
    <Button size="sm" variant="outline" onClick={() => handleRelease(row)}>
            Request payout
          </Button> :

    <span className="text-xs text-navy-400">{row.settlementStatus === 'settled' ? 'Paid out' : 'Awaiting buyer'}</span>

  }];


  return (
    <>
      <PageHeader
        title="Earnings"
        description="Settlement status across your completed sales. Payouts release after the buyer payment clears." />
      

      <div className="grid gap-4 sm:grid-cols-3">
        <DashboardCard label="Total earnings" value={formatCurrency(sellerEarnings.totalEarnings)} meta="Lifetime, net of fees" emphasis />
        <DashboardCard label="Completed settlements" value={formatCurrency(sellerEarnings.completedSettlements)} meta="Already paid out" />
        <DashboardCard
          label="Pending settlements"
          value={formatCurrency(sellerEarnings.pendingSettlements)}
          meta={`Next payout ${formatDateTime(sellerEarnings.nextPayoutAt)}`} />
        
      </div>

      <Panel title="Monthly earnings" description="Net payouts over the last six months">
        <div className="h-64 w-full p-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={sellerEarnings.monthly} margin={{ top: 8, right: 8, bottom: 0, left: 8 }}>
              <CartesianGrid stroke="#E6E9EF" vertical={false} />
              <XAxis dataKey="month" stroke="#9AAAC4" tickLine={false} axisLine={false} fontSize={12} />
              <YAxis
                stroke="#9AAAC4"
                tickLine={false}
                axisLine={false}
                fontSize={12}
                tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
              
              <Tooltip
                formatter={(value) => formatCurrency(value)}
                contentStyle={{ borderRadius: 10, border: '1px solid #E6E9EF', fontSize: 13 }} />
              
              <Bar dataKey="earnings" fill="#152C4C" radius={[6, 6, 0, 0]} maxBarSize={44} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Panel>

      <Panel title="Transaction history">
        <DataTable
          columns={columns}
          rows={rows}
          caption="Your settlements"
          empty={{ title: 'No transactions yet', description: 'Settlement records appear once a buyer completes payment.' }} />
        
      </Panel>
    </>);

}