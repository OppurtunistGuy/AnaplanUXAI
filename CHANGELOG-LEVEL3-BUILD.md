# KnowEm — Level 3 Build Changelog

Scope: Level 3 (Truth or Dare) implemented as an additive, isolated module per
approved spec. Level 1 and Level 2 are frozen — confirmed untouched (see QA
report). No new libraries, no architecture changes, no rerouting of existing
L1/L2 flow.

## Created Files

### `frontend/src/data/level3Data.js`
20-card deck builder. Cards 1–5 Chemistry (fixed pool of 5), cards 6–10
Teasing (fixed pool of 5), cards 11–20 Fantasy & Desire (10 randomly sampled
from a 15-prompt pool each session, no repeats). Each card randomly assigned
Truth or Dare (~50/50).

### `frontend/src/screens/Level3Flow.jsx`
All Level 3 flow screens, built from existing component patterns (Locked /
Handoff / BothAnswered / Question shells), themed to the existing soft
purple / pink / lavender palette (not the dark `Level3Teaser` placeholder
palette, per design directive):
- `Level3Consent` — mutual consent screen ("Continue Together" / "Not Now")
- `Level3Intro` — "Let's Begin"
- `Level3HowItWorks` — 5-step reminder ("Got It")
- `Level3Card` — hidden card, tap-to-reveal Truth/Dare badge + prompt
- `Level3Question` — free-text answer (same input pattern as Level 2's
  answer screen, per spec: "no new answer UI")
- `Level3Locked` — "Pass The Device"
- `Level3Handoff` — partner-ready screen
- `Level3Both` — side-by-side answer reveal

### `frontend/src/screens/Level3Results.jsx`
Results screen: Chemistry Score, Teasing Compatibility, Fantasy Alignment
(animated score rings, visual pattern copied from `Insights.jsx`'s existing
Donut component — copied, not imported, to keep Level 3 fully isolated from
files Insights.jsx depends on) + Relationship Archetype summary. "Play
Again" → full `RESET`. "Back to Home" → existing `closure` screen (reused,
zero new code).

## Modified Files

### `frontend/src/store/gameStore.js`
Additive only — confirmed via checksum that no existing `L1_*`/`L2_*` case
or initial-state key was altered:
- Added `level3` key to `initialState` (new key; `players`/`level1`/`level2`
  untouched)
- Added `l3-*` phases to `RESUMABLE_PHASES` (new array entries only)
- Added 11 new `L3_*` reducer cases, inserted after all existing cases and
  before `default` — no existing case body edited

### `frontend/src/pages/Game.jsx`
Additive only:
- Added imports for the new Level 3 components
- Added new `l3-*` keys to the `SCREENS` map
- Changed the `"l3-teaser"` map *value* from `Level3Teaser` to
  `Level3Consent` — this is the only line where existing routing changes,
  and it's intentional: the entry trigger (Insights' "Peek Level 3" button,
  dispatching `GO`/`l3-teaser`) is byte-identical to before; only what
  renders at that phase is now the real flow instead of the static
  placeholder. `Level3Teaser` remains imported and fully intact in
  `MetaScreens.jsx` (zero lines of that file changed).
- Added `l3-question` to the existing `keyId` pattern (same convention as
  `l1-question`/`l2-question`)

## Not Changed (verified)
- `screens/Level1Question.jsx`, `screens/Level1Flow.jsx`,
  `screens/Level2Flow.jsx`, `pages/Setup.jsx`, `pages/Insights.jsx`,
  `pages/Landing.jsx`, `screens/MetaScreens.jsx` — MD5 checksums confirmed
  identical to pre-Level-3 state.
- All 16 original `L1_*`/`L2_*` reducer cases confirmed present and
  unaltered.
- Backend, `package.json`, `components/ui/*` — untouched.
