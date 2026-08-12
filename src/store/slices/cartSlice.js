// Slice de carrito. Reemplaza a CartContext.
// El carrito vive en el backend (/api/users/:userId/cart), asociado al userId logueado.
// Forma real de cada línea: { id, itemId, itemType, quantity } — el nombre/precio/imagen
// se resuelven en los componentes contra el catálogo (catalogSlice), igual que antes.

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as cartApi from '../../api/cart';

// GET /api/users/:userId/cart
export const fetchCart = createAsyncThunk(
  'cart/fetchCart',
  async (userId, { rejectWithValue }) => {
    if (!userId) return { items: [] };
    try {
      return await cartApi.getCart(userId);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  },
  {
    // El carrito se pide al backend UNA sola vez por sesión: si ya está cargado
    // ('succeeded') o cargándose ('loading'), el thunk se aborta. Las mutaciones
    // (add/remove/setQuantity/clear) ya devuelven y aplican el carrito al store,
    // así que navegar entre pantallas —p.ej. admin -> catálogo, que remonta el
    // Navbar y vuelve a disparar este thunk— no necesita re-pegarle al endpoint:
    // el estado vive en Redux y persiste el remontaje. El logout llama resetCart,
    // que deja el status en 'idle', y el próximo login lo vuelve a cargar.
    condition: (_userId, { getState }) => {
      const status = getState().cart.status;
      return status !== 'loading' && status !== 'succeeded';
    },
  }
);

// POST /api/users/:userId/cart/items
// Un 404 acá significa que el item ya no existe en el backend (sin stock o
// eliminado): preservamos el `status` y el `itemId` para que la UI muestre el
// modal de "producto no disponible" en vez de un error genérico.
export const addToCart = createAsyncThunk(
  'cart/addToCart',
  async ({ userId, itemId, quantity = 1 }, { rejectWithValue }) => {
    try {
      return await cartApi.addItem(userId, itemId, quantity);
    } catch (err) {
      return rejectWithValue({ status: err.status, message: err.message, itemId });
    }
  }
);

// DELETE /api/users/:userId/cart/items/:itemId
export const removeFromCart = createAsyncThunk(
  'cart/removeFromCart',
  async ({ userId, itemId }, { rejectWithValue }) => {
    try {
      return await cartApi.removeItem(userId, itemId);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// El backend no tiene PATCH de cantidad: para fijarla, se quita la línea y
// se vuelve a agregar con la cantidad nueva .
export const setQuantity = createAsyncThunk(
  'cart/setQuantity',
  async ({ userId, itemId, quantity }, { rejectWithValue }) => {
    try {
      if (quantity <= 0) {
        return await cartApi.removeItem(userId, itemId);
      }
      await cartApi.removeItem(userId, itemId);
      return await cartApi.addItem(userId, itemId, quantity);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// DELETE /api/users/:userId/cart
export const clearCart = createAsyncThunk(
  'cart/clearCart',
  async (userId, { rejectWithValue }) => {
    try {
      if (userId) await cartApi.clearCart(userId);
      return { items: [] };
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const initialState = {
  items: [], // [{ id, itemId, itemType, quantity }]
  status: 'idle', // idle | loading | succeeded | failed
  error: null,
  // itemId que se intentó agregar y devolvió 404 (no disponible). Dispara el modal.
  unavailableItemId: null,
};

function applyCart(state, cart) {
  state.items = cart?.items ?? [];
}

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    resetCart(state) {
      state.items = [];
      state.status = 'idle';
      state.error = null;
      state.unavailableItemId = null;
    },
    // Cierra el modal de "producto no disponible".
    dismissUnavailable(state) {
      state.unavailableItemId = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.status = 'succeeded';
        applyCart(state, action.payload);
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.status = 'failed';
        state.items = [];
        state.error = action.payload || 'No se pudo cargar el carrito.';
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        applyCart(state, action.payload);
      })
      // Un 404 al agregar = item no disponible -> abrimos el modal (no es un
      // error genérico). Cualquier otro fallo cae al error normal del carrito.
      .addCase(addToCart.rejected, (state, action) => {
        const payload = action.payload || {};
        if (payload.status === 404) {
          state.unavailableItemId = payload.itemId ?? true;
        } else {
          state.error = payload.message || 'No se pudo actualizar el carrito.';
        }
      })
      .addCase(setQuantity.fulfilled, (state, action) => {
        applyCart(state, action.payload);
      })
      .addCase(removeFromCart.fulfilled, (state, action) => {
        applyCart(state, action.payload);
      })
      .addCase(clearCart.fulfilled, (state) => {
        state.items = [];
      })
      // Cualquier mutación fallida del carrito (set/remove/clear) reporta error
      // sin pisar el resultado de fetchCart. addToCart se maneja aparte (arriba)
      // porque distingue el caso 404 -> "no disponible".
      .addMatcher(
        (action) =>
          action.type.startsWith('cart/') &&
          action.type.endsWith('/rejected') &&
          action.type !== 'cart/fetchCart/rejected' &&
          action.type !== 'cart/addToCart/rejected',
        (state, action) => {
          state.error = action.payload || 'No se pudo actualizar el carrito.';
        }
      );
  },
});

export const { resetCart, dismissUnavailable } = cartSlice.actions;

// Selectores
export const selectCartItems = (state) => state.cart.items;
export const selectCartCount = (state) =>
  state.cart.items.reduce((sum, it) => sum + (it.quantity ?? 0), 0);
export const selectCartStatus = (state) => state.cart.status;
export const selectCartError = (state) => state.cart.error;
export const selectUnavailableItemId = (state) => state.cart.unavailableItemId;

export default cartSlice.reducer;
