// // Slice de autenticación. Reemplaza a AuthContext.
// // Mismas reglas de persistencia: token/userId/role/email en localStorage.

// import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
// import * as authApi from '../../api/auth';
// import { setToken, getToken } from '../../api/axiosClient';

// const USER_KEY = 'ch_userId';
// const ROLE_KEY = 'ch_role';
// const EMAIL_KEY = 'ch_email';

// function loadStored() {
//   const token = getToken();
//   if (!token) return { token: null, userId: null, role: null, email: null };
//   return {
//     token,
//     userId: localStorage.getItem(USER_KEY),
//     role: localStorage.getItem(ROLE_KEY),
//     email: localStorage.getItem(EMAIL_KEY),
//   };
// }

// function persist(res) {
//   setToken(res.token);
//   localStorage.setItem(USER_KEY, res.userId);
//   localStorage.setItem(ROLE_KEY, res.role);
//   localStorage.setItem(EMAIL_KEY, res.email);
// }

// function clearStored() {
//   setToken(null);
//   localStorage.removeItem(USER_KEY);
//   localStorage.removeItem(ROLE_KEY);
//   localStorage.removeItem(EMAIL_KEY);
// }

// // POST /api/auth/login
// export const login = createAsyncThunk('auth/login', async (creds, { rejectWithValue }) => {
//   try {
//     return await authApi.login(creds);
//   } catch (err) {
//     return rejectWithValue(err.message);
//   }
// });

// // POST /api/auth/register
// export const register = createAsyncThunk('auth/register', async (data, { rejectWithValue }) => {
//   try {
//     return await authApi.register(data);
//   } catch (err) {
//     return rejectWithValue(err.message);
//   }
// });

// const initialState = {
//   ...loadStored(),
//   status: 'idle', // idle | loading | succeeded | failed
//   error: null,
// };

// const authSlice = createSlice({
//   name: 'auth',
//   initialState,
//   reducers: {
//     logout(state) {
//       clearStored();
//       state.token = null;
//       state.userId = null;
//       state.role = null;
//       state.email = null;
//       state.status = 'idle';
//       state.error = null;
//     },
//     clearAuthError(state) {
//       state.error = null;
//     },
//   },
//   extraReducers: (builder) => {
//     builder
//       // login
//       .addCase(login.pending, (state) => {
//         state.status = 'loading';
//         state.error = null;
//       })
//       .addCase(login.fulfilled, (state, action) => {
//         state.status = 'succeeded';
//         persist(action.payload);
//         state.token = action.payload.token;
//         state.userId = action.payload.userId;
//         state.role = action.payload.role;
//         state.email = action.payload.email;
//       })
//       .addCase(login.rejected, (state, action) => {
//         state.status = 'failed';
//         state.error = action.payload || 'No se pudo iniciar sesión.';
//       })
//       // register
//       .addCase(register.pending, (state) => {
//         state.status = 'loading';
//         state.error = null;
//       })
//       .addCase(register.fulfilled, (state, action) => {
//         state.status = 'succeeded';
//         persist(action.payload);
//         state.token = action.payload.token;
//         state.userId = action.payload.userId;
//         state.role = action.payload.role;
//         state.email = action.payload.email;
//       })
//       .addCase(register.rejected, (state, action) => {
//         state.status = 'failed';
//         state.error = action.payload || 'No se pudo completar el registro.';
//       });
//   },
// });

// export const { logout, clearAuthError } = authSlice.actions;

// // Selectores
// export const selectAuth = (state) => state.auth;
// export const selectIsLoggedIn = (state) => !!state.auth.token;
// export const selectIsAdmin = (state) => state.auth.role === 'ADMIN';
// export const selectUserId = (state) => state.auth.userId;

// export default authSlice.reducer;

// Slice de autenticación.
// La persistencia entre recargas la maneja redux-persist (ver store/index.js),
// que serializa este slice completo a localStorage bajo la key "persist:root".
// Ya no se toca localStorage a mano acá ni en axiosClient.

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as authApi from '../../api/auth';

// POST /api/auth/login
export const login = createAsyncThunk('auth/login', async (creds, { rejectWithValue }) => {
  try {
    return await authApi.login(creds);
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

// POST /api/auth/register
export const register = createAsyncThunk('auth/register', async (data, { rejectWithValue }) => {
  try {
    return await authApi.register(data);
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

const initialState = {
  token: null,
  userId: null,
  role: null,
  email: null,
  status: 'idle', // idle | loading | succeeded | failed
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.token = null;
      state.userId = null;
      state.role = null;
      state.email = null;
      state.status = 'idle';
      state.error = null;
    },
    clearAuthError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // login
      .addCase(login.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.token = action.payload.token;
        state.userId = action.payload.userId;
        state.role = action.payload.role;
        state.email = action.payload.email;
      })
      .addCase(login.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'No se pudo iniciar sesión.';
      })
      // register
      .addCase(register.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.token = action.payload.token;
        state.userId = action.payload.userId;
        state.role = action.payload.role;
        state.email = action.payload.email;
      })
      .addCase(register.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'No se pudo completar el registro.';
      });
  },
});

export const { logout, clearAuthError } = authSlice.actions;

// Selectores
export const selectAuth = (state) => state.auth;
export const selectIsLoggedIn = (state) => !!state.auth.token;
export const selectIsAdmin = (state) => state.auth.role === 'ADMIN';
export const selectUserId = (state) => state.auth.userId;
export const selectToken = (state) => state.auth.token;

export default authSlice.reducer;