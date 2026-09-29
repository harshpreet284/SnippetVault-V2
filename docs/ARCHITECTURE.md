# SnippetVault V2 — Architecture Lock

## Locked Architecture

SnippetVault V2 upgrades the existing React frontend into a full-stack developer solution vault while preserving the existing visual design.

### Frontend
- React
- Vite
- Tailwind CSS
- React Router
- Redux Toolkit

The existing frontend is the visual source of truth. Do not redesign or replace the established macOS-inspired interface.

### Backend
- Node.js
- Express
- REST API
- Backend lives in a `server/` directory alongside the existing frontend `src/` directory.

### Database
- MongoDB Atlas
- Solutions are persisted in MongoDB rather than localStorage.

### Authentication
- Email + password authentication.
- JWT-based sessions are delivered through secure HTTP-only cookies.
- Do not store authentication JWTs in JavaScript-accessible localStorage.
- Backend must validate authenticated requests.
- Configure CORS and credentials correctly.

### AI
The primary AI feature is semantic search:
1. User enters a natural-language search query.
2. Backend sends the query to a supported Gemini embedding model.
3. The resulting vector is used with MongoDB Atlas Vector Search.
4. MongoDB returns semantically similar saved solutions.
5. Backend returns ranked results to React.

Use a currently supported Gemini embedding model. Prefer `gemini-embedding-2` where available and appropriate; do not hard-code deprecated models.

### Optional AI Feature
AI-assisted tag/technology suggestions may be added after semantic search is stable. This is secondary.

### Cost Constraint
Development targets a ₹0 budget using available free tiers. Do not assume paid API usage. Handle AI service failure gracefully.

### Data Flow
Create/update: React → Express REST API → authentication middleware → MongoDB

Semantic search: React → Express → Gemini embeddings → MongoDB Vector Search → Express → React

Authentication: React login/register → Express → password hashing + JWT cookie → authenticated API requests.

### Explicit Non-Goals
Do not add:
- AI chatbot
- AI code generator
- AI debugger
- AI code reviewer
- voice assistant
- generic RAG chatbot
- unnecessary AI features

The project remains focused on helping developers retrieve and organize solutions to technical problems they have previously encountered.
