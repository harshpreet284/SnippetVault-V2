import { get, post, put, del } from './client';

/** GET /api/solutions */
export const fetchSolutions = () =>
  get('/solutions');

/** GET /api/solutions/:id */
export const fetchSolution = (id) =>
  get(`/solutions/${id}`);

/** POST /api/solutions */
export const createSolution = (payload) =>
  post('/solutions', payload);

/** PUT /api/solutions/:id */
export const updateSolution = (id, payload) =>
  put(`/solutions/${id}`, payload);

/** DELETE /api/solutions/:id */
export const deleteSolution = (id) =>
  del(`/solutions/${id}`);
