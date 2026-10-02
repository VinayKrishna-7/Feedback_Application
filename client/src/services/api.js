import axios from 'axios';

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? 'http://localhost:5000/api' : '/api');

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Helper to normalize error messages from API or network failures
export function getErrorMessage(error) {
  if (error.response?.data?.error) {
    return error.response.data.error;
  }
  if (error.message === 'Network Error' || !error.response) {
    return 'Something went wrong. Please check your connection and try again.';
  }
  return error.message || 'An unexpected error occurred.';
}

export async function createForm(title) {
  const response = await apiClient.post('/forms', { title });
  return response.data;
}

export async function getPublicForm(publicToken) {
  const response = await apiClient.get(`/forms/${publicToken}`);
  return response.data;
}

export async function submitFeedback(publicToken, feedbackData) {
  const response = await apiClient.post(`/forms/${publicToken}/feedback`, feedbackData);
  return response.data;
}

export async function getDashboard(adminToken) {
  const response = await apiClient.get(`/manage/${adminToken}`);
  return response.data;
}

export async function deleteFeedback(adminToken, feedbackId) {
  const response = await apiClient.delete(`/manage/${adminToken}/feedback/${feedbackId}`);
  return response.data;
}

export async function updateFormTitle(adminToken, title) {
  const response = await apiClient.patch(`/manage/${adminToken}`, { title });
  return response.data;
}

export default apiClient;
