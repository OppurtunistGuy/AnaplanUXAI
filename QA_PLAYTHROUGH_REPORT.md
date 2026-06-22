# KnowEm V3 — QA Playthrough Report

**Date:** 2026-06-22  
**Methodology:** Full static trace of every screen transition, button handler, dispatch action, and reducer case through the complete game flow.  
**Scope:** All screens from Landing through Level 3 Final Results.

---

## Complete Flow Trace

### Flow: Landing → Mode Select
| Step | Action | Dispatched | Target Phase | Result |
|---|---|---|---|---|
| Landing page loads | `state.phase === "landing"` | — | — | Shows Landing component ✅ |
| Tap "Start the journey" | `go("mode-select")` | `GO: { phase: "mode-select" }` | `mode-select` | ModeSelect renders ✅ |

### Flow: Mode Select → Setup
| Step | Action | Dispatched | Target Phase | Result |
|---|---|---|---|---|
| Tap "Play Locally" | `dispatch({ type: "GO", phase: "setup" })` | `GO: { phase: "setup" }` | `setup` | Setup renders ✅ |
| Tap "Play Remotely" | `dispatch({ type: "GO", phase: "remote-setup" })` | `GO: { phase: "remote-setup" }` | `remote-setup` | RemoteSetup renders ✅ |

### Flow: Setup → Level 1
| Step | Action | Dispatched | Target Phase | Result |
|---|---|---|---|---|
| Enter names, tap "Begin Level 1" | `dispatch({ type: "SET_PLAYERS" })` | `SET_PLAYERS: { players }` | `l1-question` | Level1Question renders ✅ |

**Bug:** Player 1 avatar set to literal `"A"`, Player 2 set to `"B"` instead of emoji from `AVATARS` array (defined but unused on line 8). The `AVATARS` constant is dead code. **Severity: P2**

### Flow: Level 1 (This or That — 15 questions)
| Step | Action | Dispatched | Target Phase | Result |
|---|---|---|---|---|
| Player A selects option | `dispatch({ type: "L1_ANSWER", choice: "a" })` | `L1_ANSWER: "a"` | `l1-locked` | Level1Locked renders ✅ |
| Tap "Pass Device" | `L1_LOCKED_CONTINUE` | — | `l1-handoff` | Level1Handoff renders ✅ |
| Tap "I'm ready" | `L1_HANDOFF_READY` | — | `l1-question` | Level1Question renders, now Player B ✅ |
| Player B selects option | `L1_ANSWER: "b"` | (both answered) | `l1-both` | Level1BothAnswered renders ✅ |
| Auto-advance (2s) | `L1_BOTH_NEXT` | — | `l1-question` | Next question ✅ |
| After 15th question | `L1_ANSWER: "a"/"b"` | (final answer) | `l1-both-final` | Level1BothAnswered with final=true ✅ |
| Auto-advance (2s) | `GO: { phase: "l1-complete" }` | — | `l1-complete` | Level1Complete renders ✅ |

**Bug: Progress bar never reaches 100%** (Level1Question.jsx line 85)
```javascript
const progress = ((questionIndex) / LEVEL_1_QUESTIONS.length) * 100;
// questionIndex starts at 0: 0/15=0%, 14/15=93.3%
```
The final question (15th) shows 93.3% progress. Never reaches 100%. **Severity: P1**

**Bug: Progress bar also incorrect for the "Both Answered" screen** — after 15th question both-answered screen, the Level1Complete screen shows no progress bar, but the final question itself showed 93.3%. ✅ (Level1Complete has its own confetti display)

### Flow: Level 1 Complete → Decline Prompt
| Step | Action | Dispatched | Target Phase | Result |
|---|---|---|---|---|
| Tap "Continue to Level 2" | `L1_COMPLETE_CONTINUE` | — | `l1-decline-prompt` | Level1DeclinePrompt renders ✅ |
| Tap "Yes, let's go deeper" | `L1_ACCEPT` | — | `l2-dice` | Level2Dice renders ✅ |
| Tap "End here" on complete | `L1_DECLINE` | — | `closure` | Closure renders ✅ |
| Tap "Not today" on prompt | `L1_DECLINE` | — | `closure` | Closure renders ✅ |

**Closure → Insights:** "See our insights" button works (`GO: "insights"`). ✅  
**Closure → Play again:** RESET works. ✅  

### Flow: Level 2 (Category Discovery)
| Step | Action | Dispatched | Target Phase | Result |
|---|---|---|---|---|
| Tap "Tap to roll" | — | — | — | Dice animates ✅ |
| After animation (1.4s) | `L2_DICE_ROLLED` | — | `l2-category` | Level2Category renders ✅ |
| Auto-advance (2s) | `L2_CATEGORY_CONTINUE` | — | `l2-cards` | Level2Cards renders ✅ |
| Browse cards, tap "Reveal this card" | `L2_CARD_PICKED` | — | `l2-card-flip` | Level2CardFlip renders ✅ |
| Auto-advance (1.4s) | `L2_CARD_REVEALED` | — | `l2-question` | Level2Question renders ✅ |
| Player A types answer, taps "Lock my answer" | `L2_ANSWER` | — | `l2-locked` | Level2Locked renders ✅ |
| Tap "Pass Device" | `L2_LOCKED_CONTINUE` | — | `l2-handoff` | Level2Handoff renders ✅ |
| Tap "I'm ready" | `L2_HANDOFF_READY` | — | `l2-question` | Player B answers ✅ |
| Player B taps "Lock & reveal" | `L2_ANSWER` | — | `l2-both` | Level2BothAnswered renders ✅ |

**L2 BothAnswered screen:**
- With < 3 rounds: shows "Roll again" + "See insights" buttons ✅
- With ≥ 3 rounds: shows "Roll again" + "Finish Level 2" buttons ✅

| Tap "Roll again" | `L2_ROLL_AGAIN` | — | `l2-dice` | New round ✅ |
|---|---|---|---|---|
| Tap "Finish Level 2" (≥ 3 rounds) | `L2_COMPLETE` | — | `l2-complete` | Level2Complete renders ✅ |

**Level2Complete screen:**
- "See Insights" → `GO_INSIGHTS` → `insights` ✅
- "One More Round" → `L2_ROLL_AGAIN` → `l2-dice` ✅

**Bug: Missing null guard for `cat` in Level 2 screens** (P1)
If a user refreshes during Level 2 and the state is restored with a `l2-category`, `l2-cards`, or `l2-question` phase but `selectedCategoryId` is null (since level2 state isn't fully saved), `Level2Category.jsx:118`, `Level2Cards.jsx:170`, and `Level2Question.jsx:302` will crash because `LEVEL_2_CATEGORIES.find(...)` returns undefined and they access `.color`, `.cards`, or `.id` on it. **Severity: P1**

### Flow: Insights
| Step | Action | Dispatched | Target Phase | Result |
|---|---|---|---|---|
| Tapping segments on donut chart | `setActive(i)` | — | — | Highlights correct segment ✅ |
| "Peek Level 3" | `GO: { phase: "l3-teaser" }` | — | `l3-teaser` | Level3Teaser renders ✅ |
| "Play again" | `RESET` | — | `landing` | ✅ |

### Flow: Level 3 (Deep Questions)
| Step | Action | Dispatched | Target Phase | Result |
|---|---|---|---|---|
| Level3Teaser loads | Shows glow effects, heart SVG, lock icon | — | — | Visual ✅ |
| Tap "Continue to Level 3" | `GO: { phase: "l3-consent" }` | — | `l3-consent` | ✅ |
| Tap "Continue Together" | `L3_CONSENT_AGREE` | — | `l3-intro` | **P0-2 FIXED** ✅ |
| Tap "Not Now" | `L3_CONSENT_DECLINE` | — | `closure` | **P0-2 FIXED** ✅ |
| Tap "Let's Begin" | `L3_INTRO_CONTINUE` | — | `l3-how-it-works` | **P0-2 FIXED** ✅ |
| Tap "Got It" | `L3_HOW_IT_WORKS_CONTINUE` | — | `l3-category-select` | **P0-2 FIXED** ✅ |
| Level3CategorySelect loads | Renders category grid from LEVEL_3_GROUPS | — | — | **P0-3 FIXED** ✅ |
| Tap a category | `handleSelect(key)` → builds deck, dispatches with deck | `L3_CATEGORY_SELECT: { categoryKey, deck }` | `l3-card` | **P0-3 + P0-5 FIXED** ✅ |

**Bug: Phase unlock toast fires at wrong card** (Level3Flow.jsx lines 136-139)
```javascript
const phaseUnlockMessage =
    cardNumber === 6 ? "Phase 2 Unlocked: Teasing & Rapport"  // Wrong! Card 6 is still Truth/Dare
    : cardNumber === 11 ? "Final Phase Unlocked: Deep Dive"     // Wrong name, should be "Hot Layer"
    : null;
```
Card 6 is in the Truth/Dare pool (cards 1-7). Teasing starts at card 8. The toast appears incorrectly at card 6. **Severity: P2**

**Bug: No type field stored in L3 answers** (gameStore.js L3_ANSWER, lines 313-320)
The answer object stores `cardIndex`, `prompt`, `groupKey`, `groupName`, `A`, `B` but NOT `type` (truth/dare/hot). Level3Both (line 365) tries to display `last?.type` which will be `undefined`. The badge will never show correct type. **Severity: P1**

**Bug: groupKey and groupName are undefined** (gameStore.js L3_ANSWER)
`buildLevel3Deck()` doesn't set `groupKey` or `groupName` on cards. The L3_ANSWER reducer stores `card?.groupKey` and `card?.groupName` which are both `undefined`. **Severity: P1**

### Level 3 Full Gameplay Flow

| Step | Action | Target Phase | Result |
|---|---|---|---|
| L3Card — tap to reveal | `L3_CARD_REVEALED` | `l3-question` | ✅ |
| Player A submits answer | `L3_ANSWER` (A) | `l3-locked` | ✅ |
| Tap "Pass Device" | `L3_LOCKED_CONTINUE` | `l3-handoff` | ✅ |
| Tap "I'm ready" | `L3_HANDOFF_READY` | `l3-question` | ✅ |
| Player B submits answer | `L3_ANSWER` (B) | `l3-both` | ✅ |
| Tap "Next Card" | `L3_NEXT_CARD` | `l3-reflection` | ✅ |
| Pick reaction | `L3_REFLECTION_RECORD` | `l3-card` | ✅ |
| After 20 cards | `L3_NEXT_CARD` or `L3_REFLECTION_RECORD` | `l3-results` | ✅ |

**Bug: L3_REFLECTION_RECORD ignores reaction data** (gameStore.js lines 344-349)
```javascript
case "L3_REFLECTION_RECORD": {
  const nextIndex = state.level3.cardIndex + 1;
  // action.reaction is NEVER stored!
  ...
}
```
The reaction the user selects is dispatched but discarded by the reducer. **Severity: P1**

### Level 3 Results
| Step | Action | Target Phase | Result |
|---|---|---|---|
| "Return to Home" | `GO: { phase: "landing" }` | `landing` | ✅ |
| "Play Again" | `RESET` | `landing` | ✅ |

---

## Session Recovery Verification

After P0-1 fix:
- **Refresh on landing with saved session:** `shouldShowRecovery` detects localStorage, `state.phase === "landing"` is true → SessionRecovery renders ✅
- **"Continue where you left off":** Calls `go(state.phase)` - depends on loaded phase ✅
- **"Start fresh":** Dispatches `CLEAR_SESSION` + `go("landing")` ✅

**Bug: saveState() does NOT persist Level 3, sessionMode, or remoteSession data**
```javascript
// gameStore.js lines 48-57
const serializable = {
  version: state.version,
  phase: state.phase,
  players: state.players,
  currentPlayer: state.currentPlayer,
  level1: state.level1,
  level2: state.level2,
  sessionStatus: state.sessionStatus,
};
```
- `level3` is omitted → **Level 3 progress is lost on refresh** (phase remains but deck/answers are gone)
- `sessionMode` and `remoteSession` omitted → **Remote session data lost on refresh**
- `level2.answers` is saved (via level2), but `level2.usedCards` is also saved ✅
**Severity: P2**

---

## Console Error Paths

| File | Line | Error Handler | Type |
|---|---|---|---|
| `gameStore.js` | 60 | `console.error("Failed to save state to localStorage:", e)` | Error recovery |
| `gameStore.js` | 79 | `console.error("Failed to load state from localStorage:", e)` | Error recovery |
| `gameStore.js` | 89 | `console.error("Failed to clear session from localStorage:", e)` | Error recovery |
| `Game.jsx` | 96 | `catch (e) { return false; }` (silent) | Graceful degradation |

No uncaught error paths found.

---

## Issue Register (New + Pre-existing)

### P0 — App Breaking: 0 remaining
All 5 audit P0 issues have been fixed in the previous round.

### P1 — Major Functionality: 5

| ID | Description | File | Lines | Root Cause | Effort |
|---|---|---|---|---|---|
| **QA-P1-1** | Level 1 progress bar never reaches 100% | `Level1Question.jsx` | 85 | Uses `questionIndex / total` instead of `(questionIndex + 1) / total` | 5 min |
| **QA-P1-2** | Level 3 answer storage missing `type` field | `gameStore.js` | 314-320 | L3_ANSWER reducer doesn't store `card.type`; Level3Both tries to display `last?.type` (undefined) | 10 min |
| **QA-P1-3** | `groupKey`/`groupName` undefined in Level 3 cards | `level3Data.js` | 67-97 | `buildLevel3Deck()` never sets group metadata | 15 min |
| **QA-P1-4** | Level 3 reflection reactions not stored | `gameStore.js` | 344-349 | `L3_REFLECTION_RECORD` ignores `action.reaction` | 10 min |
| **QA-P1-5** | Level 2 screens crash on refresh mid-game | `Level2Category.jsx`, `Level2Cards.jsx`, `Level2Question.jsx` | 118, 170, 302 | `cat` can be undefined if `selectedCategoryId` is null; no null guard before accessing `.color`/`.cards`/`.id` | 15 min |

### P2 — UX Issues: 4

| ID | Description | File | Lines | Root Cause | Effort |
|---|---|---|---|---|---|
| **QA-P2-1** | `saveState()` omits level3, sessionMode, remoteSession | `gameStore.js` | 48-57 | Serialization explicitly skips these fields | 10 min |
| **QA-P2-2** | Avatar assigned as literal "A"/"B" instead of emoji | `Setup.jsx` | 30-31 | `AVATARS` array defined but unused; passes `avatar: "A"` | 5 min |
| **QA-P2-3** | Level 3 phase unlock toast fires at wrong card | `Level3Flow.jsx` | 136-139 | Hardcoded to card 6 (still Truth/Dare) instead of card 8 (Teasing starts) | 10 min |
| **QA-P2-4** | Level 3 expected deck size mismatch | `Level3Flow.jsx` | 88 | HowItWorks step 5 says "Complete 20 cards" but `LEVEL_3_DECK_SIZE` constant is never used for validation | 5 min |

### P3 — Code Quality: 2

| ID | Description | File | Lines | Root Cause | Effort |
|---|---|---|---|---|---|
| **QA-P3-1** | `AVATARS` constant defined but never used | `Setup.jsx` | 8 | Dead code | 2 min |
| **QA-P3-2** | Phase unlock message says "Deep Dive" instead of "Hot Layer" | `Level3Flow.jsx` | 139 | Wrong name for final phase | 2 min |

---

## Summary Counts

| Severity | Count |
|---|---|
| **P0** | 0 |
| **P1** | 5 |
| **P2** | 4 |
| **P3** | 2 |
| **Total** | **11** |

---

## Verification Checklist

| Requirement | Status |
|---|---|
| Landing → Mode Select | ✅ |
| Mode Select → Setup | ✅ |
| Setup → Level 1 | ✅ |
| Level 1 → Level 1 Complete | ✅ (progress bar won't reach 100%) |
| Level 1 Complete → Level 2 | ✅ |
| Level 2 → Level 2 Complete | ✅ (≥ 3 rounds) |
| Level 2 Complete → Insights | ✅ |
| Insights → Level 3 | ✅ (P0-4 fixed) |
| Level 3 → Final Results | ✅ (P0-2, P0-3, P0-5 fixed) |
| No dead ends | ✅ (after P0 fixes) |
| Console errors | ❌ None found (all errors are properly caught) |
| Progress indicators | ❌ L1 progress bar maxes at 93.3% |
| State updates correctly | ❌ L3 reactions not stored, type missing from answers |
| Refresh recovery | ❌ Partially broken: L3 data not persisted, L2 mid-screen crashes |
| Back navigation | ✅ All back buttons work (L1 exit → confirm → landing, L3Teaser back → insights) |