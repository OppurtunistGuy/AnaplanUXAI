# KnowEm — Phase 1 Approved Fixes Changelog

Scope: Critical fixes (C1–C3), mobile overflow fixes, browser metadata fix,
and the text input validation foundation, as approved. No architecture
refactor, no UI redesign, no new libraries, no Level 3 build, no Emergent
dependency removal, no unrelated cleanup.

## Created Files

### `frontend/src/lib/textValidation.js` (new)
Reusable, dependency-free text validation utility.
- `containsBlockedLanguage(value)` — blocklist check with leetspeak/separator
  normalization (e.g. catches `f.u.c.k`, `sh1t`).
- `isSpecialCharacterSpam(value)` — flags strings with no real word content
  or long repeated symbol runs (e.g. `!!!!!!!!`, `##`), while allowing normal
  punctuation, contractions, multilingual scripts, and emoji.
- `validateUserText(value)` — single entry point returning `{ valid, reason }`.
- Verified against 32 manual test cases (names, multilingual names, emoji,
  casual sentences, profanity, leetspeak evasion, symbol spam).

## Modified Files

### `frontend/src/store/gameStore.js`
- **C1 (Persistence):** Added `STORAGE_KEY`, `saveToStorage` / `loadFromStorage`
  / `clearStorage` helpers (all wrapped in try/catch — storage failures never
  crash the app). Added `RESUMABLE_PHASES` allowlist. `GameProvider` now
  checks once on mount for a resumable saved session and exposes it via
  `pendingResume`, plus `resumeSession()` / `discardSession()` callbacks —
  the UI must explicitly choose before any saved state is loaded. A
  `useEffect` persists state on every change while a session is genuinely
  underway (`setup` phase or any `RESUMABLE_PHASES` phase). Added `HYDRATE`
  reducer case to load a saved session wholesale on "Continue."
- **C3 (Exit Reset):** `RESET` reducer case now also calls `clearStorage()`,
  so any full reset clears both in-memory and persisted state.
- **C2 (Card Recycling):** `L2_CATEGORY_CONTINUE` now checks whether the
  selected category's cards are fully used; if so it routes to a new
  `l2-deck-exhausted` phase instead of `l2-cards`. Added new
  `L2_DECK_EXHAUSTED_CONTINUE` action that clears the selected category and
  routes back to `l2-dice`.

### `frontend/src/pages/Game.jsx`
- Imported and wired `ResumeSessionPrompt` (shown when `pendingResume` is
  set, before any other screen) and the new `Level2DeckExhausted` screen
  (`l2-deck-exhausted` phase) into the `SCREENS` map.

### `frontend/src/screens/MetaScreens.jsx`
- **C1:** Added new `ResumeSessionPrompt` component — "Continue session" /
  "Start new session" choice, styled consistently with the existing
  `Level1DeclinePrompt` two-button pattern.
- **Mobile overflow:** Added `overflow-y-auto` to `ResumeSessionPrompt`,
  `InactivityEnd`, `Closure` roots. Added `overflow-y-auto overflow-x-hidden`
  to `Level3Teaser` root (preserves its decorative glow-blob clipping
  horizontally while allowing vertical scroll).

### `frontend/src/screens/Level2Flow.jsx`
- **C2:** Removed the recycling fallback in `Level2Cards` (previously
  `cards = pool.length > 0 ? pool : cat.cards.map(...)` — the `: cat.cards...`
  fallback recycled every card once exhausted). Pool is now strictly
  unused-cards-only. Added new `Level2DeckExhausted` component — friendly
  message + single "Roll again" button forcing the player back to the dice.
- **Validation foundation:** Wired `validateUserText` into `Level2Question`'s
  free-text answer. Submit button is disabled and an inline error shown
  (matching Setup's existing error-display pattern) when the answer contains
  blocked language or is symbol spam.
- **Mobile overflow:** Added `overflow-y-auto` to `Level2Dice`,
  `Level2Category`, `Level2DeckExhausted`, `Level2Cards`, `Level2Question`,
  `Level2Locked`, `Level2Handoff`, `Level2BothAnswered` roots.

### `frontend/src/screens/Level1Flow.jsx`
- **Mobile overflow:** Added `overflow-y-auto` to `Level1Locked`,
  `Level1Handoff`, `Level1DeclinePrompt` roots. Added
  `overflow-y-auto overflow-x-hidden` to `Level1Complete` root (preserves its
  confetti-layer clipping, which is on a separate inner `Confetti` div, while
  making the Continue/End buttons reachable on short viewports).
  `Level1BothAnswered` intentionally left unchanged (auto-advancing,
  no interactive content, `overflow-hidden` is load-bearing for its
  heart-burst animation).

### `frontend/src/screens/Level1Question.jsx`
- **C3 (Exit Reset):** Exit-confirm "Exit" button now dispatches
  `{ type: "RESET" }` instead of `go("landing")`, so answers, skip counts,
  and progress are fully cleared (and localStorage is cleared via the
  reducer's `RESET` case). Removed the now-unused `go` destructure.
- **Mobile overflow:** Added `overflow-y-auto` to the root container.

### `frontend/src/pages/Setup.jsx`
- **C3 (Exit Reset):** Back button now dispatches `{ type: "RESET" }`
  instead of `go("landing")`, for consistency with all other exit paths
  (also clears any in-progress setup state from localStorage). Removed the
  now-unused `go` destructure.
- **Validation foundation:** Wired `validateUserText` into the existing name
  validation chain — checked after the existing length/uniqueness checks,
  using the same `error` string + `setup-error` display already in place.
- **Mobile overflow:** Added `overflow-y-auto` to the root container.
- Minor: removed a stray extra blank line introduced during editing.

### `frontend/public/index.html`
- **Browser metadata:** `<title>` changed from `Emergent | Fullstack App` to
  `KnowEm - Discover Each Other`. No other tags touched (Emergent badge,
  PostHog script, and `emergent-main.js` left in place per instructions).

## Not Changed (explicitly out of scope)
- Backend (`backend/server.py`) — untouched.
- `package.json` / dependencies — no additions or removals.
- `components/ui/*` (shadcn boilerplate) — untouched.
- Level 3 — not built; `l3-teaser` still the placeholder.
- No architecture refactor, no visual/design redesign beyond the literal
  approved fixes above.
