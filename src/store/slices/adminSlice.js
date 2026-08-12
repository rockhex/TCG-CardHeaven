// Slice admin: listado global de órdenes con filtros (userId, status, from, to).
// Usado en views/admin/Orders.jsx.

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as adminApi from '../../api/admin';

// GET /api/admin/orders (con filtros opcionales)
export const fetchAllOrders = createAsyncThunk(
  'admin/fetchAllOrders',
  async (filters = {}, { rejectWithValue }) => {
    try {
      return await adminApi.getAllOrders(filters);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const initialState = {
  orders: [],
  status: 'idle | loading | succeeded | failed', 
  error: null,
  filters: { userId: '', status: '', from: '', to: '' },
};

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    setAdminOrderFilters(state, action) {
      state.filters = { ...state.filters, ...action.payload };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllOrders.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchAllOrders.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.orders = action.payload;
      })
      .addCase(fetchAllOrders.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'No se pudieron cargar los pedidos.';
      });
  },
});

export const { setAdminOrderFilters } = adminSlice.actions;

// Selectores
export const selectAdminOrders = (state) => state.admin.orders;
export const selectAdminOrdersStatus = (state) => state.admin.status;
export const selectAdminOrdersError = (state) => state.admin.error;
export const selectAdminOrderFilters = (state) => state.admin.filters;

export default adminSlice.reducer;
