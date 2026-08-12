import { api } from './axiosClient';

// POST /api/auth/login -> AuthResponse { token, userId, role, email }
export function login({ email, password }) {
  return api.post('/api/auth/login', { email, password });
}

// POST /api/auth/register -> AuthResponse. Sin roleId el backend asigna CUSTOMER.
export function register({ name, email, password }) {
  return api.post('/api/auth/register', { name, email, password });
}
