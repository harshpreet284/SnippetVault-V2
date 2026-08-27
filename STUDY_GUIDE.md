# SnippetVault — Post-Build Study Guide

This document is for studying the project after implementation. Study what the final code actually contains; do not memorize this file instead of inspecting the implementation.

## 1. JavaScript/React
Study:
- React components
- props/state
- hooks
- useEffect/useMemo/useCallback where actually used
- controlled forms
- conditional rendering
- React Router
- Redux Toolkit
- async API calls
- loading/error states

Interview prompts:
- Why React?
- Why use Redux here?
- How does routing work?
- How does a form submit reach the backend?

## 2. HTTP & REST
Study:
- HTTP methods
- status codes
- request/response
- headers
- JSON
- REST endpoint design
- CORS

Interview prompts:
- PUT vs PATCH
- 401 vs 403
- What is CORS?
- Why separate frontend and backend?

## 3. Node & Express
Study:
- Node runtime
- Express middleware
- routes
- controllers
- services
- error handling
- async/await

Interview prompts:
- What happens when a request hits Express?
- What is middleware?
- Why keep AI logic in a service?

## 4. Authentication & Security
Study:
- password hashing
- bcrypt
- JWT structure
- authentication vs authorization
- protected routes
- ownership checks
- environment variables
- CORS
- input validation

Interview prompts:
- Why hash passwords?
- Why bcrypt?
- What is inside a JWT?
- Where should the JWT be validated?
- How do you stop User A accessing User B's solution?
- Why must the Gemini key stay server-side?

## 5. MongoDB
Study:
- documents/collections
- ObjectId
- Mongoose schemas/models
- indexes
- queries
- user-to-many-solutions relationship

Interview prompts:
- Why MongoDB instead of SQL?
- What is Mongoose?
- Why use userId instead of embedding all solutions inside the user?

## 6. Embeddings
Study:
- vector representation
- semantic similarity
- embedding dimensions
- query/document embeddings
- cosine similarity

Interview prompts:
- What is an embedding?
- Why does semantic search work when keywords differ?
- Why 768 dimensions?
- What is cosine similarity?

## 7. Vector Search
Study:
- vector indexes
- nearest-neighbor retrieval
- similarity score
- metadata/filter constraints
- MongoDB Atlas Vector Search

Interview prompts:
- How does semantic search work end-to-end?
- Where are vectors stored?
- Why not use a separate vector database?
- How do you ensure users only search their own data?

## 8. AI Failure & Cost
Study:
- API rate limits
- graceful degradation
- retries only where appropriate
- free-tier constraints
- secret management

Interview prompts:
- What happens if Gemini is unavailable?
- Does CRUD stop working?
- How do you prevent accidental paid usage?

## 9. Testing
Study the actual tests/checklists implemented.
Know:
- happy paths
- validation failures
- authentication failures
- authorization failures
- AI failure
- empty states

## 10. Deployment
Study the actual final hosting setup:
- environment variables
- frontend/backend URLs
- CORS
- MongoDB Atlas network access
- production builds

## Final Rule
For every technology on the resume, be able to answer:
1. Why did you use it?
2. What problem does it solve?
3. How does it work in this project?
4. What alternative could you have used?
5. What trade-off did you accept?
