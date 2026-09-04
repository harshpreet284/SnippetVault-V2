# SnippetVault

SnippetVault is a full-stack developer problem-and-solution management platform. It helps developers preserve the context of technical problems they solve and retrieve previous solutions later.

## Problem
Developers repeatedly encounter technical problems they have already solved. Their previous fixes may be scattered across projects, notes, files, bookmarks, or old snippets. Exact keyword search is also weak when the wording of a new problem differs from the wording of the original solution.

## Solution
SnippetVault creates a private personal engineering memory. Users can record a technical problem, the solution, code, and project context securely in their vault. Later, they can retrieve semantically similar previous solutions by searching by keywords, filters, or natural-language meaning.

## Technology Stack & Production Architecture

### Frontend
- **Framework:** React + Vite
- **Styling:** Tailwind CSS
- **State Management:** Redux Toolkit
- **Routing:** React Router
- **Hosting:** Vercel
- **Proxy:** Vercel reverse proxy (`vercel.json` rewrites `/api/*` to the backend)

### Backend
- **Framework:** Node.js + Express
- **Hosting:** Render
- **Database:** MongoDB Atlas
- **AI Integration:** Google Gemini API (`gemini-embedding-2`)
- **Vector Search:** MongoDB Atlas Vector Search

## Features

### Authentication & Security
- **Authentication:** Registration and Login flows securely manage user access.
- **Password Hashing:** Passwords are hashed using `bcryptjs`.
- **JWT & Cookies:** Authentication uses JSON Web Tokens (JWT) delivered via secure, `httpOnly` cookies.
- **First-Party Proxy Architecture:** In production, the Vercel frontend proxies `/api/*` requests to the Render backend. This ensures the frontend and backend share the same origin, preventing cross-site/third-party cookie blocking and ensuring the `httpOnly` authentication cookie works flawlessly across modern browsers.

### CRUD & Ownership
- Users can create, read, update, and delete their stored solutions.
- **Data Isolation:** All operations are strictly authorized on the backend to guarantee users can only access their own solutions. Cross-user data access is actively blocked.

### Search
- **Keyword Search:** Traditional deterministic text-matching and filtering (by technology, language, project, or tags). Serves as a fast fallback when AI is unavailable.
- **Semantic Search:** Users can search by meaning using natural language. The backend uses the Gemini API to generate embeddings from the query, and MongoDB Atlas Vector Search retrieves semantically similar solutions.

## Local Development Setup

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas account (with a cluster and Vector Search index configured)
- Gemini API key

### Environment Variables

#### Backend (`server/.env`)
**NEVER commit this file to version control.**
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=a_long_random_secret_string
JWT_EXPIRES_IN=7d
GEMINI_API_KEY=your_gemini_api_key
GEMINI_EMBEDDING_MODEL=gemini-embedding-2
```

#### Frontend (`.env`)
```env
VITE_API_URL=http://localhost:5000/api
```

### Running Locally
1. **Backend:**
   ```bash
   cd server
   npm install
   npm run dev
   ```
2. **Frontend:**
   ```bash
   npm install
   npm run dev
   ```

## Production Deployment Overview

1. **MongoDB Atlas:** 
   - Deploy a MongoDB cluster.
   - Configure Network Access to allow IPs from the Render backend.
   - Create a Vector Search Index on the `solutions` collection mapping the `embedding` array field (768 dimensions, cosine similarity).
2. **Render (Backend):**
   - Deploy the `server/` directory as a Web Service.
   - Set environment variables in the Render dashboard (`NODE_ENV=production`, `CLIENT_URL=https://your-frontend.vercel.app`, `MONGODB_URI`, `JWT_SECRET`, `GEMINI_API_KEY`, etc.).
3. **Vercel (Frontend):**
   - Deploy the repository root to Vercel.
   - Set the `VITE_API_URL` environment variable to `/api`.
   - Vercel uses `vercel.json` to automatically proxy `/api/*` requests to the Render backend domain, solving cross-origin authentication issues.

### ⚠️ Important Security Notes
- **Never commit `.env` files.**
- **Never expose server-side secrets** (like `MONGODB_URI` or `JWT_SECRET`) to the public or check them into git.
- **Never put the Gemini API key in the frontend.** The Gemini API is strictly accessed from the Node.js backend to prevent key theft.

## Current Project Status
**Phases 0–9 have been implemented and production-smoke-tested.**
The core problems of data persistence, HTTP-only authentication, CRUD ownership, keyword filtering, Gemini-powered semantic vector search, and deployment proxy configuration are completed and functional.

## Original Repository
https://github.com/harshpreet284/SnippetVault
