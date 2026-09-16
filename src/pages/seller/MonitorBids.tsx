import React, { useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { RadioIcon, UsersIcon, GavelIcon, TimerResetIcon } from 'lucide-react';
import { PageHeader } from '../../components/PageHeader';
import { Panel } from '../../components/DataTable';
import { BidHistory } from '../../components/BidHistory';
import { CountdownTimer } from '../../components/CountdownTimer';
import { StatusBadge } from '../../components/StatusBadge';
import { EmptyState } from '../../components/EmptyState';
import { Button } from '../../components/ui/Button';
import { SelectInput } from '../../components/ui/Field';
import { useAuth } from '../../context/AuthContext';
import { useAuctions } from '../../context/AuctionContext';
import { formatCurrency } from '../../utils/format';
import { auctionCover } from '../../data/auctions';

export function MonitorBids() {
  const { auctionId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { auctions, bidsFor, watchLiveAuction, simulateRivalBid } = useAuctions();

  const mine = auctions.filter((a) => a.sellerId === user.id && a.status !== 'pending');
  const selected = mine.find((a) => a.id === auctionId) || mine.find((a) => a.status === 'live') || mine[0];

  useEffect(() => {
    if (!selected || selected.status !== 'live') return undefined;
    return watchLiveAuction(selected.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected?.id, selected?.status]);

  if (!selected) {
    return (
      <>
        <PageHeader title="Monitor bids" description="Track live bidding on your lots." />
        <Panel>
          <EmptyState
            icon={RadioIcon}
            title="No auctions to monitor"
            description="Once a listing is approved and open, its live bidding activity appears here."
            actionLabel="Create auction"
            actionTo="/seller/create" />
          
        </Panel>
      </>);

  }

  const bids = bidsFor(selected.id);
  const bidders = new Set(bids.map((b) => b.userId)).size;

  return (
    <>
      <PageHeader
        title="Monitor bids"
        description="Live bidding activity for the selected lot, updated over the socket connection."
        actions={
        <div className="w-full sm:w-72">
            <label htmlFor="lot-select" className="sr-only">
              Select auction
            </label>
            <SelectInput id="lot-select" value={selected.id} onChange={(e) => navigate(`/seller/monitor/${e.target.value}`)}>
              {mine.map((a) =>
            <option key={a.id} value={a.id}>
                  {a.title}
                </option>
            )}
            </SelectInput>
          </div>
        } />
      

      <div className="grid gap-5 lg:grid-cols-[1fr_1.1fr]">
        <div className="space-y-5">
          <section className="overflow-hidden rounded-card border border-line bg-white shadow-card">
            <div className="flex gap-4 p-5">
              <img src={auctionCover(selected)} alt="" className="h-20 w-24 shrink-0 rounded-lg object-cover" />
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <StatusBadge status={selected.status} />
                  <span className="text-xs text-navy-400">{selected.category}</span>
                </div>
                <h2 className="mt-1.5 text-base font-semibold text-navy-900">{selected.title}</h2>
                <Link to={`/auctions/${selected.id}`} className="mt-1 inline-block text-xs font-semibold text-navy-600 hover:text-navy-900">
                  Open public page →
                </Link>
              </div>
            </div>

            <dl className="grid grid-cols-2 gap-px border-t border-line bg-line sm:grid-cols-4">
              <Metric label="Highest bid" value={formatCurrency(selected.currentBid || selected.startingPrice)} icon={GavelIcon} />
              <Metric label="Total bids" value={selected.bidCount} icon={RadioIcon} />
              <Metric label="Bidders" value={bidders} icon={UsersIcon} />
              <Metric label="Watchers" value={selected.watchers} icon={TimerResetIcon} />
            </dl>
          </section>

          <CountdownTimer endAt={selected.endAt} status={selected.status} variant="panel" />

          {selected.status === 'live' ?
          <div className="rounded-card border border-dashed border-navy-200 bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-navy-500">Real-time demo</p>
              <p className="mt-2 text-sm text-navy-500">
                Simulate a buyer bid to see the ledger, highest bid and notification badge update without reloading.
              </p>
              <Button variant="subtle" size="sm" className="mt-3 w-full" onClick={() => simulateRivalBid(selected.id)}>
                Simulate incoming bid
              </Button>
            </div> :
          null}
        </div>

        <Panel title="Bid history" description={`${bids.length} bids · live ledger`} bodyClassName="max-h-[560px] overflow-y-auto">
          <BidHistory bids={bids} currentUserId={null} />
        </Panel>
      </div>
    </>);

}

function Metric({ label, value, icon: Icon }) {
  return (
    <div className="bg-white p-4">
      <dt className="flex items-center gap-1.5 text-xs text-navy-400">
        <Icon className="h-3.5 w-3.5" aria-hidden="true" />
        {label}
      </dt>
      <dd className="nums mt-1 text-lg font-semibold text-navy-900">{value}</dd>
    </div>);

}