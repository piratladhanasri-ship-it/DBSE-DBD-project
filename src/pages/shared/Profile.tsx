import React, { useState } from 'react';
import { StarIcon, PencilIcon, MapPinIcon, CalendarIcon, MailIcon } from 'lucide-react';
import { PageHeader } from '../../components/PageHeader';
import { Panel } from '../../components/DataTable';
import { Button } from '../../components/ui/Button';
import { Field, TextInput } from '../../components/ui/Field';
import { StatusBadge } from '../../components/StatusBadge';
import { EmptyState } from '../../components/EmptyState';
import { useAuth } from '../../context/AuthContext';
import { useAuctions } from '../../context/AuctionContext';
import { useToast } from '../../context/ToastContext';
import { updateProfile } from '../../services/userService';
import { reviews } from '../../data/disputes';
import { formatDate, initials, formatCurrency } from '../../utils/format';

export function Profile() {
  const { user, updateUser } = useAuth();
  const { auctions, bidsByUser } = useAuctions();
  const toast = useToast();

  const [editing, setEditing] = useState(false);
  const [values, setValues] = useState({
    name: user.name,
    email: user.email,
    phone: user.phone || '',
    location: user.location || '',
    storeName: user.storeName || ''
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const myReviews = reviews.filter((r) => user.role === 'seller' ? r.sellerId === user.id : r.reviewerId === user.id);
  const myBids = bidsByUser(user.id);
  const myAuctions = auctions.filter((a) => a.sellerId === user.id);

  async function handleSave(e) {
    e.preventDefault();
    const nextErrors = {};
    if (!values.name.trim()) nextErrors.name = 'Name is required.';
    if (!/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(values.email)) nextErrors.email = 'Enter a valid email address.';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setSaving(true);
    await updateProfile(user.id, values);
    updateUser(values);
    setSaving(false);
    setEditing(false);
    toast.success('Profile updated', 'Your account details were saved.');
  }

  return (
    <>
      <PageHeader
        title="Profile"
        description="Your account details as stored in the users table."
        actions={
        !editing ?
        <Button size="sm" variant="outline" onClick={() => setEditing(true)}>
              <PencilIcon className="h-4 w-4" aria-hidden="true" />
              Edit profile
            </Button> :
        null
        } />
      

      <div className="grid gap-5 lg:grid-cols-[0.85fr_1.15fr]">
        <section className="rounded-card border border-line bg-white p-6 shadow-card">
          <div className="flex items-center gap-4">
            <span
              className="flex h-16 w-16 items-center justify-center rounded-full bg-navy-900 text-xl font-semibold text-white"
              aria-hidden="true">
              
              {initials(user.name)}
            </span>
            <div className="min-w-0">
              <h2 className="truncate text-lg font-semibold text-navy-900">{user.name}</h2>
              <p className="mt-0.5 text-xs font-semibold uppercase tracking-wide text-gold-600">{user.role}</p>
              <StatusBadge status={user.status || 'active'} className="mt-2" />
            </div>
          </div>

          <dl className="mt-6 space-y-3 text-sm">
            <Row icon={MailIcon} label="Email" value={user.email} />
            <Row icon={MapPinIcon} label="Location" value={user.location || 'Not set'} />
            <Row icon={CalendarIcon} label="Member since" value={formatDate(user.joinedAt)} />
            {user.role === 'seller' ? <Row icon={StarIcon} label="Seller rating" value={`${user.rating ?? '—'} / 5`} /> : null}
          </dl>

          <div className="mt-6 grid grid-cols-2 gap-3 border-t border-line pt-5">
            {user.role === 'seller' ?
            <>
                <Stat label="Listings" value={myAuctions.length} />
                <Stat label="Lifetime sales" value={user.totalSales ?? 0} />
              </> :

            <>
                <Stat label="Bids placed" value={myBids.length} />
                <Stat label="Auctions won" value={auctions.filter((a) => a.winnerId === user.id).length} />
              </>
            }
          </div>
        </section>

        <div className="space-y-5">
          <Panel title="Account details">
            {editing ?
            <form onSubmit={handleSave} className="space-y-4 p-5" noValidate>
                <Field label="Full name" htmlFor="p-name" error={errors.name} required>
                  <TextInput id="p-name" value={values.name} onChange={(e) => setValues({ ...values, name: e.target.value })} invalid={Boolean(errors.name)} />
                </Field>
                <Field label="Email address" htmlFor="p-email" error={errors.email} required>
                  <TextInput id="p-email" type="email" value={values.email} onChange={(e) => setValues({ ...values, email: e.target.value })} invalid={Boolean(errors.email)} />
                </Field>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Phone" htmlFor="p-phone">
                    <TextInput id="p-phone" value={values.phone} onChange={(e) => setValues({ ...values, phone: e.target.value })} placeholder="+91 98200 00000" />
                  </Field>
                  <Field label="Location" htmlFor="p-location">
                    <TextInput id="p-location" value={values.location} onChange={(e) => setValues({ ...values, location: e.target.value })} placeholder="Pune, MH" />
                  </Field>
                </div>
                {user.role === 'seller' ?
              <Field label="Store name" htmlFor="p-store">
                    <TextInput id="p-store" value={values.storeName} onChange={(e) => setValues({ ...values, storeName: e.target.value })} />
                  </Field> :
              null}
                <div className="flex gap-2">
                  <Button type="submit" size="sm" loading={saving}>
                    Save changes
                  </Button>
                  <Button type="button" size="sm" variant="ghost" onClick={() => setEditing(false)}>
                    Cancel
                  </Button>
                </div>
              </form> :

            <dl className="divide-y divide-line">
                <Line label="Full name" value={user.name} />
                <Line label="Email" value={user.email} />
                <Line label="Phone" value={user.phone || 'Not set'} />
                <Line label="Role" value={<span className="capitalize">{user.role}</span>} />
                {user.role === 'seller' ? <Line label="Store name" value={user.storeName || '—'} /> : null}
                <Line label="User ID" value={<span className="font-mono text-xs">{user.id}</span>} />
              </dl>
            }
          </Panel>

          <Panel title={user.role === 'seller' ? 'Reviews received' : 'Reviews you left'} description={`${myReviews.length} reviews`}>
            {myReviews.length === 0 ?
            <EmptyState
              icon={StarIcon}
              title="No reviews yet"
              description={
              user.role === 'seller' ?
              'Buyers can rate you after a completed sale.' :
              'You can rate a seller once a won lot is delivered.'
              } /> :


            <ul className="divide-y divide-line">
                {myReviews.map((review) =>
              <li key={review.id} className="p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-medium text-navy-900">{review.auctionTitle}</p>
                      <span className="flex items-center gap-0.5" aria-label={`${review.rating} out of 5`}>
                        {Array.from({ length: 5 }).map((_, i) =>
                    <StarIcon
                      key={i}
                      className={i < review.rating ? 'h-3.5 w-3.5 fill-gold-400 text-gold-400' : 'h-3.5 w-3.5 text-navy-200'}
                      aria-hidden="true" />

                    )}
                      </span>
                    </div>
                    <p className="mt-1.5 text-sm leading-relaxed text-navy-600">{review.comment}</p>
                    <p className="mt-1.5 text-xs text-navy-400">
                      {user.role === 'seller' ? review.reviewerName : review.sellerName} · {formatDate(review.createdAt)}
                    </p>
                  </li>
              )}
              </ul>
            }
          </Panel>
        </div>
      </div>
    </>);

}

function Row({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-2.5">
      <Icon className="h-4 w-4 shrink-0 text-navy-300" aria-hidden="true" />
      <dt className="sr-only">{label}</dt>
      <dd className="min-w-0 truncate text-navy-700">{value}</dd>
    </div>);

}

function Stat({ label, value }) {
  return (
    <div>
      <p className="text-xs text-navy-400">{label}</p>
      <p className="nums mt-0.5 text-lg font-semibold text-navy-900">{typeof value === 'number' ? value : formatCurrency(value)}</p>
    </div>);

}

function Line({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4 px-5 py-3.5">
      <dt className="text-sm text-navy-500">{label}</dt>
      <dd className="text-sm font-medium text-navy-900">{value}</dd>
    </div>);

}