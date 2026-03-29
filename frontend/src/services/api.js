import { getAuth } from './firebase';

const API_BASE_URL = ''; // Use relative path (same origin) in production, can be overridden via env if needed

/**
 * Get Firebase auth token
 */
export async function getAuthToken() {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) {
    throw new Error('No authenticated user');
  }
  const token = await user.getIdToken();
  return token;
}

/**
 * Generic API request function
 */
export async function apiRequest(endpoint, method = 'GET', body = null) {
  console.log(`🌐 API Request: ${method} ${endpoint}`);

  let token;
  try {
    token = await getAuthToken();
  } catch (err) {
    console.error('❌ No auth token available');
    throw new Error('Not authenticated');
  }

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };

  const config = {
    method,
    headers,
    credentials: 'include'
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  const url = `${API_BASE_URL}${endpoint}`;
  console.log('  Request URL:', url);

  try {
    const response = await fetch(url, config);
    const data = await response.json();
    console.log('  Response status:', response.status);
    console.log('  Response data:', data);

    if (!response.ok) {
      throw new Error(data.error || `API request failed with status ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error('❌ API request failed:', error);
    throw error;
  }
}

export default { apiRequest, getAuthToken };
