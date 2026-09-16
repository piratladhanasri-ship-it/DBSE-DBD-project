import { api, withFallback } from './api';
import { notificationsForUser } from '../data/notifications';

/** GET /api/notifications?user_id= */
export async function listNotifications(userId) {
  return withFallback(
    () => api.get('/notifications', { params: { user_id: userId } }),
    () => notificationsForUser(userId)
  );
}

/** PATCH /api/notifications/:id/read */
export async function markRead(id) {
  return withFallback(() => api.patch(`/notifications/${id}/read`), { id, isRead: true });
}

/** PATCH /api/notifications/read-all */
export async function markAllRead(userId) {
  return withFallback(() => api.patch('/notifications/read-all', { userId }), { updated: true });
}