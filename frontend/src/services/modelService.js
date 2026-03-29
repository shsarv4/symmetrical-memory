import { getAuthToken } from './api';

/**
 * Fetch current AI model and available options
 */
export async function fetchAIModel() {
  const token = await getAuthToken();
  console.log('Fetching AI model with token:', token?.substring(0, 20) + '...');

  const response = await fetch('/api/admin/ai-model', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  console.log('AI model response status:', response.status);
  const data = await response.json();
  console.log('AI model response data:', data);

  if (!response.ok) {
    throw new Error(data.error || 'Failed to fetch AI model');
  }

  return data;
}

/**
 * Update AI model selection
 */
export async function updateAIModel(modelId) {
  const token = await getAuthToken();
  const response = await fetch('/api/admin/ai-model', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ model: modelId })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update AI model');
  }

  return response.json();
}
