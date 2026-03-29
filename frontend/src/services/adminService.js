import { apiRequest } from './api';

export async function fetchAdminStats() {
  return apiRequest('/api/admin/stats', 'GET');
}

export async function fetchUsers() {
  return apiRequest('/api/admin/users', 'GET');
}

export async function fetchUser(uid) {
  return apiRequest(`/api/admin/users/${uid}`, 'GET');
}

export async function updateUserRole(uid, role) {
  return apiRequest(`/api/admin/users/${uid}/role`, 'PUT', { role });
}
