// Slice de cartas (CRUD admin). Reemplaza las llamadas directas a api/cards.js
// hechas con useState/useEffect en Stock.jsx y EditProduct.jsx.

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as cardsApi from '../../api/cards';

// GET /api/cards
export const fetchCards = createAsyncThunk(
  'cards/fetchCards',
  async (_, { rejectWithValue }) => {
    try {
      return await cardsApi.listCards();
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// GET /api/cards/:id
export const fetchCardById = createAsyncThunk(
  'cards/fetchCardById',
  async (id, { rejectWithValue }) => {
    try {
      return await cardsApi.getCard(id);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// POST /api/cards
export const createCard = createAsyncThunk(
  'cards/createCard',
  async (data, { rejectWithValue }) => {
    try {
      return await cardsApi.createCard(data);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// PUT /api/cards/:id
export const updateCard = createAsyncThunk(
  'cards/updateCard',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      return await cardsApi.updateCard(id, data);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// DELETE /api/cards/:id
export const deleteCard = createAsyncThunk(
  'cards/deleteCard',
  async (id, { rejectWithValue }) => {
    try {
      await cardsApi.deleteCard(id);
      return id;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const initialState = {
  list: [],
  listStatus: 'idle',
  listError: null,

  current: null,
  currentStatus: 'idle',
  currentError: null,

  // Estado de la mutación en curso (create/update/delete), para deshabilitar
  // botones de formulario sin pisar el status del listado.
  mutationStatus: 'idle',
  mutationError: null,
};

const cardsSlice = createSlice({
  name: 'cards',
  initialState,
  reducers: {
    clearCardsMutationError(state) {
      state.mutationError = null;
    },
    clearCurrentCard(state) {
      state.current = null;
      state.currentStatus = 'idle';
      state.currentError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCards.pending, (state) => {
        state.listStatus = 'loading';
        state.listError = null;
      })
      .addCase(fetchCards.fulfilled, (state, action) => {
        state.listStatus = 'succeeded';
        state.list = action.payload;
      })
      .addCase(fetchCards.rejected, (state, action) => {
        state.listStatus = 'failed';
        state.listError = action.payload || 'No se pudieron cargar las cartas.';
      })
      .addCase(fetchCardById.pending, (state) => {
        state.currentStatus = 'loading';
        state.currentError = null;
      })
      .addCase(fetchCardById.fulfilled, (state, action) => {
        state.currentStatus = 'succeeded';
        state.current = action.payload;
      })
      .addCase(fetchCardById.rejected, (state, action) => {
        state.currentStatus = 'failed';
        state.currentError = action.payload || 'No se encontró la carta.';
      })
      .addCase(createCard.fulfilled, (state, action) => {
        state.list.push(action.payload);
      })
      .addCase(updateCard.fulfilled, (state, action) => {
        const idx = state.list.findIndex((c) => c.id === action.payload.id);
        if (idx !== -1) state.list[idx] = action.payload;
        if (state.current?.id === action.payload.id) state.current = action.payload;
      })
      .addCase(deleteCard.fulfilled, (state, action) => {
        state.list = state.list.filter((c) => c.id !== action.payload);
      })
      // pending/rejected comunes a las 3 mutaciones (create/update/delete)
      .addMatcher(
        (action) =>
          ['cards/createCard', 'cards/updateCard', 'cards/deleteCard'].includes(
            action.type.replace(/\/(pending|fulfilled|rejected)$/, '')
          ) && action.type.endsWith('/pending'),
        (state) => {
          state.mutationStatus = 'loading';
          state.mutationError = null;
        }
      )
      .addMatcher(
        (action) =>
          ['cards/createCard', 'cards/updateCard', 'cards/deleteCard'].includes(
            action.type.replace(/\/(pending|fulfilled|rejected)$/, '')
          ) && action.type.endsWith('/fulfilled'),
        (state) => {
          state.mutationStatus = 'succeeded';
        }
      )
      .addMatcher(
        (action) =>
          ['cards/createCard', 'cards/updateCard', 'cards/deleteCard'].includes(
            action.type.replace(/\/(pending|fulfilled|rejected)$/, '')
          ) && action.type.endsWith('/rejected'),
        (state, action) => {
          state.mutationStatus = 'failed';
          state.mutationError = action.payload || 'No se pudo guardar la carta.';
        }
      );
  },
});

export const { clearCardsMutationError, clearCurrentCard } = cardsSlice.actions;

// Selectores
export const selectCardsList = (state) => state.cards.list;
export const selectCardsListStatus = (state) => state.cards.listStatus;
export const selectCardsListError = (state) => state.cards.listError;
export const selectCurrentCard = (state) => state.cards.current;
export const selectCardsMutationStatus = (state) => state.cards.mutationStatus;
export const selectCardsMutationError = (state) => state.cards.mutationError;

export default cardsSlice.reducer;
