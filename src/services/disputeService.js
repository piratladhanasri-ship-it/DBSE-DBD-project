import { api, withFallback } from './api';
import { disputes } from '../data/disputes';

/** GET /api/disputes */
export async function listDisputes(params = {}) {
  return withFallback(() => api.get('/disputes', { params }), () => disputes);
}

/** GET /api/disputes/:id */
export async function getDispute(id) {
  return withFallback(() => api.get(`/disputes/${id}`), () => disputes.find((d) => d.id === id) || null);
}

/** POST /api/disputes */
export async function raiseDispute(payload) {
  return withFallback(() => api.post('/disputes', payload), () => ({
    ...payload,
    id: `DSP-${Math.floor(Math.random() * 900 + 3100)}`,
    status: 'open',
    createdAt: new Date().toISOString()
  }));
}

/** PATCH /api/disputes/:id — resolve or move to review */
export async function updateDispute(id, { status, resolution }) {
  return withFallback(() => api.patch(`/disputes/${id}`, { status, resolution }), {
    id,
    status,
    resolution,
    resolvedAt: status === 'resolved' ? new Date().toISOString() : null
  });
}