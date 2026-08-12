// import { configureStore } from '@reduxjs/toolkit';

// import authReducer from './slices/authSlice';
// import cartReducer from './slices/cartSlice';
// import catalogReducer from './slices/catalogSlice';
// import cardsReducer from './slices/cardsSlice';
// import setsReducer from './slices/setsSlice';
// import gamesReducer from './slices/gamesSlice';
// import ordersReducer from './slices/ordersSlice';
// import addressesReducer from './slices/addressesSlice';
// import adminReducer from './slices/adminSlice';

// export const store = configureStore({
//   reducer: {
//     auth: authReducer,
//     cart: cartReducer,
//     catalog: catalogReducer,
//     cards: cardsReducer,
//     sets: setsReducer,
//     games: gamesReducer,
//     orders: ordersReducer,
//     addresses: addressesReducer,
//     admin: adminReducer,
//   },
// });

// export default store;

import { combineReducers, configureStore } from '@reduxjs/toolkit';
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import storage from './storage'; // localStorage (wrapper propio, ver storage.js)

import authReducer from './slices/authSlice';
import cartReducer from './slices/cartSlice';
import catalogReducer from './slices/catalogSlice';
import cardsReducer from './slices/cardsSlice';
import setsReducer from './slices/setsSlice';
import gamesReducer from './slices/gamesSlice';
import ordersReducer from './slices/ordersSlice';
import addressesReducer from './slices/addressesSlice';
import adminReducer from './slices/adminSlice';

import { injectStore } from '../api/axiosClient';

const rootReducer = combineReducers({
  auth: authReducer,
  cart: cartReducer,
  catalog: catalogReducer,
  cards: cardsReducer,
  sets: setsReducer,
  games: gamesReducer,
  orders: ordersReducer,
  addresses: addressesReducer,
  admin: adminReducer,
});

// Solo "auth" se persiste entre recargas (sesión del usuario).
// El resto (cart, catalog, cards, etc.) se vuelve a pedir al backend
// en cada carga, igual que antes — no tiene sentido cachearlo en localStorage.
const persistConfig = {
  key: 'root',
  version: 1,
  storage,
  whitelist: ['auth'],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      // redux-persist despacha acciones con valores no serializables (funciones)
      // en estas action types puntuales; se ignoran solo esas, no todo el check.
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);

// Le da acceso al store al cliente axios, para que el interceptor de
// Authorization pueda leer el token actual sin crear un import circular.
injectStore(store);

export default store;