# KnowEm — Levels 1–3 UI Optimization Changelog

Scope: visual/layout/styling optimization pass across Level 1, Level 2, and a
small Level 3 refinement. No reducer, action, or phase-name changes —
`gameStore.js` remains exactly 30 cases, byte-identical in logic.

## `frontend/src/pages/Setup.jsx`
- Name inputs widened to full-width with proper padding; placeholder text
  corrected to "Enter your name".

## `frontend/src/screens/Level1Question.jsx`
- Tightened vertical spacing (header, question, answer cards) so both choice
  cards stay above the fold on short viewports.

## `frontend/src/screens/Level2Flow.jsx`
- Replaced the rotating/blurred card-back face (source of mirrored text)
  with a solid, non-rotating face using a key icon.
- `Level2Locked` now auto-bypasses straight to the handoff screen instead of
  showing a "Pass Device" button screen; removed the resulting unused
  variable.
- Tightened spacing on the answer screen (prompt, input, submit button).
- Redesigned the post-answer screen into a circular progress view
  ("X/5 Discoveries Completed") with a single primary CTA.
- Centered the dice screen and simplified its instruction copy.
- Added a disabled visual state (40% opacity, grayscale, checkmark,
  pointer-events none) to the card as it locks in.
- Added `Level2Discover`: a single wrapper that visually consolidates
  Category Reveal → Deck Selection → Question Input via progressive
  disclosure. `Level2Cards` and `Level2Question` gained an `embedded` prop so
  they render without duplicate headers inside the wrapper; both remain
  fully usable standalone.

## `frontend/src/screens/Level3Flow.jsx`
- Added an auto-dismissing inline toast on `Level3Card` ("Phase 2 Unlocked:
  Teasing & Rapport" at card 6, "Final Phase Unlocked: Deep Dive" at card 11).
  Fixed a hook-ordering issue so all hooks run before the early return.

## `frontend/src/pages/Game.jsx`
- `l2-category` / `l2-cards` / `l2-question` now all render `Level2Discover`.
- Added a stable `keyId` (`selectedCategoryId` + `answers.length`) so the
  wrapper stays mounted across those three phases instead of remounting.

## Unchanged (verified)
`gameStore.js`, `level3Data.js`, `Level3Results.jsx` — byte-identical to
pre-optimization state. No new routes, libraries, or reducer cases.
