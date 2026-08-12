import { api } from './axiosClient';

// /api/users/{userId}/cart -> CartResponse { id, items: [{ id, itemId, itemType, quantity }] }
export function getCart(userId) {
  return api.get(`/api/users/${userId}/cart`);
}

export function addItem(userId, itemId, quantity = 1) {
  return api.post(`/api/users/${userId}/cart/items`, { itemId, quantity });
}

export function removeItem(userId, itemId) {
  return api.del(`/api/users/${userId}/cart/items/${itemId}`);
}

export function clearCart(userId) {
  return api.del(`/api/users/${userId}/cart`);
}
