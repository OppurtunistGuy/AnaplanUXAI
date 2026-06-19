# KnowEm — Phase 1 PRD

## Original Problem Statement
Build the KnowEm webapp from the provided UI prototype + Phase 1 Spec doc.
KnowEm is a **single-device, pass-and-play** connection app for two players.
Tagline: *"Know each other. For real."*  •  *"Not a dating app. A connection app."*

## Architecture (Built)
- **Frontend** — React 19 + Tailwind + Framer Motion, mobile-first phone-shell container
- **State** — React Context + useReducer (single source of truth) at `/app/frontend/src/store/gameStore.js`
- **Routing** — phase-driven screen switching (not URL routes) in `/app/frontend/src/pages/Game.jsx`
- **Backend** — FastAPI + MongoDB for session persistence and stats
  - `GET /api/` health, `GET /api/health`, `POST /api/sessions`, `GET /api/sessions/{id}`, `GET /api/stats`
- **Content** — 15 Level 1 this-or-that questions + 6 categories × 5 Level 2 cards embedded in `/app/frontend/src/data/content.js`

## Personas
- **Couples / close friends** — want a low-pressure, screen-shared experience to learn about each other
- **Not dating-app users** — explicitly framed as a connection app
- **Mobile-first** — designed for one phone passed back and forth

## Core Requirements (Static — from Phase 1 spec)
1. Single device, pass-and-play (no real-time sync)
2. Level 1: 15 timed this-or-that questions (30s timer, 3 skips per player, hint chips)
3. Level 2: dice → category (6 options) → 5-card carousel → free-text (120-char cap)
4. Handoff sequence: Answer Locked → "Pass the phone to X" → "I'm Ready"
5. Insights: 6 cards (Agreed / Surprised / Matters / Approach / Worth Talking / Compatibility)
6. Level 3: static "Coming Soon" teaser
7. Inactivity: 2 consecutive timer-misses by same player ends session
8. Out of scope: backend sync, auth, payments, Level 3 implementation

## Implemented (Feb 2026)
- ✅ Landing page (hero, tagline w/ Caveat script font, 3 value props, 6-feature strip)
- ✅ Player setup screen (name inputs for A & B with validation)
- ✅ Level 1 question screen with timer ring, progress bar, turn indicator, hint chip, skip counter
- ✅ Answer Locked → Handoff → Both Answered transition (auto-advances)
- ✅ Inactivity end (2 consecutive timeouts) with restart
- ✅ Level 1 Complete celebration screen with CSS confetti
- ✅ Level 1 → Level 2 decline prompt flow (Accept / Not today)
- ✅ Level 2 dice screen with roll animation → random category selection
- ✅ Category reveal screen
- ✅ Card carousel with blurred neighbors, dot navigation
- ✅ Card flip animation → free-text answer (120 char cap enforced)
- ✅ Level 2 handoff and both-answered reveal with side-by-side answers
- ✅ Roll Again loop
- ✅ Insights page with 6 algorithmic cards (rule-based, no AI needed)
- ✅ Level 3 dark-theme teaser with neon heart + "Coming Soon"
- ✅ Closure screen
- ✅ Backend session persistence endpoints

## Tested & Passing
- Backend: 5/5 pytest passing (100%)
- Frontend e2e (playwright via testing agent): 100% pass — Landing → Setup → L1 × 15 → L2 → Insights → L3 teaser → Restart loop verified

## Backlog (P0 / P1 / P2)
- **P1** — Save completed session to backend automatically (currently endpoints exist but UI doesn't call them yet)
- **P1** — Share insights via deep link (Easy to Share feature is currently visual only)
- **P1** — Sound/haptic feedback for dice roll, card flip, confetti
- **P2** — Avatar picker on setup (currently first-letter monogram)
- **P2** — Inactivity message + analytics on which questions get skipped most
- **P2** — Internationalization (Hindi / Spanish / French)
- **P3** — Level 3 implementation (premium intimate-question deck)
- **P3** — AI-powered narrative insights (Claude / GPT) as an optional upgrade

## Next Action Items
- Wire backend session save on Insights view (one-liner POST to `/api/sessions`)
- Add a share button on Insights → generates a shareable summary link (read-only view)
- Build Level 3 deck when ready
