# SnippetVault V2 — Architecture Decisions

## Decision 1 — Preserve Existing Frontend
Retain the existing frontend as the visual foundation. The UI was manually developed and should not be replaced with an unrelated redesign.

## Decision 2 — Add Backend Beside Existing Frontend
Use a `server/` directory alongside the existing React `src/` directory to minimize unnecessary restructuring.

## Decision 3 — MongoDB Atlas
Use MongoDB Atlas for persistent solution storage and Atlas Vector Search.

## Decision 4 — HTTP-Only Authentication Cookie
JWT authentication is delivered through a secure HTTP-only cookie rather than JavaScript-accessible localStorage.

## Decision 5 — Semantic Search as Main AI Feature
Use semantic retrieval to solve the core problem: finding previously saved technical solutions when the user remembers the concept but not the exact keywords.

## Decision 6 — Current Gemini Embedding Model
Keep the embedding model configurable and current. Prefer `gemini-embedding-2` when available and suitable.

## Decision 7 — Keep Keyword Search
Keyword search remains available because it is deterministic, cheap, explainable, and a fallback when AI is unavailable.

## Decision 8 — Optional AI Tag Suggestions
AI tag/technology suggestions are secondary and must not delay semantic search.

## Decision 9 — No Generic AI Chatbot
Do not add a chatbot because it does not directly strengthen the core problem and would increase implementation/interview complexity.
