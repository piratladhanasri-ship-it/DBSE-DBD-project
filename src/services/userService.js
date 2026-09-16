import { api, withFallback } from './api';
import { users, findUserById } from '../data/users';
import { reviews, adminStats } from '../data/disputes';

/** GET /api/users */
export async function listUsers(params = {}) {
  return withFallback(() => api.get('/users', { params }), () => users);
}

/** GET /api/users/:id */
export async function getUser(id) {
  return withFallback(() => api.get(`/users/${id}`), () => findUserById(id) || null);
}

/** PUT /api/users/:id */
export async function updateProfile(id, payload) {
  return withFallback(() => api.put(`/users/${id}`, payload), () => ({ id, ...payload }));
}

/** PATCH /api/users/:id/status — activate / suspend / verify */
export async function setUserStatus(id, status) {
  return withFallback(() => api.patch(`/users/${id}/status`, { status }), { id, status });
}

/** PUT /api/users/:id/preferences — notification preferences */
export async function updatePreferences(id, preferences) {
  return withFallback(() => api.put(`/users/${id}/preferences`, preferences), { id, preferences });
}

/** GET /api/reviews?seller_id= */
export async function listSellerReviews(sellerId) {
  return withFallback(
    () => api.get('/reviews', { params: { seller_id: sellerId } }),
    () => reviews.filter((r) => r.sellerId === sellerId)
  );
}

/** GET /api/admin/stats */
export async function getAdminStats() {
  return withFallback(() => api.get('/admin/stats'), () => adminStats);
}