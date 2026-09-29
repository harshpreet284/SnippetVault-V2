# SnippetVault — Database Schema

## 1. Collections
MVP uses two main collections:
- users
- solutions

## 2. User
Fields:
- _id: ObjectId
- name: String, required
- email: String, required, unique, normalized
- passwordHash: String, required
- createdAt: Date

Never store plaintext passwords.

## 3. Solution
Fields:
- _id: ObjectId
- userId: ObjectId, required, references users logically
- title: String, required
- problem: String, required
- solution: String, required
- code: String, optional
- technology: String, optional
- language: String, optional
- tags: Array<String>
- project: String, optional
- notes: String, optional
- sourceUrl: String, optional
- embedding: Array<Number>, optional until successfully generated
- createdAt: Date
- updatedAt: Date

## 4. Relationship
One user can own many solutions.

users._id
   │
   └── solutions.userId

Do not embed all solutions inside a user document.

## 5. Embedding Source
The embedding input should combine searchable context:
- title
- problem
- solution
- technology
- language
- tags
- project
- notes

Code is not required to be the primary semantic source. If code is included, it should not dominate the text representation.

## 6. Indexes
Required/expected:
- unique index on users.email
- index supporting userId-based solution retrieval
- indexes needed for common filters where justified
- MongoDB Atlas Vector Search index on embedding

Do not create indexes without a query/use-case reason.

## 7. Vector Constraints
The embedding array must use the same dimensionality as the configured Gemini embedding output: 768.

## 8. Data Ownership
All solution reads, updates, and deletes must be scoped to the authenticated user's ownership.

## 9. Validation
Server-side validation must enforce required fields and reasonable length limits. URLs must be validated when sourceUrl is supplied.
