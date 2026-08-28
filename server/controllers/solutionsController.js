import mongoose from 'mongoose';
import Solution from '../models/Solution.js';
import { generateEmbedding, buildEmbeddingText } from '../services/embeddingService.js';

// ─── Constants ────────────────────────────────────────────────────────────────

/**
 * Fields the client is allowed to set on create or update.
 * userId, embedding, _id, createdAt, and updatedAt are NEVER accepted from
 * the client — they are assigned by the server.
 */
const WRITABLE_FIELDS = [
  'title',
  'problem',
  'solution',
  'code',
  'technology',
  'language',
  'tags',
  'project',
  'notes',
  'sourceUrl',
];

/** Required fields that must be non-empty strings. */
const REQUIRED_FIELDS = ['title', 'problem', 'solution'];

/**
 * Fields whose change warrants regenerating the solution embedding.
 * Mirrors buildEmbeddingText() source fields (DATABASE_SCHEMA.md §5).
 */
const EMBEDDING_FIELDS = ['title', 'problem', 'solution', 'technology', 'language', 'tags', 'project', 'notes'];

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Extracts only WRITABLE_FIELDS from req.body and trims string values.
 * Fields not in the whitelist are silently dropped.
 */
const pickWritableFields = (body) => {
  const result = {};
  for (const field of WRITABLE_FIELDS) {
    if (body[field] !== undefined) {
      result[field] = typeof body[field] === 'string' ? body[field].trim() : body[field];
    }
  }
  return result;
};

/**
 * Returns true if the string is a structurally valid MongoDB ObjectId.
 * Used to return 404 (not 500) for malformed IDs before hitting the DB.
 */
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

/**
 * Escapes special regex metacharacters in a user-supplied string.
 * Prevents regex injection when building case-insensitive MongoDB queries.
 *
 * Example: 'a.b*c' → 'a\.b\*c'
 */
const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Validates the tags field when present in req.body.
 * Returns an error message string if invalid, or null if valid.
 */
const validateTags = (tags) => {
  if (!Array.isArray(tags)) return 'tags must be an array.';
  if (!tags.every((t) => typeof t === 'string')) return 'Each tag must be a string.';
  return null;
};

/**
 * Validates a URL string when present.
 * Mirrors the Mongoose schema validator so errors surface before the DB call.
 */
const validateUrl = (url) => {
  if (!url) return null;
  if (!/^https?:\/\/.+/.test(url)) return 'sourceUrl must be a valid http or https URL.';
  return null;
};

// ─── Embedding helpers ───────────────────────────────────────────────────────

/**
 * Attempts to generate and store an embedding for a solution document.
 * Fire-and-forget: called without await so it never blocks the API response.
 * All errors are caught and logged; a Gemini failure must not crash the app
 * or prevent solutions from being saved (AI_SPEC.md §Failure Handling).
 *
 * @param {mongoose.Types.ObjectId} solutionId
 * @param {object} fields — plain object of solution fields for buildEmbeddingText
 */
const tryGenerateAndStoreEmbedding = async (solutionId, fields) => {
  try {
    const text = buildEmbeddingText(fields);
    if (!text) return; // nothing to embed (all optional fields empty)
    const embedding = await generateEmbedding(text);
    await Solution.findByIdAndUpdate(solutionId, { embedding });
    console.log(`[embedding] Stored for solution ${solutionId} (${embedding.length} dims)`);
  } catch (err) {
    // Non-fatal — solution is already saved; embedding can be regenerated later
    console.warn(`[embedding] Failed for solution ${solutionId}:`, err.message);
  }
};

// ─── Controllers ──────────────────────────────────────────────────────────────

/**
 * GET /api/solutions
 *
 * Returns all solutions belonging to the authenticated user, newest first.
 * Embedding is excluded from results (select: false in schema).
 */
export const listSolutions = async (req, res, next) => {
  try {
    const solutions = await Solution.find({ userId: req.user.id }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: solutions });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/solutions/search
 *
 * Keyword search and filter across the authenticated user's solutions.
 * All results are scoped to req.user.id — users cannot search each other's data.
 *
 * Query parameters (all optional, all combined with AND logic):
 *   q          — free-text keyword; matched case-insensitively against title,
 *                problem, solution, technology, language, project, and notes.
 *   technology — exact (case-insensitive) match on the technology field.
 *   language   — exact (case-insensitive) match on the language field.
 *   project    — exact (case-insensitive) match on the project field.
 *   tag        — a single tag value that must appear in the tags array
 *                (case-insensitive element match).
 *
 * Returns the same shape as listSolutions: { success: true, data: [...] }
 * Returns an empty array (not 404) when no results match — that is a valid
 * search outcome, not an error.
 *
 * Route must be registered BEFORE /:id so Express does not treat the literal
 * string "search" as a MongoDB ObjectId parameter.
 */
export const keywordSearch = async (req, res, next) => {
  try {
    const { q, technology, language, project, tag } = req.query;

    // ── Parameter length guard ────────────────────────────────────────────────
    // Prevents excessively large regex patterns from reaching MongoDB.
    const MAX_PARAM_LENGTH = 200;
    for (const [key, val] of Object.entries({ q, technology, language, project, tag })) {
      if (val && val.length > MAX_PARAM_LENGTH) {
        return res.status(400).json({
          success: false,
          message: `Query parameter "${key}" exceeds the maximum allowed length of ${MAX_PARAM_LENGTH} characters.`,
        });
      }
    }

    // ── Build the MongoDB filter ──────────────────────────────────────────────
    // Always scope to the authenticated user's data.
    const filter = { userId: req.user.id };

    // Free-text keyword: partial, case-insensitive match across 7 searchable fields.
    if (q && q.trim()) {
      const re = new RegExp(escapeRegex(q.trim()), 'i');
      filter.$or = [
        { title: re },
        { problem: re },
        { solution: re },
        { technology: re },
        { language: re },
        { project: re },
        { notes: re },
      ];
    }

    // Exact (case-insensitive) match on discrete filter fields.
    // Using anchored regex (^ … $) so "react" doesn't match "react-native".
    if (technology && technology.trim()) {
      filter.technology = new RegExp(`^${escapeRegex(technology.trim())}$`, 'i');
    }
    if (language && language.trim()) {
      filter.language = new RegExp(`^${escapeRegex(language.trim())}$`, 'i');
    }
    if (project && project.trim()) {
      filter.project = new RegExp(`^${escapeRegex(project.trim())}$`, 'i');
    }

    // Tag match: at least one element in the tags array must equal the supplied
    // tag value (case-insensitive, anchored).
    if (tag && tag.trim()) {
      filter.tags = {
        $elemMatch: { $regex: new RegExp(`^${escapeRegex(tag.trim())}$`, 'i') },
      };
    }

    // ── Execute query ─────────────────────────────────────────────────────────
    const solutions = await Solution.find(filter).sort({ createdAt: -1 });

    return res.status(200).json({ success: true, data: solutions });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/solutions/:id
 *
 * Returns one solution only if it belongs to the authenticated user.
 * Returns 404 for both "not found" and "belongs to another user" — intentionally
 * indistinguishable to prevent leaking information about other users' data.
 */
export const getSolution = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(404).json({ success: false, message: 'Solution not found.' });
    }

    const solution = await Solution.findOne({ _id: id, userId: req.user.id });
    if (!solution) {
      return res.status(404).json({ success: false, message: 'Solution not found.' });
    }

    return res.status(200).json({ success: true, data: solution });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/solutions
 *
 * Creates a new solution for the authenticated user.
 * userId is always sourced from the verified JWT — never from req.body.
 * Phase 7: triggers non-blocking embedding generation after document creation.
 */
export const createSolution = async (req, res, next) => {
  try {
    // ── Required field validation ─────────────────────────────────────────────
    const missing = REQUIRED_FIELDS.filter(
      (f) => !req.body[f] || (typeof req.body[f] === 'string' && !req.body[f].trim())
    );
    if (missing.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing or empty required fields: ${missing.join(', ')}.`,
      });
    }

    // ── Optional field validation ─────────────────────────────────────────────
    if (req.body.tags !== undefined) {
      const tagError = validateTags(req.body.tags);
      if (tagError) return res.status(400).json({ success: false, message: tagError });
    }

    if (req.body.sourceUrl) {
      const urlError = validateUrl(req.body.sourceUrl);
      if (urlError) return res.status(400).json({ success: false, message: urlError });
    }

    // ── Pick only allowed fields — userId always from JWT ─────────────────────
    const fields = pickWritableFields(req.body);

    const solution = await Solution.create({
      ...fields,
      userId: req.user.id, // ownership assigned by server — never trusted from client
    });

    // Phase 7: generate and store embedding — non-blocking, failure is non-fatal
    // (AI_SPEC.md §Failure Handling: save the solution regardless of AI availability)
    tryGenerateAndStoreEmbedding(solution._id, fields);

    return res.status(201).json({ success: true, data: solution });
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ success: false, message: err.message });
    }
    next(err);
  }
};

/**
 * PUT /api/solutions/:id
 *
 * Updates a solution — only if it belongs to the authenticated user.
 * Accepts only WRITABLE_FIELDS. userId, embedding, and timestamps are ignored.
 * Validates updated values before writing.
 * Phase 7: regenerates embedding non-blocking if any searchable field changed.
 */
export const updateSolution = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(404).json({ success: false, message: 'Solution not found.' });
    }

    // ── Validate optional fields ──────────────────────────────────────────────
    if (req.body.tags !== undefined) {
      const tagError = validateTags(req.body.tags);
      if (tagError) return res.status(400).json({ success: false, message: tagError });
    }

    if (req.body.sourceUrl) {
      const urlError = validateUrl(req.body.sourceUrl);
      if (urlError) return res.status(400).json({ success: false, message: urlError });
    }

    // ── Build update object ───────────────────────────────────────────────────
    const updates = pickWritableFields(req.body);

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one valid field must be provided to update.',
      });
    }

    // Disallow setting required fields to empty strings
    for (const field of REQUIRED_FIELDS) {
      if (updates[field] !== undefined && updates[field] === '') {
        return res.status(400).json({
          success: false,
          message: `${field} cannot be empty.`,
        });
      }
    }

    // ── Update with ownership check ───────────────────────────────────────────
    // If the solution doesn't exist or belongs to another user, null is returned.
    const solution = await Solution.findOneAndUpdate(
      { _id: id, userId: req.user.id },
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!solution) {
      return res.status(404).json({ success: false, message: 'Solution not found.' });
    }

    // Phase 7: regenerate embedding if any searchable field changed (AI_SPEC.md)
    const needsRegen = EMBEDDING_FIELDS.some((f) => updates[f] !== undefined);
    if (needsRegen) {
      tryGenerateAndStoreEmbedding(solution._id, solution.toObject());
    }

    return res.status(200).json({ success: true, data: solution });
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ success: false, message: err.message });
    }
    next(err);
  }
};

/**
 * DELETE /api/solutions/:id
 *
 * Deletes a solution — only if it belongs to the authenticated user.
 * Returns 404 for both "not found" and "another user's solution" cases.
 */
export const deleteSolution = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(404).json({ success: false, message: 'Solution not found.' });
    }

    const solution = await Solution.findOneAndDelete({ _id: id, userId: req.user.id });

    if (!solution) {
      return res.status(404).json({ success: false, message: 'Solution not found.' });
    }

    return res.status(200).json({ success: true, message: 'Solution deleted.' });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/solutions/search?mode=semantic&q=<query>
 * (dispatched by searchController when mode=semantic)
 *
 * Semantic search flow (ARCHITECTURE.md §AI, AI_SPEC.md):
 *   1. Validate query string.
 *   2. Generate query embedding via Gemini (gemini-embedding-2, 768 dims).
 *   3. Run MongoDB Atlas $vectorSearch with userId ownership filter.
 *   4. Return ranked results.
 *
 * Graceful fallback (AI_SPEC.md §Failure Handling):
 *   - If GEMINI_API_KEY is missing → keyword fallback.
 *   - If Gemini API fails          → keyword fallback.
 *   - If Atlas index not ready     → keyword fallback.
 *   In all fallback cases the response is 200 with keyword results;
 *   the client is informed via searchMode:'keyword_fallback'.
 *
 * Ownership: userId filter is applied INSIDE $vectorSearch so Atlas
 * pre-filters candidates before computing cosine similarity — users
 * can never retrieve another user's solutions (DATABASE_SCHEMA.md §8).
 */
export const semanticSearch = async (req, res, next) => {
  try {
    const { q } = req.query;

    // ── Validate query ───────────────────────────────────────────────────────
    if (!q || !q.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Query parameter "q" is required for semantic search.',
      });
    }
    if (q.length > 500) {
      return res.status(400).json({
        success: false,
        message: 'Query parameter "q" exceeds the maximum allowed length of 500 characters.',
      });
    }

    const query = q.trim();
    const userId = new mongoose.Types.ObjectId(req.user.id);

    // ── Generate query embedding ─────────────────────────────────────────────
    let queryVector;
    try {
      queryVector = await generateEmbedding(query);
    } catch (embeddingErr) {
      console.warn('[semanticSearch] Embedding generation failed — keyword fallback:', embeddingErr.message);
      return fallbackToKeyword(res, userId, query, 'Embedding unavailable: ' + embeddingErr.message);
    }

    // ── Atlas Vector Search ──────────────────────────────────────────────────
    // Index name: solution_embedding_index (must be created manually in Atlas UI)
    // Filter by userId enforces per-user ownership at the Atlas query level.
    try {
      const results = await Solution.aggregate([
        {
          $vectorSearch: {
            index: 'solution_embedding_index',
            path: 'embedding',
            queryVector,
            numCandidates: 100,
            limit: 20,
            filter: { userId },
          },
        },
        {
          $project: {
            _id: 1, title: 1, problem: 1, solution: 1, code: 1,
            technology: 1, language: 1, tags: 1, project: 1,
            notes: 1, sourceUrl: 1, createdAt: 1, updatedAt: 1, userId: 1,
            score: { $meta: 'vectorSearchScore' }
          },
        },
      ]);

      return res.status(200).json({ success: true, data: results, searchMode: 'semantic' });
    } catch (vectorErr) {
      console.warn('[semanticSearch] Atlas Vector Search failed — keyword fallback:', vectorErr.message);
      return fallbackToKeyword(res, userId, query, 'Vector index unavailable: ' + vectorErr.message);
    }
  } catch (err) {
    next(err);
  }
};

/**
 * Internal helper — executes a simple keyword search and returns the results
 * as a keyword_fallback response. Used only by semanticSearch error paths.
 *
 * @param {Response}              res
 * @param {mongoose.Types.ObjectId} userId
 * @param {string}                query   — original user query
 * @param {string}                reason  — human-readable fallback reason
 */
const fallbackToKeyword = async (res, userId, query, reason) => {
  const re = new RegExp(escapeRegex(query), 'i');
  const solutions = await Solution.find({
    userId,
    $or: [
      { title: re }, { problem: re }, { solution: re },
      { technology: re }, { language: re }, { project: re }, { notes: re },
    ],
  }).sort({ createdAt: -1 });

  return res.status(200).json({
    success: true,
    data: solutions,
    searchMode: 'keyword_fallback',
    fallbackReason: reason,
  });
};

/**
 * Route dispatcher for GET /api/solutions/search.
 * Delegates to semanticSearch when mode=semantic, otherwise to keywordSearch.
 * This is the handler registered in solutions.js routes (Phase 7).
 */
export const searchController = async (req, res, next) => {
  if (req.query.mode === 'semantic') {
    return semanticSearch(req, res, next);
  }
  return keywordSearch(req, res, next);
};
