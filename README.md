# SnippetVault

SnippetVault is a full-stack developer problem-and-solution vault that helps developers preserve the context of technical problems they solve and retrieve previous solutions later.

## Problem
Developers often solve the same class of technical problems repeatedly, but previous fixes can become scattered across projects, notes, snippets, and bookmarks. Exact keyword search also fails when a new problem is described differently from the original.

## Solution
SnippetVault stores:
- Problem
- Solution
- Code
- Technology
- Language
- Tags
- Project
- Notes
- Source

Users can retrieve solutions through:
- Keyword search
- Filters
- AI-powered semantic search

## Core AI Feature
Semantic search converts saved solution context and natural-language queries into embeddings. MongoDB Atlas Vector Search retrieves semantically similar solutions.

The AI feature is retrieval-focused; SnippetVault is not a chatbot.

## Architecture
React + Tailwind CSS + React Router + Redux Toolkit
→ Node.js + Express
→ MongoDB Atlas

Semantic search additionally uses:
Gemini embeddings → MongoDB Atlas Vector Search

## Security
- JWT authentication
- bcrypt password hashing
- server-side validation
- ownership checks
- environment-based secrets
- Gemini key kept server-side

## Cost Constraint
The project is designed to use the Gemini API Free tier and free-tier hosting/services where available. No automatic paid API fallback is permitted.

## Development
The existing SnippetVault frontend is preserved and extended rather than replaced.

Before running the application, configure the environment variables documented in the project setup files.

## Study
See STUDY_GUIDE.md for the topics to study after implementation.
See DECISIONS.md for architecture decisions.
See API_SPEC.md for backend contracts.
See AI_SPEC.md for semantic-search behavior.

## Original Repository
https://github.com/harshpreet284/SnippetVault
