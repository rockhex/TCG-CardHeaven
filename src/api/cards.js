import { api } from './axiosClient';

// CRUD de cartas (admin). El catálogo de lectura vive en catalog.js.
export function listCards() {
  return api.get('/api/cards');
}

export function createCard({ setId, name, rarity, condition, price, stock, imageUrl }) {
  return api.post('/api/cards', { setId, name, rarity, condition, price, stock, imageUrl });
}

export function getCard(id) {
  return api.get(`/api/cards/${id}`);
}

export function updateCard(id, { setId, name, rarity, condition, price, stock, imageUrl }) {
  return api.put(`/api/cards/${id}`, { setId, name, rarity, condition, price, stock, imageUrl });
}

export function deleteCard(id) {
  return api.del(`/api/cards/${id}`);
}
