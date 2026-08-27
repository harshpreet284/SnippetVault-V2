# WORKING.md — SnippetVault V2 Agent Handoff

## PURPOSE
This is the handoff/checkpoint document for continuing SnippetVault V2 in another IDE, coding agent, or account.

READ THIS FILE COMPLETELY BEFORE MAKING CODE CHANGES.

SnippetVault V2 is an existing working frontend being upgraded into a full-stack application. The original frontend is the visual source of truth and must be preserved unless project documentation explicitly requires otherwise.

## 1. CURRENT PROJECT STATE
- Project: SnippetVault V2
- Current phase: Task 5 completed and committed.
- NEXT task: Task 6.
- Do not assume Task 6 has started unless the repository itself shows otherwise.
- Task 4 was previously committed.
- Task 5 was completed, verified, accepted, and committed.
- The working tree was clean after the Task 5 commit.
- Task 5 was intended to be pushed to the new V2 GitHub repository.

Never reset/revert committed work without explicit approval.
Before major changes, inspect git status and git diff.
Keep each major task as a separate Git checkpoint.

## 2. DEVELOPMENT WORKFLOW
1. Read the relevant MD documentation.
2. Inspect the existing implementation.
3. Inspect current Git state.
4. Make only changes required for the current task.
5. Preserve completed work.
6. Test the implementation.
7. Run the frontend production build when frontend changes are involved.
8. Report exactly what changed and what was tested.
9. Do NOT commit automatically unless explicitly instructed.
10. Human/project owner reviews the report.
11. After approval, create a Git commit.

If an AI coding-agent session is interrupted by a quota/context limit:
- Do NOT restart the task from scratch.
- Inspect the current working tree and diff.
- Determine what is already complete.
- Continue only from the existing state.
- Avoid duplicate implementations and unnecessary rewrites.

## 3. CRITICAL PROJECT RULES
- This is an existing project being upgraded, not a new project.
- Do not redesign the existing UI without explicit approval.
- The existing UI is the visual source of truth.
- Preserve the existing macOS-inspired visual design.
- Preserve existing colors, layout, spacing, typography, responsiveness, and interaction patterns unless the task explicitly requires a change.
- Do not remove existing functionality unless explicitly required.
- Do not perform unrelated refactors.
- Do not install unnecessary packages.
- Do not create duplicate architecture.
- Follow the project MD documentation before making architectural decisions.
- Never put secrets into Git.
- `server/.env` must remain git-ignored.
- JWT must remain in an httpOnly cookie, not localStorage.
- User ownership must always come from the authenticated JWT on the server.
- Do not trust client-supplied `userId`.
- Do not expose password hashes through API responses.
- Keep backend and frontend responsibilities separated according to the locked architecture.

## 4. DOCUMENTATION
Before implementing a task, read the relevant project documentation completely:
1. PROJECT_RULES.md
2. PRD.md
3. ARCHITECTURE.md
4. DATABASE_SCHEMA.md
5. API_SPEC.md
6. AI_SPEC.md
7. TASKS.md
8. DECISIONS.md
9. STUDY_GUIDE.md
10. README.md

If any are missing, do not invent their contents. Inspect the repository and report the missing file before architecture-sensitive work.

## 5. ARCHITECTURE STATUS
Architecture is LOCKED.

Broad architecture:

Frontend:
- React
- Vite
- Tailwind CSS
- Redux Toolkit
- React Router / existing routing
- API client modules

Backend:
- Node.js
- Express
- MongoDB
- Mongoose
- JWT authentication
- httpOnly cookie authentication

Deployment/other planned infrastructure is defined by the project MD files. Do not replace the architecture with another stack without explicit approval.

## 6. BACKEND STATUS
The `server/` backend was created and implemented through Task 4.

Current structure includes:
- server/package.json
- server/package-lock.json
- server/.env.example
- server/server.js
- server/routes/health.js
- server/routes/auth.js
- server/routes/solutions.js
- server/controllers/healthController.js
- server/controllers/authController.js
- server/controllers/solutionsController.js
- server/config/db.js
- server/middleware/authMiddleware.js
- server/models/User.js
- server/models/Solution.js
- server/services/
- server/utils/

Some folders contain `.gitkeep` files for future functionality.

## 7. DATABASE STATUS
MongoDB Atlas is connected. Mongoose connects before the Express server starts.

User model:
- name
- email
- passwordHash
- createdAt

Email is normalized/lowercased and unique.
Passwords are never stored as plaintext.

Solution model:
- userId
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
- embedding
- createdAt
- updatedAt

`embedding` is excluded from normal responses with `select: false`.

Vector search indexing is planned for the relevant later phase when embeddings are implemented. Do not create the Atlas vector index prematurely.

## 8. AUTHENTICATION STATUS
Task 3 completed authentication.

Endpoints:
- POST /api/auth/register
- POST /api/auth/login
- GET /api/auth/me
- POST /api/auth/logout

Uses:
- bcryptjs
- jsonwebtoken
- cookie-parser
- httpOnly JWT cookie

Security behavior:
- JWT is not stored in localStorage.
- JWT is not returned to React as a normal data value.
- Browser sends the cookie using `credentials: 'include'`.
- `protect` middleware verifies the JWT.
- `req.user.id` comes from the verified JWT.
- Password hashes are stripped from user responses.

## 9. SOLUTION CRUD STATUS
Task 4 completed backend Solution CRUD.

Endpoints:
- GET /api/solutions
- GET /api/solutions/:id
- POST /api/solutions
- PUT /api/solutions/:id
- DELETE /api/solutions/:id

All solution routes are protected.

Ownership behavior:
- Users can only access their own solutions.
- Cross-user reads/updates/deletes return 404 rather than exposing another user's resource.
- `userId` is assigned from the verified JWT.
- Client-supplied `userId` is not trusted.
- Protected fields are filtered from writable input.

Validation includes:
- required title/problem/solution
- tags must be an array of strings
- sourceUrl must use http/https
- ObjectId validation
- update validation

## 10. TASK 5 STATUS — COMPLETED
Task 5 migrated the existing frontend from localStorage-based persistence to backend API/authentication.

Task 5 MUST NOT be redone.

Confirmed frontend API modules:
- `src/api/client.js` — fetch wrapper with `credentials: 'include'`
- `src/api/auth.js` — register, login, logout, getMe
- `src/api/solutions.js` — all 5 solution CRUD endpoints

Redux:
- `src/redux/authSlice.js` — restoreSession, loginUser, registerUser, logoutUser
- `src/redux/pasteSlice.js` — backend/API-based CRUD; localStorage persistence removed
- `src/redux/store.js` — authReducer + pasteReducer

Routing/auth UI:
- `src/App.jsx` — protected routes, login/register routes, session restoration
- `src/components/Login.jsx`
- `src/components/Register.jsx`
- `src/components/ProtectedRoute.jsx`

Navbar:
- `src/components/Navbar.jsx` — auth-conditional navigation, logout, user name

Main UI:
- `src/components/Home.jsx` — API thunks, problem + solution panels, edit prefill
- `src/components/Paste.jsx` — fetches solutions, delete API thunk, content/solution flow
- `src/components/ViewPaste.jsx` — fetches by ID from API, loading/error states

Environment:
- frontend `.env`: `VITE_API_URL=http://localhost:5000/api`
- `.env.example`: documented, no secrets

Task 5 verification:
- 12/12 API integration tests passed.
- `npm run build` passed.
- localStorage key `pastes` removed.
- JWT is not stored in localStorage.
- Login/logout/session restore verified.
- Solution create/read/update/delete verified through API.
- Task 5 was committed.

Do not recreate these files or replace their implementation without a concrete reason.

## 11. EXISTING FRONTEND VISUAL REQUIREMENT
The original SnippetVault frontend is the visual source of truth.

Preserve unless a task explicitly changes them:
- macOS-inspired UI
- existing color palette
- existing layout
- existing responsive behavior
- existing navigation style
- existing cards
- existing buttons
- existing paste/solution presentation
- existing copy-to-clipboard behavior
- existing visual hierarchy

When integrating backend features, prefer changing the data source/state handling rather than redesigning the UI.

## 12. IMPORTANT FRONTEND FILES
- src/App.jsx
- src/components/Home.jsx
- src/components/Navbar.jsx
- src/components/Paste.jsx
- src/components/ViewPaste.jsx
- src/components/Login.jsx
- src/components/Register.jsx
- src/components/ProtectedRoute.jsx
- src/redux/pasteSlice.js
- src/redux/authSlice.js
- src/redux/store.js
- src/api/client.js
- src/api/auth.js
- src/api/solutions.js

Before changing these, inspect the current implementation.

## 13. ENVIRONMENT
Frontend normally runs on port 5173.
Backend normally runs on port 5000.
Frontend API URL: `http://localhost:5000/api`

Backend secrets/config are in `server/.env`.
Never commit real `.env` files or secrets.

## 14. TESTING EXPECTATIONS
For frontend changes:
- run `npm run build`

For backend changes:
- start backend
- verify MongoDB connection
- test affected endpoints

For authentication:
- test authenticated and unauthenticated behavior.

For solution CRUD:
- test ownership isolation where relevant.

Do not claim a task is complete merely because the code compiles. Report actual tests performed.

## 15. GIT SAFETY
Before changes:
```bash
git status
```

For significant changes:
```bash
git diff --stat
git diff
```

After implementation:
```bash
npm run build
```

Do not automatically commit.
After human approval:
```bash
git add .
git commit -m "Complete Task X ..."
git status
```

A clean working tree is preferred before moving to the next major task.

## 16. CURRENT RESUME POINT
STOP HERE unless the user explicitly asks to begin the next task.

NEXT PLANNED TASK: TASK 6

Before implementing Task 6:
1. Read TASKS.md and relevant architecture/API documentation.
2. Inspect the current repository.
3. Inspect Git status.
4. Determine the exact Task 6 requirements.
5. Do not assume Task 6 details from this file if TASKS.md contains more specific requirements.
6. Follow the established project workflow.

IMPORTANT:
Task 5 is already complete. Do not restart it.

## 17. HANDOFF INSTRUCTION
When taking over this repository:

"You are continuing an existing SnippetVault V2 project. This is NOT a new project. Read WORKING.md first, then inspect the actual repository and Git history. Task 5 is already completed and committed. Do not redo Task 5. Your next responsibility is to determine the exact requirements of Task 6 from the project documentation and continue from the current repository state. Preserve all completed work and the existing UI. Before making changes, inspect the current implementation and Git status."

END OF WORKING.md
