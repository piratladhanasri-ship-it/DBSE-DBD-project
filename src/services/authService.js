import { api, withFallback, setToken } from './api';
import { demoAccounts, findUserByEmail, users } from '../data/users';

/** POST /api/auth/login */
export async function login({ email, password }) {
  return withFallback(
    () => api.post('/auth/login', { email, password }),
    () => {
      const account = demoAccounts.find(
        (a) => a.email.toLowerCase() === String(email).toLowerCase() && a.password === password
      );
      if (!account) {
        throw { status: 401, message: 'Invalid email or password. Try one of the demo accounts below.' };
      }
      const user = findUserByEmail(account.email);
      return { user, token: `mock.jwt.${user.id}.${Date.now()}` };
    }
  );
}

/** POST /api/auth/register */
export async function register({ name, email, password, role }) {
  return withFallback(
    () => api.post('/auth/register', { name, email, password, role }),
    () => {
      if (findUserByEmail(email)) {
        throw { status: 409, message: 'An account with this email already exists.' };
      }
      const user = {
        id: `u-${users.length + 1}`,
        name,
        email,
        role,
        status: 'active',
        joinedAt: new Date().toISOString().slice(0, 10),
        location: '—',
        rating: null,
        bidsPlaced: 0,
        auctionsWon: 0
      };
      return { user, token: `mock.jwt.${user.id}.${Date.now()}` };
    }
  );
}

/** GET /api/auth/me — used to restore a session from a stored JWT. */
export async function me() {
  return withFallback(() => api.get('/auth/me'), null, 0);
}

/** POST /api/auth/forgot-password */
export async function requestPasswordReset(email) {
  return withFallback(() => api.post('/auth/forgot-password', { email }), {
    message: `If an account exists for ${email}, a reset link has been sent.`
  });
}

/** POST /api/auth/change-password */
export async function changePassword(payload) {
  return withFallback(() => api.post('/auth/change-password', payload), { message: 'Password updated.' });
}

export function logout() {
  setToken(null);
  return api.post('/auth/logout').catch(() => null);
}