/**
 * API client helper that attaches mock authentication headers from localStorage
 */
export async function apiRequest(endpoint, options = {}) {
  const currentUserId = localStorage.getItem('autoflow_user_id') || '00000000-0000-0000-0000-000000000001';

  // Read current user role if stored or pass default
  const headers = {
    'Content-Type': 'application/json',
    'x-user-id': currentUserId,
    ...options.headers
  };

  const config = {
    ...options,
    headers
  };

  const response = await fetch(endpoint, config);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message = errorData.error || errorData.message || `Request failed with status ${response.status}`;
    const error = new Error(message);
    error.status = response.status;
    error.details = errorData.details;
    throw error;
  }

  return response.json();
}

export default apiRequest;
