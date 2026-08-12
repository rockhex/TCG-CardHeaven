import { api } from './axiosClient';

// POST /api/users/{userId}/checkout -> OrderResponse
export function checkout(userId, { addressId, paymentProvider, externalProcessorId }) {
  return api.post(`/api/users/${userId}/checkout`, {
    addressId,
    paymentProvider,
    externalProcessorId,
  });
}

// GET /api/users/{userId}/orders -> OrderResponse[]
export function getUserOrders(userId) {
  return api.get(`/api/users/${userId}/orders`);
}

// GET /api/orders/{id} -> OrderResponse { ..., address, items }
export function getOrder(id) {
  return api.get(`/api/orders/${id}`);
}

// POST /api/users/{userId}/orders/{orderId}/cancel -> OrderResponse (botón de arrepentimiento)
export function cancelOrder(userId, orderId) {
  return api.post(`/api/users/${userId}/orders/${orderId}/cancel`);
}
