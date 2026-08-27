# SnippetVault V2 — API Specification

## Authentication
- `POST /api/auth/register` — create account
- `POST /api/auth/login` — authenticate and issue JWT through secure HTTP-only cookie
- `POST /api/auth/logout` — clear authentication cookie
- `GET /api/auth/me` — return authenticated user

Authentication cookies must not be readable through client-side JavaScript.

## Solutions
- `GET /api/solutions` — return authenticated user's solutions
- `GET /api/solutions/:id` — return one owned solution
- `POST /api/solutions` — create solution
- `PUT /api/solutions/:id` — update owned solution
- `DELETE /api/solutions/:id` — delete owned solution

## Search
- `GET /api/solutions/search` — keyword/filter or semantic search
- Semantic search generates a Gemini query embedding and uses MongoDB Atlas Vector Search.
- If semantic search is unavailable, provide a controlled keyword fallback or recoverable error.

## Security
- Authenticate private solution endpoints.
- Users can only access their own solutions.
- Validate request bodies server-side.
- Hash passwords; never store plaintext passwords.
- Never expose JWT secrets or Gemini API keys to the frontend.
- Configure CORS explicitly.
