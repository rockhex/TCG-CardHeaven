// Slice de sets (ediciones de cartas). Usado en EditProduct.jsx para el selector
// de set al crear/editar una carta.

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as setsApi from '../../api/sets';

// GET /api/sets
export const fetchSets = createAsyncThunk(
  'sets/fetchSets',
  async (_, { rejectWithValue }) => {
    try {
      return await setsApi.getSets();
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// GET /api/games/:gameId/sets
export const fetchSetsByGame = createAsyncThunk(
  'sets/fetchSetsByGame',
  async (gameId, { rejectWithValue }) => {
    try {
      return await setsApi.getSetsByGame(gameId);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// POST /api/sets
export const createSet = createAsyncThunk(
  'sets/createSet',
  async (data, { rejectWithValue }) => {
    try {
      return await setsApi.createSet(data);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const initialState = {
  list: [],
  status: 'idle | loading | succeeded | failed', // idle | loading | succeeded | failed
  error: null,
};

const setsSlice = createSlice({
  name: 'sets',
  initialState,
  extraReducers: (builder) => {
    builder
      .addCase(fetchSets.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchSets.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.list = action.payload;
      })
      .addCase(fetchSets.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'No se pudieron cargar los sets.';
      })
      .addCase(fetchSetsByGame.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchSetsByGame.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.list = action.payload;
      })
      .addCase(fetchSetsByGame.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'No se pudieron cargar los sets.';
      })
      .addCase(createSet.fulfilled, (state, action) => {
        state.list.push(action.payload);
      });
  },
});

// Selectores
export const selectSets = (state) => state.sets.list;
export const selectSetsStatus = (state) => state.sets.status;
export const selectSetsError = (state) => state.sets.error;

export default setsSlice.reducer;
