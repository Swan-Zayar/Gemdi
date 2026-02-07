# Security + Efficiency Hardening Plan

## Goals

- Reduce redundancy and improve efficiency.
- Add security protections to prevent common exploits.
- Move Gemini API key server-side via Firebase Functions proxy.
- Sanitize AI output to plain text/KaTeX-only.
- Enforce stricter Firestore rules and 50 MB upload cap.

## Decisions

- Proxy: Firebase Functions
- AI output: sanitize to plain text/KaTeX-only
- Firestore rules: strict schema + size limits
- Upload cap: 50 MB

## Step 1: Firebase Functions Proxy for Gemini

- Create a Firebase Functions project in this repo (functions/).
- Move Gemini API key to Functions environment config.
- Add a callable or HTTP endpoint that accepts study content + prompt data.
- Update client to call the Functions endpoint instead of GoogleGenAI directly.
- Remove any client-side API key exposure in Vite config.

## Step 2: Sanitize AI Output (KaTeX-Only)

- Create a shared formatter/sanitizer utility.
- Ensure all AI-generated text is treated as plain text.
- Only allow KaTeX math rendering from $...$ and $$...$$.
- Replace or sanitize all uses of dangerouslySetInnerHTML.

## Step 3: Enforce Upload Constraints

- Add file size and type validation in the upload handler.
- Reject files over 50 MB with a clear user message.
- Add validation in the processing service as a second guard.

## Step 4: Tighten Firestore Rules

- Add field allowlists and size checks for userProfiles and studySessions.
- Validate required fields and types in rules where possible.
- Ensure optional fields are omitted when not set (never undefined).

## Step 5: Reduce Redundancy / Improve Efficiency

- Centralize duplicate formatMath logic into a shared utility.
- Remove redundant model training calls where they do not add value.
- Avoid unnecessary refetches of sessions after updates.

## Verification

- Run npm run build.
- Use Firebase emulator or staging project to validate rules and Functions.
- Test:
  - Profile save and header update.
  - Quiz/flashcard rendering with KaTeX.
  - Upload > 50 MB (should be blocked).
  - Upload valid PDF/DOCX under 50 MB (should pass).
