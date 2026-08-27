# SnippetVault — Product Requirements Document

## 1. Product Summary
SnippetVault is a full-stack developer problem-and-solution management platform. Instead of storing only isolated code snippets, users record the technical problem, the solution, code, and project context so they can retrieve their own previous solutions later.

## 2. Problem
Developers repeatedly encounter technical problems they have already solved. Their previous fixes may be scattered across projects, notes, files, bookmarks, or old snippets. Exact keyword search is also weak when the wording of a new problem differs from the wording of the original solution.

## 3. Product Solution
SnippetVault creates a private personal engineering memory:
1. Encounter a problem.
2. Save the problem and solution with context.
3. Store it securely in the user's vault.
4. Later search by keywords or natural-language meaning.
5. Retrieve semantically similar previous solutions.

## 4. Target User
Primary user: an individual developer/student who wants to preserve and reuse technical solutions encountered during development.

## 5. Core User Stories
### Authentication
- As a user, I can register.
- As a user, I can log in securely.
- As a user, I can access only my own solutions.

### Solution Management
- As a user, I can create a solution entry.
- As a user, I can view a solution.
- As a user, I can edit a solution.
- As a user, I can delete a solution.
- As a user, I can copy code.

### Retrieval
- As a user, I can search by keywords.
- As a user, I can filter by technology, tags, and project.
- As a user, I can perform semantic search using natural-language descriptions.

## 6. Solution Entry
Fields:
- title
- problem
- solution
- code
- technology
- language
- tags
- project
- notes
- sourceUrl

System fields:
- userId
- embedding
- createdAt
- updatedAt

## 7. AI Requirement
Semantic search must use embeddings. Stored solution content and search queries are converted into vectors, then MongoDB Atlas Vector Search retrieves relevant solutions.

AI is an enhancement to retrieval, not the core CRUD dependency.

## 8. Search Modes
### Keyword Search
Traditional text-based matching and filters.

### Semantic Search
Natural-language query → embedding → MongoDB Vector Search → ranked results.

Do not create a complicated hybrid ranking algorithm for MVP.

## 9. UX Requirements
- Preserve the existing SnippetVault visual identity.
- Dashboard should feel like an evolution of the existing paste listing.
- Create/edit should evolve the existing editor.
- Detail view should evolve the existing macOS-style viewer.
- Authentication pages must visually integrate with the existing product.
- Provide loading, empty, success, and error states.
- Maintain responsive behavior.

## 10. Non-Functional Requirements
- Secure authentication.
- Server-side authorization.
- Server-side validation.
- Graceful AI failure.
- No secrets in frontend code.
- Maintainable folder structure.
- Deployment-ready environment configuration.

## 11. MVP Exclusions
No chatbot, code generation, agents, GitHub integration, OAuth, team collaboration, microservices, or separate vector database.
