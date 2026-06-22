# Sprint 1 Implementation Plan – Mandatory Beta Fixes

**Sprint Goal:** Fix all trust-breaking issues before beta release  
**Timeline:** Immediate  
**Blocker:** None of these can wait

---

## Tasks

### 1. Race Condition Protection (P0.1)

**Problem:** Auto-advance timers and manual buttons can fire simultaneously, causing double transitions

**Solution:** Add `isTransitioning` guard to all screens with auto-advance timers

**Files to modify:**
- `frontend/src/screens/Level1Flow.jsx` (Level1Locked, Level1BothAnswered)
- `frontend/src/screens/Level2Flow.jsx` (Level2Category, Level2CardFlip)
- `frontend/src/screens/Level3Flow.jsx` (Level3Locked, Level3Both)

**Implementation:**
```javascript
// Add to each affected component:
const [isTransitioning, setIsTransitioning] = useState(false);

// In auto-advance useEffect:
useEffect(() => {
  const t = setTimeout(() => {
    if (!isTransitioning) {
      setIsTransitioning(true);
      dispatch({ type: "..." });
    }
  }, delay);
  return () => clearTimeout(t);
}, [dispatch, isTransitioning]);

// In manual button onClick:
onClick={() => {
  if (!isTransitioning) {
    setIsTransitioning(true);
    dispatch({ type: "..." });
  }
}}
```

---

### 2. Player Name Stabilization (P0.2)

**Problem:** Player name recalculates from `state.currentPlayer` on every render, causing name changes during handoff

**Solution:** Capture player name once when screen opens using `useRef` or `useState`

**Files to modify:**
- `frontend/src/screens/Level1Flow.jsx` (Level1Locked, Level1Handoff)
- `frontend/src/screens/Level2Flow.jsx` (Level2Locked, Level2Handoff)
- `frontend/src/screens/Level3Flow.jsx` (Level3Locked, Level3Handoff)

**Implementation:**
```javascript
// Replace:
const next = state.players[state.currentPlayer];

// With:
const [handoffPlayerName, setHandoffPlayerName] = useState(null);
const nextPlayer = state.currentPlayer === "A" ? state.players.B : state.players.A;

useEffect(() => {
  setHandoffPlayerName(nextPlayer.name);
}, []); // Empty deps = only on mount

// Use handoffPlayerName in JSX instead of recalculating
```

---

### 3. Question Leakage Fix (P0.3)

**Problem:** `questionIndex` increments too early, allowing next question to render during transition

**Solution:** Defer index increment until transitioning to question screen

**Files to modify:**
- `frontend/src/store/gameStore.js` (Add `pendingQuestionIndex` to state)
- `frontend/src/screens/Level1Question.jsx` (Remove 350ms delay workaround)
- Similar changes for L2, L3 if needed

**Implementation:**
```javascript
// In initialState:
level1: {
  questionIndex: 0,
  pendingQuestionIndex: null,  // NEW
  // ...
}

// In L1_ANSWER (Player B):
const pendingIndex = questionIndex + 1;
return {
  ...state,
  level1: {
    ...state.level1,
    pendingQuestionIndex: pendingIndex,  // Store separately
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
    level1: { 
      ...state.level1, 
      questionIndex: pendingIndex,  // Increment HERE
      pendingQuestionIndex: null 
    },
    phase: "l1-question",
    currentPlayer: "A"
  };
}
```

---

### 4. State Machine Validation (Already Complete)

**Status:** ✅ Fixed in previous sprint
- Added `l1-both-final` transitions
- Added `l3-category-select` to `l3-intro`
- Added `l3-how-it-works` to SCREENS

---

## Implementation Order

1. **Race conditions** (affects all levels, prevents crashes)
2. **Player name stabilization** (most visible bug to users)
3. **Question leakage** (proper fix, removes need for 350ms delay)
4. **Testing** (verify all fixes work together)

---

## Success Criteria

- [ ] No double transitions possible (race conditions fixed)
- [ ] Player name never changes during handoff screen
- [ ] Next question never visible before handoff completes
- [ ] All state machine transitions valid
- [ ] App can complete full gameplay without errors
- [ ] Internal QA signs off

---

## After Sprint 1

**Next:** Sprint 2 (Back Navigation + Single Handoff Screen)  
**Then:** Closed Beta  
**Finally:** Sprint 3 (Polish based on beta feedback)