import React from 'react';
import { Link } from 'react-router-dom';
import { TrophyIcon } from 'lucide-react';
import { PageHeader } from '../../components/PageHeader';
import { Panel, DataTable } from '../../components/DataTable';
import { StatusBadge } from '../../components/StatusBadge';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import { useAuctions } from '../../context/AuctionContext';
import { usePayments } from '../../context/PaymentContext';
import { formatCurrency, formatDate } from '../../utils/format';

export function WonAuctions() {
  const { user } = useAuth();
  const { auctions } = useAuctions();
  const { forBuyer } = usePayments();

  const myPayments = forBuyer(user.id);
  const rows = auctions.
  filter((a) => a.status === 'ended' && a.winnerId === user.id).
  map((a) => ({ ...a, payment: myPayments.find((p) => p.auctionId === a.id) }));

  const outstanding = rows.filter((r) => r.payment && r.payment.status !== 'paid');

  const columns = [
  {
    key: 'title',
    header: 'Product',
    render: (row) =>
    <Link to={`/auctions/${row.id}`} className="font-medium text-navy-900 hover:text-navy-600">
          {row.title}
        </Link>

  },
  { key: 'amount', header: 'Winning bid', align: 'right', render: (row) => <span className="nums font-semibold">{formatCurrency(row.currentBid)}</span> },
  { key: 'date', header: 'Auction closed', render: (row) => <span className="nums">{formatDate(row.endAt)}</span> },
  {
    key: 'payment',
    header: 'Payment status',
    render: (row) => <StatusBadge status={row.payment?.status || 'awaiting_payment'} />
  },
  {
    key: 'action',
    header: '',
    align: 'right',
    render: (row) =>
    row.payment && row.payment.status !== 'paid' ?
    <Button to={`/buyer/payments/${row.payment.id}`} size="sm" variant="gold">
            Pay now
          </Button> :

    <Button to="/buyer/payments" size="sm" variant="outline">
            Receipt
          </Button>

  }];


  return (
    <>
      <PageHeader
        title="Won auctions"
        description="Lots where you held the highest bid at the close. Payment is due within 72 hours of the close." />
      

      {outstanding.length ?
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-card border border-gold-200 bg-gold-50 p-4">
          <div>
            <p className="text-sm font-semibold text-gold-600">
              {outstanding.length} payment{outstanding.length > 1 ? 's' : ''} outstanding
            </p>
            <p className="mt-0.5 text-sm text-navy-600">
              Total due {formatCurrency(outstanding.reduce((s, r) => s + r.payment.amount, 0))}. Unpaid wins may be relisted and can
              affect your bidding privileges.
            </p>
          </div>
          <Button to={`/buyer/payments/${outstanding[0].payment.id}`} size="sm">
            Complete payment
          </Button>
        </div> :
      null}

      <Panel title={`${rows.length} won lots`}>
        <DataTable
          columns={columns}
          rows={rows}
          caption="Auctions you have won"
          empty={{
            title: 'No wins yet',
            description: 'Once you hold the highest bid at a close, the lot appears here with its payment status.',
            actionLabel: 'Browse auctions',
            actionTo: '/auctions'
          }} />
        
      </Panel>

      {rows.length ?
      <p className="flex items-center gap-2 text-xs text-navy-400">
          <TrophyIcon className="h-3.5 w-3.5" aria-hidden="true" />
          Wins are derived from the highest row in the bids table once an auction reaches the ended state.
        </p> :
      null}
    </>);

}