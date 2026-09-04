# SnippetVault V2 — Post-Build Study Guide

This document is for studying the project after implementation. Study what the final code actually contains; do not memorize this file instead of inspecting the implementation.

## 1. JavaScript/React
Study:
- **React Components & Architecture:** The shift from local state to backend-integrated components.
- **Hooks & State:** `useState`, `useEffect`, `useMemo`, and controlled forms (e.g., in `src/components/Paste.jsx`).
- **React Router:** Protected routes (`src/components/ProtectedRoute.jsx`) and authentication-dependent navigation (`src/components/Navbar.jsx`).
- **Redux Toolkit:** Managing async API state using `createAsyncThunk` (`src/redux/pasteSlice.js` and `src/redux/authSlice.js`).
- **Loading & Error States:** Handling asynchronous UI transitions.

Interview prompts:
- Why React?
- Why use Redux Toolkit here instead of just React Context? *(Focus on async thunks for API calls)*
- How does routing work, and how do you protect a route from unauthenticated users?
- How does a form submit reach the backend?

## 2. HTTP & REST
Study:
- **HTTP Methods & Status Codes:** Proper use of GET, POST, PUT, DELETE, and returning semantic status codes (e.g., 200, 201, 401, 403, 404).
- **REST Endpoint Design:** Structured resources in `server/routes/solutions.js` and `server/routes/auth.js`.
- **CORS & Credentials:** The backend explicitly allows the frontend origin and requires `credentials: true` to support cross-origin authenticated requests during development.
- **REST Requests:** `src/api/client.js` centralization of `fetch` with `credentials: 'include'`.

Interview prompts:
- PUT vs PATCH?
- 401 Unauthorized vs 403 Forbidden vs 404 Not Found? *(Hint: we use 404 for missing or unowned resources to prevent data leakage)*
- What is CORS, and why is `credentials: true` critical in `server.js`?
- Why separate the frontend and backend into two different deployments?

## 3. Node & Express
Study:
- **Node Runtime:** Using Node.js for backend logic.
- **Express Middleware:** Request parsing (`express.json()`), cookie parsing (`cookie-parser`), and authentication (`server/middleware/authMiddleware.js`).
- **Routes & Controllers:** Mapping endpoints to logic (`server/routes/` to `server/controllers/`).
- **Services:** Isolating complex AI logic (`server/services/`) from HTTP request handling.
- **Async/Await & Error Handling:** Centralized error catching and asynchronous Mongoose operations.

Interview prompts:
- What happens when a request hits Express?
- What is middleware? Explain how the `protect` middleware intercepts a request.
- Why keep AI logic in a service rather than inside the controller?

## 4. Authentication & Security
Study:
- **Password Security:** Hashing passwords with bcrypt (`server/models/User.js`).
- **JWT Structure & Validation:** Issuing and verifying JSON Web Tokens.
- **httpOnly Cookies:** Delivering JWTs via secure, `httpOnly` cookies from `server/controllers/authController.js` to prevent JavaScript/XSS access.
- **Authentication vs Authorization:** Identifying the user (authn) vs ensuring they own the solution (authz).
- **Ownership Enforcement:** Using the trusted `req.user.id` from the JWT rather than a client-provided ID to query and modify data in `server/controllers/solutionsController.js`.
- **Environment Variables & Secret Boundaries:** Keeping `JWT_SECRET` and `GEMINI_API_KEY` strictly on the backend.

Interview prompts:
- Why hash passwords? Why use bcrypt?
- What is inside a JWT?
- Why deliver the JWT via an `httpOnly` cookie instead of storing it in `localStorage`?
- How do you stop User A from accessing User B's solution? *(Hint: `Solution.findOne({ _id, userId: req.user.id })`)*
- Why must the Gemini API key stay server-side?

## 5. MongoDB
Study:
- **Documents & Collections:** The `users` and `solutions` collections.
- **ObjectId & Mongoose Schemas:** Schema definitions and validation.
- **Relationships:** The one-to-many relationship linking a solution to a user via `userId`.
- **Schema Design:** Flattened references rather than embedding all solutions inside a single user document.

Interview prompts:
- Why MongoDB instead of SQL for this project?
- What is Mongoose?
- Why use a `userId` reference field instead of embedding an array of solutions inside the `users` document?

## 6. Embeddings
Study:
- **Vector Representation & Semantic Similarity:** Converting text meaning into numbers.
- **Gemini Embeddings:** Using `gemini-embedding-2` to generate 768-dimensional vectors.
- **Embedding Lifecycle:** Generating vectors synchronously on creation, and regenerating them only when searchable fields (title, problem, solution, tags, notes) are updated.

Interview prompts:
- What is an embedding?
- Why does semantic search work when the exact keywords differ?
- Why generate embeddings on the server instead of the client?

## 7. Vector Search
Study:
- **MongoDB Atlas Vector Search:** Using Atlas to index the `embedding` array field.
- **Cosine Similarity:** The mathematical distance metric used for ranking.
- **Vector Search Filtering:** Using a `userId` pre-filter within the vector search pipeline to ensure users only retrieve their own solutions.
- **Search Architecture:** Keyword search and filtering running alongside semantic search.

Interview prompts:
- How does semantic search work end-to-end in this project?
- Where are vectors stored? Why use MongoDB Atlas Vector Search instead of a separate vector database (like Pinecone)? *(Hint: Architecture simplicity and unified data/vector storage)*
- How do you ensure users only search their own data during a vector search?

## 8. AI Failure & Cost
Study:
- **AI Failure & Semantic-Search Fallback:** Preserving core CRUD functionality and falling back to keyword search/standard listing if the Gemini API fails or rate limits.
- **Graceful Degradation:** Handled in `server/controllers/solutionsController.js`.
- **Cost Considerations:** Developing within the Gemini API free-tier constraints.

Interview prompts:
- What happens if Gemini is unavailable? Does standard CRUD stop working?
- How do you prevent accidental paid API usage?
- When should you retry a failed AI request, and when should you just fail gracefully?

## 9. Testing
Study the actual tests/checklists performed during the project:
- **API Integration Tests:** Verifying CRUD operations and search logic.
- **Authentication Flows:** Testing valid logins, invalid credentials, and protected route rejection (401 status).
- **Authorization & Ownership:** Manually verifying cross-user access failures (404 status).
- **AI Fallback Testing:** Ensuring the app doesn't crash when embeddings fail.
- **Production Smoke Tests:** Verifying the live frontend, proxy, and backend.

Interview prompts:
- How do you test that user isolation actually works?
- What is the difference between testing `httpOnly` cookies in development vs production?

## 10. Deployment
Study the actual final hosting setup:
- **Vercel Frontend & Proxy:** The frontend deployed to Vercel, utilizing `vercel.json` to proxy `/api/*` requests to Render.
- **Production Authentication Behavior:** The Vercel reverse proxy ensures that requests to the backend appear as same-origin requests (`snippet-vault-v2.vercel.app/api/...`). This completely bypasses modern browser restrictions on cross-site/third-party cookies.
- **Render Backend:** The Express app deployed as a web service.
- **MongoDB Atlas Connectivity:** Network Access configured to accept the Render backend IPs, with production environment variables securely injected.

Interview prompts:
- Why did we need a Vercel `/api/*` rewrite proxy for production? *(Hint: Third-party cookie blocking)*
- How do environment variables securely flow into a Vercel/Render deployment?

## Final Rule
For every technology on the resume, be able to answer:
1. Why did you use it?
2. What problem does it solve?
3. How does it work in this project?
4. What alternative could you have used?
5. What trade-off did you accept?
