import { apiRequest } from './api';

export async function fetchAnnouncements() {
  return apiRequest('/api/announcements', 'GET');
}

export async function fetchAllAnnouncements() {
  return apiRequest('/api/announcements/all', 'GET');
}

export async function createAnnouncement(announcementData) {
  return apiRequest('/api/announcements', 'POST', announcementData);
}

export async function updateAnnouncement(id, updateData) {
  return apiRequest(`/api/announcements/${id}`, 'PUT', updateData);
}

export async function deleteAnnouncement(id) {
  return apiRequest(`/api/announcements/${id}`, 'DELETE');
}
