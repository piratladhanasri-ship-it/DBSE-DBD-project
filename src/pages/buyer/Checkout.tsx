import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { LockIcon, CheckCircle2Icon, ChevronLeftIcon, ShieldCheckIcon } from 'lucide-react';
import { PageHeader } from '../../components/PageHeader';
import { Panel } from '../../components/DataTable';
import { Button } from '../../components/ui/Button';
import { Field, TextInput } from '../../components/ui/Field';
import { StatusBadge } from '../../components/StatusBadge';
import { EmptyState } from '../../components/EmptyState';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { usePayments } from '../../context/PaymentContext';
import { useToast } from '../../context/ToastContext';
import { createPaymentIntent } from '../../services/paymentService';
import { formatCurrency, formatDateTime } from '../../utils/format';
import { cn } from '../../utils/cn';

const STEPS = ['Review', 'Payment', 'Confirmation'];

export function Checkout() {
  const { paymentId } = useParams();
  const { getPayment, payNow } = usePayments();
  const toast = useToast();
  const navigate = useNavigate();

  const payment = getPayment(paymentId);
  const [step, setStep] = useState(payment?.status === 'paid' ? 2 : 0);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [card, setCard] = useState({ name: '', number: '', expiry: '', cvc: '' });
  const [cardErrors, setCardErrors] = useState({});

  if (!payment) {
    return (
      <EmptyState
        title="Invoice not found"
        description="This payment may already be settled or belongs to another account."
        actionLabel="Back to payments"
        actionTo="/buyer/payments" />);


  }

  function validateCard() {
    const errors = {};
    if (!card.name.trim()) errors.name = 'Name on card is required.';
    if (!/^[0-9\s]{12,19}$/.test(card.number)) errors.number = 'Enter the 16 digit card number.';
    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(card.expiry)) errors.expiry = 'Use MM/YY format.';
    if (!/^\d{3,4}$/.test(card.cvc)) errors.cvc = 'CVC must be 3 or 4 digits.';
    setCardErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handlePay(e) {
    e.preventDefault();
    if (!validateCard()) return;
    setError('');
    setProcessing(true);
    try {
      // Backend creates the PaymentIntent; the browser only receives a client secret.
      await createPaymentIntent(payment.id);
      await payNow(payment.id);
      setStep(2);
      toast.success('Payment successful', `${formatCurrency(payment.amount)} received for ${payment.auctionTitle}.`);
    } catch (err) {
      setError(err?.message || 'The payment could not be completed. No amount was charged.');
    } finally {
      setProcessing(false);
    }
  }

  return (
    <>
      <Link
        to="/buyer/payments"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-navy-500 transition-colors duration-150 ease-out hover:text-navy-900">
        
        <ChevronLeftIcon className="h-4 w-4" aria-hidden="true" />
        Payments
      </Link>

      <PageHeader title="Secure checkout" description={`Invoice ${payment.id} · ${payment.auctionTitle}`} />

      {/* Stepper */}
      <ol className="flex items-center gap-2" aria-label="Checkout progress">
        {STEPS.map((label, i) =>
        <li key={label} className="flex flex-1 items-center gap-2">
            <span
            className={cn(
              'nums flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold',
              i < step ? 'bg-positive/15 text-positive' : i === step ? 'bg-navy-900 text-white' : 'bg-navy-100 text-navy-400'
            )}>
            
              {i < step ? <CheckCircle2Icon className="h-4 w-4" aria-hidden="true" /> : i + 1}
            </span>
            <span className={cn('text-sm font-medium', i === step ? 'text-navy-900' : 'text-navy-400')}>{label}</span>
            {i < STEPS.length - 1 ? <span className="h-px flex-1 bg-line" aria-hidden="true" /> : null}
          </li>
        )}
      </ol>

      <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
        <div>
          {step === 0 ?
          <Panel title="Review your purchase">
              <div className="space-y-4 p-5">
                <dl className="space-y-2.5 text-sm">
                  <Row label="Lot" value={payment.auctionTitle} />
                  <Row label="Seller" value={payment.sellerName} />
                  <Row label="Winning bid" value={formatCurrency(payment.amount)} />
                  <Row label="Payment due by" value={formatDateTime(payment.dueAt)} />
                  <Row label="Status" value={<StatusBadge status={payment.status} />} />
                </dl>
                <div className="rounded-lg border border-line bg-mist p-4 text-sm text-navy-600">
                  Paying now releases the lot for dispatch. Funds are held until you confirm delivery or the dispute window closes.
                </div>
                <Button size="lg" className="w-full" onClick={() => setStep(1)}>
                  Continue to payment
                </Button>
              </div>
            </Panel> :
          null}

          {step === 1 ?
          <Panel title="Card details" description="Test mode — use any values. Nothing is stored by this application.">
              <form onSubmit={handlePay} className="space-y-4 p-5" noValidate>
                {error ?
              <p className="rounded-lg border border-negative/30 bg-negative/5 p-3 text-sm text-negative" role="alert">
                    {error}
                  </p> :
              null}

                <Field label="Name on card" htmlFor="card-name" error={cardErrors.name} required>
                  <TextInput
                  id="card-name"
                  value={card.name}
                  onChange={(e) => setCard({ ...card, name: e.target.value })}
                  placeholder="Rhea Kulkarni"
                  invalid={Boolean(cardErrors.name)} />
                
                </Field>

                <Field label="Card number" htmlFor="card-number" error={cardErrors.number} hint="Try 4242 4242 4242 4242" required>
                  <TextInput
                  id="card-number"
                  inputMode="numeric"
                  value={card.number}
                  onChange={(e) => setCard({ ...card, number: e.target.value })}
                  placeholder="4242 4242 4242 4242"
                  className="nums"
                  invalid={Boolean(cardErrors.number)} />
                
                </Field>

                <div className="grid grid-cols-2 gap-4">
                  <Field label="Expiry" htmlFor="card-expiry" error={cardErrors.expiry} required>
                    <TextInput
                    id="card-expiry"
                    value={card.expiry}
                    onChange={(e) => setCard({ ...card, expiry: e.target.value })}
                    placeholder="MM/YY"
                    className="nums"
                    invalid={Boolean(cardErrors.expiry)} />
                  
                  </Field>
                  <Field label="CVC" htmlFor="card-cvc" error={cardErrors.cvc} required>
                    <TextInput
                    id="card-cvc"
                    inputMode="numeric"
                    value={card.cvc}
                    onChange={(e) => setCard({ ...card, cvc: e.target.value })}
                    placeholder="123"
                    className="nums"
                    invalid={Boolean(cardErrors.cvc)} />
                  
                  </Field>
                </div>

                <Button type="submit" variant="gold" size="lg" className="w-full" loading={processing}>
                  {processing ? 'Processing payment…' : `Pay ${formatCurrency(payment.amount)}`}
                </Button>
                <p className="flex items-center justify-center gap-1.5 text-xs text-navy-400">
                  <LockIcon className="h-3.5 w-3.5" aria-hidden="true" />
                  In production this form is replaced by Stripe Elements
                </p>
              </form>
            </Panel> :
          null}

          {step === 2 ?
          <Panel title="Payment complete">
              <div className="p-6">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-positive/10 text-positive">
                  <CheckCircle2Icon className="h-6 w-6" aria-hidden="true" />
                </span>
                <h2 className="mt-4 font-display text-2xl text-navy-900">Payment successful</h2>
                <p className="mt-2 text-sm leading-relaxed text-navy-600">
                  {formatCurrency(payment.amount)} was received for {payment.auctionTitle}. The seller has been notified to dispatch
                  the lot, and settlement is scheduled after the dispute window.
                </p>
                <dl className="mt-5 divide-y divide-line rounded-lg border border-line">
                  <RowLine label="payment_id" value={payment.id} />
                  <RowLine label="status" value="paid" />
                  <RowLine label="settlement_status" value="pending" />
                </dl>
                <div className="mt-5 flex flex-wrap gap-2">
                  <Button to="/buyer/payments" size="sm">
                    View receipts
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => navigate('/auctions')}>
                    Keep bidding
                  </Button>
                </div>
              </div>
            </Panel> :
          null}
        </div>

        <aside className="space-y-4">
          <div className="rounded-card border border-line bg-white p-5 shadow-card">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-navy-400">Order summary</h2>
            <dl className="mt-4 space-y-2.5 text-sm">
              <Row label="Winning bid" value={formatCurrency(payment.amount)} />
              <Row label="Platform fee" value="Included" />
              <Row label="Shipping" value="Arranged with seller" />
            </dl>
            <div className="mt-4 flex items-center justify-between border-t border-line pt-4">
              <p className="text-sm font-semibold text-navy-900">Total due</p>
              <p className="nums text-xl font-semibold text-navy-900">{formatCurrency(payment.amount)}</p>
            </div>
          </div>

          <div className="rounded-card border border-line bg-mist p-5">
            <p className="flex items-center gap-2 text-sm font-semibold text-navy-900">
              <ShieldCheckIcon className="h-4 w-4 text-positive" aria-hidden="true" />
              Buyer protection
            </p>
            <p className="mt-2 text-sm leading-relaxed text-navy-600">
              Raise a dispute within 7 days of delivery and the seller payout stays on hold until an administrator resolves it.
            </p>
          </div>

          {processing ?
          <div className="flex items-center gap-3 rounded-card border border-line bg-white p-4">
              <LoadingSpinner />
              <p className="text-sm text-navy-600">Confirming with the payment provider…</p>
            </div> :
          null}
        </aside>
      </div>
    </>);

}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="text-navy-500">{label}</dt>
      <dd className="nums text-right font-medium text-navy-900">{value}</dd>
    </div>);

}

function RowLine({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-2.5">
      <dt className="font-mono text-xs text-navy-400">{label}</dt>
      <dd className="text-sm font-medium text-navy-900">{value}</dd>
    </div>);

}