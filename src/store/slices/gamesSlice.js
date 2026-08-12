// Slice de juegos (TCGs). Usado en EditProduct.jsx para el selector de juego
// del que dependen los sets.

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as gamesApi from '../../api/games';

// GET /api/games
export const fetchGames = createAsyncThunk(
  'games/fetchGames',
  async (_, { rejectWithValue }) => {
    try {
      return await gamesApi.getGames();
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// POST /api/games
export const createGame = createAsyncThunk(
  'games/createGame',
  async (data, { rejectWithValue }) => {
    try {
      return await gamesApi.createGame(data);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const initialState = {
  list: [],
  status: 'idle',
  error: null,
};

const gamesSlice = createSlice({
  name: 'games',
  initialState,
  extraReducers: (builder) => {
    builder
      .addCase(fetchGames.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchGames.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.list = action.payload;
      })
      .addCase(fetchGames.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'No se pudieron cargar los juegos.';
      })
      .addCase(createGame.fulfilled, (state, action) => {
        state.list.push(action.payload);
      });
  },
});

// Selectores
export const selectGames = (state) => state.games.list;
export const selectGamesStatus = (state) => state.games.status;
export const selectGamesError = (state) => state.games.error;

export default gamesSlice.reducer;
