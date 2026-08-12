// Slice de catálogo (cartas + decks combinados). Reemplaza al hook useProducts.
// La firma de getProducts/getProductById ya resuelve la combinación y el `type`
// (CARD | DECK); el slice solo orquesta loading/error/data.

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as catalogApi from '../../api/catalog';

// GET /api/cards + GET /api/decks combinados.
// Trae SIEMPRE el catálogo completo; el filtrado (búsqueda, juego, set, rareza,
// precio) se hace client-side sobre estos datos ya cargados.
export const fetchProducts = createAsyncThunk(
  'catalog/fetchProducts',
  async (_arg, { rejectWithValue }) => {
    try {
      return await catalogApi.getProducts({});
    } catch (err) {
      return rejectWithValue(err.message);
    }
  },
  {
    // El store funciona como caché: si el catálogo ya está cargado ('succeeded')
    // o cargándose ('loading'), el thunk se aborta y NO se repite el GET. Así
    // cualquier vista puede hacer dispatch(fetchProducts()) sin miedo: en toda
    // la sesión se pega una sola vez (también evita el doble fetch de StrictMode).
    // Tras un fallo ('failed') sí se permite reintentar.
    // Con dispatch(fetchProducts({ force: true })) se ignora la caché y se vuelve a
    // pedir el catálogo: lo necesita el checkout, que requiere stock FRESCO para
    // validar disponibilidad. Aun así nunca se lanza un segundo GET en paralelo
    // mientras ya hay uno en vuelo ('loading').
    condition: (arg, { getState }) => {
      const status = getState().catalog.productsStatus;
      if (status === 'loading') return false;
      if (arg?.force) return true;
      return status !== 'succeeded';
    },
  }
);

// GET /api/cards/:id ó /api/decks/:id (fallback 404)
export const fetchProductById = createAsyncThunk(
  'catalog/fetchProductById',
  async (id, { rejectWithValue }) => {
    try {
      return await catalogApi.getProductById(id);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const initialState = {
  products: [],
  productsStatus: 'idle', // idle | loading | succeeded | failed
  productsError: null,

  // Caché acumulativa itemId -> nombre. Se va llenando con cada catálogo cargado y
  // NUNCA se vacía, así conservamos el nombre de un producto aunque luego se elimine
  // del catálogo. Lo necesita el modal de "producto no disponible" del checkout: el
  // carrito solo guarda el itemId, no el nombre, así que sin esta caché un producto
  // eliminado solo podría mostrarse como genérico.
  namesById: {},

  current: null,
  currentStatus: 'idle',
  currentError: null,
};

const catalogSlice = createSlice({
  name: 'catalog',
  initialState,
  reducers: {
    clearCurrentProduct(state) {
      state.current = null;
      state.currentStatus = 'idle';
      state.currentError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.productsStatus = 'loading';
        state.productsError = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.productsStatus = 'succeeded';
        state.products = action.payload;
        // Acumulamos los nombres vistos (no se borran al refrescar el catálogo).
        for (const p of action.payload) {
          if (p.itemId && p.name) state.namesById[p.itemId] = p.name;
        }
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.productsStatus = 'failed';
        state.productsError = action.payload || 'No se pudo cargar el catálogo.';
      })
      .addCase(fetchProductById.pending, (state) => {
        state.currentStatus = 'loading';
        state.currentError = null;
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.currentStatus = 'succeeded';
        state.current = action.payload;
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.currentStatus = 'failed';
        state.currentError = action.payload || 'No se encontró el producto.';
      })
      // Cuando el admin crea/edita/elimina una carta (p.ej. agrega stock), el
      // catálogo cacheado queda viejo: la mutación la hizo otro slice (`cards`),
      // no este. Lo invalidamos poniendo el status en 'idle'; así el próximo
      // dispatch(fetchProducts()) —en el effect de cada vista (Catálogo, Home,
      // Cart) y el force del checkout— vuelve a pedir el catálogo y a guardarlo
      // (products + namesById) con el stock actualizado.
      .addMatcher(
        (action) => /^cards\/(createCard|updateCard|deleteCard)\/fulfilled$/.test(action.type),
        (state) => {
          state.productsStatus = 'idle';
        }
      );
  },
});

export const { clearCurrentProduct } = catalogSlice.actions;

// Selectores
export const selectProducts = (state) => state.catalog.products;
// Nombres conocidos (itemId -> nombre), incluso de productos ya eliminados.
export const selectProductNames = (state) => state.catalog.namesById;
export const selectProductsStatus = (state) => state.catalog.productsStatus;
export const selectProductsError = (state) => state.catalog.productsError;
export const selectCurrentProduct = (state) => state.catalog.current;
export const selectCurrentProductStatus = (state) => state.catalog.currentStatus;
export const selectCurrentProductError = (state) => state.catalog.currentError;

export default catalogSlice.reducer;
