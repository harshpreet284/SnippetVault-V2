# SnippetVault V2 — Project Rules

## Core Rule
This is an upgrade of an existing working project, not a new application.

The existing frontend UI is the visual source of truth.

## Preserve Existing Design
Do not unnecessarily change:
- colors
- typography style
- navbar visual language
- macOS traffic-light editor chrome
- card appearance
- button treatment
- responsive layout
- copy/toast interaction patterns

New screens must feel like the same application.

## Implementation Rules
1. Read relevant MD documentation before implementing a task.
2. Work incrementally.
3. Do not implement unrelated phases together.
4. Inspect existing code before replacing it.
5. Reuse working components where practical.
6. Do not delete existing functionality without a documented reason.
7. Do not introduce unnecessary dependencies.
8. Do not invent features outside approved scope.
9. Test each milestone before proceeding.
10. Keep Git commits small and meaningful.

## Security
- Never hard-code secrets.
- Never expose Gemini API keys in React/browser code.
- Use secure HTTP-only authentication cookies.
- Validate and authorize backend requests.
- Users must not access another user's solutions.

## AI
- Semantic search is the primary AI feature.
- Use a currently supported Gemini embedding model.
- Do not use deprecated embedding models.
- AI failures must not crash the application.
- Keep keyword search as fallback.

## Cost
Target a ₹0 development budget using free tiers. Do not introduce paid services without explicit approval.

## Agent Behavior
Before modifying files:
- explain what will change
- identify affected files
- identify risks

After modifying files:
- report changed files
- report tests/commands run
- report remaining issues

Never silently perform a large architectural rewrite.
