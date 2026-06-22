# KnowEm V3 — Phase 1.5: Gameplay Flow Optimization

**Version:** 1.0  
**Date:** 2026-06-22  
**Status:** Approved for Planning  
**Constraint:** Zero UI/UX redesign, minimal code changes, reduce friction

---

## EXECUTIVE SUMMARY

Current gameplay requires **excessive taps and screen transitions**:
- **Level 1:** 3 taps per question (answer → pass device → handoff ready)
- **Level 2:** 5 taps per round (roll → pick card → answer → pass device → handoff ready) + 2 blank screens
- **Level 3:** 6 taps per card + 5 onboarding screens before first card

**Goal:** Reduce tap count by 40-50% while preserving existing UI components and gameplay mechanics.

---

## CURRENT vs RECOMMENDED FLOWS

### Level 1: Question → Answer Flow

#### Current Flow
```
l1-question (tap answer)
  ↓ 1s timeout
l1-locked (tap "Pass Device")
  ↓
l1-handoff (tap "I'm ready")
  ↓
l1-question (Player B)
```

**Tap count:** 3 taps per question  
**Screen transitions:** 4  
**Time per question:** ~4-5 seconds

#### Recommended Flow
```
l1-question (tap answer)
  ↓ 1s timeout
l1-locked (auto-advance after 1.5s, OR tap "Pass Device")
  ↓
l1-question (Player B, with "Player B's turn" indicator)
```

**Tap count:** 1-2 taps per question  
**Screen transitions:** 2-3  
**Time per question:** ~2-3 seconds

#### Changes
| Screen | Action | Rationale |
|--------|--------|-----------|
| **l1-locked** | Keep, but add auto-advance after 1.5s | Reduces mandatory tap |
| **l1-handoff** | **REMOVE** | Redundant - l1-locked already shows "Pass to [Player B]" |
| **l1-question** | Add player indicator banner | Shows whose turn it is without separate screen |

**Effort:** 4 hours  
**Risk:** Low (removes one screen, simplifies flow)  
**Rollback:** Keep l1-handoff, disable auto-advance

---

### Level 2: Category Discovery Flow

#### Current Flow
```
l2-dice (tap "Roll")
  ↓ 1.4s animation
l2-category (2s auto-advance, shows category name)
  ↓
l2-cards (tap card to pick)
  ↓ 0.6s animation
l2-card-flip (1.4s auto-advance, shows card reveal)
  ↓
l2-question (answer)
  ↓
l2-locked (tap "Pass Device")
  ↓
l2-handoff (tap "I'm ready")
  ↓
l2-question (Player B)
```

**Tap count:** 5 taps per round  
**Screen transitions:** 9  
**Blank screens:** l2-category (2s), l2-card-flip (1.4s) = 3.4s of blank screens

#### Recommended Flow
```
l2-dice (tap "Roll")
  ↓ 1.4s animation
l2-cards (category banner shown at top, tap card)
  ↓ 0.6s animation + reveal
l2-question (answer, with card prompt visible)
  ↓
l2-locked (auto-advance after 1.5s, OR tap "Pass Device")
  ↓
l2-question (Player B, with "Player B's turn" indicator)
```

**Tap count:** 3 taps per round  
**Screen transitions:** 5  
**Blank screens:** 0

#### Changes
| Screen | Action | Rationale |
|--------|--------|-----------|
| **l2-category** | **REMOVE** | Blank screen, auto-advances after 2s. Merge category reveal into l2-dice or l2-cards |
| **l2-card-flip** | **REMOVE** | Blank animation, auto-advances after 1.4s. Merge card reveal into l2-question |
| **l2-cards** | Add category banner at top | Replaces l2-category screen |
| **l2-question** | Show card prompt immediately after pick | Replaces l2-card-flip screen |
| **l2-locked** | Add auto-advance after 1.5s | Reduces mandatory tap |
| **l2-handoff** | **REMOVE** | Same as Level 1 - redundant |

**Effort:** 6 hours  
**Risk:** Low (removes 2 screens, simplifies flow)  
**Rollback:** Keep l2-category and l2-card-flip, disable auto-advance

---

### Level 3: Deep Questions Flow

#### Current Flow
```
l3-teaser (tap "Continue to Level 3")
  ↓
l3-consent (tap "Continue Together")
  ↓
l3-intro (tap "Let's Begin")
  ↓
l3-how-it-works (tap "Got It")
  ↓
l3-category-select (tap category)
  ↓
l3-card (tap to reveal)
  ↓
l3-question (answer)
  ↓
l3-locked (tap "Pass Device")
  ↓
l3-handoff (tap "I'm ready")
  ↓
l3-question (Player B)
  ↓
l3-both (tap "Next Card")
  ↓
l3-reflection (tap reaction)
  ↓
[repeat for 20 cards]
  ↓
l3-results
```

**Tap count:** 6 taps per card + 5 onboarding taps = 125 taps total  
**Screen transitions:** 11+ screens  
**Onboarding screens:** 4 (teaser, consent, intro, how-it-works) + 1 (category select) = 5 screens before first card

#### Recommended Flow
```
l3-consent (tap "Continue Together")
  ↓
l3-intro (consolidated: intro + how-it-works + category select)
  ↓
l3-card (tap to reveal, OR auto-reveal after 1s)
  ↓
l3-question (answer)
  ↓
l3-locked (auto-advance after 1.5s, OR tap "Pass Device")
  ↓
l3-question (Player B, with "Player B's turn" indicator)
  ↓
l3-both (tap "Next Card" OR auto-advance after 2s)
  ↓
[skip l3-reflection for Hot Layer cards]
  ↓
[repeat for 20 cards]
  ↓
l3-results
```

**Tap count:** 3-4 taps per card + 2 onboarding taps = 75-85 taps total  
**Screen transitions:** 7-8 screens  
**Onboarding screens:** 2 (consent, intro+how-it-works+category) = 2 screens before first card

#### Changes
| Screen | Action | Rationale |
|--------|--------|-----------|
| **l3-teaser** | **REMOVE** | Redundant with l3-consent. Merge "Ready for the last ride?" into l3-consent |
| **l3-how-it-works** | **REMOVE** | Merge into l3-intro as expandable section or skip button |
| **l3-category-select** | **MERGE into l3-intro** | Show categories at end of intro, tap to start |
| **l3-card** | Keep, but add auto-reveal after 1s | Reduces mandatory tap |
| **l3-locked** | Add auto-advance after 1.5s | Reduces mandatory tap |
| **l3-handoff** | **REMOVE** | Same as Level 1/2 - redundant |
| **l3-reflection** | Keep, but skip for Hot Layer cards | Hot Layer is reaction-based, no need for additional reaction selection |
| **l3-both** | Add auto-advance after 2s | Reduces mandatory tap |

**Effort:** 8 hours  
**Risk:** Medium (removes 3 screens, consolidates 2)  
**Rollback:** Keep all screens, disable auto-advance

---

## DETAILED SCREEN ANALYSIS

### Screens to KEEP (No Changes)

| Screen | File | Rationale |
|--------|------|-----------|
| Landing | Game.jsx | Entry point, required |
| Mode Select | Game.jsx | Required for local/remote choice |
| Setup | Setup.jsx | Required for player names |
| l1-question | Level1Question.jsx | Core gameplay, works well |
| l1-both | Level1Flow.jsx | Shows match/different perspective, auto-advances |
| l1-complete | Level1Flow.jsx | Level completion, confetti, good UX |
| l1-decline-prompt | Level1Flow.jsx | Required for decline flow |
| l2-dice | Level2Flow.jsx | Fun dice animation, required |
| l2-cards | Level2Flow.jsx | Card carousel, works well |
| l2-question | Level2Flow.jsx | Answer input, works well |
| l2-both | Level2Flow.jsx | Shows both answers, works well |
| l2-complete | Level2Flow.jsx | Level completion, good UX |
| insights | Insights.jsx | Analytics display, required |
| l3-consent | Level3Flow.jsx | Required for consent |
| l3-intro | Level3Flow.jsx | Can be enhanced with how-it-works |
| l3-card | Level3Flow.jsx | Card reveal, can add auto-reveal |
| l3-question | Level3Flow.jsx | Answer input, works well |
| l3-both | Level3Flow.jsx | Shows both answers, works well |
| l3-results | Level3Results.jsx | Final results, good UX |
| closure | MetaScreens.jsx | End screen, required |
| inactivity-end | MetaScreens.jsx | Inactivity handling, required |

### Screens to REMOVE

| Screen | File | Lines | Replacement |
|--------|------|-------|-------------|
| **l1-handoff** | Level1Flow.jsx | 52-76 | Merge into l1-locked (show "Pass to [Player B]" with auto-advance) |
| **l2-category** | Level2Flow.jsx | 116-176 | Merge category banner into l2-dice or l2-cards |
| **l2-card-flip** | Level2Flow.jsx | 301-318 | Merge card reveal into l2-question (show prompt immediately) |
| **l2-handoff** | Level2Flow.jsx | 420-443 | Merge into l2-locked (same as Level 1) |
| **l3-teaser** | MetaScreens.jsx | 6-76 | Merge into l3-consent (add "Ready for the last ride?" header) |
| **l3-how-it-works** | Level3Flow.jsx | 82-120 | Merge into l3-intro (add as expandable "How it works" section) |
| **l3-category-select** | Level3Flow.jsx | 390-443 | Merge into l3-intro (show categories at bottom, tap to start) |
| **l3-handoff** | Level3Flow.jsx | 325-343 | Merge into l3-locked (same as Level 1/2) |

**Total screens removed:** 8  
**Total screens kept:** 20  
**New total:** 28 screens (down from 36)

### Screens to REDESIGN

| Screen | File | Changes | Effort |
|--------|------|---------|--------|
| **l1-locked** | Level1Flow.jsx | Add auto-advance after 1.5s, keep "Pass Device" button as fallback | 1h |
| **l2-dice** | Level2Flow.jsx | Show category name after roll (replaces l2-category) | 1h |
| **l2-cards** | Level2Flow.jsx | Add category banner at top | 30m |
| **l2-question** | Level2Flow.jsx | Show card prompt immediately after pick (replaces l2-card-flip) | 1h |
| **l2-locked** | Level2Flow.jsx | Add auto-advance after 1.5s | 1h |
| **l3-consent** | Level3Flow.jsx | Add "Ready for the last ride?" header from l3-teaser | 30m |
| **l3-intro** | Level3Flow.jsx | Add how-it-works steps + category selection at bottom | 2h |
| **l3-card** | Level3Flow.jsx | Add auto-reveal after 1s (keep tap as fallback) | 30m |
| **l3-locked** | Level3Flow.jsx | Add auto-advance after 1.5s | 1h |
| **l3-both** | Level3Flow.jsx | Add auto-advance after 2s (keep "Next Card" as fallback) | 1h |

**Total redesign effort:** 9 hours

---

## REDUCED TAP COUNT ANALYSIS

### Level 1 (15 questions)

| Metric | Current | Optimized | Savings |
|--------|---------|-----------|---------|
| Taps per question | 3 | 1-2 | 33-66% |
| Total taps | 45 | 15-30 | 33-66% |
| Screen transitions | 60 | 30-45 | 25-50% |
| Time per question | 4-5s | 2-3s | 40% |

### Level 2 (3+ rounds)

| Metric | Current | Optimized | Savings |
|--------|---------|-----------|---------|
| Taps per round | 5 | 3 | 40% |
| Total taps (3 rounds) | 15 | 9 | 40% |
| Screen transitions | 27 | 15 | 44% |
| Blank screen time | 3.4s | 0s | 100% |

### Level 3 (20 cards)

| Metric | Current | Optimized | Savings |
|--------|---------|-----------|---------|
| Onboarding taps | 5 | 2 | 60% |
| Taps per card | 6 | 3-4 | 33-50% |
| Total taps | 125 | 75-85 | 32-40% |
| Screen transitions | 220 | 140-160 | 27-36% |
| Onboarding screens | 5 | 2 | 60% |

---

## IMPLEMENTATION PRIORITY

### Phase 1.5.1: Quick Wins (4 hours)
**Priority:** High  
**Risk:** Very Low

1. Add auto-advance to l1-locked (1h)
2. Add auto-advance to l2-locked (1h)
3. Add auto-advance to l3-locked (1h)
4. Add auto-advance to l3-both (1h)

**Impact:** Reduces mandatory taps by 25% across all levels

---

### Phase 1.5.2: Remove Blank Screens (6 hours)
**Priority:** High  
**Risk:** Low

1. Remove l2-category, merge into l2-dice (2h)
2. Remove l2-card-flip, merge into l2-question (2h)
3. Remove l2-handoff, merge into l2-locked (1h)
4. Remove l1-handoff, merge into l1-locked (1h)

**Impact:** Eliminates 3.4s of blank screens per Level 2 round

---

### Phase 1.5.3: Consolidate Onboarding (8 hours)
**Priority:** Medium  
**Risk:** Medium

1. Merge l3-teaser into l3-consent (1h)
2. Merge l3-how-it-works into l3-intro (2h)
3. Merge l3-category-select into l3-intro (3h)
4. Remove l3-handoff, merge into l3-locked (1h)
5. Add auto-reveal to l3-card (1h)

**Impact:** Reduces onboarding from 5 screens to 2 screens (60% reduction)

---

## CODE CHANGES SUMMARY

### 1. Remove l1-handoff Screen

**File:** `frontend/src/screens/Level1Flow.jsx`  
**Lines to remove:** 52-76

**Changes:**
- Delete `Level1Handoff` component
- Update `Level1Locked` to auto-advance after 1.5s
- Update reducer to transition from `l1-locked` → `l1-question` (skip `l1-handoff`)

**Reducer change:**
```javascript
// BEFORE
case "L1_LOCKED_CONTINUE":
  return { ...state, phase: "l1-handoff", currentPlayer: "B" };

case "L1_HANDOFF_READY":
  return { ...state, phase: "l1-question" };

// AFTER
case "L1_LOCKED_CONTINUE":
  return { ...state, phase: "l1-question", currentPlayer: "B" };
```

---

### 2. Remove l2-category and l2-card-flip Screens

**File:** `frontend/src/screens/Level2Flow.jsx`  
**Lines to remove:** 116-176 (l2-category), 301-318 (l2-card-flip)

**Changes:**
- Delete `Level2Category` component
- Delete `Level2CardFlip` component
- Update `Level2Dice` to show category name after roll
- Update `Level2Cards` to show card prompt after pick
- Update reducer to skip `l2-category` and `l2-card-flip`

**Reducer changes:**
```javascript
// BEFORE
case "L2_DICE_ROLLED":
  return { ...state, level2: { ...state.level2, selectedCategoryId: action.categoryId, cardIndex: 0 }, phase: "l2-category" };

case "L2_CATEGORY_CONTINUE":
  return { ...state, phase: "l2-cards" };

case "L2_CARD_PICKED":
  return { ...state, level2: { ...state.level2, cardIndex: action.cardIndex }, phase: "l2-card-flip" };

case "L2_CARD_REVEALED":
  return { ...state, phase: "l2-question", currentPlayer: "A" };

// AFTER
case "L2_DICE_ROLLED":
  return { ...state, level2: { ...state.level2, selectedCategoryId: action.categoryId, cardIndex: 0 }, phase: "l2-cards" };

case "L2_CARD_PICKED":
  return { ...state, level2: { ...state.level2, cardIndex: action.cardIndex }, phase: "l2-question" };
```

---

### 3. Remove l2-handoff Screen

**File:** `frontend/src/screens/Level2Flow.jsx`  
**Lines to remove:** 420-443

**Changes:**
- Delete `Level2Handoff` component
- Update `Level2Locked` to auto-advance after 1.5s
- Update reducer to transition from `l2-locked` → `l2-question` (skip `l2-handoff`)

**Reducer change:**
```javascript
// BEFORE
case "L2_LOCKED_CONTINUE":
  return { ...state, phase: "l2-handoff", currentPlayer: "B" };

case "L2_HANDOFF_READY":
  return { ...state, phase: "l2-question" };

// AFTER
case "L2_LOCKED_CONTINUE":
  return { ...state, phase: "l2-question", currentPlayer: "B" };
```

---

### 4. Consolidate Level 3 Onboarding

**File:** `frontend/src/screens/Level3Flow.jsx`  
**Lines to remove:** 7-52 (l3-consent), 82-120 (l3-how-it-works), 390-443 (l3-category-select)

**Changes:**
- Merge l3-teaser header into l3-consent
- Merge l3-how-it-works into l3-intro as collapsible section
- Merge l3-category-select into l3-intro as category grid at bottom
- Delete `Level3Consent`, `Level3HowItWorks`, `Level3CategorySelect` components
- Update reducer to skip removed phases

**Reducer changes:**
```javascript
// BEFORE
case "L3_CONSENT_AGREE":
  return { ...state, phase: "l3-intro" };

case "L3_INTRO_CONTINUE":
  return { ...state, phase: "l3-how-it-works" };

case "L3_HOW_IT_WORKS_CONTINUE":
  return { ...state, phase: "l3-category-select" };

case "L3_CATEGORY_SELECT":
  return { ...state, level3: { ...state.level3, selectedCategory: action.categoryKey, deck: action.deck, cardIndex: 0 }, phase: "l3-card", currentPlayer: "A" };

// AFTER
case "L3_INTRO_CONTINUE":
  return { ...state, level3: { ...state.level3, selectedCategory: action.categoryKey, deck: action.deck, cardIndex: 0 }, phase: "l3-card", currentPlayer: "A" };
```

---

### 5. Remove l3-handoff Screen

**File:** `frontend/src/screens/Level3Flow.jsx`  
**Lines to remove:** 325-343

**Changes:**
- Delete `Level3Handoff` component
- Update `Level3Locked` to auto-advance after 1.5s
- Update reducer to transition from `l3-locked` → `l3-question` (skip `l3-handoff`)

**Reducer change:**
```javascript
// BEFORE
case "L3_LOCKED_CONTINUE":
  return { ...state, phase: "l3-handoff", currentPlayer: "B" };

case "L3_HANDOFF_READY":
  return { ...state, phase: "l3-question" };

// AFTER
case "L3_LOCKED_CONTINUE":
  return { ...state, phase: "l3-question", currentPlayer: "B" };
```

---

### 6. Remove l3-teaser Screen

**File:** `frontend/src/screens/MetaScreens.jsx`  
**Lines to remove:** 6-76

**Changes:**
- Delete `Level3Teaser` component
- Update Game.jsx routing to skip `l3-teaser`
- Update Insights.jsx to go directly to `l3-consent`

---

## STATE MACHINE UPDATES

### Current Transitions (Simplified)
```
l1-question → l1-locked → l1-handoff → l1-question
l2-dice → l2-category → l2-cards → l2-card-flip → l2-question → l2-locked → l2-handoff → l2-question
l3-teaser → l3-consent → l3-intro → l3-how-it-works → l3-category-select → l3-card → l3-question → l3-locked → l3-handoff → l3-question
```

### Optimized Transitions
```
l1-question → l1-locked → l1-question
l2-dice → l2-cards → l2-question → l2-locked → l2-question
l3-consent → l3-intro → l3-card → l3-question → l3-locked → l3-question
```

**Transitions removed:** 8  
**Transitions remaining:** 12  
**Reduction:** 40%

---

## TESTING CHECKLIST

### Level 1
- [ ] Answer question → auto-advance to l1-locked
- [ ] Wait 1.5s on l1-locked → auto-advance to Player B
- [ ] Tap "Pass Device" on l1-locked → immediate advance
- [ ] Player B answers → l1-both → auto-advance
- [ ] Complete 15 questions → l1-complete
- [ ] Decline flow still works

### Level 2
- [ ] Roll dice → category shown on l2-cards
- [ ] Pick card → prompt shown immediately on l2-question
- [ ] Answer → l2-locked → auto-advance to Player B
- [ ] Complete 3+ rounds → l2-complete
- [ ] "Roll again" works
- [ ] "Finish Level 2" works

### Level 3
- [ ] l3-consent shows "Ready for the last ride?" header
- [ ] l3-intro shows how-it-works + categories
- [ ] Tap category → l3-card
- [ ] Tap card (or wait 1s) → reveal
- [ ] Answer → l3-locked → auto-advance to Player B
- [ ] Complete 20 cards → l3-results
- [ ] Hot Layer cards skip l3-reflection

### General
- [ ] All animations still work
- [ ] All buttons still functional
- [ ] No console errors
- [ ] No broken navigation
- [ ] Session recovery still works
- [ ] localStorage persistence still works

---

## RISK ASSESSMENT

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| Users confused by removed screens | Low | Medium | Keep auto-advance slow enough (1.5s) to notice transition |
| Auto-advance triggers accidentally | Low | Low | User must tap to start transition (answer, roll, pick card) |
| State machine breaks | Medium | High | Update all transition maps, test all paths |
| Hot Layer reflection skip unclear | Medium | Low | Add text "No reaction needed - just pass to partner" |
| Category selection timing | Low | Medium | Ensure category is selected before deck is built |

---

## ROLLBACK STRATEGY

### Feature Flags
```javascript
const FEATURES = {
  L1_AUTO_ADVANCE: true,      // Auto-advance from l1-locked
  L2_REMOVE_CATEGORY: true,   // Remove l2-category screen
  L2_REMOVE_FLIP: true,       // Remove l2-card-flip screen
  L3_CONSOLIDATE_INTRO: true, // Merge l3 onboarding screens
  L3_AUTO_REVEAL: true,       // Auto-reveal l3-card after 1s
};
```

### Rollback Procedure
1. Set feature flags to `false`
2. Keep removed screens in code (commented out or hidden)
3. Revert reducer transitions to original
4. Deploy rollback in < 5 minutes

---

## EFFORT SUMMARY

| Phase | Task | Effort | Risk |
|-------|------|--------|------|
| 1.5.1 | Quick wins (auto-advance) | 4h | Very Low |
| 1.5.2 | Remove blank screens | 6h | Low |
| 1.5.3 | Consolidate onboarding | 8h | Medium |
| **Total** | | **18h** | **Low-Medium** |

**Timeline:** 2-3 days for one engineer  
**Testing:** 1 day  
**Total:** 3-4 days

---

## SUCCESS METRICS

| Metric | Current | Target | Measurement |
|--------|---------|--------|-------------|
| Taps per Level 1 question | 3 | 1-2 | User testing |
| Taps per Level 2 round | 5 | 3 | User testing |
| Taps per Level 3 card | 6 | 3-4 | User testing |
| Blank screen time (L2) | 3.4s | 0s | Stopwatch |
| Onboarding screens (L3) | 5 | 2 | Count |
| Total gameplay taps | 125 | 75-85 | User testing |
| User satisfaction | N/A | > 4/5 | Survey |

---

## NEXT STEPS

1. **Review this plan** with stakeholders
2. **Create feature branch:** `optimization/gameplay-flow`
3. **Start Phase 1.5.1:** Quick wins (auto-advance)
4. **Deploy to staging** and user test
5. **Iterate based on feedback**
6. **Proceed to Phase 1.5.2** if successful
7. **Document learnings** in `docs/optimization-log.md`

---

## WHAT WE ARE NOT CHANGING

❌ **NOT changing:**
- UI components (colors, layouts, animations)
- Gameplay mechanics (questions, answers, scoring)
- State structure (reducers, actions)
- Backend integration (deferred to Phase 2)
- Visual design (preserving existing look & feel)

✅ **ONLY changing:**
- Screen transitions (remove redundant screens)
- Tap count (add auto-advance where appropriate)
- Onboarding flow (consolidate screens)
- Navigation paths (shorten routes)

---

**Document Version:** 1.0  
**Author:** Principal Software Architect  
**Review:** Approved with adjustments  
**Next Review:** After Phase 1.5.1 completion