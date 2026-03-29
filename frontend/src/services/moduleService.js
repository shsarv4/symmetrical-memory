import { apiRequest } from './api';

export async function fetchModules() {
  return apiRequest('/api/modules', 'GET');
}

export async function fetchModule(id) {
  return apiRequest(`/api/modules/${id}`, 'GET');
}

export async function createModule(moduleData) {
  return apiRequest('/api/modules', 'POST', moduleData);
}

export async function updateModule(id, updateData) {
  return apiRequest(`/api/modules/${id}`, 'PUT', updateData);
}

export async function deleteModule(id) {
  return apiRequest(`/api/modules/${id}`, 'DELETE');
}
