import { api } from './axiosClient';

export function getSets() {
  return api.get('/api/sets');
}

export function getSetsByGame(gameId) {
  return api.get(`/api/games/${gameId}/sets`);
}

export function createSet({ gameId, name, code }) {
  return api.post('/api/sets', { gameId, name, code });
}
