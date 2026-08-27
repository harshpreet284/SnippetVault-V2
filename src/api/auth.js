import { get, post } from './client';

/** POST /api/auth/register */
export const register = (name, email, password) =>
  post('/auth/register', { name, email, password });

/** POST /api/auth/login */
export const login = (email, password) =>
  post('/auth/login', { email, password });

/** POST /api/auth/logout */
export const logout = () =>
  post('/auth/logout');

/** GET /api/auth/me — used to restore session after page refresh */
export const getMe = () =>
  get('/auth/me');
