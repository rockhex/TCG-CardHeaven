import { api, ApiError } from './axiosClient';

// Catálogo unificado: cartas (/api/cards) + decks (/api/decks).
// Solo se concatena y se marca el `type`; ningún valor se inventa en el front.

export async function getProducts({ search } = {}) {
  const cardsPath = search
    ? `/api/cards?search=${encodeURIComponent(search)}`
    : '/api/cards';
  const [cards, decks] = await Promise.all([
    api.get(cardsPath),
    api.get('/api/decks'),
  ]);

  const cardProducts = cards.map((c) => ({ ...c, type: 'CARD' }));
  // El backend solo filtra cartas por `search`; los decks se filtran por nombre acá.
  const filteredDecks = search
    ? decks.filter((d) => d.name.toLowerCase().includes(search.toLowerCase()))
    : decks;
  const deckProducts = filteredDecks.map((d) => ({ ...d, type: 'DECK' }));

  return [...cardProducts, ...deckProducts];
}

// Resuelve un producto por id (los ids de carta y deck son UUID distintos).
export async function getProductById(id) {
  try {
    const card = await api.get(`/api/cards/${id}`);
    return { ...card, type: 'CARD' };
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) {
      const deck = await api.get(`/api/decks/${id}`);
      return { ...deck, type: 'DECK' };
    }
    throw err;
  }
}
