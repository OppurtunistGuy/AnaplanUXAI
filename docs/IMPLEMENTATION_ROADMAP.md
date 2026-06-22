# KnowEm V3 — Implementation Roadmap

**Version:** 1.0  
**Date:** 2026-06-22  
**Status:** Approved for Execution  
**Constraint:** Incremental migration, zero UI/UX changes, minimal risk

---

## OVERVIEW

This roadmap prioritizes **stability over features**. We will fix crashes and data loss before adding new capabilities.

**Guiding Principles:**
1. No full rewrites
2. No UI/UX changes
3. No breaking changes to existing gameplay
4. Each phase is independently deployable
5. Rollback is always possible

---

## PHASE 1: CRASH PREVENTION (Week 1-2)

**Goal:** Eliminate all runtime crashes and state corruption  
**Priority:** P0  
**Risk:** Low  
**Rollback:** Git revert (all changes are additive)

### 1.1 Add Error Boundaries

**Files Affected:**
- `frontend/src/components/ErrorBoundary.jsx` (new)
- `frontend/src/pages/Game.jsx` (modify)

**Changes:**
```javascript
// New file: frontend/src/components/ErrorBoundary.jsx
import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Game crashed:', error, errorInfo);
    // TODO: Send to backend in Phase 2
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center max-w-sm">
            <h2 className="text-2xl font-black text-[#1A0B2E] mb-2">
              Something went wrong
            </h2>
            <p className="text-sm text-[#4B3B60] mb-4">
              {this.state.error?.message || 'Unknown error'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-[#6C3BFF] text-white rounded-full font-bold"
            >
              Recover Session
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
```

**Effort:** 4 hours  
**Risk:** Very low (additive only)  
**Rollback:** Remove ErrorBoundary wrapper from Game.jsx

---

### 1.2 Add Defensive Null Guards to Level 2 Screens

**Files Affected:**
- `frontend/src/screens/Level2Flow.jsx` (lines 118, 170, 302)

**Changes:**
```javascript
// Line 118 (Level2Category)
const cat = LEVEL_2_CATEGORIES.find(c => c.id === state.level2.selectedCategoryId);
if (!cat) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
      <p className="text-sm text-[#4B3B60]">Category not found. Rolling again...</p>
    </div>
  );
}

// Line 170 (Level2Cards) - ALREADY FIXED
// Line 302 (Level2Question) - ALREADY FIXED
```

**Effort:** 2 hours (already done, verify)  
**Risk:** None  
**Rollback:** N/A (already applied)

---

### 1.3 Fix Level 1 Transition Deadlock

**Files Affected:**
- `frontend/src/screens/Level1Question.jsx` (lines 58-67)

**Changes:**
```javascript
// BEFORE (broken):
useEffect(() => {
  if (!selected) return;
  const t = setTimeout(() => {
    if (!isTransitioning.current) {        // ← REMOVE
      isTransitioning.current = true;      // ← REMOVE
      dispatch({ type: "L1_ANSWER", choice: selected });
    }
  }, 1000);
  return () => clearTimeout(t);
}, [selected, dispatch]);

// AFTER (fixed):
useEffect(() => {
  if (!selected) return;
  const t = setTimeout(() => {
    dispatch({ type: "L1_ANSWER", choice: selected });
  }, 1000);
  return () => clearTimeout(t);
}, [selected, dispatch]);
```

**Effort:** 1 hour (already done, verify)  
**Risk:** None  
**Rollback:** N/A (already applied)

---

### 1.4 Add State Schema Validation

**Files Affected:**
- `frontend/src/utils/validation.js` (new)
- `frontend/src/store/gameStore.js` (modify)

**Changes:**
```javascript
// New file: frontend/src/utils/validation.js
export const GameStateSchema = {
  version: 1,
  phase: String,
  players: Object,
  currentPlayer: String,
  level1: {
    questionIndex: Number,
    answers: Array,
    currentRoundA: String,
    skipsUsed: Object,
    timerExpiredStreak: Object,
  },
  level2: {
    selectedCategoryId: String,
    cardIndex: Number,
    answers: Array,
    currentRoundA: String,
    usedCards: Object,
  },
  level3: {
    deck: Array,
    cardIndex: Number,
    selectedCategory: String,
    answers: Array,  // ← CRITICAL: Must be array
    currentRoundA: String,
  },
  sessionStatus: String,
  sessionMode: String,
  remoteSession: Object,
};

export function validateGameState(state) {
  if (!state || typeof state !== 'object') {
    throw new Error('Invalid state: not an object');
  }

  // Ensure level3.answers is always an array
  if (!Array.isArray(state.level3?.answers)) {
    console.warn('Fixing corrupted level3.answers');
    state.level3.answers = [];
  }

  // Ensure level1.answers is always an array
  if (!Array.isArray(state.level1?.answers)) {
    console.warn('Fixing corrupted level1.answers');
    state.level1.answers = [];
  }

  // Ensure level2.answers is always an array
  if (!Array.isArray(state.level2?.answers)) {
    console.warn('Fixing corrupted level2.answers');
    state.level2.answers = [];
  }

  return state;
}
```

**Usage in gameStore.js:**
```javascript
// In loadState():
function loadState() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    const parsed = JSON.parse(stored);
    
    // Validate and fix corrupted state
    validateGameState(parsed);
    
    return parsed;
  } catch (e) {
    console.error("Failed to load state:", e);
    return null;
  }
}
```

**Effort:** 4 hours  
**Risk:** Low (validation only, no behavior changes)  
**Rollback:** Remove validateGameState call from loadState()

---

### 1.5 Add State Machine Validation

**Files Affected:**
- `frontend/src/utils/stateMachine.js` (new)
- `frontend/src/store/gameStore.js` (modify)

**Changes:**
```javascript
// New file: frontend/src/utils/stateMachine.js
const VALID_TRANSITIONS = {
  'landing': ['mode-select'],
  'mode-select': ['setup', 'remote-setup'],
  'setup': ['l1-question'],
  'l1-question': ['l1-locked', 'inactivity-end'],
  'l1-locked': ['l1-handoff'],
  'l1-handoff': ['l1-question'],
  'l1-both': ['l1-both', 'l1-complete', 'l1-question'],
  'l1-complete': ['l1-decline-prompt'],
  'l1-decline-prompt': ['l2-dice', 'closure'],
  'l2-dice': ['l2-category'],
  'l2-category': ['l2-cards'],
  'l2-cards': ['l2-card-flip'],
  'l2-card-flip': ['l2-question'],
  'l2-question': ['l2-locked'],
  'l2-locked': ['l2-handoff'],
  'l2-handoff': ['l2-question'],
  'l2-both': ['l2-both', 'l2-complete', 'l2-dice'],
  'l2-complete': ['insights', 'l2-dice'],
  'insights': ['l3-teaser', 'landing'],
  'l3-consent': ['l3-intro', 'closure'],
  'l3-intro': ['l3-how-it-works'],
  'l3-how-it-works': ['l3-category-select'],
  'l3-category-select': ['l3-card'],
  'l3-card': ['l3-question', 'l3-results'],
  'l3-question': ['l3-locked'],
  'l3-locked': ['l3-handoff'],
  'l3-handoff': ['l3-question'],
  'l3-both': ['l3-both', 'l3-reflection', 'l3-results'],
  'l3-reflection': ['l3-card', 'l3-results'],
  'l3-results': ['landing'],
  'l3-teaser': ['l3-consent', 'insights'],
  'inactivity-end': ['closure'],
  'closure': ['landing', 'insights'],
};

export function canTransition(from, to) {
  return VALID_TRANSITIONS[from]?.includes(to) ?? false;
}

export function assertTransition(from, to) {
  if (!canTransition(from, to)) {
    console.error(`Invalid transition: ${from} → ${to}`);
    // In development, throw; in production, redirect to safe state
    if (process.env.NODE_ENV === 'development') {
      throw new Error(`Invalid state transition: ${from} → ${to}`);
    }
    return false;
  }
  return true;
}
```

**Usage in gameStore.js:**
```javascript
import { assertTransition } from '../utils/stateMachine';

case "GO": {
  const { phase, ...rest } = action;
  if (!assertTransition(state.phase, phase)) {
    // Invalid transition, stay in current state
    return state;
  }
  return { ...state, phase };
}
```

**Effort:** 6 hours  
**Risk:** Low (warns on invalid transitions, doesn't break valid ones)  
**Rollback:** Remove assertTransition calls, revert to direct assignment

---

### Phase 1 Summary

| Task | Files | Effort | Risk | Rollback |
|------|-------|--------|------|----------|
| Error boundaries | 2 | 4h | Very Low | Remove wrapper |
| Null guards (L2) | 1 | 2h | None | N/A (done) |
| L1 deadlock fix | 1 | 1h | None | N/A (done) |
| State validation | 2 | 4h | Low | Remove validation call |
| State machine | 2 | 6h | Low | Remove assertions |
| **Total** | **8** | **17h** | **Low** | **Git revert** |

**Deliverables:**
- ✅ No more "is not iterable" crashes
- ✅ No more null dereference crashes
- ✅ No more state transition deadlocks
- ✅ Graceful error recovery UI
- ✅ Invalid transitions logged (not thrown in production)

---

## PHASE 2: BACKEND FOUNDATION (Week 3-4)

**Goal:** Add backend API without changing frontend behavior  
**Priority:** P1  
**Risk:** Medium  
**Rollback:** Feature flag to disable backend sync

### 2.1 Database Schema

**Files Affected:**
- `backend/alembic/versions/001_initial_schema.py` (new)
- `backend/models/session.py` (new)
- `backend/models/answer.py` (new)

**Changes:**
```python
# backend/models/session.py
from sqlalchemy import Column, String, DateTime, JSON
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
import uuid

class Session(Base):
    __tablename__ = "sessions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    session_code = Column(String(6), unique=True, nullable=True)
    status = Column(String(20), nullable=False, default="active")
    current_phase = Column(String(30), nullable=False, default="landing")
    current_player = Column(String(1), nullable=True)
    level1_state = Column(JSON, nullable=False, default=dict)
    level2_state = Column(JSON, nullable=False, default=dict)
    level3_state = Column(JSON, nullable=False, default=dict)
    metadata = Column(JSON, nullable=False, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    expires_at = Column(DateTime, nullable=True)
```

**Effort:** 1 day  
**Risk:** Low (new tables, no data migration yet)  
**Rollback:** Drop tables, revert code

---

### 2.2 Core API Endpoints

**Files Affected:**
- `backend/routers/sessions.py` (new)
- `backend/routers/answers.py` (new)
- `backend/main.py` (modify)

**Changes:**
```python
# backend/routers/sessions.py
from fastapi import APIRouter, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from models.session import Session
from pydantic import BaseModel

router = APIRouter()

class SessionCreate(BaseModel):
    player_a_name: str
    player_b_name: str
    session_mode: str = "local"

class SessionResponse(BaseModel):
    id: str
    session_code: str | None
    current_phase: str
    current_player: str | None
    level1_state: dict
    level2_state: dict
    level3_state: dict

@router.post("/sessions", response_model=SessionResponse)
async def create_session(payload: SessionCreate, db: AsyncSession):
    session = Session(
        session_code=str(uuid.uuid4())[:6].upper(),
        level1_state={"questionIndex": 0, "answers": [], "skipsUsed": {"A": 0, "B": 0}},
        level2_state={"selectedCategoryId": None, "cardIndex": 0, "answers": [], "usedCards": {}},
        level3_state={"deck": [], "cardIndex": 0, "answers": [], "currentRoundA": None},
    )
    db.add(session)
    await db.commit()
    await db.refresh(session)
    return session

@router.get("/sessions/{session_id}", response_model=SessionResponse)
async def get_session(session_id: str, db: AsyncSession):
    result = await db.execute(select(Session).where(Session.id == session_id))
    session = result.scalar_one_or_none()
    if not session:
        raise HTTPException(404, "Session not found")
    return session

@router.patch("/sessions/{session_id}")
async def update_session(session_id: str, updates: dict, db: AsyncSession):
    result = await db.execute(select(Session).where(Session.id == session_id))
    session = result.scalar_one_or_none()
    if not session:
        raise HTTPException(404, "Session not found")
    
    for key, value in updates.items():
        if hasattr(session, key):
            setattr(session, key, value)
    
    await db.commit()
    return {"success": True}
```

**Effort:** 3 days  
**Risk:** Medium (new backend, needs testing)  
**Rollback:** Disable router in main.py, frontend continues with localStorage

---

### 2.3 Frontend API Client

**Files Affected:**
- `frontend/src/services/api.js` (new)
- `frontend/src/services/session.js` (new)

**Changes:**
```javascript
// New file: frontend/src/services/api.js
import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';

export const api = axios.create({
  baseURL: API_BASE,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging
api.interceptors.request.use((config) => {
  console.log(`[API] ${config.method.toUpperCase()} ${config.url}`);
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('[API Error]', error.message);
    // Don't throw - let caller decide how to handle
    return Promise.reject(error);
  }
);

// New file: frontend/src/services/session.js
import { api } from './api';

export async function createSession(playerA, playerB) {
  try {
    const response = await api.post('/sessions', {
      player_a_name: playerA,
      player_b_name: playerB,
      session_mode: 'local',
    });
    return response.data;
  } catch (error) {
    console.warn('Backend unavailable, using localStorage');
    return null;  // Fallback to localStorage
  }
}

export async function saveSessionState(sessionId, state) {
  try {
    await api.patch(`/sessions/${sessionId}`, {
      current_phase: state.phase,
      current_player: state.currentPlayer,
      level1_state: state.level1,
      level2_state: state.level2,
      level3_state: state.level3,
    });
    return true;
  } catch (error) {
    console.warn('Failed to sync to backend:', error.message);
    return false;
  }
}
```

**Effort:** 2 days  
**Risk:** Medium (new async code, needs error handling)  
**Rollback:** Feature flag `USE_BACKEND=false`, all calls become no-ops

---

### Phase 2 Summary

| Task | Files | Effort | Risk | Rollback |
|------|-------|--------|------|----------|
| Database schema | 3 | 1 day | Low | Drop tables |
| Core API | 3 | 3 days | Medium | Disable router |
| Frontend client | 2 | 2 days | Medium | Feature flag |
| **Total** | **8** | **6 days** | **Medium** | **Feature flag** |

**Deliverables:**
- ✅ Backend API running
- ✅ Database schema deployed
- ✅ Frontend can sync to backend (optional)
- ✅ Graceful fallback to localStorage if backend down

---

## PHASE 3: PERSISTENCE & RECOVERY (Week 5-6)

**Goal:** Eliminate data loss on refresh/crash  
**Priority:** P1  
**Risk:** Medium  
**Rollback:** Feature flag, dual-write period

### 3.1 Dual-Write Persistence Layer

**Files Affected:**
- `frontend/src/store/gameStore.js` (modify)
- `frontend/src/services/session.js` (modify)

**Changes:**
```javascript
// In gameStore.js - modify saveState()
async function saveState(state) {
  try {
    const serializable = {
      version: state.version,
      phase: state.phase,
      players: state.players,
      currentPlayer: state.currentPlayer,
      level1: state.level1,
      level2: state.level2,
      level3: state.level3,  // ← ADD (currently missing)
      sessionStatus: state.sessionStatus,
      sessionMode: state.sessionMode,
      remoteSession: state.remoteSession,
    };
    
    // 1. Always save to localStorage (fast, offline-capable)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(serializable));
    
    // 2. Attempt backend sync (async, non-blocking)
    const sessionId = localStorage.getItem('knowem_session_id');
    if (sessionId) {
      saveSessionState(sessionId, serializable).catch(() => {
        // Silently fail - localStorage is source of truth
      });
    }
  } catch (e) {
    console.error("Failed to save state:", e);
  }
}
```

**Effort:** 1 day  
**Risk:** Low (additive, localStorage remains primary)  
**Rollback:** Remove backend sync call

---

### 3.2 Session Recovery Flow

**Files Affected:**
- `frontend/src/components/SessionRecovery.jsx` (new)
- `frontend/src/pages/Game.jsx` (modify)

**Changes:**
```javascript
// New file: frontend/src/components/SessionRecovery.jsx
import React, { useEffect, useState } from 'react';
import { useGame } from '../store/gameStore';
import { getSession } from '../services/session';

export function SessionRecovery({ onRecover, onStartFresh }) {
  const { state } = useGame();
  const [recovering, setRecovering] = useState(false);

  useEffect(() => {
    const attemptRecovery = async () => {
      const sessionId = localStorage.getItem('knowem_session_id');
      if (!sessionId) {
        onStartFresh();
        return;
      }

      setRecovering(true);
      try {
        // Try backend first
        const backendState = await getSession(sessionId);
        if (backendState) {
          console.log('✅ Recovered from backend');
          onRecover(backendState);
          return;
        }
      } catch (e) {
        console.warn('Backend recovery failed, trying localStorage');
      }

      // Fallback to localStorage
      const localState = localStorage.getItem('knowem_session');
      if (localState) {
        console.log('✅ Recovered from localStorage');
        onRecover(JSON.parse(localState));
        return;
      }

      onStartFresh();
    };

    attemptRecovery();
  }, [onRecover, onStartFresh]);

  if (recovering) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl mb-2">🔄</div>
          <p className="text-sm text-[#4B3B60]">Recovering your session...</p>
        </div>
      </div>
    );
  }

  return null;
}
```

**Effort:** 1 day  
**Risk:** Low (additive, doesn't change existing flow)  
**Rollback:** Remove SessionRecovery component

---

### 3.3 State Migration System

**Files Affected:**
- `frontend/src/utils/migrations.js` (new)
- `frontend/src/store/gameStore.js` (modify)

**Changes:**
```javascript
// New file: frontend/src/utils/migrations.js
const MIGRATIONS = {
  1: (state) => state,  // Initial version
  
  2: (state) => ({
    ...state,
    level3: {
      ...state.level3,
      // Fix: ensure answers is always an array
      answers: Array.isArray(state.level3?.answers) ? state.level3.answers : [],
    },
    // Fix: add missing fields
    sessionMode: state.sessionMode || 'local',
    remoteSession: state.remoteSession || {
      code: null,
      isHost: false,
      partnerId: null,
      partnerName: null,
    },
  }),
};

export function migrateState(state) {
  const version = state.version || 1;
  const currentVersion = 2;  // Increment when adding migrations

  if (version === currentVersion) {
    return state;
  }

  console.log(`Migrating state from v${version} to v${currentVersion}`);

  let migrated = { ...state };
  for (let v = version; v < currentVersion; v++) {
    if (MIGRATIONS[v]) {
      migrated = MIGRATIONS[v](migrated);
      migrated.version = v + 1;
    }
  }

  return migrated;
}
```

**Usage in gameStore.js:**
```javascript
function loadState() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    const parsed = JSON.parse(stored);
    
    // Run migrations
    const migrated = migrateState(parsed);
    
    // Validate
    validateGameState(migrated);
    
    return migrated;
  } catch (e) {
    console.error("Failed to load state:", e);
    return null;
  }
}
```

**Effort:** 1 day  
**Risk:** Low (only runs on old state)  
**Rollback:** Remove migration call

---

### Phase 3 Summary

| Task | Files | Effort | Risk | Rollback |
|------|-------|--------|------|----------|
| Dual-write persistence | 2 | 1 day | Low | Remove backend sync |
| Session recovery | 2 | 1 day | Low | Remove component |
| State migrations | 2 | 1 day | Low | Remove migration call |
| **Total** | **6** | **3 days** | **Low** | **Feature flag** |

**Deliverables:**
- ✅ No data loss on refresh (backend backup)
- ✅ Automatic state migration for old saves
- ✅ Graceful recovery from crashes
- ✅ Backend as secondary source (localStorage remains primary)

---

## PHASE 4: PRODUCTION READINESS (Week 7-8)

**Goal:** Monitoring, observability, and hardening  
**Priority:** P2  
**Risk:** Low  
**Rollback:** Disable monitoring, keep core functionality

### 4.1 Error Tracking (Sentry)

**Files Affected:**
- `frontend/src/services/monitoring.js` (new)
- `frontend/src/components/ErrorBoundary.jsx` (modify)

**Changes:**
```javascript
// New file: frontend/src/services/monitoring.js
import * as Sentry from '@sentry/react';

export function initMonitoring() {
  if (process.env.NODE_ENV === 'production' && process.env.REACT_APP_SENTRY_DSN) {
    Sentry.init({
      dsn: process.env.REACT_APP_SENTRY_DSN,
      environment: process.env.NODE_ENV,
      tracesSampleRate: 0.1,
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,
    });
  }
}

// Update ErrorBoundary to report to Sentry
componentDidCatch(error, errorInfo) {
  console.error('Game crashed:', error, errorInfo);
  
  if (process.env.NODE_ENV === 'production') {
    Sentry.captureException(error, {
      contexts: {
        react: errorInfo,
      },
    });
  }
}
```

**Effort:** 4 hours  
**Risk:** Very low (only sends errors, no behavior change)  
**Rollback:** Remove Sentry.init() call

---

### 4.2 Backend Logging & Monitoring

**Files Affected:**
- `backend/utils/logger.py` (new)
- `backend/main.py` (modify)

**Changes:**
```python
# New file: backend/utils/logger.py
import structlog
import logging
import sys

def setup_logging():
    structlog.configure(
        processors=[
            structlog.stdlib.filter_by_level,
            structlog.stdlib.add_logger_name,
            structlog.stdlib.add_log_level,
            structlog.stdlib.PositionalArgumentsFormatter(),
            structlog.processors.TimeStamper(fmt="iso"),
            structlog.processors.StackInfoRenderer(),
            structlog.processors.format_exc_info,
            structlog.processors.UnicodeDecoder(),
            structlog.processors.JSONRenderer(),
        ],
        context_class=dict,
        logger_factory=structlog.stdlib.LoggerFactory(),
        wrapper_class=structlog.stdlib.BoundLogger,
        cache_logger_on_first_use=True,
    )

    logging.basicConfig(
        format="%(message)s",
        stream=sys.stdout,
        level=logging.INFO,
    )
```

**Effort:** 4 hours  
**Risk:** Very low (logging only)  
**Rollback:** Remove structlog configuration

---

### 4.3 Rate Limiting

**Files Affected:**
- `backend/middleware/rate_limit.py` (new)
- `backend/main.py` (modify)

**Changes:**
```python
# New file: backend/middleware/rate_limit.py
from fastapi import Request
from fastapi.responses import JSONResponse
import time
from collections import defaultdict

class RateLimiter:
    def __init__(self, calls=100, period=60):
        self.calls = calls
        self.period = period
        self.history = defaultdict(list)

    async def __call__(self, request: Request, call_next):
        client_ip = request.client.host
        now = time.time()
        
        # Clean old entries
        self.history[client_ip] = [
            t for t in self.history[client_ip] if now - t < self.period
        ]
        
        if len(self.history[client_ip]) >= self.calls:
            return JSONResponse(
                status_code=429,
                content={"error": "Rate limit exceeded"},
            )
        
        self.history[client_ip].append(now)
        return await call_next(request)

# Usage in main.py
from middleware.rate_limit import RateLimiter
app.add_middleware(RateLimiter, calls=100, period=60)
```

**Effort:** 4 hours  
**Risk:** Low (can be disabled)  
**Rollback:** Remove middleware

---

### 4.4 Health Checks & Readiness Probes

**Files Affected:**
- `backend/routers/health.py` (new)
- `backend/main.py` (modify)

**Changes:**
```python
# New file: backend/routers/health.py
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
import time

router = APIRouter()

@router.get("/health")
async def health():
    return {
        "status": "healthy",
        "timestamp": time.time(),
    }

@router.get("/health/ready")
async def readiness(db: AsyncSession):
    try:
        await db.execute(text("SELECT 1"))
        return {"status": "ready"}
    except Exception as e:
        return {"status": "not ready", "error": str(e)}
```

**Effort:** 2 hours  
**Risk:** None  
**Rollback:** N/A

---

### Phase 4 Summary

| Task | Files | Effort | Risk | Rollback |
|------|-------|--------|------|----------|
| Sentry error tracking | 2 | 4h | Very Low | Remove init |
| Backend logging | 2 | 4h | Very Low | Remove config |
| Rate limiting | 2 | 4h | Low | Remove middleware |
| Health checks | 2 | 2h | None | N/A |
| **Total** | **8** | **1.5 days** | **Low** | **Config flag** |

**Deliverables:**
- ✅ Production error tracking
- ✅ Structured logging
- ✅ API rate limiting
- ✅ Health check endpoints

---

## IMPLEMENTATION TIMELINE

```
Week 1-2:   Phase 1 (Crash Prevention)
            ├── Day 1-2:   Error boundaries + null guards
            ├── Day 3:     L1 deadlock fix
            ├── Day 4-5:   State validation
            └── Day 6-7:   State machine

Week 3-4:   Phase 2 (Backend Foundation)
            ├── Day 8-9:   Database schema
            ├── Day 10-12: Core API
            └── Day 13-14: Frontend client

Week 5-6:   Phase 3 (Persistence & Recovery)
            ├── Day 15:    Dual-write persistence
            ├── Day 16:    Session recovery
            └── Day 17:    State migrations

Week 7-8:   Phase 4 (Production Readiness)
            ├── Day 18:    Sentry + logging
            ├── Day 19:    Rate limiting + health checks
            └── Day 20:    Testing + documentation
```

**Total Effort:** 8 weeks (40 working days)  
**Team Size:** 1-2 engineers  
**Risk Level:** Low-Medium

---

## RISK MITIGATION MATRIX

| Risk | Phase | Likelihood | Impact | Mitigation |
|------|-------|-----------|--------|------------|
| Backend downtime | 2-3 | Medium | Medium | localStorage fallback, feature flag |
| Data migration failure | 3 | Low | High | Dual-write period, rollback plan |
| Performance regression | 1-4 | Low | Medium | Profiling, lazy loading |
| Breaking UI changes | 1-4 | Very Low | High | Component testing, visual regression |
| State machine too restrictive | 1 | Low | Medium | Log warnings in production, don't throw |
| Backend cost overrun | 2-4 | Low | Low | Start with single instance, auto-scaling |

---

## SUCCESS CRITERIA

### Phase 1 Exit Criteria
- [ ] Zero runtime crashes in testing
- [ ] All null guards in place
- [ ] State validation catches corrupted data
- [ ] Invalid transitions logged (not thrown)
- [ ] Error boundary catches and recovers

### Phase 2 Exit Criteria
- [ ] Backend API passes all integration tests
- [ ] Frontend can create/read sessions
- [ ] Graceful fallback to localStorage works
- [ ] API documentation (Swagger) complete

### Phase 3 Exit Criteria
- [ ] No data loss on refresh (tested 10x)
- [ ] State migrations work for v1 → v2
- [ ] Session recovery works after crash
- [ ] Dual-write period successful (1 week)

### Phase 4 Exit Criteria
- [ ] Sentry capturing errors in staging
- [ ] Structured logs in production
- [ ] Rate limiting prevents abuse
- [ ] Health checks pass in k8s/vercel

---

## WHAT WE ARE NOT DOING (YET)

❌ **NOT in this roadmap:**
- Redis caching (add in Phase 5 if needed)
- Multiplayer/WebSocket (add in Phase 5)
- Analytics pipeline (add in Phase 5)
- Celery/queues (add in Phase 5 if needed)
- JWT authentication (add in Phase 5 if needed)
- UI/UX changes (zero changes)
- Feature additions (bug fixes only)

✅ **ONLY in this roadmap:**
- Crash prevention
- State validation
- Backend foundation
- Persistence & recovery
- Production monitoring

---

## NEXT STEPS

1. **Review this roadmap** with team
2. **Create feature branch:** `arch/crash-prevention`
3. **Start Phase 1, Task 1.1:** Error boundaries
4. **Deploy to staging** after each phase
5. **Monitor for 3 days** before next phase
6. **Document learnings** in `docs/implementation-log.md`

---

## APPENDIX: FEATURE FLAGS

```javascript
// frontend/src/config/features.js
export const FEATURES = {
  USE_BACKEND: process.env.REACT_APP_USE_BACKEND === 'true',
  USE_STATE_MACHINE: process.env.REACT_APP_USE_STATE_MACHINE === 'true',
  USE_SENTRY: process.env.NODE_ENV === 'production',
  USE_ERROR_BOUNDARY: true,  // Always on
  DUAL_WRITE: process.env.REACT_APP_DUAL_WRITE === 'true',
};
```

**Usage:**
```javascript
import { FEATURES } from '../config/features';

if (FEATURES.USE_BACKEND) {
  await saveSessionState(sessionId, state);
}
```

---

**Document Version:** 1.0  
**Author:** Principal Software Architect  
**Review:** Approved  
**Next Review:** After Phase 1 completion