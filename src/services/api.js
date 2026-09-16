import axios from 'axios';

/**
 * Single Axios instance for the whole app. Point VITE_API_BASE_URL at the
 * Node/Express server (e.g. http://localhost:5000) once the backend exists.
 * Only public configuration lives here — never secrets or DB credentials.
 */
export const API_BASE_URL =
typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE_URL ||
'http://localhost:5000';

export const TOKEN_KEY = 'bidvault.token';

export function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);else
    localStorage.removeItem(TOKEN_KEY);
  } catch {

    /* storage unavailable — token stays in memory only */}
}

export const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000
});

// Attach the JWT to every outgoing request.
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Normalise errors and bounce the user out on an expired session.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    if (status === 401) {
      setToken(null);
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
        window.location.assign('/login?expired=1');
      }
    }
    return Promise.reject({
      status: status || 0,
      message: error?.response?.data?.message || error?.message || 'Network error. Please try again.'
    });
  }
);

/**
 * Runs a live API call and falls back to mock data when no backend is reachable.
 * Every service below uses this, so deleting the fallback is all that is needed
 * to go fully live.
 */
export async function withFallback(request, fallbackValue, delay = 350) {
  try {
    const response = await request();
    return response.data;
  } catch {
    await new Promise((resolve) => setTimeout(resolve, delay));
    return typeof fallbackValue === 'function' ? fallbackValue() : fallbackValue;
  }
}