import { api } from './axiosClient';

export function getGames() {
  return api.get('/api/games');
}

export function createGame({ name }) {
  return api.post('/api/games', { name });
}
