# SnippetVault V2 — AI Specification

## Primary AI Feature: Semantic Search

Keyword search requires users to remember the same words used when a solution was saved. Semantic search allows retrieval by meaning.

Example:
Saved: "JWT token disappears from Redux state after page refresh."
Search: "authentication state is lost when I reload the React app"

The system should identify the saved solution as relevant despite different wording.

## Implementation
1. Accept the natural-language query in the backend.
2. Generate an embedding using a currently supported Gemini embedding model.
3. Search stored solution embeddings with MongoDB Atlas Vector Search.
4. Return ranked semantically similar solutions.
5. Display results using the existing SnippetVault card visual language.

## Embeddings
Preferred current model: `gemini-embedding-2`, subject to current API availability and free-tier suitability.

The model identifier must be configurable through environment variables.

Generate embeddings from useful fields such as title, problem, solution, technology, language, tags, and notes.

Never embed passwords, authentication tokens, API keys, or unrelated private data.

## Failure Handling
If Gemini is unavailable or embedding generation fails:
- save the solution where appropriate
- return a controlled response
- do not crash the frontend
- retain normal keyword search as a fallback

## Optional Secondary AI Feature
AI-assisted tag/technology suggestions may be implemented after semantic search is stable.

## AI Non-Goals
No chatbot, code generator, debugger, code reviewer, generic RAG assistant, or voice assistant.
