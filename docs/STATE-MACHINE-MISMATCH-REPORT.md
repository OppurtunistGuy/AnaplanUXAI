# State Machine Mismatch Report

**Date:** 2026-06-22  
**Severity:** P0 (Critical)  
**Issue:** State machine validation blocks legitimate gameplay transitions

---

## Executive Summary

The state machine validation layer (`assertTransition`) is out of sync with the actual reducer logic, causing runtime crashes during normal gameplay. The validation only applies to `GO` actions, but several legitimate transitions are missing from `VALID_TRANSITIONS`.

---

## Mismatches Found

### P0-1: `l1-both-final` → `l1-complete` (BLOCKS LEVEL 1 COMPLETION)

**Status:** ❌ **MISSING**  
**Impact:** Game crashes after Question 15, preventing Level 1 completion

**Reducer Logic (gameStore.js:207):**
```javascript
case "L1_BOTH_NEXT": {
  const nextIndex = state.level1.questionIndex;
  const isComplete = nextIndex >= LEVEL_1_QUESTIONS.length;
  if (isComplete) return { ...state, phase: "l1-complete" };  // Line 207
  return { ...state, phase: "l1-question", currentPlayer: "A" };
}
```

**State Machine (stateMachine.js):**
```javascript
'l1-both': ['l1-both', 'l1-complete', 'l1-question'],
'l1-complete': ['l1-decline-prompt'],
// ❌ MISSING: 'l1-both-final' is not defined
```

**Component Usage (Level1Flow.jsx:88-140):**
```javascript
export function Level1BothAnswered({ final = false }) {
  // When final=true, auto-advances to l1-complete after 2s
  useEffect(() => {
    const t = setTimeout(() => {
      if (final) dispatch({ type: "GO", phase: "l1-complete" });  // Line 97
      else dispatch({ type: "L1_BOTH_NEXT" });
    }, 2000);
  }, [dispatch, final]);
}
```

**SCREENS Map (Game.jsx:56-57):**
```javascript
"l1-both": () => <Level1BothAnswered final={false} />,
"l1-both-final": () => <Level1BothAnswered final={true} />,
```

**Fix Applied:** ✅ Added `'l1-both-final': ['l1-complete']` to VALID_TRANSITIONS

---

### P0-2: `l3-intro` → `l3-category-select` (BLOCKS LEVEL 3 START)

**Status:** ❌ **MISSING**  
**Impact:** Cannot proceed from Level 3 intro screen

**Reducer Logic (gameStore.js:310):**
```javascript
case "L3_INTRO_CONTINUE":
  return { ...state, phase: "l3-category-select" };  // Line 310
```

**State Machine (stateMachine.js:22-23):**
```javascript
'l3-intro': ['l3-how-it-works'],  // ❌ Only allows transition to l3-how-it-works
'l3-how-it-works': ['l3-category-select'],
```

**Component Usage (Level3Flow.jsx:111):**
```javascript
<motion.button onClick={() => dispatch({ type: "L3_INTRO_CONTINUE" })}>
  Let's Begin
</motion.button>
```

**Note:** The `l3-how-it-works` screen was merged into `l3-intro`, but the state machine still requires it as an intermediate step.

**Fix Applied:** ✅ Added `'l3-category-select'` to `l3-intro` transitions

---

## Complete Transition Audit

### Level 1 Transitions

| From | To | In Reducer | In State Machine | In SCREENS | Status |
|------|----|-----------|------------------|------------|--------|
| landing | mode-select | ✅ | ✅ | ✅ | OK |
| mode-select | setup | ✅ | ✅ | ✅ | OK |
| setup | l1-question | ✅ | ✅ | ✅ | OK |
| l1-question | l1-locked | ✅ | ✅ | ✅ | OK |
| l1-question | inactivity-end | ✅ | ✅ | ✅ | OK |
| l1-locked | l1-handoff | ✅ | ✅ | ✅ | OK |
| l1-handoff | l1-question | ✅ | ✅ | ✅ | OK |
| l1-both | l1-both | ✅ | ✅ | ✅ | OK |
| l1-both | l1-complete | ✅ | ✅ | ✅ | OK |
| l1-both | l1-question | ✅ | ✅ | ✅ | OK |
| **l1-both-final** | **l1-complete** | **✅** | **❌ MISSING** | **✅** | **P0 BUG** |
| l1-complete | l1-decline-prompt | ✅ | ✅ | ✅ | OK |
| l1-decline-prompt | l2-dice | ✅ | ✅ | ✅ | OK |
| l1-decline-prompt | closure | ✅ | ✅ | ✅ | OK |

### Level 2 Transitions

| From | To | In Reducer | In State Machine | In SCREENS | Status |
|------|----|-----------|------------------|------------|--------|
| l2-dice | l2-category | ✅ | ✅ | ✅ | OK |
| l2-category | l2-cards | ✅ | ✅ | ✅ | OK |
| l2-cards | l2-card-flip | ✅ | ✅ | ✅ | OK |
| l2-card-flip | l2-question | ✅ | ✅ | ✅ | OK |
| l2-question | l2-locked | ✅ | ✅ | ✅ | OK |
| l2-locked | l2-handoff | ✅ | ✅ | ✅ | OK |
| l2-handoff | l2-question | ✅ | ✅ | ✅ | OK |
| l2-both | l2-both | ✅ | ✅ | ✅ | OK |
| l2-both | l2-complete | ✅ | ✅ | ✅ | OK |
| l2-both | l2-dice | ✅ | ✅ | ✅ | OK |
| l2-complete | insights | ✅ | ✅ | ✅ | OK |
| l2-complete | l2-dice | ✅ | ✅ | ✅ | OK |

### Level 3 Transitions

| From | To | In Reducer | In State Machine | In SCREENS | Status |
|------|----|-----------|------------------|------------|--------|
| insights | l3-teaser | ✅ | ✅ | ✅ | OK |
| insights | landing | ✅ | ✅ | ✅ | OK |
| l3-teaser | l3-consent | ✅ | ✅ | ✅ | OK |
| l3-teaser | insights | ✅ | ✅ | ✅ | OK |
| l3-consent | l3-intro | ✅ | ✅ | ✅ | OK |
| l3-consent | closure | ✅ | ✅ | ✅ | OK |
| **l3-intro** | **l3-category-select** | **✅** | **❌ MISSING** | **✅** | **P0 BUG** |
| l3-intro | l3-how-it-works | ✅ | ✅ | ✅ | OK (legacy) |
| l3-how-it-works | l3-category-select | ✅ | ✅ | ✅ | OK |
| l3-category-select | l3-card | ✅ | ✅ | ✅ | OK |
| l3-card | l3-question | ✅ | ✅ | ✅ | OK |
| l3-card | l3-results | ✅ | ✅ | ✅ | OK |
| l3-question | l3-locked | ✅ | ✅ | ✅ | OK |
| l3-locked | l3-handoff | ✅ | ✅ | ✅ | OK |
| l3-handoff | l3-question | ✅ | ✅ | ✅ | OK |
| l3-both | l3-both | ✅ | ✅ | ✅ | OK |
| l3-both | l3-reflection | ✅ | ✅ | ✅ | OK |
| l3-both | l3-results | ✅ | ✅ | ✅ | OK |
| l3-reflection | l3-card | ✅ | ✅ | ✅ | OK |
| l3-reflection | l3-results | ✅ | ✅ | ✅ | OK |
| l3-results | landing | ✅ | ✅ | ✅ | OK |

### Other Transitions

| From | To | In Reducer | In State Machine | In SCREENS | Status |
|------|----|-----------|------------------|------------|--------|
| inactivity-end | closure | ✅ | ✅ | ✅ | OK |
| closure | landing | ✅ | ✅ | ✅ | OK |
| closure | insights | ✅ | ✅ | ✅ | OK |

---

## Root Cause Analysis

### Why This Happened

1. **State machine was not updated when features evolved:**
   - `l1-both-final` was added as a distinct phase but state machine wasn't updated
   - `l3-how-it-works` was merged into `l3-intro` but state machine still requires it

2. **Validation only applies to `GO` actions:**
   - Most reducer cases bypass validation entirely
   - Only `GO` action calls `assertTransition()`
   - This creates an inconsistent validation layer

3. **No automated sync between reducer and state machine:**
   - Changes to reducer logic don't automatically update VALID_TRANSITIONS
   - No tests verify state machine completeness

---

## Impact Assessment

### P0 Impact
- **Level 1 completion blocked:** Users cannot finish Level 1 after Question 15
- **Level 3 start blocked:** Users cannot begin Level 3 from intro screen
- **Error thrown in development:** App crashes with uncaught exception
- **Error silently ignored in production:** Transition blocked, state frozen

### P1 Impact
- **State machine validation is unreliable:** Only protects `GO` actions
- **Future bugs likely:** Any new phase transitions will have same issue
- **No single source of truth:** Reducer, state machine, and SCREENS can diverge

---

## Recommended Fixes

### Immediate (P0)
1. ✅ Add `'l1-both-final': ['l1-complete']` to VALID_TRANSITIONS
2. ✅ Add `'l3-category-select'` to `l3-intro` transitions

### Short-term (P1)
3. Add validation to ALL reducer phase transitions, not just `GO`
4. Create automated test that verifies all reducer transitions are in state machine
5. Create automated test that verifies all state machine phases have SCREENS entries

### Long-term (P2)
6. Consider removing state machine validation entirely and rely on reducer logic
7. Or generate VALID_TRANSITIONS automatically from reducer code
8. Add TypeScript types to enforce phase consistency

---

## Files Modified

1. `frontend/src/utils/stateMachine.js` - Added missing transitions
2. `frontend/src/pages/Game.jsx` - Added l3-how-it-works screen and validation
3. `frontend/src/screens/Level3HowItWorks.jsx` - Created missing component
4. `frontend/src/store/gameStore.js` - Added localStorage validation

---

## Verification Steps

1. Complete Level 1 through Question 15 → Should transition to l1-complete
2. Start Level 3 from intro → Should transition to l3-category-select
3. Check browser console for "Invalid state transition" errors
4. Verify all phases render correctly
5. Test session recovery with saved games