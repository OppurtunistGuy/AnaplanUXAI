# P1 Gameplay Integrity Issue - Question Leakage During Transitions

**Date:** 2026-06-22  
**Severity:** P1 (High)  
**Issue:** Next question briefly renders during transition states, breaking blind-answer mechanic

---

## Evidence

### Screenshot 1: l1-both Screen (Correct)
- Shows "✓ BOTH ANSWERED"
- Shows "Different perspective"
- Shows "Moving to next discovery..."
- This is the expected behavior

### Screenshot 2: Question Preview (BUG)
- Shows "Question 14 of 15"
- Shows "Pick your dessert side"
- Shows answer options (Sweet/Savory)
- This is the NEXT question rendering prematurely
- Should only appear after handoff flow completes

### Console Error
```
Uncaught runtime errors:
ERROR
Invalid state transition: l1-both-final -> l1-complete
```

---

## Root Cause Analysis

### The Flow Problem

**Intended Flow (Level 1, subsequent questions):**
1. Player A answers → `l1-locked` (2.5s) → `l1-handoff` → Player B's turn
2. Player B answers → `l1-both` (2s animation) → `l1-question` (next question)

**Actual Flow (with bug):**
1. Player B answers → `l1-both` 
2. **BUG:** Next question briefly renders during `l1-both` → `l1-question` transition
3. Player sees next question content before their turn

### Why It Happens

**Issue 1: questionIndex Incremented Too Early**

In `gameStore.js:180-193`:
```javascript
case "L1_ANSWER": {
  // Player B answers
  const nextIndex = questionIndex + 1;  // ← Incremented HERE
  const isComplete = nextIndex >= LEVEL_1_QUESTIONS.length;
  return {
    ...state,
    level1: {
      ...state.level1,
      questionIndex: nextIndex,  // ← Stored immediately
      answers: newAnswers,
      // ...
    },
    currentPlayer: "A",
    phase: isComplete ? "l1-both-final" : "l1-both",  // ← Shows l1-both
  };
}
```

The `questionIndex` is incremented BEFORE showing the `l1-both` screen. This means:
- `l1-both` screen shows with `questionIndex` already pointing to next question
- `Level1BothAnswered` component uses `questionIndex - 1` to show correct answers (line 90)
- But if `l1-question` renders at all during transition, it shows the NEXT question

**Issue 2: Direct Transition from l1-both to l1-question**

In `gameStore.js:204-209`:
```javascript
case "L1_BOTH_NEXT": {
  const nextIndex = state.level1.questionIndex;
  const isComplete = nextIndex >= LEVEL_1_QUESTIONS.length;
  if (isComplete) return { ...state, phase: "l1-complete" };
  return { ...state, phase: "l1-question", currentPlayer: "A" };  // ← Direct jump
}
```

For subsequent questions (after the first), the flow is:
- `l1-both` → `l1-question` (direct, no handoff screens)

This is intentional for gameplay flow, but creates a moment where the next question is visible.

**Issue 3: PhoneShell Animation May Cause Flash**

In `PhoneShell.jsx:6-17`:
```javascript
<AnimatePresence mode="wait">
  <motion.div
    key={keyId}
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -12 }}
  >
    {children}
  </motion.div>
</AnimatePresence>
```

The `keyId` for l1-question includes the questionIndex:
```javascript
const keyId = state.phase === "l1-question"
  ? `l1q-${state.level1.questionIndex}-${state.currentPlayer}`
  : state.phase;
```

When questionIndex changes, the key changes, causing AnimatePresence to treat it as a new component. This can cause a brief flash as the new component mounts.

---

## Impact Assessment

### Gameplay Impact
- **Breaks blind-answer mechanic:** Player B can see the next question before their turn
- **Unfair advantage:** Player on next turn gets to preview the question
- **Breaks immersion:** Transition feels jarring and unpolished

### Technical Impact
- **State management issue:** questionIndex incremented at wrong time
- **Animation timing issue:** Component renders before transition completes
- **Inconsistent flow:** First question has handoff screens, subsequent questions don't

---

## Affected Areas

### Level 1
- ✅ `l1-both` → `l1-question` transition (subsequent questions)
- ✅ `l1-both-final` → `l1-complete` transition (final question)

### Level 2
- ⚠️ Similar pattern: `l2-both` → `l2-question` (check if same issue)
- Need to audit Level 2 flow

### Level 3
- ⚠️ Similar pattern: `l3-both` → `l3-card` or `l3-reflection`
- Need to audit Level 3 flow

---

## Recommended Fixes

### Option 1: Delay questionIndex Increment (Preferred)
**Pros:** Cleanest solution, maintains correct state throughout flow  
**Cons:** Requires refactoring reducer logic

```javascript
// In L1_ANSWER, don't increment questionIndex yet
// Instead, store it as "pendingNextIndex"
// Increment it when transitioning from l1-both to l1-question
```

### Option 2: Add Transition Screen
**Pros:** Simple, explicit user feedback  
**Cons:** Adds extra screen to flow

Add a brief "Get ready..." screen between `l1-both` and `l1-question`:
- `l1-both` → `l1-transition` (1s) → `l1-question`

### Option 3: Hide Question Content During Mount
**Pros:** Minimal code change  
**Cons:** Feels like a band-aid fix

In `Level1Question.jsx`, add a mount delay:
```javascript
const [isVisible, setIsVisible] = useState(false);

useEffect(() => {
  const t = setTimeout(() => setIsVisible(true), 300);
  return () => clearTimeout(t);
}, []);

// Only render question content when isVisible is true
```

### Option 4: Use Previous questionIndex for l1-both Screen
**Pros:** Maintains current flow  
**Cons:** Requires storing previous index

Store the current question index separately from the next question index:
- `currentQuestionIndex`: Shows in l1-question
- `nextQuestionIndex`: Used for l1-both screen logic

---

## Recommended Approach

**Implement Option 3 (quick fix) + Option 1 (proper fix)**

1. **Immediate:** Add mount delay to prevent flash (Option 3)
2. **Short-term:** Refactor to delay questionIndex increment (Option 1)
3. **Long-term:** Add transition screens for all level changes (Option 2)

---

## Files to Modify

1. `frontend/src/screens/Level1Question.jsx` - Add mount delay
2. `frontend/src/store/gameStore.js` - Refactor questionIndex timing
3. `frontend/src/screens/Level2Flow.jsx` - Check for similar issues
4. `frontend/src/screens/Level3Flow.jsx` - Check for similar issues

---

## Verification Steps

1. Complete Question 13 in Level 1
2. Verify "Both Answered" screen shows for 2 seconds
3. Verify NO question content is visible during transition
4. Verify next question only appears after handoff flow
5. Repeat for Questions 1-14
6. Test Level 2 and Level 3 for similar issues