import { api } from './axiosClient';

// /api/users/{userId}/addresses -> AddressResponse { id, street, city, country, zipCode }
export function getAddresses(userId) {
  return api.get(`/api/users/${userId}/addresses`);
}

export function createAddress(userId, { street, city, country, zipCode }) {
  return api.post(`/api/users/${userId}/addresses`, { street, city, country, zipCode });
}
