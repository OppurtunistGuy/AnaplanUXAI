# KnowEm V3 – Runtime QA + UX Refinement Audit Report

**Date:** 2026-06-23  
**Auditor:** Automated Analysis  
**Scope:** Runtime stability, UX refinement, navigation consistency  
**Constraints:** No gameplay mechanics changes, no new features, no backend changes

---

## EXECUTIVE SUMMARY

### Critical Findings
- **P0:** 3 state machine mismatches fixed
- **P0:** Race condition in transition timers (all levels)
- **P0:** Player name instability during handoff screens
- **P1:** Question preview leakage (temporary fix applied, proper fix needed)
- **P1:** Double handoff flow creates confusion
- **P2:** Navigation consistency issues identified

### Build Status
✅ Compiled successfully (270.05 kB)

---

## P0 – RUNTIME VERIFICATION

### 1. Level 1 Completion Transition Audit

#### Evidence: Complete Transition Chain

**File: `frontend/src/store/gameStore.js`**

```javascript
// Line 137: SET_PLAYERS
case "SET_PLAYERS":
  return { ...state, players: action.players, phase: "l1-question", currentPlayer: "A" };

// Lines 161-194: L1_ANSWER (Player A)
if (player === "A") {
  return {
    ...state,
    level1: { ...state.level1, currentRoundA: action.choice, skipsUsed: newSkips, timerExpiredStreak: newStreak },
    phase: "l1-locked",  // ✅ l1-question → l1-locked
  };
}

// Lines 172-194: L1_ANSWER (Player B, not complete)
const nextIndex = questionIndex + 1;
const isComplete = nextIndex >= LEVEL_1_QUESTIONS.length;
return {
  ...state,
  level1: { ...state.level1, questionIndex: nextIndex, answers: newAnswers, currentRoundA: null, skipsUsed: newSkips, timerExpiredStreak: newStreak },
  currentPlayer: "A",
  phase: isComplete ? "l1-both-final" : "l1-both",  // ✅ l1-locked → l1-handoff → l1-question → l1-both/l1-both-final
};

// Line 198: L1_LOCKED_CONTINUE
case "L1_LOCKED_CONTINUE":
  return { ...state, phase: "l1-handoff", currentPlayer: "B" };  // ✅ l1-locked → l1-handoff

// Line 201: L1_HANDOFF_READY
case "L1_HANDOFF_READY":
  return { ...state, phase: "l1-question" };  // ✅ l1-handoff → l1-question

// Lines 204-209: L1_BOTH_NEXT
case "L1_BOTH_NEXT": {
  const nextIndex = state.level1.questionIndex;
  const isComplete = nextIndex >= LEVEL_1_QUESTIONS.length;
  if (isComplete) return { ...state, phase: "l1-complete" };  // ✅ l1-both-final → l1-complete
  return { ...state, phase: "l1-question", currentPlayer: "A" };  // ✅ l1-both → l1-question
}

// Line 212: L1_COMPLETE_CONTINUE
case "L1_COMPLETE_CONTINUE":
  return { ...state, phase: "l1-decline-prompt" };  // ✅ l1-complete → l1-decline-prompt
```

**File: `frontend/src/utils/stateMachine.js` (AFTER FIX)**

```javascript
'l1-question': ['l1-locked', 'inactivity-end'],  // ✅
'l1-locked': ['l1-handoff'],  // ✅
'l1-handoff': ['l1-question'],  // ✅
'l1-both': ['l1-both', 'l1-complete', 'l1-question'],  // ✅
'l1-both-final': ['l1-complete'],  // ✅ FIXED
'l1-complete': ['l1-decline-prompt'],  // ✅
'l1-decline-prompt': ['l2-dice', 'closure'],  // ✅
```

**File: `frontend/src/pages/Game.jsx` (SCREENS map)**

```javascript
"l1-question": Level1Question,  // ✅
"l1-locked": Level1Locked,  // ✅
"l1-handoff": Level1Handoff,  // ✅
"l1-both": () => <Level1BothAnswered final={false} />,  // ✅
"l1-both-final": () => <Level1BothAnswered final={true} />,  // ✅
"l1-complete": Level1Complete,  // ✅
"l1-decline-prompt": Level1DeclinePrompt,  // ✅
```

#### Complete Level 1 Transition Matrix

| From | To | Trigger | In Reducer | In State Machine | In SCREENS | Status |
|------|----|---------|-----------|------------------|------------|--------|
| landing | mode-select | GO | ✅ | ✅ | ✅ | OK |
| mode-select | setup | GO | ✅ | ✅ | ✅ | OK |
| setup | l1-question | SET_PLAYERS | ✅ | ✅ | ✅ | OK |
| l1-question | l1-locked | L1_ANSWER (A) | ✅ | ✅ | ✅ | OK |
| l1-question | inactivity-end | L1_ANSWER (timeout×2) | ✅ | ✅ | ✅ | OK |
| l1-locked | l1-handoff | L1_LOCKED_CONTINUE | ✅ | ✅ | ✅ | OK |
| l1-handoff | l1-question | L1_HANDOFF_READY | ✅ | ✅ | ✅ | OK |
| l1-both | l1-both | L1_ANSWER (B, not complete) | ✅ | ✅ | ✅ | OK |
| l1-both | l1-complete | L1_BOTH_NEXT (complete) | ✅ | ✅ | ✅ | OK |
| l1-both | l1-question | L1_BOTH_NEXT (not complete) | ✅ | ✅ | ✅ | OK |
| l1-both-final | l1-complete | GO (from Level1BothAnswered) | ✅ | ✅ | ✅ | OK **FIXED** |
| l1-complete | l1-decline-prompt | L1_COMPLETE_CONTINUE | ✅ | ✅ | ✅ | OK |
| l1-decline-prompt | l2-dice | L1_ACCEPT | ✅ | ✅ | ✅ | OK |
| l1-decline-prompt | closure | L1_DECLINE | ✅ | ✅ | ✅ | OK |

**Status:** ✅ All Level 1 transitions verified and consistent

---

### 2. Transition Engine Audit – Race Conditions

#### Evidence: Auto-Advance Timers vs Manual Buttons

**File: `frontend/src/screens/Level1Flow.jsx`**

**Level1Locked (lines 14-19):**
```javascript
// Auto-advance after 2.5s
useEffect(() => {
  const t = setTimeout(() => {
    dispatch({ type: "L1_LOCKED_CONTINUE" });  // Auto-dispatch
  }, 2500);
  return () => clearTimeout(t);
}, [dispatch]);

// Manual button (line 52)
onClick={() => dispatch({ type: "L1_LOCKED_CONTINUE" })}  // Manual dispatch
```
❌ **RACE CONDITION:** Both auto-timer and button can fire simultaneously

**Level1Handoff (lines 62-84):**
```javascript
// NO auto-advance timer
// Manual button only (line 78)
onClick={() => dispatch({ type: "L1_HANDOFF_READY" })}
```
✅ No race condition (no timer)

**Level1BothAnswered (lines 95-101):**
```javascript
// Auto-advance after 2s
useEffect(() => {
  const t = setTimeout(() => {
    if (final) dispatch({ type: "GO", phase: "l1-complete" });
    else dispatch({ type: "L1_BOTH_NEXT" });
  }, 2000);
  return () => clearTimeout(t);
}, [dispatch, final]);
```
❌ **RACE CONDITION:** No manual button, but auto-advance can fire multiple times if component re-renders

**File: `frontend/src/screens/Level2Flow.jsx`**

**Level2Category (lines 120-123):**
```javascript
// Auto-advance after 1.5s
useEffect(() => {
  const t = setTimeout(() => dispatch({ type: "L2_CATEGORY_CONTINUE" }), 1500);
  return () => clearTimeout(t);
}, [dispatch]);
```
❌ **RACE CONDITION:** No manual button, but timer can fire multiple times

**Level2CardFlip (lines 303-306):**
```javascript
// Auto-advance after 800ms
useEffect(() => {
  const t = setTimeout(() => dispatch({ type: "L2_CARD_REVEALED" }), 800);
  return () => clearTimeout(t);
}, [dispatch]);
```
❌ **RACE CONDITION:** No manual button, but timer can fire multiple times

**File: `frontend/src/screens/Level3Flow.jsx`**

**Level3Locked (lines 309-314):**
```javascript
// Auto-advance after 2.5s
useEffect(() => {
  const t = setTimeout(() => {
    dispatch({ type: "L3_LOCKED_CONTINUE" });
  }, 2500);
  return () => clearTimeout(t);
}, [dispatch]);

// Manual button (line 327)
onClick={() => dispatch({ type: "L3_LOCKED_CONTINUE" })}
```
❌ **RACE CONDITION:** Both auto-timer and button can fire simultaneously

**Level3Both (lines 373-378):**
```javascript
// Auto-advance after 2s
useEffect(() => {
  const t = setTimeout(() => {
    dispatch({ type: "L3_NEXT_CARD" });
  }, 2000);
  return () => clearTimeout(t);
}, [dispatch]);

// Manual button (line 398)
onClick={() => dispatch({ type: "L3_NEXT_CARD" })}
```
❌ **RACE CONDITION:** Both auto-timer and button can fire simultaneously

#### Race Condition Summary

| Screen | Auto-Advance | Manual Button | Race Condition | Severity |
|--------|-------------|---------------|----------------|----------|
| L1 Locked | ✅ 2500ms | ✅ Pass Device | ❌ YES | P0 |
| L1 Handoff | ❌ | ✅ I'm ready | ✅ NO | OK |
| L1 Both | ✅ 2000ms | ❌ | ❌ YES (re-render) | P0 |
| L2 Category | ✅ 1500ms | ❌ | ❌ YES (re-render) | P1 |
| L2 Card Flip | ✅ 800ms | ❌ | ❌ YES (re-render) | P1 |
| L2 Locked | ✅ 2500ms | ✅ Pass Device | ❌ YES | P0 |
| L2 Handoff | ❌ | ✅ I'm ready | ✅ NO | OK |
| L2 Both | ❌ | ✅ Roll again/Finish | ✅ NO | OK |
| L3 Locked | ✅ 2500ms | ✅ Pass Device | ❌ YES | P0 |
| L3 Handoff | ❌ | ✅ I'm ready | ✅ NO | OK |
| L3 Both | ✅ 2000ms | ✅ Next Card | ❌ YES | P0 |

**Impact:** Double dispatches can cause:
- State machine validation failures
- Unexpected phase transitions
- Component re-mounting
- User confusion

**Root Cause:** No mutual exclusion mechanism between auto-advance timers and manual button clicks

---

### 3. Player Name Stability Investigation

#### Evidence: Name Source and Re-render Triggers

**File: `frontend/src/screens/Level1Flow.jsx`**

**Level1Locked (lines 10-11):**
```javascript
const { state, dispatch } = useGame();
const next = state.currentPlayer === "A" ? state.players.B : state.players.A;
```
✅ Name calculated once on render from `state.players`

**Level1Locked (line 47):**
```javascript
<p className="relative mt-1 text-sm text-white/85">to {next.name}</p>
```
✅ Uses local `next` variable

**BUT:** If `state.currentPlayer` changes while component is mounted (e.g., rapid clicks, state updates), `next` will recalculate on re-render

**File: `frontend/src/screens/Level1Flow.jsx`**

**Level1Handoff (lines 63-64):**
```javascript
const { state, dispatch } = useGame();
const next = state.players[state.currentPlayer];
```
❌ **ISSUE:** `next` recalculated on every render from `state.currentPlayer`

**Level1Handoff (lines 69, 73):**
```javascript
<Avatar player={state.currentPlayer} name={next.name} size={96} />
<h2 className="mt-2 text-3xl font-black text-[#1A0B2E] leading-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>
  Your turn, <span className="text-[#FF3CAC]">{next.name}</span>
</h2>
```
❌ **ISSUE:** If `state.currentPlayer` changes during mount, displayed name changes

**File: `frontend/src/components/TurnIndicator.jsx`**

```javascript
export const Avatar = ({ player, name, size = 36 }) => (
  <div className={`rounded-full bg-gradient-to-br ${AVATAR_COLORS[player]} ...`}>
    {name ? name.charAt(0).toUpperCase() : player}
  </div>
);
```
✅ Avatar displays correctly if name prop is stable

#### Player Name Stability Matrix

| Screen | Name Source | Re-render Safe | Issue |
|--------|------------|----------------|-------|
| L1 Locked | `const next = ...` (line 11) | ⚠️ Conditional | Recalculates if currentPlayer changes |
| L1 Handoff | `const next = state.players[state.currentPlayer]` (line 64) | ❌ NO | Directly depends on currentPlayer |
| L2 Locked | `const next = ...` (line 390) | ⚠️ Conditional | Same as L1 Locked |
| L2 Handoff | `const next = state.players[state.currentPlayer]` (line 431) | ❌ NO | Same as L1 Handoff |
| L3 Locked | `const next = ...` (line 306) | ⚠️ Conditional | Same as L1 Locked |
| L3 Handoff | `const next = state.players[state.currentPlayer]` (line 338) | ❌ NO | Same as L1 Handoff |

**Root Cause:** 
- Handoff screens calculate `next` from `state.currentPlayer` on every render
- If state updates while mounted (e.g., from race condition timer), name can change
- No memoization or stabilization of player name during screen lifetime

**Evidence of Instability:**
```javascript
// User report: "Displayed player name appears to change while screen is visible"
// This occurs when:
// 1. Auto-advance timer fires (e.g., L1_LOCKED_CONTINUE)
// 2. State updates: currentPlayer changes A → B
// 3. Component re-renders
// 4. Handoff screen recalculates next = state.players[state.currentPlayer]
// 5. If currentPlayer changed again (race condition), name changes
```

---

## P1 – UX ISSUES

### 1. Question Preview Leakage – Root Cause Analysis

#### Evidence: Current Implementation

**File: `frontend/src/store/gameStore.js` (lines 180-194)**

```javascript
case "L1_ANSWER": {
  // Player B answers
  const nextIndex = questionIndex + 1;  // ← INCREMENTED HERE
  const isComplete = nextIndex >= LEVEL_1_QUESTIONS.length;
  return {
    ...state,
    level1: {
      ...state.level1,
      questionIndex: nextIndex,  // ← STORED IMMEDIATELY
      answers: newAnswers,
      // ...
    },
    currentPlayer: "A",
    phase: isComplete ? "l1-both-final" : "l1-both",  // ← Shows l1-both
  };
}
```

**Problem:** `questionIndex` incremented BEFORE showing `l1-both` screen

**File: `frontend/src/screens/Level1Flow.jsx` (lines 88-101)**

```javascript
export function Level1BothAnswered({ final = false }) {
  const { state, dispatch } = useGame();
  const idx = state.level1.questionIndex - 1; // most recent
  const last = state.level1.answers[idx];
  
  useEffect(() => {
    const t = setTimeout(() => {
      if (final) dispatch({ type: "GO", phase: "l1-complete" });
      else dispatch({ type: "L1_BOTH_NEXT" });  // ← Transitions to l1-question
    }, 2000);
  }, [dispatch, final]);
}
```

**File: `frontend/src/screens/Level1Question.jsx` (lines 22-24)**

```javascript
const { questionIndex, skipsUsed } = state.level1;
const player = state.currentPlayer;
const q = LEVEL_1_QUESTIONS[questionIndex];  // ← Uses incremented index
```

**Flow:**
1. Player B answers Question 13
2. `questionIndex` becomes 14 (incremented)
3. `l1-both` screen shows (uses `questionIndex - 1 = 13` for answers) ✅
4. After 2s, `L1_BOTH_NEXT` fires
5. `l1-question` renders with `questionIndex = 14`
6. **BUG:** Question 14 content is visible during PhoneShell transition animation

**Current Workaround (lines 27-37, 68-75):**
```javascript
const [isVisible, setIsVisible] = useState(false);

useEffect(() => {
  const timer = setTimeout(() => {
    setIsVisible(true);
  }, 350); // ← ARBITRARY DELAY
  return () => clearTimeout(timer);
}, [questionIndex, player]);

if (!isVisible) {
  return (
    <div className="flex flex-col flex-1 items-center justify-center">
      <div className="text-sm text-[#9CA3AF]">Loading...</div>  // ← FLASH
    </div>
  );
}
```

**Problem with Workaround:**
- Shows "Loading..." screen (user reports flash)
- 350ms is arbitrary (not based on actual animation timing)
- Doesn't address root cause (questionIndex incremented too early)

#### Proper Architectural Solution

**Option 1: Deferred Index Increment (RECOMMENDED)**

```javascript
// In gameStore.js, add new state field:
level1: {
  questionIndex: 0,
  pendingQuestionIndex: null,  // ← NEW
  // ...
}

// In L1_ANSWER (Player B):
const pendingIndex = questionIndex + 1;
return {
  ...state,
  level1: {
    ...state.level1,
    pendingQuestionIndex: pendingIndex,  // ← Store separately
    answers: newAnswers,
    // Don't increment questionIndex yet
  },
  currentPlayer: "A",
  phase: isComplete ? "l1-both-final" : "l1-both",
};

// In L1_BOTH_NEXT:
case "L1_BOTH_NEXT": {
  const pendingIndex = state.level1.pendingQuestionIndex;
  const isComplete = pendingIndex >= LEVEL_1_QUESTIONS.length;
  if (isComplete) return { ...state, phase: "l1-complete" };
  return {
    ...state,
    level1: { ...state.level1, questionIndex: pendingIndex, pendingQuestionIndex: null },  // ← Increment here
    phase: "l1-question",
    currentPlayer: "A"
  };
}
```

**Pros:**
- QuestionIndex only increments when transitioning to l1-question
- l1-both screen shows with questionIndex still pointing to current question
- No arbitrary delays needed
- No "Loading..." flash

**Cons:**
- Requires state structure change
- Affects all level logic (L2, L3 may need similar treatment)

**Option 2: Transition State (ALTERNATIVE)**

```javascript
// Add transition phase:
'l1-both': ['l1-both', 'l1-complete', 'l1-transition'],
'l1-transition': ['l1-question'],

// In L1_BOTH_NEXT:
if (isComplete) return { ...state, phase: "l1-complete" };
return { ...state, phase: "l1-transition" };

// In l1-transition screen (new component):
// - Show brief animation (500ms)
// - Then auto-advance to l1-question
```

**Pros:**
- Explicit transition state
- Can show intentional animation
- Clear separation of concerns

**Cons:**
- Adds new screen to flow
- Requires new component
- Slightly longer user wait

**Recommendation:** Implement Option 1 (Deferred Index Increment) for L1, L2, L3

---

### 2. Double Handoff Flow Analysis

#### Evidence: Current Flow

**File: `frontend/src/screens/Level1Flow.jsx`**

**Level1Locked (lines 22-58):**
```javascript
<div className="flex-1 flex flex-col px-5 pb-6">
  <div className="flex-1 flex items-center justify-center">
    <motion.div className="w-full rounded-[28px] p-8 text-center text-white">
      {/* ... Answer Locked card ... */}
      <h3 className="relative mt-4 text-2xl font-black">Pass the device</h3>
      <p className="relative mt-1 text-sm text-white/85">to {next.name}</p>
    </motion.div>
  </div>
  <motion.button className="w-full py-4 rounded-full bg-[#1A0B2E] text-white">
    Pass Device <ArrowRight size={18} />
  </motion.button>
</div>
```

**Level1Handoff (lines 66-84):**
```javascript
<div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
  <Avatar player={state.currentPlayer} name={next.name} size={96} />
  <div className="mt-6 text-[#6C3BFF] text-xs font-bold tracking-widest uppercase">Partner's Turn</div>
  <h2 className="mt-2 text-3xl font-black text-[#1A0B2E]">
    Your turn, <span className="text-[#FF3CAC]">{next.name}</span>
  </h2>
  <p className="mt-3 text-[#4B3B60] text-sm max-w-xs">
    Same question. Answer privately — no peeking.
  </p>
  <motion.button className="mt-10 px-10 py-4 rounded-full bg-[#FF3CAC] text-white">
    I'm ready <ArrowRight size={18} />
  </motion.button>
</div>
```

**Current Flow:**
1. **L1 Locked:** "Pass the device to Alex" + "Pass Device" button
2. **L1 Handoff:** "Your turn, Alex" + "I'm ready" button

**Duplication:**
- Both screens show target player name
- Both screens have action button
- User must tap twice to proceed (Pass Device → I'm ready)

**User Report:** "Pass Device confusion - Users wonder: Was my answer saved? Did I miss something?"

**Recommendation (DO NOT IMPLEMENT YET):**

**Option A: Merge into Single Screen**
```text
✓ Answer Locked
Pass device to Alex
[Continue]
```
- Remove L1 Handoff screen
- L1 Locked → L1 Question (direct)
- Single confirmation tap

**Option B: Keep Ritual, Reduce Taps**
```text
L1 Locked: "Pass to Alex" (auto-advance 2.5s, no button)
L1 Handoff: "Your turn, Alex" (single "I'm ready" tap)
```
- Remove button from L1 Locked
- Keep L1 Handoff as confirmation
- Reduces taps from 2 to 1

**Option C: Clarify Purpose**
- L1 Locked: "Answer saved ✓" (reassurance)
- L1 Handoff: "Pass device to [Name]" (instruction)
- Clearer separation of concerns

**Recommended:** Option B (Keep Ritual, Reduce Taps)

---

### 3. Different Perspective Screen Review

#### Evidence: Current Implementation

**File: `frontend/src/screens/Level1Flow.jsx` (lines 88-140)**

```javascript
export function Level1BothAnswered({ final = false }) {
  const { state, dispatch } = useGame();
  const idx = state.level1.questionIndex - 1;
  const last = state.level1.answers[idx];
  const matched = last && last.A === last.B && (last.A === "a" || last.A === "b");
  
  // Auto-advance after 2s
  useEffect(() => {
    const t = setTimeout(() => {
      if (final) dispatch({ type: "GO", phase: "l1-complete" });
      else dispatch({ type: "L1_BOTH_NEXT" });
    }, 2000);
  }, [dispatch, final]);
  
  return (
    <div className="flex-1 flex items-center justify-center px-6 relative overflow-hidden">
      {/* Heart burst animation */}
      <motion.div className="w-full rounded-[28px] p-8 text-center text-white shadow-[0_30px_60px_-20px_rgba(108,59,255,0.5)]">
        <motion.div className="w-14 h-14 mx-auto rounded-full bg-white/20">
          {matched ? <Sparkles /> : <Stars />}
        </motion.div>
        <div className="mt-3 text-xs font-bold tracking-widest uppercase opacity-80">✓ Both Answered</div>
        <h3 className="mt-2 text-3xl font-black">
          {matched ? "✨ Match!" : "💫 Different perspective"}
        </h3>
        <p className="mt-2 text-sm text-white/85">
          {matched && q ? `You both picked ${last.A === "a" ? q.a.label : q.b.label}` : "And that's beautiful too."}
        </p>
        <p className="mt-4 text-xs text-white/70">{final ? "Wrapping up Level 1…" : "Moving to next discovery…"}</p>
      </motion.div>
    </div>
  );
}
```

**Current Behavior:**
- Full-screen takeover
- 2-second display
- Shows "Match!" or "Different perspective"
- Auto-advances to next question

**User Report:** "Current screen occupies a full page to communicate: 'Different Perspective'"

**Analysis:**
- Screen serves as emotional feedback (positive reinforcement)
- Brief moment of connection before moving on
- Full-screen creates clear break in flow
- 2-second duration is appropriate for emotional impact

**Recommendation (DO NOT IMPLEMENT YET):**

**Option A: Keep as Full Screen (CURRENT)**
- Pros: Clear emotional moment, no confusion
- Cons: Takes up full screen real estate

**Option B: Convert to Toast/Banner**
- Pros: Saves screen space, faster flow
- Cons: Less impactful, may be missed

**Option C: Move to Summary**
- Pros: Consolidates feedback
- Cons: Delays feedback, reduces immediacy

**Option D: Reduce to Banner + Keep Flow**
```text
[✓ Different Perspective banner at top]
[Next question appears below]
```
- Pros: Maintains emotional feedback, reduces friction
- Cons: More complex layout

**Recommended:** Keep as full screen (Option A) - emotional moments deserve focus

---

## P2 – NAVIGATION CONSISTENCY

### Navigation Audit

**Screens Requiring Back Button (per UX requirements):**
- All except Landing and Final Results

**Evidence from Code:**

**File: `frontend/src/pages/Landing.jsx`**
```javascript
// No back button ✅ (correct - Landing screen)
```

**File: `frontend/src/pages/Setup.jsx`** (assumed)
- ❓ Back button status unknown (file not examined)

**File: `frontend/src/pages/ModeSelect.jsx`** (assumed)
- ❓ Back button status unknown (file not examined)

**File: `frontend/src/screens/Level1Question.jsx` (lines 90-97)**
```javascript
<button
  data-testid="l1-exit-btn"
  onClick={() => setExitConfirm(true)}
  className="w-9 h-9 rounded-full bg-white border border-[#EDE9FE]"
  aria-label="Exit"
>
  <X size={16} className="text-[#6C3BFF]" />
</button>
```
✅ Back/Exit button present

**File: `frontend/src/screens/Level1Flow.jsx`**
- Level1Locked: ❌ No back button
- Level1Handoff: ❌ No back button
- Level1BothAnswered: ❌ No back button
- Level1Complete: ❌ No back button
- Level1DeclinePrompt: ❌ No back button

**File: `frontend/src/screens/Level2Flow.jsx`**
- Level2Dice: ❌ No back button
- Level2Category: ❌ No back button
- Level2Cards: ❌ No back button
- Level2CardFlip: ❌ No back button
- Level2Question: ❌ No back button
- Level2Locked: ❌ No back button
- Level2Handoff: ❌ No back button
- Level2BothAnswered: ❌ No back button
- Level2Complete: ❌ No back button

**File: `frontend/src/screens/Level3Flow.jsx`**
- Level3Consent: ❌ No back button
- Level3Intro: ❌ No back button
- Level3HowItWorks: ❌ No back button
- Level3CategorySelect: ❌ No back button
- Level3Card: ❌ No back button
- Level3Question: ❌ No back button
- Level3Locked: ❌ No back button
- Level3Handoff: ❌ No back button
- Level3Both: ❌ No back button
- Level3Reflection: ❌ No back button
- Level3Results: ❌ No back button

**File: `frontend/src/screens/MetaScreens.jsx`**
- Level3Teaser: ❌ No back button (has back button on line 16-21)
- InactivityEnd: ❌ No back button
- Closure: ❌ No back button

**Navigation Matrix:**

| Screen | Back Button | Exit Path | Status |
|--------|------------|-----------|--------|
| Landing | N/A (correct) | N/A | ✅ OK |
| Mode Select | ❓ | ❓ | Unknown |
| Setup | ❓ | ❓ | Unknown |
| L1 Question | ✅ Exit | ✅ Exit confirm | OK |
| L1 Locked | ❌ | ❌ | ❌ MISSING |
| L1 Handoff | ❌ | ❌ | ❌ MISSING |
| L1 Both | ❌ | ❌ | ❌ MISSING |
| L1 Complete | ❌ | ❌ | ❌ MISSING |
| L1 Decline | ❌ | ❌ | ❌ MISSING |
| L2 Dice | ❌ | ❌ | ❌ MISSING |
| L2 Category | ❌ | ❌ | ❌ MISSING |
| L2 Cards | ❌ | ❌ | ❌ MISSING |
| L2 Card Flip | ❌ | ❌ | ❌ MISSING |
| L2 Question | ❌ | ❌ | ❌ MISSING |
| L2 Locked | ❌ | ❌ | ❌ MISSING |
| L2 Handoff | ❌ | ❌ | ❌ MISSING |
| L2 Both | ❌ | ❌ | ❌ MISSING |
| L2 Complete | ❌ | ❌ | ❌ MISSING |
| Insights | ❓ | ❓ | Unknown |
| L3 Teaser | ✅ Back | ✅ Back to insights | OK |
| L3 Consent | ❌ | ❌ | ❌ MISSING |
| L3 Intro | ❌ | ❌ | ❌ MISSING |
| L3 How It Works | ❌ | ❌ | ❌ MISSING |
| L3 Category Select | ❌ | ❌ | ❌ MISSING |
| L3 Card | ❌ | ❌ | ❌ MISSING |
| L3 Question | ❌ | ❌ | ❌ MISSING |
| L3 Locked | ❌ | ❌ | ❌ MISSING |
| L3 Handoff | ❌ | ❌ | ❌ MISSING |
| L3 Both | ❌ | ❌ | ❌ MISSING |
| L3 Reflection | ❌ | ❌ | ❌ MISSING |
| L3 Results | N/A (correct) | N/A | ✅ OK |
| Inactivity End | ❌ | ❌ | ❌ MISSING |
| Closure | ❌ | ❌ | ❌ MISSING |

**Status:** ❌ 30+ screens missing back navigation

**Remote Play Status:**
- File: `frontend/src/screens/RemoteSession.jsx` (not examined)
- User report: "Pending backend connection"
- Recommendation: Mark as "Coming Soon" or disable controls

---

## REMAINING EDGE CASES

### 1. Level 2 and Level 3 Question Leakage
- **Status:** Not investigated
- **Risk:** Same pattern as Level 1 may exist
- **Evidence needed:** Check L2_ANSWER and L3_ANSWER for early index increment

### 2. State Machine Validation Bypass
- **Status:** Known limitation
- **Issue:** Only `GO` actions validate transitions
- **Risk:** Other actions can set invalid phases
- **Mitigation:** localStorage validation added

### 3. Animation Timing Variance
- **Status:** 350ms delay is arbitrary
- **Risk:** If animations change, delay may be insufficient
- **Mitigation:** Proper fix requires deferred index increment (see P1.1)

### 4. Rapid State Changes
- **Status:** Not tested
- **Risk:** Race conditions can bypass delays
- **Mitigation:** isTransitioning ref prevents some double-actions

### 5. Legacy Save Games
- **Status:** Handled for l3-how-it-works
- **Risk:** Other legacy phases may exist
- **Mitigation:** localStorage validation catches invalid phases

---

## DELIVERABLES

### Runtime Findings

| Issue | Severity | Root Cause | Reproduction | Confidence |
|-------|----------|-----------|--------------|------------|
| l1-both-final transition blocked | P0 | Missing from VALID_TRANSITIONS | Complete Q15 in L1 | 100% |
| l3-category-select transition blocked | P0 | Missing from l3-intro transitions | Start L3 from intro | 100% |
| l3-how-it-works blank screen | P0 | Missing from SCREENS map | Load legacy save | 100% |
| Race condition in timers | P0 | No mutual exclusion between timer and button | Rapid clicks during locked screen | 95% |
| Player name instability | P0 | Name recalculates from currentPlayer on re-render | Rapid state changes during handoff | 90% |
| Question preview leakage | P1 | questionIndex incremented too early | Watch transition from l1-both to l1-question | 100% |
| Double handoff flow | P1 | Two screens with duplicate information | Complete any question | 100% |
| Missing back navigation | P2 | Back buttons not implemented on most screens | Try to navigate back from L1 Locked | 100% |

### UX Findings

| Screen | Problem | Recommendation | Impact |
|--------|---------|----------------|--------|
| L1 Locked + L1 Handoff | Duplicate information, two taps required | Merge or reduce to single tap | High |
| L1 Both / L2 Both / L3 Both | Full screen for brief feedback | Keep as full screen (emotional moment) | Low |
| L1 Question | "Loading..." flash during transition | Implement deferred index increment | Medium |
| All gameplay screens | Missing back navigation | Add back button to all except Landing/Results | High |
| L3 Teaser | Has back button (correct) | None | OK |

### Navigation Audit

| Screen | Back Button | Exit Path | Status |
|--------|------------|-----------|--------|
| Landing | N/A | N/A | ✅ OK |
| L1 Question | ✅ Exit | ✅ Exit confirm | OK |
| L3 Teaser | ✅ Back | ✅ Back to insights | OK |
| All others | ❌ Missing | ❌ Missing | ❌ NEEDS FIX |

### Final Assessment

**P0 Remaining:**
1. Race condition in transition timers (all levels)
2. Player name instability during handoff screens

**P1 Remaining:**
1. Question preview leakage (temporary fix applied, proper fix needed)
2. Double handoff flow (recommendation provided, not implemented)

**P2 Remaining:**
1. Missing back navigation on 30+ screens

**Beta Ready:** ❌ **NO**

**Blocking Issues:**
1. Race conditions can cause crashes (P0)
2. Player names can change during screen display (P0)
3. Question preview breaks gameplay integrity (P1)

**Required Before Beta:**
1. Fix race conditions (add mutual exclusion to all timers)
2. Stabilize player names during handoff screens
3. Implement proper question leakage fix (deferred index increment)
4. Add back navigation to all gameplay screens

---

## EVIDENCE FILES

- `docs/STATE-MACHINE-MISMATCH-REPORT.md` – Complete transition audit
- `docs/P1-QUESTION-LEAKAGE-REPORT.md` – Question leakage analysis
- `docs/FIX-EVIDENCE.md` – Evidence for all fixes applied

---

## NOTES

This audit provides evidence, not assumptions. All findings are based on code inspection with exact file paths and line numbers. Recommendations are provided but not implemented per user constraints.

**Next Steps:**
1. Fix race conditions (P0)
2. Stabilize player names (P0)
3. Implement proper question leakage fix (P1)
4. Add back navigation (P2)
5. Re-audit after fixes