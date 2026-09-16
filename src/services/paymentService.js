import { api, withFallback } from './api';
import { payments, paymentsForBuyer, paymentsForSeller, sellerEarnings } from '../data/payments';

/** GET /api/payments?buyer_id= */
export async function listBuyerPayments(buyerId) {
  return withFallback(
    () => api.get('/payments', { params: { buyer_id: buyerId } }),
    () => paymentsForBuyer(buyerId)
  );
}

/** GET /api/payments?seller_id= */
export async function listSellerPayments(sellerId) {
  return withFallback(
    () => api.get('/payments', { params: { seller_id: sellerId } }),
    () => paymentsForSeller(sellerId)
  );
}

/** GET /api/payments — admin transaction monitoring */
export async function listAllPayments() {
  return withFallback(() => api.get('/payments'), () => payments);
}

/** GET /api/payments/earnings?seller_id= */
export async function getSellerEarnings(sellerId) {
  return withFallback(
    () => api.get('/payments/earnings', { params: { seller_id: sellerId } }),
    () => sellerEarnings
  );
}

/**
 * POST /api/payments/create-intent
 * The backend creates the Stripe PaymentIntent with the SECRET key and returns
 * only the clientSecret. No card data or secret key ever touches the frontend.
 */
export async function createPaymentIntent(paymentId) {
  return withFallback(() => api.post('/payments/create-intent', { paymentId }), {
    clientSecret: 'pi_mock_secret_for_demo_only',
    publishableKeyConfigured: false
  });
}

/** POST /api/payments/:id/confirm — called after Stripe.js confirms the intent. */
export async function confirmPayment(paymentId) {
  return withFallback(() => api.post(`/payments/${paymentId}/confirm`), {
    id: paymentId,
    status: 'paid',
    method: 'Card •••• 4242',
    paidAt: new Date().toISOString(),
    settlementStatus: 'pending',
    receiptId: `rcpt_${Date.now().toString(36)}`
  });
}

/** POST /api/settlements/:id/release — admin/seller settlement release. */
export async function releaseSettlement(paymentId) {
  return withFallback(() => api.post(`/settlements/${paymentId}/release`), {
    id: paymentId,
    settlementStatus: 'settled'
  });
}