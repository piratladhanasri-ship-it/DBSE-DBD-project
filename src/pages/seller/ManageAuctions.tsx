import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { EyeIcon, PencilIcon, Trash2Icon, PlusCircleIcon } from 'lucide-react';
import { PageHeader } from '../../components/PageHeader';
import { Panel, DataTable } from '../../components/DataTable';
import { StatusBadge } from '../../components/StatusBadge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/Modal';
import { ConfirmationDialog } from '../../components/ConfirmationDialog';
import { Field, TextInput } from '../../components/ui/Field';
import { useAuth } from '../../context/AuthContext';
import { useAuctions } from '../../context/AuctionContext';
import { useToast } from '../../context/ToastContext';
import { deleteAuction, updateAuction } from '../../services/auctionService';
import { formatCurrency, formatDateTime } from '../../utils/format';

export function ManageAuctions() {
  const { user } = useAuth();
  const { auctions, patchAuction, removeAuction } = useAuctions();
  const toast = useToast();

  const [editing, setEditing] = useState(null);
  const [editValues, setEditValues] = useState({ title: '', startingPrice: '', endAt: '' });
  const [deleting, setDeleting] = useState(null);

  const rows = auctions.
  filter((a) => a.sellerId === user.id).
  sort((a, b) => new Date(b.startAt) - new Date(a.startAt));

  function openEdit(auction) {
    setEditing(auction);
    setEditValues({
      title: auction.title,
      startingPrice: String(auction.startingPrice),
      endAt: new Date(auction.endAt).toISOString().slice(0, 16)
    });
  }

  async function saveEdit(e) {
    e.preventDefault();
    const patch = {
      title: editValues.title.trim(),
      startingPrice: Number(editValues.startingPrice),
      endAt: new Date(editValues.endAt).toISOString()
    };
    await updateAuction(editing.id, patch);
    patchAuction(editing.id, patch);
    toast.success('Auction updated', patch.title);
    setEditing(null);
  }

  async function confirmDelete() {
    await deleteAuction(deleting.id);
    removeAuction(deleting.id);
    toast.success('Auction deleted', `${deleting.title} was removed from your catalogue.`);
    setDeleting(null);
  }

  const columns = [
  {
    key: 'title',
    header: 'Product',
    render: (row) =>
    <div className="min-w-0">
          <Link to={`/auctions/${row.id}`} className="font-medium text-navy-900 hover:text-navy-600">
            {row.title}
          </Link>
          <p className="text-xs text-navy-400">{row.category}</p>
        </div>

  },
  { key: 'startingPrice', header: 'Starting price', align: 'right', render: (row) => <span className="nums">{formatCurrency(row.startingPrice)}</span> },
  {
    key: 'currentBid',
    header: 'Highest bid',
    align: 'right',
    render: (row) => <span className="nums font-semibold text-navy-900">{row.currentBid ? formatCurrency(row.currentBid) : '—'}</span>
  },
  { key: 'bidCount', header: 'Bids', align: 'right', render: (row) => <span className="nums">{row.bidCount}</span> },
  { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
  { key: 'endAt', header: 'End time', hideOnMobile: true, render: (row) => <span className="nums text-navy-600">{formatDateTime(row.endAt)}</span> },
  {
    key: 'actions',
    header: 'Actions',
    align: 'right',
    render: (row) =>
    <div className="flex justify-end gap-1.5">
          <Button to={`/auctions/${row.id}`} variant="ghost" size="icon" aria-label={`View ${row.title}`}>
            <EyeIcon className="h-4 w-4" aria-hidden="true" />
          </Button>
          <Button
        variant="ghost"
        size="icon"
        onClick={() => openEdit(row)}
        disabled={row.status === 'ended'}
        aria-label={`Edit ${row.title}`}>
        
            <PencilIcon className="h-4 w-4" aria-hidden="true" />
          </Button>
          <Button
        variant="ghost"
        size="icon"
        onClick={() => setDeleting(row)}
        disabled={row.status === 'live' && row.bidCount > 0}
        aria-label={`Delete ${row.title}`}
        className="text-negative hover:bg-negative/5">
        
            <Trash2Icon className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>

  }];


  return (
    <>
      <PageHeader
        title="My auctions"
        description="Every lot you have listed, with its bidding state. Lots with active bids cannot be deleted."
        actions={
        <Button to="/seller/create" size="sm">
            <PlusCircleIcon className="h-4 w-4" aria-hidden="true" />
            Create auction
          </Button>
        } />
      

      <Panel title={`${rows.length} listings`}>
        <DataTable
          columns={columns}
          rows={rows}
          caption="Your auction listings"
          empty={{
            title: 'No listings yet',
            description: 'Submit your first lot and track its verification status here.',
            actionLabel: 'Create auction',
            actionTo: '/seller/create'
          }} />
        
      </Panel>

      <Modal
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
        title="Edit listing"
        description="Pricing can only be changed before the first bid is placed."
        footer={
        <>
            <Button variant="outline" size="sm" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button size="sm" onClick={saveEdit}>
              Save changes
            </Button>
          </>
        }>
        
        <form onSubmit={saveEdit} className="space-y-4">
          <Field label="Product name" htmlFor="edit-title">
            <TextInput id="edit-title" value={editValues.title} onChange={(e) => setEditValues({ ...editValues, title: e.target.value })} />
          </Field>
          <Field label="Starting price (₹)" htmlFor="edit-price" hint={editing?.bidCount ? 'Locked — this lot already has bids.' : undefined}>
            <TextInput
              id="edit-price"
              type="number"
              className="nums"
              disabled={Boolean(editing?.bidCount)}
              value={editValues.startingPrice}
              onChange={(e) => setEditValues({ ...editValues, startingPrice: e.target.value })} />
            
          </Field>
          <Field label="End time" htmlFor="edit-end">
            <TextInput
              id="edit-end"
              type="datetime-local"
              value={editValues.endAt}
              onChange={(e) => setEditValues({ ...editValues, endAt: e.target.value })} />
            
          </Field>
        </form>
      </Modal>

      <ConfirmationDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={confirmDelete}
        title="Delete this listing?"
        message={`“${deleting?.title}” will be removed from the catalogue. This cannot be undone.`}
        confirmLabel="Delete listing"
        tone="danger" />
      
    </>);

}