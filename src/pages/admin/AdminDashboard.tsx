import React from 'react';
import { Link } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { UsersIcon, GavelIcon, RadioIcon, CheckCircle2Icon, ReceiptIcon, AlertTriangleIcon } from 'lucide-react';
import { PageHeader } from '../../components/PageHeader';
import { DashboardCard } from '../../components/DashboardCard';
import { Panel } from '../../components/DataTable';
import { StatusBadge } from '../../components/StatusBadge';
import { Button } from '../../components/ui/Button';
import { useAuctions } from '../../context/AuctionContext';
import { usePayments } from '../../context/PaymentContext';
import { adminStats, disputes } from '../../data/disputes';
import { formatCurrency, relativeTime } from '../../utils/format';

export function AdminDashboard() {
  const { auctions } = useAuctions();
  const { payments } = usePayments();

  const pending = auctions.filter((a) => a.status === 'pending');
  const live = auctions.filter((a) => a.status === 'live');
  const openDisputes = disputes.filter((d) => d.status !== 'resolved');

  return (
    <>
      <PageHeader
        title="Platform overview"
        description="Marketplace health, moderation queue and transaction volume."
        actions={
        <Button to="/admin/verify" size="sm">
            Review {pending.length} pending listing{pending.length === 1 ? '' : 's'}
          </Button>
        } />
      

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <DashboardCard
          label="Transaction volume"
          value={formatCurrency(adminStats.transactionVolume)}
          meta={`${adminStats.totalTransactions} recorded transactions`}
          icon={ReceiptIcon}
          to="/admin/transactions"
          emphasis />
        
        <DashboardCard label="Total users" value={adminStats.totalUsers.toLocaleString('en-IN')} meta="Buyers, sellers and staff" icon={UsersIcon} to="/admin/users" />
        <DashboardCard label="Total auctions" value={adminStats.totalAuctions} meta={`${adminStats.completedAuctions} completed`} icon={GavelIcon} to="/admin/auctions" />
        <DashboardCard label="Active auctions" value={live.length} meta="Accepting bids right now" icon={RadioIcon} to="/admin/auctions" />
        <DashboardCard label="Completed auctions" value={adminStats.completedAuctions} meta="Closed with a winning bid" icon={CheckCircle2Icon} />
        <DashboardCard
          label="Pending disputes"
          value={openDisputes.length}
          meta={openDisputes.length ? 'Settlement held until resolved' : 'Nothing open'}
          icon={AlertTriangleIcon}
          to="/admin/disputes"
          tone={openDisputes.length ? 'negative' : 'default'} />
        
      </div>

      <Panel title="Weekly activity" description="New auctions and bids placed per day">
        <div className="h-64 w-full p-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={adminStats.weekly} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
              <CartesianGrid stroke="#E6E9EF" vertical={false} />
              <XAxis dataKey="day" stroke="#9AAAC4" tickLine={false} axisLine={false} fontSize={12} />
              <YAxis stroke="#9AAAC4" tickLine={false} axisLine={false} fontSize={12} />
              <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #E6E9EF', fontSize: 13 }} />
              <Line type="monotone" dataKey="bids" stroke="#152C4C" strokeWidth={2} dot={false} name="Bids" />
              <Line type="monotone" dataKey="auctions" stroke="#CFAC3C" strokeWidth={2} dot={false} name="New auctions" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Panel>

      <div className="grid gap-5 lg:grid-cols-2">
        <Panel
          title="Verification queue"
          description={`${pending.length} listings awaiting review`}
          action={
          <Link to="/admin/verify" className="text-xs font-semibold text-navy-600 hover:text-navy-900">
              Open queue
            </Link>
          }>
          
          <ul className="divide-y divide-line">
            {pending.length === 0 ?
            <li className="px-4 py-8 text-center text-sm text-navy-500">Queue is clear.</li> :

            pending.map((a) =>
            <li key={a.id} className="flex items-center gap-4 px-4 py-3.5">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-navy-900">{a.title}</p>
                    <p className="text-xs text-navy-400">
                      {a.sellerName} · submitted {relativeTime(a.submittedAt || a.startAt)}
                    </p>
                  </div>
                  <StatusBadge status="pending" />
                </li>
            )
            }
          </ul>
        </Panel>

        <Panel
          title="Recent transactions"
          action={
          <Link to="/admin/transactions" className="text-xs font-semibold text-navy-600 hover:text-navy-900">
              View all
            </Link>
          }>
          
          <ul className="divide-y divide-line">
            {payments.slice(0, 5).map((p) =>
            <li key={p.id} className="flex items-center gap-4 px-4 py-3.5">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-navy-900">{p.auctionTitle}</p>
                  <p className="text-xs text-navy-400">
                    {p.buyerName} → {p.sellerName}
                  </p>
                </div>
                <p className="nums text-sm font-semibold text-navy-900">{formatCurrency(p.amount)}</p>
                <StatusBadge status={p.status} withDot={false} />
              </li>
            )}
          </ul>
        </Panel>
      </div>
    </>);

}