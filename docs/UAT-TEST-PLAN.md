# KnowEm V3 — UAT Test Plan

**Date:** 2026-06-22  
**Tester:** [Tester Name]  
**Environment:** Development (localhost:3000)  
**Build:** Commit [latest commit hash]

---

## TESTING INSTRUCTIONS

### How to Test
1. Open browser to `http://localhost:3000`
2. Open DevTools Console (F12) to monitor for errors
3. Open DevTools Application tab → Local Storage → `knowem_session` to inspect state
4. Follow each test scenario step-by-step
5. Document any failures with screenshot and console errors

### What to Look For
- **Console errors:** Red text in DevTools Console
- **UI glitches:** Broken layouts, missing elements, overlapping text
- **Flow breaks:** Stuck screens, infinite loops, missing transitions
- **Data loss:** Answers not saved, state not persisted
- **Crashes:** White screen, ErrorBoundary recovery screen

---

## TEST SCENARIO 1: Fresh User Journey

**Objective:** Verify complete gameplay flow from landing to results

### Steps
1. Open `http://localhost:3000`
2. Verify landing screen loads
3. Tap "Start Playing"
4. Enter Player A name: "Alex"
5. Enter Player B name: "Jordan"
6. Tap "Start Game"
7. Play through Level 1 (answer 3-5 questions)
8. Complete Level 1
9. Continue to Level 2
10. Roll dice, pick card, answer (1-2 rounds)
11. Continue to Level 3
12. Complete Level 3 (5-10 cards)
13. View results

### Expected Results
- ✅ Landing screen displays correctly
- ✅ Setup screen accepts names
- ✅ Level 1 questions load with animations
- ✅ Answers save after each question
- ✅ Handoff screens appear between players
- ✅ Level 2 dice rolls and category reveals
- ✅ Level 3 cards flip and reveal
- ✅ Results screen shows completion

### Potential Issues to Watch For
- [ ] "answers is not iterable" error in console
- [ ] State not persisting between questions
- [ ] Handoff screens not appearing
- [ ] Auto-advance triggering too quickly/slowly
- [ ] Missing animations or broken transitions

### Actual Results
**Status:** ⬜ Pass / ⬜ Fail  
**Notes:**  
**Screenshot:** [Attach screenshot]  
**Console Errors:** [List any errors]

---

## TEST SCENARIO 2: Refresh Testing

**Objective:** Verify state persistence and recovery after page refresh

### Test 2.1: Refresh on Landing
**Steps:**
1. Complete a full game (or partial game)
2. Navigate back to landing (or close and reopen app)
3. Verify session recovery prompt appears
4. Tap "Continue" or "Start Fresh"

**Expected:** Session recovery detects saved game, offers to continue

**Actual:**  
**Status:** ⬜ Pass / ⬜ Fail  
**Console Errors:**  

---

### Test 2.2: Refresh on Level 1 Question
**Steps:**
1. Start game, play Level 1
2. During a question (before answering), press F5 to refresh
3. Verify app recovers to same question
4. Answer the question
5. Continue playing

**Expected:** Returns to same question, state preserved

**Actual:**  
**Status:** ⬜ Pass / ⬜ Fail  
**Console Errors:**  

---

### Test 2.3: Refresh on Level 1 Locked
**Steps:**
1. Play Level 1, answer a question
2. On l1-locked screen, press F5 to refresh
3. Verify app recovers to l1-locked or l1-handoff
4. Continue playing

**Expected:** Returns to locked/handoff state, can continue

**Actual:**  
**Status:** ⬜ Pass / ⬜ Fail  
**Console Errors:**  

---

### Test 2.4: Refresh on Level 2 Dice
**Steps:**
1. Complete Level 1, enter Level 2
2. On l2-dice screen, press F5 to refresh
3. Verify app recovers to l2-dice
4. Roll dice again

**Expected:** Returns to dice screen, can roll again

**Actual:**  
**Status:** ⬜ Pass / ⬜ Fail  
**Console Errors:**  

---

### Test 2.5: Refresh on Level 2 Category
**Steps:**
1. Roll dice, wait for category reveal
2. On l2-category screen, press F5 to refresh
3. Verify app recovers or redirects appropriately

**Expected:** Either recovers to category or redirects to dice

**Actual:**  
**Status:** ⬜ Pass / ⬜ Fail  
**Console Errors:**  

---

### Test 2.6: Refresh on Level 2 Question
**Steps:**
1. Pick a card, answer question
2. On l2-question screen (while typing), press F5
3. Verify app recovers to question
4. Re-enter answer
5. Submit

**Expected:** Returns to question, can re-answer

**Actual:**  
**Status:** ⬜ Pass / ⬜ Fail  
**Console Errors:**  

---

### Test 2.7: Refresh on Level 3 Card
**Steps:**
1. Enter Level 3, select category
2. On l3-card screen (before revealing), press F5
3. Verify app recovers to card screen
4. Reveal and answer

**Expected:** Returns to same card, can continue

**Actual:**  
**Status:** ⬜ Pass / ⬜ Fail  
**Console Errors:**  

---

### Test 2.8: Refresh on Level 3 Question
**Steps:**
1. Answer Level 3 card
2. On l3-question screen, press F5
3. Verify app recovers to question
4. Re-enter answer
5. Submit

**Expected:** Returns to question, can re-answer

**Actual:**  
**Status:** ⬜ Pass / ⬜ Fail  
**Console Errors:**  

---

### Test 2.9: Refresh on Level 3 Both (Reveal)
**Steps:**
1. Both players answer Level 3 card
2. On l3-both screen, press F5
3. Verify app recovers to reveal screen
4. Continue to next card

**Expected:** Returns to reveal, can continue

**Actual:**  
**Status:** ⬜ Pass / ⬜ Fail  
**Console Errors:**  

---

## TEST SCENARIO 3: Restart Testing

**Objective:** Verify "Start Over" functionality from every level

### Test 3.1: Restart from Level 1
**Steps:**
1. Play Level 1 (answer 2-3 questions)
2. Navigate to landing (or use browser back)
3. Start new game
4. Verify old answers cleared

**Expected:** Fresh game starts, no old data

**Actual:**  
**Status:** ⬜ Pass / ⬜ Fail  
**Console Errors:**  

---

### Test 3.2: Restart from Level 2
**Steps:**
1. Complete Level 1, enter Level 2
2. Play 1 round
3. Navigate to landing, start new game
4. Verify Level 2 data cleared

**Expected:** Fresh game, starts at Level 1

**Actual:**  
**Status:** ⬜ Pass / ⬜ Fail  
**Console Errors:**  

---

### Test 3.3: Restart from Level 3
**Steps:**
1. Complete Levels 1-2, enter Level 3
2. Answer 5 cards
3. Navigate to landing, start new game
4. Verify Level 3 data cleared

**Expected:** Fresh game, starts at Level 1

**Actual:**  
**Status:** ⬜ Pass / ⬜ Fail  
**Console Errors:**  

---

### Test 3.4: Restart from Results
**Steps:**
1. Complete full game (all levels)
2. View results screen
3. Tap "Play Again"
4. Verify complete reset

**Expected:** Fresh game, all data cleared

**Actual:**  
**Status:** ⬜ Pass / ⬜ Fail  
**Console Errors:**  

---

## TEST SCENARIO 4: Corrupted localStorage

**Objective:** Verify app handles corrupted/invalid localStorage data gracefully

### Test 4.1: Empty Object
**Steps:**
1. Open DevTools → Application → Local Storage
2. Find `knowem_session` key
3. Edit value to: `{}`
4. Refresh page
5. Observe behavior

**Expected:** App detects invalid state, starts fresh game

**Actual:**  
**Status:** ⬜ Pass / ⬜ Fail  
**Console Errors:**  
**Screenshot:** [Attach screenshot showing error or recovery]

---

### Test 4.2: Missing Answers Array
**Steps:**
1. Edit `knowem_session` to:
```json
{
  "version": 1,
  "phase": "l3-question",
  "level3": {
    "deck": [...],
    "cardIndex": 0,
    "answers": null
  }
}
```
2. Refresh page
3. Observe behavior

**Expected:** Validation fixes `answers` to `[]`, continues gameplay

**Actual:**  
**Status:** ⬜ Pass / ⬜ Fail  
**Console Errors:**  
**Screenshot:**  

---

### Test 4.3: Invalid Phase
**Steps:**
1. Edit `knowem_session` to:
```json
{
  "version": 1,
  "phase": "invalid-phase",
  "level1": { "answers": [] }
}
```
2. Refresh page
3. Observe behavior

**Expected:** State machine blocks invalid transition, stays on landing or redirects to valid phase

**Actual:**  
**Status:** ⬜ Pass / ⬜ Fail  
**Console Errors:**  
**Screenshot:**  

---

### Test 4.4: Corrupted JSON
**Steps:**
1. Edit `knowem_session` to: `{ invalid json`
2. Refresh page
3. Observe behavior

**Expected:** JSON parse fails, app starts fresh game

**Actual:**  
**Status:** ⬜ Pass / ⬜ Fail  
**Console Errors:**  
**Screenshot:**  

---

### Test 4.5: Missing Required Fields
**Steps:**
1. Edit `knowem_session` to:
```json
{
  "version": 1,
  "phase": "l1-question"
}
```
2. Refresh page
3. Observe behavior

**Expected:** Validation adds missing fields with defaults, continues gameplay

**Actual:**  
**Status:** ⬜ Pass / ⬜ Fail  
**Console Errors:**  
**Screenshot:**  

---

## TEST SCENARIO 5: Level 3 Complete Journey

**Objective:** Verify full Level 3 gameplay with all card types

### Test 5.1: Truth Card Flow
**Steps:**
1. Enter Level 3, select any category
2. Reveal a Truth card
3. Type answer (50+ characters)
4. Submit
5. Pass device (or wait for auto-advance)
6. View reveal screen
7. Continue to next card

**Expected:** 
- Card reveals correctly
- Answer saves
- Both answers shown on reveal
- Auto-advance after 2s

**Actual:**  
**Status:** ⬜ Pass / ⬜ Fail  
**Console Errors:**  

---

### Test 5.2: Dare Card Flow
**Steps:**
1. Continue to next card (Dare)
2. Reveal dare
3. Type answer
4. Submit, pass device
5. View reveal

**Expected:** Same as Truth, different card type

**Actual:**  
**Status:** ⬜ Pass / ⬜ Fail  
**Console Errors:**  

---

### Test 5.3: Hot Layer Card (No Input)
**Steps:**
1. Continue to card 11+ (Hot Layer)
2. Reveal card
3. Verify no text input shown
4. Tap "Pass to [Partner]"
5. View reveal

**Expected:** 
- No textarea for Hot Layer cards
- Shows "Feel free to react or pass" message
- Pass button works

**Actual:**  
**Status:** ⬜ Pass / ⬜ Fail  
**Console Errors:**  

---

### Test 5.4: Reflection Screen
**Steps:**
1. After both answer a card (non-last card)
2. Verify reflection screen appears
3. Select a reaction (e.g., "Very Surprised")
4. Wait for auto-advance (2s)
5. Continue to next card

**Expected:**
- Reflection screen shows 3 reaction options
- Selecting reaction highlights it
- Auto-advance after 2s
- Moves to next card

**Actual:**  
**Status:** ⬜ Pass / ⬜ Fail  
**Console Errors:**  

---

### Test 5.5: Complete Level 3 (20 Cards)
**Steps:**
1. Play through all 20 cards
2. Answer all questions
3. Complete all reflections
4. View results screen

**Expected:**
- All 20 cards playable
- All answers saved
- Results screen shows completion
- "Return to Home" and "Play Again" buttons work

**Actual:**  
**Status:** ⬜ Pass / ⬜ Fail  
**Console Errors:**  

---

## KNOWN ISSUES (From Code Review)

### Potential Runtime Issues to Monitor

1. **Auto-advance timing**
   - **Risk:** 2.5s may feel too fast/slow for some users
   - **Mitigation:** Users can tap button to skip
   - **Watch for:** User complaints about rushed feel

2. **State validation edge cases**
   - **Risk:** May not catch all corruption patterns
   - **Mitigation:** ErrorBoundary catches remaining crashes
   - **Watch for:** Console warnings about "Fixing corrupted..."

3. **Invalid transition blocking**
   - **Risk:** May block valid transitions if state machine incomplete
   - **Mitigation:** Logs warnings, stays in current state
   - **Watch for:** Console errors "Invalid transition: X → Y"

4. **Level 3 Hot Layer**
   - **Risk:** Hot Layer cards (11-20) use placeholder "[reacted]"
   - **Mitigation:** Intentional design (no input required)
   - **Watch for:** User confusion about missing input

5. **Collapsible How-It-Works**
   - **Risk:** Users may not discover toggle
   - **Mitigation:** Shows by default when expanded
   - **Watch for:** Users asking "how does Level 3 work?"

---

## UAT SIGN-OFF

### Tester Confirmation

**I have completed all test scenarios and documented all findings.**

**Tester Name:** _________________  
**Date:** _________________  
**Signature:** _________________

### Issues Found

| # | Scenario | Severity | Description | Screenshot | Console Error |
|---|----------|----------|-------------|------------|---------------|
| 1 | | ⬜ Critical / ⬜ Major / ⬜ Minor | | | |
| 2 | | ⬜ Critical / ⬜ Major / ⬜ Minor | | | |
| 3 | | ⬜ Critical / ⬜ Major / ⬜ Minor | | | |

**Severity Definitions:**
- **Critical:** App crashes, data loss, cannot complete flow
- **Major:** Feature broken, workaround exists
- **Minor:** UI glitch, cosmetic issue, confusing UX

### Go/No-Go Decision

**⬜ GO** - All critical/major issues resolved, ready for production  
**⬜ NO-GO** - Critical issues remain, requires fixes

**Decision By:** _________________  
**Date:** _________________

---

## QUICK REFERENCE: WHAT TO TEST

### Must Test (Critical Paths)
- [ ] Fresh user completes full game
- [ ] Refresh on l1-question
- [ ] Refresh on l2-question
- [ ] Refresh on l3-question
- [ ] Corrupted localStorage (empty object)
- [ ] Corrupted localStorage (null answers)
- [ ] Restart from Level 2
- [ ] Complete Level 3 (20 cards)

### Should Test (Important Paths)
- [ ] Refresh on every screen (all 30+ screens)
- [ ] All restart scenarios
- [ ] All corruption scenarios
- [ ] Hot Layer cards (11-20)
- [ ] Reflection screen
- [ ] Auto-advance timing
- [ ] Handoff ritual preservation

### Nice to Test (Edge Cases)
- [ ] Rapid refresh (multiple times)
- [ ] Back button navigation
- [ ] Long answers (500+ chars)
- [ ] Special characters in names
- [ ] Multiple games in sequence

---

## DEBUGGING TIPS

### If App Crashes
1. Check console for red errors
2. Check if ErrorBoundary recovery screen appears
3. Inspect `knowem_session` in Local Storage
4. Copy console error and screenshot
5. Note exact steps to reproduce

### If State is Lost
1. Check `knowem_session` in Local Storage
2. Verify `phase` field matches expected screen
3. Check `answers` arrays are present
4. Try "Continue" on landing if available

### If Flow Stucks
1. Check console for "Invalid transition" warnings
2. Note current screen and last action
3. Check `state.phase` in React DevTools
4. Try navigating back or restarting

---

**Test Plan Version:** 1.0  
**Last Updated:** 2026-06-22  
**Status:** Ready for Execution