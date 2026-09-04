# SnippetVault V2 — Interview Question Bank

This document contains a curated list of interview questions derived directly from the implementation of SnippetVault V2. Use `STUDY_GUIDE.md` and the repository source code to prepare your answers.

## 1. Project Overview & Architecture
**Level 1 — Fundamentals**
- What is a MERN stack, and why is it a popular choice for full-stack applications?
- What is the difference between client-side persistence (localStorage) and server-side persistence?
- What are the distinct responsibilities of the frontend and the backend in this project?

**Level 2 — Implementation**
- Why was localStorage persistence replaced in SnippetVault V2?
- How did you integrate the new Node/Express backend alongside the existing React frontend without destroying the original project?
- How does the data flow from a user typing a search query to the final rendered list of solutions?

**Level 3 — Interview Defense**
- What would you change if the application scaled to 1 million solutions?
- If you had to rebuild this project from scratch today, would you use the exact same architecture? Why or why not?

## 2. React & Frontend State
**Level 1 — Fundamentals**
- What are React hooks? Explain `useState` and `useEffect`.
- What is Redux Toolkit, and how does it differ from traditional Redux?
- What is a controlled component in React?

**Level 2 — Implementation**
- Explain the React/Vite + Redux Toolkit architecture used in this project.
- How do you use `createAsyncThunk` to handle API state (loading, success, error) during solution CRUD operations?
- How does the `ProtectedRoute` component determine if a user is allowed to access a specific route?

**Level 3 — Interview Defense**
- Why did you choose Redux Toolkit for async API state handling instead of React Query or native React Context?
- If a user manually edits the Redux state in their browser dev tools to say `isAuthenticated: true`, will they gain access to protected backend data? Why or why not?

## 3. HTTP, REST & API Design
**Level 1 — Fundamentals**
- What are the standard HTTP methods used in REST APIs, and what do they represent?
- What is the difference between a 401 Unauthorized and a 403 Forbidden status code?
- What is CORS, and why do web browsers enforce it?

**Level 2 — Implementation**
- How does `src/api/client.js` centralize REST requests for the frontend?
- Why does the frontend fetch configuration require `credentials: 'include'`?
- Explain the route structure for the solutions API (`server/routes/solutions.js`).

**Level 3 — Interview Defense**
- Why do you return a 404 Not Found instead of a 403 Forbidden when a user tries to access a solution that belongs to another user?
- How does the backend CORS configuration restrict access while still allowing the frontend to send authenticated cookies?

## 4. Node & Express
**Level 1 — Fundamentals**
- What is Node.js, and how does it handle asynchronous I/O operations?
- What is Express middleware, and what is its purpose in the request lifecycle?
- How do you handle errors in an asynchronous Express route?

**Level 2 — Implementation**
- Walk through the Express request lifecycle from the moment `server.js` receives a request to the moment a controller sends a response.
- Explain the purpose of `express.json()` and `cookie-parser` in your application.
- How are Express routes, controllers, and services separated in this project?

**Level 3 — Interview Defense**
- Why did you isolate the Gemini AI logic into a dedicated service (`server/services/embeddingService.js`) rather than putting it directly inside the solutions controller?
- If an unhandled promise rejection occurs in one of your controllers, how does your centralized error handler catch it?

## 5. Authentication & Security
**Level 1 — Fundamentals**
- What is the difference between authentication and authorization?
- Why must passwords be hashed, and what is a salt?
- What is a JSON Web Token (JWT), and what are its three parts?

**Level 2 — Implementation**
- Walk through the JWT + `httpOnly` cookie authentication flow implemented in `authController.js`.
- Why does registration automatically authenticate the user in this project?
- How does the `protect` middleware (`server/middleware/authMiddleware.js`) validate the user's session?

**Level 3 — Interview Defense**
- User A changes the `userId` in the request body to User B's ID. What prevents unauthorized access?
- Why must the authenticated user identity always come strictly from the verified JWT rather than the client request body?
- What is an XSS attack, and how does using an `httpOnly` cookie protect your JWT from it?

## 6. MongoDB & Mongoose
**Level 1 — Fundamentals**
- How does a NoSQL document database like MongoDB differ from a relational database like PostgreSQL?
- What is an ObjectId?
- What is Mongoose, and why use it instead of the native MongoDB driver?

**Level 2 — Implementation**
- Explain the Mongoose schemas used in SnippetVault V2.
- How is the relationship between a User and their Solutions modeled in the database?
- How do you use Mongoose to enforce that a solution belongs to a specific user during a query?

**Level 3 — Interview Defense**
- Why did you use a `userId` reference field instead of embedding an array of solutions directly inside the `users` document?
- If the `solutions` collection grows massively, what indexes would you add to optimize the list and update operations?

## 7. Keyword Search & Filtering
**Level 1 — Fundamentals**
- What is deterministic search?
- How do you implement a basic text search query in MongoDB?

**Level 2 — Implementation**
- How are keyword search and attribute filters (technology, language, project) implemented in `solutionsController.js`?
- How does the frontend handle empty search results?

**Level 3 — Interview Defense**
- Why keep keyword search if semantic search exists?
- If a user searches for "React hooks", how does your keyword search differentiate from your semantic search approach?

## 8. Gemini Embeddings
**Level 1 — Fundamentals**
- What is a vector embedding in the context of machine learning?
- How do embeddings capture semantic meaning?
- Why are embeddings multi-dimensional?

**Level 2 — Implementation**
- Why did you choose the `gemini-embedding-2` model, and why exactly 768 dimensions?
- When are embeddings generated and regenerated in the solution lifecycle?
- Why are embeddings strictly generated server-side?

**Level 3 — Interview Defense**
- What searchable context (title, problem, solution, tags, notes) is included in the embedding string, and why did you choose those specific fields?
- What happens when Gemini embedding generation fails during solution creation?
- How would you prevent embedding generation from slowing down the user experience during a save operation? (e.g., synchronous vs asynchronous processing).

## 9. MongoDB Atlas Vector Search
**Level 1 — Fundamentals**
- What is nearest-neighbor retrieval?
- What is cosine similarity?

**Level 2 — Implementation**
- Explain how MongoDB Atlas Vector Search is utilized in this project.
- How do you pass the query embedding to the Atlas Vector Search pipeline?
- How is `userId` vector-search filtering applied to ensure data isolation?

**Level 3 — Interview Defense**
- Why use MongoDB Atlas Vector Search instead of a dedicated vector database like Pinecone or Weaviate?
- What would happen if two users search for the exact same phrase? Will they see the same results? Why or why not?

## 10. AI Failure, Performance & Cost
**Level 1 — Fundamentals**
- What is graceful degradation in software engineering?
- What are API rate limits?

**Level 2 — Implementation**
- Describe the semantic-search fallback behavior implemented in your controllers.
- How does the application ensure core CRUD operations survive if the Gemini API goes down?
- What AI cost considerations influenced the architecture?

**Level 3 — Interview Defense**
- If your application suddenly receives a massive spike in users, how does your embedding generation strategy impact your API rate limits?
- What happens if MongoDB Vector Search is unavailable or the index is rebuilding?

## 11. Deployment & Production
**Level 1 — Fundamentals**
- What is a reverse proxy?
- Why do you need environment variables in a production application?

**Level 2 — Implementation**
- Describe the production deployment architecture (Vercel, Render, MongoDB Atlas).
- How does the Vercel `/api/*` rewrite proxy work, and why was it introduced?
- How is MongoDB Atlas Network Access configured to ensure the Render backend can connect securely?

**Level 3 — Interview Defense**
- Why did production authentication initially fail even though the backend Express code and CORS configuration appeared correct in development?
- What are the strict security boundaries for your environment variables? Where do the JWT secret and Gemini API key live?

## 12. Debugging & Failure Scenarios
**Level 1 — Fundamentals**
- How do you read and interpret a backend stack trace?
- What tools do you use to debug network requests in the browser?

**Level 2 — Implementation**
- How did you verify that the `httpOnly` cookie was being correctly set and sent in production?
- Walk me through how you tested user isolation manually during the project.

**Level 3 — Interview Defense**
- You deploy a new version of the frontend and users report being immediately logged out. Walk me through your debugging steps.
- If a user reports that semantic search is returning completely irrelevant results, how would you investigate the issue?

## 13. Technical Decisions & Trade-offs
**Level 1 — Fundamentals**
- What is an architectural trade-off?

**Level 2 — Implementation**
- Why did you preserve the existing SnippetVault visual identity rather than replacing it with a generic SaaS template?
- Why did you defer building an AI chatbot or AI tag suggestions in favor of semantic search?

**Level 3 — Interview Defense**
- Looking back at the project, what is the weakest part of your architecture, and how would you fix it given more time?
- If you had a budget of $500/month for this project, what infrastructure components would you upgrade first?

## 14. Resume / Project Defense
*(These are direct, high-level questions an interviewer might open with)*
- "I see SnippetVault V2 on your resume. Tell me about the core problem it solves."
- "What was the most challenging technical hurdle you faced in this project, and how did you overcome it?"
- "Walk me through the architecture of the semantic search feature."
- "How did you ensure the security and privacy of user data in this application?"
