// Slice de direcciones de envío. Usado en CheckOut.jsx.

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as addressesApi from '../../api/addresses';

// GET /api/users/:userId/addresses
export const fetchAddresses = createAsyncThunk(
  'addresses/fetchAddresses',
  async (userId, { rejectWithValue }) => {
    try {
      return await addressesApi.getAddresses(userId);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// POST /api/users/:userId/addresses
export const createAddress = createAsyncThunk(
  'addresses/createAddress',
  async ({ userId, data }, { rejectWithValue }) => {
    try {
      return await addressesApi.createAddress(userId, data);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const initialState = {
  list: [],
  status: 'idle',
  error: null,
  createStatus: 'idle',
  createError: null,
};

const addressesSlice = createSlice({
  name: 'addresses',
  initialState,
  reducers: {
    clearAddressCreateError(state) {
      state.createError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAddresses.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchAddresses.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.list = action.payload;
      })
      .addCase(fetchAddresses.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'No se pudieron cargar las direcciones.';
      })
      .addCase(createAddress.pending, (state) => {
        state.createStatus = 'loading';
        state.createError = null;
      })
      .addCase(createAddress.fulfilled, (state, action) => {
        state.createStatus = 'succeeded';
        state.list.push(action.payload);
      })
      .addCase(createAddress.rejected, (state, action) => {
        state.createStatus = 'failed';
        state.createError = action.payload || 'No se pudo guardar la dirección.';
      });
  },
});

export const { clearAddressCreateError } = addressesSlice.actions;

// Selectores
export const selectAddresses = (state) => state.addresses.list;
export const selectAddressesStatus = (state) => state.addresses.status;
export const selectAddressCreateStatus = (state) => state.addresses.createStatus;
export const selectAddressCreateError = (state) => state.addresses.createError;

export default addressesSlice.reducer;
