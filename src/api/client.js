/**
 * Centralized fetch wrapper for all backend API calls.
 *
 * - Reads the backend base URL from VITE_API_URL (env var).
 * - Always sends credentials so the browser includes the httpOnly cookie.
 * - Returns parsed JSON for success responses.
 * - Throws a plain Error with the backend's message for error responses.
 * - Never touches, stores, or decodes the JWT — that lives in the cookie only.
 */

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * @param {string} path      - API path, e.g. '/auth/login'
 * @param {RequestInit} opts - fetch options (method, body, etc.)
 * @returns {Promise<any>}   - parsed response data
 * @throws {Error}           - with backend message on HTTP errors
 */
const request = async (path, opts = {}) => {
  const response = await fetch(`${BASE_URL}${path}`, {
    ...opts,
    credentials: 'include', // send httpOnly cookie on every request
    headers: {
      'Content-Type': 'application/json',
      ...opts.headers,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    // Surface the backend's human-readable message
    throw new Error(data.message || `Request failed: ${response.status}`);
  }

  return data;
};

export const get  = (path)         => request(path, { method: 'GET' });
export const post = (path, body)   => request(path, { method: 'POST',   body: JSON.stringify(body) });
export const put  = (path, body)   => request(path, { method: 'PUT',    body: JSON.stringify(body) });
export const del  = (path)         => request(path, { method: 'DELETE' });
