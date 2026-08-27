# SnippetVault — Implementation Tasks

## Phase 0 — Baseline
- [ ] Inspect existing repository and run it unchanged.
- [ ] Confirm current frontend routes/components.
- [ ] Confirm current design tokens/colors/theme.
- [ ] Create a Git checkpoint before major changes.

## Phase 1 — Project Structure
- [ ] Introduce backend without destroying existing frontend.
- [ ] Configure client/server development workflow.
- [ ] Add environment variable handling.
- [ ] Add/update .gitignore.
- [ ] Verify existing frontend still runs.

## Phase 2 — Backend Foundation
- [ ] Initialize Express server.
- [ ] Configure MongoDB connection.
- [ ] Add centralized error handling.
- [ ] Add request validation.
- [ ] Configure CORS.
- [ ] Add health endpoint if useful for deployment.

## Phase 3 — Authentication
- [ ] Create User model.
- [ ] Implement registration.
- [ ] Hash passwords with bcrypt.
- [ ] Implement login.
- [ ] Issue JWT.
- [ ] Implement authentication middleware.
- [ ] Implement /auth/me.
- [ ] Test invalid credentials and protected routes.

## Phase 4 — Solution Data
- [ ] Create Solution model.
- [ ] Implement create.
- [ ] Implement list.
- [ ] Implement detail.
- [ ] Implement update.
- [ ] Implement delete.
- [ ] Enforce ownership.
- [ ] Validate input.

## Phase 5 — Frontend Integration
- [ ] Replace localStorage persistence with backend persistence.
- [ ] Preserve existing UI.
- [ ] Add login/register screens matching existing design.
- [ ] Add protected routing.
- [ ] Add authenticated API state handling.
- [ ] Preserve copy and toast interactions.
- [ ] Update dashboard/listing to use solutions.

## Phase 6 — Search
- [ ] Implement keyword search.
- [ ] Implement technology/language/project/tag filtering.
- [ ] Add search mode UI.
- [ ] Test empty/no-result states.

## Phase 7 — Semantic Search
- [ ] Configure Gemini API on backend.
- [ ] Implement embedding service.
- [ ] Create MongoDB vector index.
- [ ] Generate embeddings for new solutions.
- [ ] Regenerate embeddings when searchable content changes.
- [ ] Implement semantic-search endpoint.
- [ ] Apply user ownership filtering.
- [ ] Implement graceful AI failure.
- [ ] Test semantic retrieval with differently worded queries.

## Phase 8 — Security & Quality
- [ ] Verify secrets are not exposed.
- [ ] Verify ownership checks on every solution endpoint.
- [ ] Verify validation.
- [ ] Verify CORS configuration.
- [ ] Test unauthorized access.
- [ ] Test another user's solution cannot be accessed.
- [ ] Run lint/build.
- [ ] Review frontend for broken flows.

## Phase 9 — Deployment
- [ ] Configure production environment variables.
- [ ] Deploy backend.
- [ ] Deploy frontend.
- [ ] Configure MongoDB Atlas production access.
- [ ] Configure CORS for production frontend.
- [ ] Test production authentication.
- [ ] Test CRUD in production.
- [ ] Test keyword search.
- [ ] Test semantic search.
- [ ] Verify no secret appears in frontend bundle or repository.

## Phase 10 — Documentation & Study
- [ ] Update README with architecture and setup.
- [ ] Record final technical decisions.
- [ ] Complete STUDY_GUIDE.md topics.
- [ ] Create an interview question bank from the actual implementation.
- [ ] Review Git history.
- [ ] Tag final stable version.

## Execution Rule
Complete one coherent task at a time. Test it before moving on. Do not jump to AI search while authentication/database fundamentals are broken.
