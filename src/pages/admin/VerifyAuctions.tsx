import React, { useState } from 'react';
import { CheckIcon, XIcon, ShieldCheckIcon } from 'lucide-react';
import { PageHeader } from '../../components/PageHeader';
import { Panel } from '../../components/DataTable';
import { StatusBadge } from '../../components/StatusBadge';
import { EmptyState } from '../../components/EmptyState';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/Modal';
import { Field, TextArea } from '../../components/ui/Field';
import { useAuctions } from '../../context/AuctionContext';
import { useToast } from '../../context/ToastContext';
import { setAuctionStatus } from '../../services/auctionService';
import { formatCurrency, formatDateTime, relativeTime } from '../../utils/format';
import { auctionCover } from '../../data/auctions';

export function VerifyAuctions() {
  const { auctions, patchAuction } = useAuctions();
  const toast = useToast();
  const [rejecting, setRejecting] = useState(null);
  const [reason, setReason] = useState('');
  const [reasonError, setReasonError] = useState('');

  const queue = auctions.filter((a) => a.status === 'pending');

  async function approve(auction) {
    await setAuctionStatus(auction.id, 'upcoming');
    patchAuction(auction.id, { status: 'upcoming' });
    toast.success('Listing approved', `${auction.title} will open at its scheduled start time.`);
  }

  async function confirmReject(e) {
    e.preventDefault();
    if (reason.trim().length < 10) {
      setReasonError('Give the seller a reason of at least 10 characters.');
      return;
    }
    await setAuctionStatus(rejecting.id, 'rejected', reason);
    patchAuction(rejecting.id, { status: 'rejected', rejectionReason: reason });
    toast.success('Listing rejected', 'The seller has been notified with your reason.');
    setRejecting(null);
    setReason('');
    setReasonError('');
  }

  return (
    <>
      <PageHeader
        title="Verify auctions"
        description="Approve or reject submitted listings. Nothing becomes publicly visible until it is approved." />
      

      <Panel title={`${queue.length} listings in the queue`}>
        {queue.length === 0 ?
        <EmptyState
          icon={ShieldCheckIcon}
          title="Verification queue is clear"
          description="New seller submissions will appear here for review." /> :


        <ul className="divide-y divide-line">
            {queue.map((auction) =>
          <li key={auction.id} className="flex flex-col gap-4 p-5 lg:flex-row">
                <img src={auctionCover(auction)} alt="" className="h-40 w-full rounded-lg object-cover lg:h-28 lg:w-36" />

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge status="pending" />
                    <span className="text-xs text-navy-400">{auction.category}</span>
                    <span className="text-xs text-navy-400">· submitted {relativeTime(auction.submittedAt || auction.startAt)}</span>
                  </div>
                  <h2 className="mt-1.5 text-base font-semibold text-navy-900">{auction.title}</h2>
                  <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-navy-500">{auction.description}</p>
                  <dl className="mt-3 grid gap-x-6 gap-y-1 text-xs text-navy-500 sm:grid-cols-2 lg:grid-cols-4">
                    <div>
                      <dt className="inline text-navy-400">Seller: </dt>
                      <dd className="inline font-medium text-navy-700">{auction.sellerName}</dd>
                    </div>
                    <div>
                      <dt className="inline text-navy-400">Start price: </dt>
                      <dd className="nums inline font-medium text-navy-700">{formatCurrency(auction.startingPrice)}</dd>
                    </div>
                    <div>
                      <dt className="inline text-navy-400">Opens: </dt>
                      <dd className="nums inline font-medium text-navy-700">{formatDateTime(auction.startAt)}</dd>
                    </div>
                    <div>
                      <dt className="inline text-navy-400">Closes: </dt>
                      <dd className="nums inline font-medium text-navy-700">{formatDateTime(auction.endAt)}</dd>
                    </div>
                  </dl>
                </div>

                <div className="flex shrink-0 gap-2 lg:flex-col">
                  <Button size="sm" onClick={() => approve(auction)} className="flex-1">
                    <CheckIcon className="h-4 w-4" aria-hidden="true" />
                    Approve
                  </Button>
                  <Button size="sm" variant="danger" onClick={() => setRejecting(auction)} className="flex-1">
                    <XIcon className="h-4 w-4" aria-hidden="true" />
                    Reject
                  </Button>
                </div>
              </li>
          )}
          </ul>
        }
      </Panel>

      <Modal
        open={Boolean(rejecting)}
        onClose={() => {
          setRejecting(null);
          setReasonError('');
        }}
        title="Reject listing"
        description={rejecting?.title}
        footer={
        <>
            <Button variant="outline" size="sm" onClick={() => setRejecting(null)}>
              Cancel
            </Button>
            <Button variant="danger" size="sm" onClick={confirmReject}>
              Reject listing
            </Button>
          </>
        }>
        
        <form onSubmit={confirmReject}>
          <Field label="Reason sent to the seller" htmlFor="reject-reason" error={reasonError} required>
            <TextArea
              id="reject-reason"
              rows={4}
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                setReasonError('');
              }}
              placeholder="The hallmark assay report is missing. Re-submit with the certificate scan attached."
              invalid={Boolean(reasonError)} />
            
          </Field>
        </form>
      </Modal>
    </>);

}