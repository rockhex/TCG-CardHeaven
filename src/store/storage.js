// Storage engine para redux-persist, basado en localStorage.
// Se define a mano (en vez de importar 'redux-persist/lib/storage') porque
// ese subpath no siempre resuelve bien con Vite/ESM y termina rompiendo
// con "storage.setItem is not a function". La implementación es la misma
// que usa redux-persist internamente: localStorage envuelto en promesas.

const storage = {
  getItem(key) {
    return Promise.resolve(window.localStorage.getItem(key));
  },
  setItem(key, value) {
    return Promise.resolve(window.localStorage.setItem(key, value));
  },
  removeItem(key) {
    return Promise.resolve(window.localStorage.removeItem(key));
  },
};

export default storage;