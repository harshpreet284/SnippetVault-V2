import mongoose from 'mongoose';
import Solution from '../models/Solution.js';

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
 * Embedding generation will be added in Phase 7.
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
 * Embedding regeneration will be handled in Phase 7.
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
