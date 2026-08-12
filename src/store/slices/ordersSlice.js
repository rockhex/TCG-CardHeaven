// Slice de órdenes del usuario (checkout, historial, detalle, cancelación).
// El listado de TODAS las órdenes (vista admin) vive en adminSlice, ya que
// pega contra /api/admin/orders con filtros propios.

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as ordersApi from '../../api/orders';

// POST /api/users/:userId/checkout
export const checkout = createAsyncThunk(
  'orders/checkout',
  async ({ userId, data }, { rejectWithValue }) => {
    try {
      return await ordersApi.checkout(userId, data);
    } catch (err) {
      // Conservamos status y mensaje: el checkout puede fallar porque un ítem dejó
      // de estar disponible (404 "... not found for item") o sin stock suficiente
      // ("Insufficient stock ..."). La vista necesita distinguir ese caso para
      // mostrar el modal de "producto no disponible" en vez de un error genérico.
      return rejectWithValue({ status: err.status, message: err.message });
    }
  }
);

// GET /api/users/:userId/orders
export const fetchUserOrders = createAsyncThunk(
  'orders/fetchUserOrders',
  async (userId, { rejectWithValue }) => {
    try {
      return await ordersApi.getUserOrders(userId);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// GET /api/orders/:id
export const fetchOrderById = createAsyncThunk(
  'orders/fetchOrderById',
  async (id, { rejectWithValue }) => {
    try {
      return await ordersApi.getOrder(id);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// POST /api/users/:userId/orders/:orderId/cancel
export const cancelOrder = createAsyncThunk(
  'orders/cancelOrder',
  async ({ userId, orderId }, { rejectWithValue }) => {
    try {
      return await ordersApi.cancelOrder(userId, orderId);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const initialState = {
  // Resultado del último checkout (para redirigir/mostrar confirmación)
  lastOrder: null,
  checkoutStatus: 'idle | loading | succeeded | failed',
  checkoutError: null,

  // Historial del usuario
  list: [],
  listStatus: 'idle',
  listError: null,
  
  // Detalle de una orden puntual
  current: null,
  currentStatus: 'idle',
  currentError: null,

  cancelStatus: 'idle',
  cancelError: null,
};

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    clearCheckoutState(state) {
      state.lastOrder = null;
      state.checkoutStatus = 'idle';
      state.checkoutError = null;
    },
    clearCurrentOrder(state) {
      state.current = null;
      state.currentStatus = 'idle';
      state.currentError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // checkout
      .addCase(checkout.pending, (state) => {
        state.checkoutStatus = 'loading';
        state.checkoutError = null;
      })
      .addCase(checkout.fulfilled, (state, action) => {
        state.checkoutStatus = 'succeeded';
        state.lastOrder = action.payload;
        state.list.unshift(action.payload);
      })
      .addCase(checkout.rejected, (state, action) => {
        state.checkoutStatus = 'failed';
        state.checkoutError = action.payload?.message || 'No se pudo completar la compra.';
      })
      // historial
      .addCase(fetchUserOrders.pending, (state) => {
        state.listStatus = 'loading';
        state.listError = null;
      })
      .addCase(fetchUserOrders.fulfilled, (state, action) => {
        state.listStatus = 'succeeded';
        state.list = action.payload;
      })
      .addCase(fetchUserOrders.rejected, (state, action) => {
        state.listStatus = 'failed';
        state.listError = action.payload || 'No se pudieron cargar tus pedidos.';
      })
      // detalle
      .addCase(fetchOrderById.pending, (state) => {
        state.currentStatus = 'loading';
        state.currentError = null;
      })
      .addCase(fetchOrderById.fulfilled, (state, action) => {
        state.currentStatus = 'succeeded';
        state.current = action.payload;
      })
      .addCase(fetchOrderById.rejected, (state, action) => {
        state.currentStatus = 'failed';
        state.currentError = action.payload || 'No se encontró el pedido.';
      })
      // cancelar
      .addCase(cancelOrder.pending, (state) => {
        state.cancelStatus = 'loading';
        state.cancelError = null;
      })
      .addCase(cancelOrder.fulfilled, (state, action) => {
        state.cancelStatus = 'succeeded';
        if (state.current?.id === action.payload.id) state.current = action.payload;
        const idx = state.list.findIndex((o) => o.id === action.payload.id);
        if (idx !== -1) state.list[idx] = action.payload;
      })
      .addCase(cancelOrder.rejected, (state, action) => {
        state.cancelStatus = 'failed';
        state.cancelError = action.payload || 'No se pudo cancelar el pedido.';
      });
  },
});

export const { clearCheckoutState, clearCurrentOrder } = ordersSlice.actions;

// Selectores
export const selectLastOrder = (state) => state.orders.lastOrder;
export const selectCheckoutStatus = (state) => state.orders.checkoutStatus;
export const selectCheckoutError = (state) => state.orders.checkoutError;
export const selectUserOrders = (state) => state.orders.list;
export const selectUserOrdersStatus = (state) => state.orders.listStatus;
export const selectCurrentOrder = (state) => state.orders.current;
export const selectCurrentOrderStatus = (state) => state.orders.currentStatus;
export const selectCancelOrderStatus = (state) => state.orders.cancelStatus;
export const selectCancelOrderError = (state) => state.orders.cancelError;

export default ordersSlice.reducer;
