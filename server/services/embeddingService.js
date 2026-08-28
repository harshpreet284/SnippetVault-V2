import { GoogleGenAI } from '@google/genai';

/**
 * Embedding Service — AI_SPEC.md, ARCHITECTURE.md §AI, DATABASE_SCHEMA.md §5
 *
 * Generates 768-dimensional vector embeddings using the Gemini API.
 *
 * Model:       gemini-embedding-2 (GA April 22 2026, free tier)
 *              Configurable via GEMINI_EMBEDDING_MODEL env var (AI_SPEC.md).
 * Dimensions:  768 — must match the MongoDB Atlas Vector Search index
 *              (DATABASE_SCHEMA.md §7). Truncated via Matryoshka Representation
 *              Learning from the model's native 3072-dim output.
 * SDK:         @google/genai — GoogleGenAI class (current official JS SDK)
 *
 * API usage (from official docs, embeddings page — verified August 2026):
 *   const ai   = new GoogleGenAI({ apiKey });
 *   const resp = await ai.models.embedContent({
 *     model:    'gemini-embedding-2',
 *     contents: text,
 *     config:   { outputDimensionality: 768 },
 *   });
 *   const vector = resp.embeddings[0].values; // float[], length 768
 *
 * SECURITY: GEMINI_API_KEY is read here on the server ONLY.
 * It is NEVER returned to the client, logged, or exposed in any API response.
 */

// ─── Configuration ────────────────────────────────────────────────────────────

/** Embedding model — configurable, default: gemini-embedding-2 (AI_SPEC.md). */
const EMBEDDING_MODEL = process.env.GEMINI_EMBEDDING_MODEL || 'gemini-embedding-2';

/** Output dimensions — must match MongoDB Atlas Vector Search index (DATABASE_SCHEMA.md §7). */
const OUTPUT_DIMENSIONALITY = 768;

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Builds the combined text used as embedding input from Solution fields.
 *
 * Source fields per DATABASE_SCHEMA.md §5:
 *   title, problem, solution, technology, language, tags, project, notes
 *
 * The `code` field is intentionally excluded — DATABASE_SCHEMA.md §5 states
 * "code is not required to be the primary semantic source" and warns it should
 * not dominate the text representation.
 *
 * @param {object} fields — object containing any subset of Solution fields
 * @returns {string}      — newline-joined embedding text (may be empty string)
 */
export const buildEmbeddingText = (fields = {}) => {
  const parts = [];
  if (fields.title)    parts.push(fields.title);
  if (fields.problem)  parts.push(fields.problem);
  if (fields.solution) parts.push(fields.solution);
  if (fields.technology) parts.push(fields.technology);
  if (fields.language)   parts.push(fields.language);
  if (Array.isArray(fields.tags) && fields.tags.length > 0)
    parts.push(fields.tags.join(' '));
  if (fields.project) parts.push(fields.project);
  if (fields.notes)   parts.push(fields.notes);
  return parts.join('\n').trim();
};

// ─── Core API ─────────────────────────────────────────────────────────────────

/**
 * Generates a 768-dimensional embedding vector for the given text string.
 *
 * @param {string} text — input text to embed (non-empty)
 * @returns {Promise<number[]>} 768-element float array
 * @throws {Error} — if GEMINI_API_KEY is missing, invalid, or the API call fails.
 *                   Callers MUST wrap this in try/catch. Failures must not propagate
 *                   to the client (AI_SPEC.md §Failure Handling).
 */
export const generateEmbedding = async (text) => {
  // ── Guard: key must be configured ───────────────────────────────────────────
  const apiKey = process.env.GEMINI_API_KEY;
  if (
    !apiKey ||
    apiKey.trim() === '' ||
    apiKey === 'replace_with_your_gemini_api_key'
  ) {
    throw new Error('GEMINI_API_KEY is not configured. Embedding generation skipped.');
  }

  // ── Call Gemini embedContent ─────────────────────────────────────────────────
  const ai = new GoogleGenAI({ apiKey });

  const result = await ai.models.embedContent({
    model:    EMBEDDING_MODEL,
    contents: text,
    config:   { outputDimensionality: OUTPUT_DIMENSIONALITY },
  });

  // result.embeddings is an array — [0] corresponds to our single input
  return result.embeddings[0].values; // float[], length 768
};
