import React, { useState } from 'react';
import { PageHeader } from '../../components/PageHeader';
import { Panel, DataTable } from '../../components/DataTable';
import { StatusBadge } from '../../components/StatusBadge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/Modal';
import { Field, TextArea } from '../../components/ui/Field';
import { useToast } from '../../context/ToastContext';
import { updateDispute } from '../../services/disputeService';
import { disputes as seedDisputes } from '../../data/disputes';
import { formatCurrency, formatDate } from '../../utils/format';

export function Disputes() {
  const toast = useToast();
  const [disputes, setDisputes] = useState(seedDisputes);
  const [viewing, setViewing] = useState(null);
  const [resolution, setResolution] = useState('');
  const [error, setError] = useState('');

  const open = disputes.filter((d) => d.status !== 'resolved');

  async function resolve(e) {
    e.preventDefault();
    if (resolution.trim().length < 10) {
      setError('Record a resolution note of at least 10 characters.');
      return;
    }
    await updateDispute(viewing.id, { status: 'resolved', resolution });
    setDisputes((prev) =>
    prev.map((d) => d.id === viewing.id ? { ...d, status: 'resolved', resolution, resolvedAt: new Date().toISOString() } : d)
    );
    toast.success('Dispute resolved', `${viewing.id} closed and both parties notified.`);
    setViewing(null);
    setResolution('');
    setError('');
  }

  async function moveToReview(dispute) {
    await updateDispute(dispute.id, { status: 'under_review' });
    setDisputes((prev) => prev.map((d) => d.id === dispute.id ? { ...d, status: 'under_review' } : d));
    toast.info('Marked under review', dispute.id);
  }

  const columns = [
  { key: 'id', header: 'Dispute ID', render: (row) => <span className="font-mono text-xs font-semibold text-navy-800">{row.id}</span> },
  { key: 'auction', header: 'Auction', render: (row) => <span className="font-medium text-navy-900">{row.auctionTitle}</span> },
  {
    key: 'user',
    header: 'Raised by',
    render: (row) =>
    <div>
          <p className="text-navy-700">{row.raisedBy}</p>
          <p className="text-xs capitalize text-navy-400">{row.raisedByRole} · against {row.against}</p>
        </div>

  },
  { key: 'reason', header: 'Reason', render: (row) => <span className="text-navy-600">{row.reason}</span> },
  { key: 'amount', header: 'Value', align: 'right', hideOnMobile: true, render: (row) => <span className="nums">{formatCurrency(row.amount)}</span> },
  { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
  { key: 'created', header: 'Raised', hideOnMobile: true, render: (row) => <span className="nums text-navy-600">{formatDate(row.createdAt)}</span> },
  {
    key: 'actions',
    header: 'Actions',
    align: 'right',
    render: (row) =>
    <div className="flex justify-end gap-2">
          <Button size="sm" variant="outline" onClick={() => setViewing(row)}>
            View
          </Button>
          {row.status === 'open' ?
      <Button size="sm" variant="subtle" onClick={() => moveToReview(row)}>
              Review
            </Button> :
      null}
        </div>

  }];


  return (
    <>
      <PageHeader
        title="Dispute management"
        description="Cases raised by buyers or sellers. Seller settlement is held while a dispute is open." />
      

      <div className="grid gap-4 sm:grid-cols-3">
        {[
        { label: 'Open disputes', value: disputes.filter((d) => d.status === 'open').length },
        { label: 'Under review', value: disputes.filter((d) => d.status === 'under_review').length },
        { label: 'Value on hold', value: formatCurrency(open.reduce((s, d) => s + d.amount, 0)) }].
        map((stat) =>
        <div key={stat.label} className="rounded-card border border-line bg-white p-4 shadow-card">
            <p className="text-sm text-navy-500">{stat.label}</p>
            <p className="nums mt-1 text-xl font-semibold text-navy-900">{stat.value}</p>
          </div>
        )}
      </div>

      <Panel title={`${disputes.length} disputes`}>
        <DataTable columns={columns} rows={disputes} caption="Disputes" empty={{ title: 'No disputes', description: 'Cases raised by buyers or sellers will appear here.' }} />
      </Panel>

      <Modal
        open={Boolean(viewing)}
        onClose={() => {
          setViewing(null);
          setError('');
        }}
        title={`Dispute ${viewing?.id || ''}`}
        description={viewing?.auctionTitle}
        size="lg"
        footer={
        viewing?.status !== 'resolved' ?
        <>
              <Button variant="outline" size="sm" onClick={() => setViewing(null)}>
                Close
              </Button>
              <Button size="sm" onClick={resolve}>
                Resolve dispute
              </Button>
            </> :

        <Button variant="outline" size="sm" onClick={() => setViewing(null)}>
              Close
            </Button>

        }>
        
        {viewing ?
        <div className="space-y-4">
            <dl className="grid gap-3 sm:grid-cols-2">
              <Detail label="Raised by" value={`${viewing.raisedBy} (${viewing.raisedByRole})`} />
              <Detail label="Against" value={viewing.against} />
              <Detail label="Reason" value={viewing.reason} />
              <Detail label="Transaction value" value={formatCurrency(viewing.amount)} />
              <Detail label="Status" value={<StatusBadge status={viewing.status} />} />
              <Detail label="Raised on" value={formatDate(viewing.createdAt)} />
            </dl>

            <div className="rounded-lg border border-line bg-mist p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-navy-400">Details submitted</p>
              <p className="mt-2 text-sm leading-relaxed text-navy-700">{viewing.details}</p>
            </div>

            {viewing.status === 'resolved' ?
          <div className="rounded-lg border border-positive/30 bg-positive/5 p-4 text-sm text-navy-700">
                Resolved on {formatDate(viewing.resolvedAt)}. {viewing.resolution || 'Outcome recorded in the dispute log.'}
              </div> :

          <form onSubmit={resolve}>
                <Field label="Resolution note" htmlFor="resolution" error={error} required>
                  <TextArea
                id="resolution"
                rows={4}
                value={resolution}
                onChange={(e) => {
                  setResolution(e.target.value);
                  setError('');
                }}
                placeholder="Refund of 20% agreed with the seller; settlement released for the remaining amount."
                invalid={Boolean(error)} />
              
                </Field>
              </form>
          }
          </div> :
        null}
      </Modal>
    </>);

}

function Detail({ label, value }) {
  return (
    <div>
      <dt className="text-xs text-navy-400">{label}</dt>
      <dd className="mt-0.5 text-sm font-medium text-navy-900">{value}</dd>
    </div>);

}