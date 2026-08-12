// // Cliente HTTP base contra el backend Spring Boot, con axios.
// // Inyecta el JWT (Authorization: Bearer) desde localStorage vía interceptor
// // y normaliza errores del backend (ProblemDetail, RFC 7807) en ApiError.

// import axios from 'axios';

// const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
// // const TOKEN_KEY = 'ch_token';

// export class ApiError extends Error {
//   constructor(status, message, body) {
//     super(message);
//     this.name = 'ApiError';
//     this.status = status;
//     this.body = body;
//   }
// }

// export function getToken() {
//   return localStorage.getItem(TOKEN_KEY);
// }

// export function setToken(token) {
//   if (token) localStorage.setItem(TOKEN_KEY, token);
//   else localStorage.removeItem(TOKEN_KEY);
// }

// export const axiosClient = axios.create({
//   baseURL: BASE_URL,
//   headers: { 'Content-Type': 'application/json' },
// });

// // Inyecta el JWT en cada request si existe.
// axiosClient.interceptors.request.use((config) => {
//   const token = getToken();
//   if (token) config.headers.Authorization = `Bearer ${token}`;
//   return config;
// });

// // Normaliza cualquier error de red/HTTP en una ApiError con `.message` legible,
// // igual que hacía el wrapper de fetch anterior.
// axiosClient.interceptors.response.use(
//   (res) => res,
//   (err) => {
//     if (err.response) {
//       const data = err.response.data;
//       const message = data?.detail || data?.message || data?.title || `HTTP ${err.response.status}`;
//       return Promise.reject(new ApiError(err.response.status, message, data));
//     }
//     return Promise.reject(new ApiError(0, err.message || 'Error de red', null));
//   }
// );

// // Helpers con la misma forma que el viejo `api.get/post/put/patch/del`,
// // para minimizar el diff en los módulos de src/api/*.js.
// export const api = {
//   get: (path, config) => axiosClient.get(path, config).then((r) => r.data),
//   post: (path, body, config) => axiosClient.post(path, body, config).then((r) => r.data),
//   put: (path, body, config) => axiosClient.put(path, body, config).then((r) => r.data),
//   patch: (path, body, config) => axiosClient.patch(path, body, config).then((r) => r.data),
//   del: (path, config) => axiosClient.delete(path, config).then((r) => r.data),
// };
// Cliente HTTP base contra el backend Spring Boot, con axios.
// Inyecta el JWT (Authorization: Bearer) leyéndolo del store de Redux
// (persistido por redux-persist) y normaliza errores del backend
// (ProblemDetail, RFC 7807) en ApiError.
//
// Nota sobre el orden de carga: este módulo no importa el store directamente
// (evita el ciclo store -> slices -> api -> store). En su lugar, store/index.js
// llama a `injectStore(store)` una vez creado, y desde ahí el interceptor ya
// puede leer `store.getState().auth.token` en cada request.

import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export class ApiError extends Error {
  constructor(status, message, body) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }
}

let _store = null;
export function injectStore(store) {
  _store = store;
}

export const axiosClient = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Inyecta el JWT en cada request si existe, leyéndolo del estado de Redux.
axiosClient.interceptors.request.use((config) => {
  const token = _store?.getState()?.auth?.token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Normaliza cualquier error de red/HTTP en una ApiError con `.message` legible.
axiosClient.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response) {
      const data = err.response.data;
      const message = data?.detail || data?.message || data?.title || `HTTP ${err.response.status}`;
      return Promise.reject(new ApiError(err.response.status, message, data));
    }
    return Promise.reject(new ApiError(0, err.message || 'Error de red', null));
  }
);

// Helpers con la misma forma que el viejo `api.get/post/put/patch/del`,
// para minimizar el diff en los módulos de src/api/*.js.
export const api = {
  get: (path, config) => axiosClient.get(path, config).then((r) => r.data),
  post: (path, body, config) => axiosClient.post(path, body, config).then((r) => r.data),
  put: (path, body, config) => axiosClient.put(path, body, config).then((r) => r.data),
  patch: (path, body, config) => axiosClient.patch(path, body, config).then((r) => r.data),
  del: (path, config) => axiosClient.delete(path, config).then((r) => r.data),
};