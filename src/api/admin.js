import { api } from './axiosClient';

// GET /api/admin/orders -> OrderResponse[]  (filtros opcionales)
export function getAllOrders({ userId, status, from, to } = {}) {
  const params = new URLSearchParams();
  if (userId) params.set('userId', userId);
  if (status) params.set('status', status);
  if (from) params.set('from', from);
  if (to) params.set('to', to);
  const qs = params.toString();
  return api.get(`/api/admin/orders${qs ? `?${qs}` : ''}`);
}
