/*
 * Seed del catálogo de Card Heaven contra la API del backend (Spring Boot).
 *
 * Requisitos: backend levantado y migrado (incluye V2), Node 18+ (fetch global).
 * Uso:  node scripts/seed.js
 *
 * Crea: 1 juego, 5 sets, las cartas del catálogo (con sus descuentos) y un deck
 * con su contenido. No modifica el backend; usa los endpoints de admin.
 */

const BASE = process.env.VITE_API_URL || 'http://localhost:8080';
const ADMIN = { email: 'admin@tcgtrader.com', password: 'admin123' };

async function api(method, path, body, token) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) {
    throw new Error(`${method} ${path} -> ${res.status}: ${data?.detail || text}`);
  }
  return data;
}

const SET_DEFS = [
  { name: '1st edition', code: '1ED' },
  { name: 'Jungle', code: 'JUN' },
  { name: 'Fossil Set', code: 'FOS' },
  { name: 'Promo', code: 'PRO' },
  { name: 'Battle Deck', code: 'BTD' },
];

const CARD_DEFS = [
  { name: 'Holographic Charizard', set: '1st edition', rarity: 5, price: 450.0, discountedPrice: 385.0, stock: 8, imageUrl: 'https://www.tokyosnackbox.com/cdn/shop/files/Charizard_Holo_25_anniversary.jpg?v=1768642732' },
  { name: 'First Edition Blastoise', set: '1st edition', rarity: 4, price: 320.0, discountedPrice: null, stock: 5, imageUrl: 'https://i.ebayimg.com/images/g/D5IAAOSwd59ewwD~/s-l1200.jpg' },
  { name: 'Shadowless Mewtwo', set: '1st edition', rarity: 5, price: 1200.0, discountedPrice: 950.0, stock: 3, imageUrl: 'https://cdn-vault.fanaticscollect.com/2026/2/23/wr4/small/v2623802_20260223145814659M_9.jpg' },
  { name: 'Jungle Venusaur', set: 'Jungle', rarity: 3, price: 125.0, discountedPrice: null, stock: 12, imageUrl: 'https://i.ebayimg.com/images/g/OEsAAeSwqBlo2yoz/s-l400.jpg' },
  { name: 'Japanese Gyarados Misprint', set: 'Fossil Set', rarity: 4, price: 850.0, discountedPrice: 680.0, stock: 4, imageUrl: 'https://i.ebayimg.com/images/g/OB4AAOSwtUtjynqQ/s-l400.jpg' },
  { name: 'Ancient Mew Promo', set: 'Promo', rarity: null, price: 550.0, discountedPrice: 440.0, stock: 20, imageUrl: 'https://mlpnk72yciwc.i.optimole.com/cqhiHLc.IIZS~2ef73/w:376/h:616/q:75/https://bleedingcool.com/wp-content/uploads/2021/08/card-front-2.jpg' },
  { name: 'Booster Box Base Set', set: '1st edition', rarity: 5, price: 3500.0, discountedPrice: 2800.0, stock: 2, imageUrl: 'https://www.landrypop.com/items/index/2000/320_1_for_elite_trainers_iconic_pokemon_cards_booster_boxes_august_2025_1999_pokemon_base_set_1st_edition_booster_box_factory_sealed__lpa_auction.jpg?t=1753809795' },
  { name: 'PSA 10 Dragonite Holo', set: '1st edition', rarity: 4, price: 2200.0, discountedPrice: null, stock: 1, imageUrl: 'https://i.ebayimg.com/00/s/MTYwMFg5NDE=/z/fy4AAeSwJE9pzUqn/$_57.JPG?set_id=880000500F' },
  // Cartas que componen el Battle Deck:
  { name: 'Tinkaton ex', set: 'Battle Deck', rarity: 5, price: 300.0, discountedPrice: null, stock: 6, imageUrl: 'https://www.pokemoncenter.com/images/DAMRoot/High/10000/P8940_699-85241_01.jpg' },
  { name: 'Tinkaton', set: 'Battle Deck', rarity: 3, price: 80.0, discountedPrice: null, stock: 30, imageUrl: 'https://www.pokemoncenter.com/images/DAMRoot/High/10000/P8940_699-85241_01.jpg' },
];

function isoOffset(days) {
  return new Date(Date.now() + days * 86400000).toISOString();
}

async function main() {
  console.log(`Seeding contra ${BASE}…`);
  const auth = await api('POST', '/api/auth/login', ADMIN);
  const token = auth.token;
  console.log(`Login admin OK (userId=${auth.userId})`);

  const game = await api('POST', '/api/games', { name: 'Pokémon TCG' }, token);
  console.log(`Juego: Pokémon TCG -> ${game.id}`);

  const sets = {};
  for (const s of SET_DEFS) {
    const created = await api('POST', '/api/sets', { gameId: game.id, name: s.name, code: s.code }, token);
    sets[s.name] = created.id;
    console.log(`  set: ${s.name} -> ${created.id}`);
  }

  const cards = {};
  for (const c of CARD_DEFS) {
    const created = await api('POST', '/api/cards', {
      setId: sets[c.set],
      name: c.name,
      rarity: c.rarity,
      condition: 'Near Mint',
      price: c.price,
      stock: c.stock,
      imageUrl: c.imageUrl,
    }, token);
    cards[c.name] = created;
    console.log(`  carta: ${c.name} -> ${created.id}`);

    if (c.discountedPrice) {
      const pct = Number((100 * (1 - c.discountedPrice / c.price)).toFixed(2));
      await api('POST', '/api/discounts', {
        itemId: created.itemId,
        percentage: pct,
        validFrom: isoOffset(-1),
        validTo: isoOffset(365),
        active: true,
      }, token);
      console.log(`    descuento ${pct}% aplicado`);
    }
  }

  const deck = await api('POST', '/api/decks', {
    setId: sets['Battle Deck'],
    name: 'Pokémon TCG: Tinkaton ex Battle Deck',
    description: 'Mazo de batalla listo para jugar con Tinkaton ex como estrella.',
    imageUrl: 'https://www.pokemoncenter.com/images/DAMRoot/High/10000/P8940_699-85241_01.jpg',
    price: 7200.0,
    stock: 5,
    cards: [
      { cardId: cards['Tinkaton ex'].id, quantity: 1 },
      { cardId: cards['Tinkaton'].id, quantity: 2 },
      { cardId: cards['Ancient Mew Promo'].id, quantity: 10 },
      { cardId: cards['Shadowless Mewtwo'].id, quantity: 1 },
      { cardId: cards['Jungle Venusaur'].id, quantity: 5 },
    ],
  }, token);
  console.log(`Deck: ${deck.name} -> ${deck.id}`);

  console.log('\n✅ Seed completado.');
}

main().catch((err) => {
  console.error('\n❌ Seed falló:', err.message);
  process.exit(1);
});
