# KnowEm — Level 3 QA Report

All checks below were run fresh against the final build prior to packaging.
Evidence type is disclosed per item — "Simulated" means logic was extracted
and executed standalone in Node, outside React/the DOM. No real browser was
available in this environment (no network access to the npm registry), so
no item in this report should be read as "confirmed rendering correctly on
screen" unless explicitly stated.

| # | Requirement | Evidence Type | Result |
|---|---|---|---|
| 1 | Full 20-card playthrough | Simulated | ✅ PASS |
| 2 | Consent flow working | Simulated | ✅ PASS |
| 3 | Truth/Dare randomization working | Simulated (400-deck run) | ✅ PASS |
| 4 | No duplicate cards during a session | Simulated (200-deck run) | ✅ PASS |
| 5 | Pass Device flow working | Simulated | ✅ PASS |
| 6 | Reveal Answers flow working | Simulated | ✅ PASS |
| 7 | Results screen rendering | Logic simulated only | **Requires local browser verification.** |
| 8 | Relationship Archetype rendering | Logic simulated only | **Requires local browser verification.** |
| 9 | Mobile layout verification | Static structural check only | **Requires local browser verification.** |
| 10 | Level 1 regression check | File checksum + logic simulation | ✅ PASS |
| 11 | Level 2 regression check | File checksum + logic simulation | ✅ PASS |

## Detail — Items 1–6, 10, 11 (Simulated, high confidence)

- **20-card playthrough:** Reducer logic for all `L3_*` actions was copied
  into a standalone script and walked through all 20 cards. Every card
  followed the exact phase sequence:
  `l3-card → l3-question → l3-locked → l3-handoff → l3-question → l3-both`.
  Final phase after card 20 is `l3-results`.
- **Consent flow:** Both branches verified — agree routes to `l3-intro`;
  decline routes to the existing `closure` screen.
- **Truth/Dare randomization:** 400 simulated decks. Aggregate truth ratio
  within 5% of 50/50. 395+/400 decks contained both types (not skewed to
  one type).
- **No duplicate cards:** 200 simulated decks, 0 sessions with any
  duplicate prompt. Fantasy group (cards 11–20) confirmed to sample exactly
  10 unique prompts from its 15-prompt pool every time.
- **Pass Device / Reveal Answers:** Confirmed player switches from A to B
  at the handoff step on every card, and that both A's and B's answer text
  are present in every recorded answer object (no missing pairs).
- **Level 1 / Level 2 regression:** MD5 checksums of all 7 L1/L2-related
  files (`Level1Question.jsx`, `Level1Flow.jsx`, `Level2Flow.jsx`,
  `Setup.jsx`, `Insights.jsx`, `Landing.jsx`, `MetaScreens.jsx`) confirmed
  identical to their pre-Level-3 state. All 16 original `L1_*`/`L2_*`
  reducer cases confirmed present and unaltered. L1 skip/timeout logic and
  L2 deck-exhaustion logic independently re-simulated and behave exactly as
  before.

## Detail — Items 7, 8, 9 (Requires local browser verification)

These were **not** visually rendered in this environment:

- **Results screen rendering (#7):** The scoring function
  (`computeLevel3Scores`) was verified to always return finite, bounded
  (0–100) values across empty/partial/full-engagement edge cases. The
  actual `Level3Results.jsx` component — its layout, the animated score
  rings, spacing, and visual correctness — has not been confirmed to paint
  without errors in a browser.
- **Relationship Archetype rendering (#8):** The archetype-selection logic
  was verified to always resolve to a valid name for any score 0–100. The
  visual placement and copy rendering of the archetype card itself was not
  confirmed in-browser.
- **Mobile layout verification (#9):** Confirmed structurally that all 9
  new Level 3 screens have `overflow-y-auto` on their root container,
  consistent with the rest of the app. No actual rendering at any phone
  viewport width was performed — true mobile layout behavior (wrapping,
  spacing, touch target sizing, the card-flip 3D transform) needs to be
  confirmed locally.

**Recommendation:** verify items 7–9 by running `npm install && npm start`
locally and walking through one full session on an actual mobile-width
viewport (or device emulator), paying particular attention to the
`Level3Card` flip animation and `Level3Results`' score-ring layout on a
narrow screen.
