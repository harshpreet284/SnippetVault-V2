# SnippetVault V2 — Final Technical Decisions

### Decision: Project Structure & Stack
**Choice:** React/Vite frontend with an Express/Node backend alongside it (`server/`), using MongoDB Atlas for storage (MERN-style stack).
**Reason:** Minimizes unnecessary restructuring by building on top of the existing React codebase while adding a robust backend.
**Status:** Accepted

### Decision: Frontend Design Preservation
**Choice:** Retain the existing SnippetVault visual identity rather than replacing it with a generic AI/SaaS redesign.
**Reason:** The UI was manually developed and tested; evolving it preserves the project's identity while integrating new full-stack features.
**Status:** Accepted

### Decision: Authentication Architecture
**Choice:** Use bcrypt for password hashing, JWT for authentication, and deliver the session via an `httpOnly` cookie rather than storing JWTs in localStorage.
**Reason:** Storing JWTs in JavaScript-accessible `localStorage` is vulnerable to XSS. An `httpOnly` cookie provides a secure, modern authentication baseline.
**Status:** Accepted

### Decision: Production API Proxy Architecture
**Choice:** Use a Vercel frontend rewrite (`/api/*`) to proxy requests to the Render backend.
**Reason:** Ensures production browser requests remain same-origin from the frontend's perspective. This prevents modern browsers from silently blocking the `httpOnly` authentication cookie due to strict third-party cookie/tracking policies.
**Status:** Accepted

### Decision: CORS Configuration
**Choice:** The backend explicitly allows the configured frontend origin (via `CLIENT_URL`) and supports credentials (`credentials: true`); local and production origins are environment-specific.
**Reason:** Secures the backend by rejecting unauthorized cross-origin requests while ensuring the browser is permitted to send the authentication cookie during cross-origin local development.
**Status:** Accepted

### Decision: Solution Ownership & Isolation
**Choice:** The authenticated user identity always comes strictly from the verified JWT on the backend. Clients cannot choose or override the `userId`.
**Reason:** Prevents authorization bypass. Every solution operation enforces ownership, ensuring strict isolation between users.
**Status:** Accepted

### Decision: Search Architecture
**Choice:** Keyword search remains actively available alongside semantic search rather than replacing it.
**Reason:** Keyword search is deterministic, cheap, explainable, and serves as an essential fallback mechanism.
**Status:** Accepted

### Decision: Semantic Embeddings
**Choice:** Generate 768-dimensional vectors server-side using Google's `gemini-embedding-2` model.
**Reason:** Provides high-quality natural language understanding to retrieve previous solutions when exact keywords differ. Server-side generation prevents the Gemini API key from being exposed to the frontend.
**Status:** Accepted

### Decision: Vector Search Implementation
**Choice:** Use MongoDB Atlas Vector Search with cosine similarity and a pre-filter on `userId`.
**Reason:** Eliminates the need for a separate vector database by keeping embeddings alongside the application data. The `userId` filter ensures strict cross-user data isolation during vector retrieval.
**Status:** Accepted

### Decision: Embedding Lifecycle
**Choice:** Generate embeddings for new solutions, and regenerate them when searchable content changes.
**Reason:** Balances retrieval freshness with API cost constraints.
**Status:** Accepted

### Decision: Graceful Semantic-Search Failure
**Choice:** Preserve the implemented fallback behavior when vector search is unavailable.
**Reason:** AI should enhance the retrieval experience, not act as a single point of failure that breaks core CRUD functionality.
**Status:** Accepted

### Decision: Deployment Architecture
**Choice:** Deploy the frontend to Vercel, the backend to Render, the database to MongoDB Atlas, and use the Gemini API.
**Reason:** Satisfies the zero-cost budget constraint by utilizing generous free tiers across reliable, modern platforms while maintaining separation of concerns.
**Status:** Accepted

### Decision: Optional AI Tag Suggestions (Deferred)
**Choice:** AI tag/technology suggestions are considered secondary and deferred.
**Reason:** They must not delay or complicate the primary semantic search implementation.
**Status:** Accepted

### Decision: No Generic AI Chatbot
**Choice:** Do not add a conversational chatbot.
**Reason:** A chatbot does not directly strengthen the core problem of solution retrieval and would unnecessarily increase implementation and interview complexity.
**Status:** Accepted
