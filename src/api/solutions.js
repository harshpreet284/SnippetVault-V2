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

/**
 * GET /api/solutions/search
 *
 * Sends a keyword/filter search to the backend.
 * Only params with non-empty values are appended to the query string.
 *
 * @param {{ q?: string, technology?: string, language?: string, project?: string, tag?: string }} params
 */
export const searchSolutions = (params = {}) => {
  const qs = new URLSearchParams();
  if (params.q          && params.q.trim())          qs.set('q',          params.q.trim());
  if (params.technology && params.technology.trim()) qs.set('technology',  params.technology.trim());
  if (params.language   && params.language.trim())   qs.set('language',    params.language.trim());
  if (params.project    && params.project.trim())    qs.set('project',     params.project.trim());
  if (params.tag        && params.tag.trim())        qs.set('tag',         params.tag.trim());
  return get(`/solutions/search?${qs.toString()}`);
};

/**
 * GET /api/solutions/search?mode=semantic&q=<query>
 *
 * Semantic search — backend generates a Gemini embedding for the query and
 * runs MongoDB Atlas Vector Search against the authenticated user's solutions.
 * Falls back to keyword search on the same endpoint if Gemini or Atlas is
 * unavailable (handled server-side; client receives 200 in all cases).
 *
 * @param {string} q — natural-language query
 */
export const semanticSearchSolutions = (q) =>
  get(`/solutions/search?mode=semantic&q=${encodeURIComponent(q.trim())}`);

