import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ImagePlusIcon, XIcon, InfoIcon } from 'lucide-react';
import { PageHeader } from '../../components/PageHeader';
import { Panel } from '../../components/DataTable';
import { Button } from '../../components/ui/Button';
import { Field, TextInput, TextArea, SelectInput } from '../../components/ui/Field';
import { useAuth } from '../../context/AuthContext';
import { useAuctions } from '../../context/AuctionContext';
import { useToast } from '../../context/ToastContext';
import { createAuction } from '../../services/auctionService';
import { validateAuctionForm, isEmpty } from '../../utils/validation';
import { categories, IMAGES } from '../../data/auctions';
import { formatCurrency } from '../../utils/format';
import { cn } from '../../utils/cn';

const SAMPLE_KEYS = Object.keys(IMAGES);

function toLocalInput(date) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function CreateAuction() {
  const { user } = useAuth();
  const { addAuction } = useAuctions();
  const toast = useToast();
  const navigate = useNavigate();

  const [values, setValues] = useState({
    title: '',
    description: '',
    category: '',
    condition: 'Very good',
    images: [],
    startingPrice: '',
    bidIncrement: '1000',
    startAt: toLocalInput(new Date(Date.now() + 24 * 60 * 60 * 1000)),
    endAt: toLocalInput(new Date(Date.now() + 8 * 24 * 60 * 60 * 1000))
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  function set(key, value) {
    setValues((v) => ({ ...v, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  }

  function toggleImage(key) {
    setValues((v) => ({
      ...v,
      images: v.images.includes(key) ? v.images.filter((k) => k !== key) : [...v.images, key]
    }));
    setErrors((e) => ({ ...e, images: undefined }));
  }

  function handleFiles(e) {
    const files = Array.from(e.target.files || []);
    const urls = files.map((file) => URL.createObjectURL(file));
    setValues((v) => ({ ...v, images: [...v.images, ...urls] }));
    setErrors((err) => ({ ...err, images: undefined }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const nextErrors = validateAuctionForm(values);
    setErrors(nextErrors);
    if (!isEmpty(nextErrors)) {
      toast.error('Check the form', 'Some required details are missing or invalid.');
      return;
    }

    setSubmitting(true);
    const payload = {
      title: values.title.trim(),
      description: values.description.trim(),
      category: values.category,
      condition: values.condition,
      images: values.images,
      startingPrice: Number(values.startingPrice),
      bidIncrement: Number(values.bidIncrement),
      startAt: new Date(values.startAt).toISOString(),
      endAt: new Date(values.endAt).toISOString(),
      sellerId: user.id,
      sellerName: user.name,
      sellerStore: user.storeName || user.name,
      location: user.location || '—'
    };

    const created = await createAuction(payload);
    addAuction({ ...payload, ...created, status: 'pending', submittedAt: new Date().toISOString(), watchers: 0, reserveMet: false });
    setSubmitting(false);
    toast.success('Auction submitted', 'It will go live once an administrator verifies the listing.');
    navigate('/seller/auctions');
  }

  return (
    <>
      <PageHeader
        title="Create auction"
        description="Submit a lot for verification. Listings go live automatically at the start time once approved." />
      

      <form onSubmit={handleSubmit} className="grid gap-5 lg:grid-cols-[1.4fr_0.9fr]" noValidate>
        <div className="space-y-5">
          <Panel title="Product details">
            <div className="space-y-4 p-5">
              <Field label="Product name" htmlFor="title" error={errors.title} required>
                <TextInput
                  id="title"
                  value={values.title}
                  onChange={(e) => set('title', e.target.value)}
                  placeholder="1969 Heuer Carrera Chronograph, Ref. 2447"
                  invalid={Boolean(errors.title)} />
                
              </Field>

              <Field
                label="Description"
                htmlFor="description"
                error={errors.description}
                hint="Cover condition, provenance, service history and what is included."
                required>
                
                <TextArea
                  id="description"
                  rows={6}
                  value={values.description}
                  onChange={(e) => set('description', e.target.value)}
                  placeholder="Manual-wind movement, serviced in March 2025. Original dial with light patina, unpolished case…"
                  invalid={Boolean(errors.description)} />
                
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Category" htmlFor="category" error={errors.category} required>
                  <SelectInput id="category" value={values.category} onChange={(e) => set('category', e.target.value)} invalid={Boolean(errors.category)}>
                    <option value="">Select a category</option>
                    {categories.map((c) =>
                    <option key={c} value={c}>
                        {c}
                      </option>
                    )}
                  </SelectInput>
                </Field>
                <Field label="Condition" htmlFor="condition">
                  <SelectInput id="condition" value={values.condition} onChange={(e) => set('condition', e.target.value)}>
                    {['New, sealed', 'Mint', 'Excellent', 'Very good', 'Good', 'Fair, restoration needed'].map((c) =>
                    <option key={c} value={c}>
                        {c}
                      </option>
                    )}
                  </SelectInput>
                </Field>
              </div>
            </div>
          </Panel>

          <Panel title="Product images" description="Upload your own photographs, or pick from the sample catalogue for this demo.">
            <div className="space-y-4 p-5">
              <div className="flex flex-wrap gap-3">
                {SAMPLE_KEYS.map((key) => {
                  const selected = values.images.includes(key);
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => toggleImage(key)}
                      aria-pressed={selected}
                      className={cn(
                        'h-16 w-20 overflow-hidden rounded-lg border-2 transition-colors duration-150 ease-out',
                        selected ? 'border-navy-900' : 'border-line hover:border-navy-300'
                      )}>
                      
                      <img src={IMAGES[key]} alt={`Sample ${key}`} className="h-full w-full object-cover" />
                    </button>);

                })}
              </div>

              <label className="flex h-24 cursor-pointer flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed border-navy-200 bg-mist text-sm text-navy-500 transition-colors duration-150 ease-out hover:border-navy-400">
                <ImagePlusIcon className="h-5 w-5" aria-hidden="true" />
                Upload images (JPG or PNG, up to 5)
                <input type="file" accept="image/*" multiple className="sr-only" onChange={handleFiles} />
              </label>

              {values.images.length ?
              <ul className="flex flex-wrap gap-2">
                  {values.images.map((key) =>
                <li key={key} className="flex items-center gap-1.5 rounded-full bg-navy-50 py-1 pl-3 pr-1.5 text-xs text-navy-700">
                      <span className="max-w-[10rem] truncate">{IMAGES[key] ? key : 'uploaded image'}</span>
                      <button
                    type="button"
                    onClick={() => toggleImage(key)}
                    className="rounded-full p-0.5 text-navy-400 hover:bg-white hover:text-navy-900"
                    aria-label="Remove image">
                    
                        <XIcon className="h-3 w-3" aria-hidden="true" />
                      </button>
                    </li>
                )}
                </ul> :
              null}

              {errors.images ?
              <p className="text-xs font-medium text-negative" role="alert">
                  {errors.images}
                </p> :
              null}
            </div>
          </Panel>
        </div>

        <div className="space-y-5">
          <Panel title="Pricing">
            <div className="space-y-4 p-5">
              <Field label="Starting price (₹)" htmlFor="startingPrice" error={errors.startingPrice} required>
                <TextInput
                  id="startingPrice"
                  type="number"
                  min="1"
                  value={values.startingPrice}
                  onChange={(e) => set('startingPrice', e.target.value)}
                  placeholder="180000"
                  className="nums"
                  invalid={Boolean(errors.startingPrice)} />
                
              </Field>
              <Field label="Bid increment (₹)" htmlFor="bidIncrement" error={errors.bidIncrement} hint="Smallest allowed raise per bid.">
                <TextInput
                  id="bidIncrement"
                  type="number"
                  min="1"
                  value={values.bidIncrement}
                  onChange={(e) => set('bidIncrement', e.target.value)}
                  className="nums"
                  invalid={Boolean(errors.bidIncrement)} />
                
              </Field>
              {values.startingPrice ?
              <p className="rounded-lg bg-mist p-3 text-xs text-navy-600">
                  First valid bid will be{' '}
                  <span className="nums font-semibold text-navy-900">
                    {formatCurrency(Number(values.startingPrice) + Number(values.bidIncrement || 0))}
                  </span>
                  .
                </p> :
              null}
            </div>
          </Panel>

          <Panel title="Schedule">
            <div className="space-y-4 p-5">
              <Field label="Auction starts" htmlFor="startAt" error={errors.startAt} required>
                <TextInput id="startAt" type="datetime-local" value={values.startAt} onChange={(e) => set('startAt', e.target.value)} invalid={Boolean(errors.startAt)} />
              </Field>
              <Field label="Auction ends" htmlFor="endAt" error={errors.endAt} required>
                <TextInput id="endAt" type="datetime-local" value={values.endAt} onChange={(e) => set('endAt', e.target.value)} invalid={Boolean(errors.endAt)} />
              </Field>
              <p className="flex gap-2 rounded-lg bg-mist p-3 text-xs leading-relaxed text-navy-600">
                <InfoIcon className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                Any bid in the final minute extends the close by 30 seconds, so the actual end time may run slightly past the value
                you set.
              </p>
            </div>
          </Panel>

          <div className="flex flex-col gap-2">
            <Button type="submit" size="lg" loading={submitting}>
              Submit auction for verification
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => navigate('/seller/auctions')}>
              Cancel
            </Button>
          </div>
        </div>
      </form>
    </>);

}