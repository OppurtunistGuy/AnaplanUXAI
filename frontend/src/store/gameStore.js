import React, { createContext, useContext, useReducer, useCallback } from "react";
import { LEVEL_1_QUESTIONS, LEVEL_2_CATEGORIES } from "../data/content";
import { validateGameState } from "../utils/validation";
import { assertTransition } from "../utils/stateMachine";

const STORAGE_KEY = "knowem_session";
const CURRENT_VERSION = 1;

const initialState = {
  version: CURRENT_VERSION,
  phase: "landing", // landing | setup | mode-select | remote-setup | remote-create | remote-join | remote-lobby | l1-question | l1-locked | l1-handoff | l1-both | l1-complete | l1-decline-prompt | l2-dice | l2-category | l2-cards | l2-card-flip | l2-question | l2-locked | l2-handoff | l2-both | l2-complete | insights | l3-consent | l3-intro | l3-how-it-works | l3-category-select | l3-card | l3-question | l3-locked | l3-handoff | l3-both | l3-reflection | l3-results | l3-teaser | inactivity-end | closure
  players: {
    A: { name: "", avatar: "🌸" },
    B: { name: "", avatar: "🌿" },
  },
  currentPlayer: "A",
  level1: {
    questionIndex: 0,
    answers: [], // [{qid, A, B}], indexed by questionIndex
    currentRoundA: null,
    skipsUsed: { A: 0, B: 0 },
    timerExpiredStreak: { A: 0, B: 0 },
  },
  level2: {
    selectedCategoryId: null,
    cardIndex: 0,
    answers: [], // [{categoryId, cardIndex, prompt, A, B}]
    currentRoundA: null,
    usedCards: {}, // { [categoryId]: [cardIndex,...] }
  },
  level3: {
    deck: [],
    cardIndex: 0,
    selectedCategory: null,
    answers: [], // [{prompt, A, B, reaction, groupKey}]
    currentRoundA: null,
  },
  sessionStatus: "active",
  sessionMode: "local", // "local" | "remote"
  remoteSession: {
    code: null,
    isHost: false,
    partnerId: null,
    partnerName: null,
  },
};

// Serialize and save state to localStorage, skipping non-serializable values
function saveState(state) {
  try {
    const serializable = {
      version: state.version,
      phase: state.phase,
      players: state.players,
      currentPlayer: state.currentPlayer,
      level1: state.level1,
      level2: state.level2,
      sessionStatus: state.sessionStatus,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(serializable));
  } catch (e) {
    console.error("Failed to save state to localStorage:", e);
  }
}

// Valid phases that have corresponding screen components
const VALID_PHASES = [
  "landing", "mode-select", "setup", "remote-setup", "remote-create", "remote-join", "remote-lobby",
  "l1-question", "l1-locked", "l1-handoff", "l1-both", "l1-both-final", "l1-complete", "l1-decline-prompt",
  "l2-dice", "l2-category", "l2-cards", "l2-card-flip", "l2-question", "l2-locked", "l2-handoff", "l2-both", "l2-complete",
  "insights", "l3-consent", "l3-intro", "l3-how-it-works", "l3-category-select", "l3-card", "l3-question",
  "l3-locked", "l3-handoff", "l3-both", "l3-reflection", "l3-results", "l3-teaser", "inactivity-end", "closure"
];

// Load state from localStorage, with version checking
function loadState() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    const parsed = JSON.parse(stored);
    
    // Version check for future migrations
    if (parsed.version !== CURRENT_VERSION) {
      console.warn(`Stored state version ${parsed.version} does not match current ${CURRENT_VERSION}`);
      return null;
    }
    
    // Validate phase is valid
    if (!parsed.phase || !VALID_PHASES.includes(parsed.phase)) {
      console.warn(`Invalid phase in stored state: "${parsed.phase}". Clearing session.`);
      clearSession();
      return null;
    }
    
    // Validate and fix corrupted state
    validateGameState(parsed);
    
    return parsed;
  } catch (e) {
    console.error("Failed to load state from localStorage:", e);
    clearSession();
    return null;
  }
}

// Clear session from localStorage
function clearSession() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error("Failed to clear session from localStorage:", e);
  }
}

function reducer(state, action) {
  switch (action.type) {
    case "RESET":
      clearSession();
      return { ...initialState };

    case "CLEAR_SESSION":
      console.log("🧹 Reducer: CLEAR_SESSION action");
      clearSession();
      console.log("   Session cleared from localStorage");
      return { ...initialState };

    case "GO": {
      console.log(`🔀 Reducer: GO action -> phase: ${action.phase}`);
      if (!assertTransition(state.phase, action.phase)) {
        console.warn(`Blocked invalid transition: ${state.phase} → ${action.phase}`);
        return state; // Stay in current state
      }
      return { ...state, phase: action.phase };
    }

    case "SET_PLAYERS":
      return { ...state, players: action.players, phase: "l1-question", currentPlayer: "A" };

    case "L1_ANSWER": {
      // action: { choice: 'a'|'b'|'skip'|'timeout' }
      const { questionIndex, currentRoundA, skipsUsed, timerExpiredStreak } = state.level1;
      const player = state.currentPlayer;

      // Update skips/streak
      const newSkips = { ...skipsUsed };
      const newStreak = { ...timerExpiredStreak };
      if (action.choice === "skip") newSkips[player] = (newSkips[player] || 0) + 1;
      if (action.choice === "timeout") newStreak[player] = (newStreak[player] || 0) + 1;
      else newStreak[player] = 0;

      // End on 2-streak
      if (newStreak[player] >= 2) {
        return {
          ...state,
          level1: { ...state.level1, skipsUsed: newSkips, timerExpiredStreak: newStreak },
          sessionStatus: "ended-inactivity",
          phase: "inactivity-end",
        };
      }

      if (player === "A") {
        return {
          ...state,
          level1: {
            ...state.level1,
            currentRoundA: action.choice,
            skipsUsed: newSkips,
            timerExpiredStreak: newStreak,
          },
          phase: "l1-locked",
        };
      } else {
        // Both answered now
        const newAnswers = [...state.level1.answers];
        newAnswers[questionIndex] = {
          qid: LEVEL_1_QUESTIONS[questionIndex].id,
          A: currentRoundA,
          B: action.choice,
        };
        const nextIndex = questionIndex + 1;
        const isComplete = nextIndex >= LEVEL_1_QUESTIONS.length;
        return {
          ...state,
          level1: {
            ...state.level1,
            questionIndex: nextIndex,
            answers: newAnswers,
            currentRoundA: null,
            skipsUsed: newSkips,
            timerExpiredStreak: newStreak,
          },
          currentPlayer: "A",
          phase: isComplete ? "l1-both-final" : "l1-both",
        };
      }
    }

    case "L1_LOCKED_CONTINUE":
      return { ...state, phase: "l1-handoff", currentPlayer: "B" };

    case "L1_HANDOFF_READY":
      return { ...state, phase: "l1-question" };

    case "L1_BOTH_NEXT": {
      const nextIndex = state.level1.questionIndex;
      const isComplete = nextIndex >= LEVEL_1_QUESTIONS.length;
      if (isComplete) return { ...state, phase: "l1-complete" };
      return { ...state, phase: "l1-question", currentPlayer: "A" };
    }

    case "L1_COMPLETE_CONTINUE":
      return { ...state, phase: "l1-decline-prompt" };

    case "L1_DECLINE":
      return { ...state, phase: "closure", sessionStatus: "ended-graceful" };

    case "L1_ACCEPT":
      return { ...state, phase: "l2-dice", currentPlayer: "A" };

    case "L2_DICE_ROLLED":
      return { ...state, level2: { ...state.level2, selectedCategoryId: action.categoryId, cardIndex: 0 }, phase: "l2-category" };

    case "L2_CATEGORY_CONTINUE":
      return { ...state, phase: "l2-cards" };

    case "L2_CARD_PICKED":
      return { ...state, level2: { ...state.level2, cardIndex: action.cardIndex }, phase: "l2-card-flip" };

    case "L2_CARD_REVEALED":
      return { ...state, phase: "l2-question", currentPlayer: "A" };

    case "L2_ANSWER": {
      const player = state.currentPlayer;
      if (player === "A") {
        return { ...state, level2: { ...state.level2, currentRoundA: action.text }, phase: "l2-locked" };
      } else {
        const cat = LEVEL_2_CATEGORIES.find(c => c.id === state.level2.selectedCategoryId);
        const newAnswers = [...state.level2.answers, {
          categoryId: state.level2.selectedCategoryId,
          categoryName: cat?.name,
          cardIndex: state.level2.cardIndex,
          prompt: cat?.cards[state.level2.cardIndex],
          A: state.level2.currentRoundA,
          B: action.text,
        }];
        const used = { ...state.level2.usedCards };
        used[state.level2.selectedCategoryId] = [...(used[state.level2.selectedCategoryId] || []), state.level2.cardIndex];
        return { ...state, level2: { ...state.level2, answers: newAnswers, currentRoundA: null, usedCards: used }, phase: "l2-both", currentPlayer: "A" };
      }
    }

    case "L2_LOCKED_CONTINUE":
      return { ...state, phase: "l2-handoff", currentPlayer: "B" };

    case "L2_HANDOFF_READY":
      return { ...state, phase: "l2-question" };

    case "L2_ROLL_AGAIN":
      return { ...state, level2: { ...state.level2, selectedCategoryId: null, cardIndex: 0 }, phase: "l2-dice", currentPlayer: "A" };

    case "L2_COMPLETE":
      return { ...state, phase: "l2-complete" };

    case "GO_INSIGHTS":
      return { ...state, phase: "insights" };

    case "CREATE_REMOTE_SESSION":
      return {
        ...state,
        sessionMode: "remote",
        remoteSession: {
          code: action.sessionCode,
          isHost: true,
          partnerId: null,
          partnerName: null,
        },
        players: { ...state.players, A: { ...state.players.A, name: action.playerName } },
      };

    case "JOIN_REMOTE_SESSION":
      return {
        ...state,
        sessionMode: "remote",
        remoteSession: {
          code: action.sessionCode,
          isHost: false,
          partnerId: null,
          partnerName: null,
        },
        players: { ...state.players, B: { ...state.players.B, name: action.playerName } },
      };

    case "REMOTE_PARTNER_JOINED":
      return {
        ...state,
        remoteSession: {
          ...state.remoteSession,
          partnerId: action.partnerId,
          partnerName: action.partnerName,
        },
      };

    case "L3_CONSENT_AGREE":
      return { ...state, phase: "l3-intro" };

    case "L3_CONSENT_DECLINE":
      return { ...state, phase: "closure", sessionStatus: "ended-graceful" };

    case "L3_INTRO_CONTINUE":
      return { ...state, phase: "l3-category-select" };

    case "L3_CATEGORY_SELECT":
      return {
        ...state,
        level3: {
          ...state.level3,
          selectedCategory: action.categoryKey,
          deck: action.deck,
          cardIndex: 0,
        },
        phase: "l3-card",
        currentPlayer: "A",
      };

    case "L3_CARD_REVEALED":
      return { ...state, phase: "l3-question", currentPlayer: "A" };

    case "L3_ANSWER": {
      const player = state.currentPlayer;
      if (player === "A") {
        return {
          ...state,
          level3: { ...state.level3, currentRoundA: action.text },
          phase: "l3-locked",
        };
      } else {
        const card = state.level3.deck[state.level3.cardIndex];
        // Defensive: ensure answers is always an array
        const currentAnswers = Array.isArray(state.level3.answers) ? state.level3.answers : [];
        const newAnswers = [...currentAnswers, {
          cardIndex: state.level3.cardIndex,
          type: card?.type,
          prompt: card?.prompt,
          groupKey: card?.groupKey,
          groupName: card?.groupName,
          A: state.level3.currentRoundA,
          B: action.text,
        }];
        return {
          ...state,
          level3: { ...state.level3, answers: newAnswers, currentRoundA: null },
          phase: "l3-both",
          currentPlayer: "A",
        };
      }
    }

    case "L3_LOCKED_CONTINUE":
      return { ...state, phase: "l3-handoff", currentPlayer: "B" };

    case "L3_HANDOFF_READY":
      return { ...state, phase: "l3-question" };

    case "L3_NEXT_CARD": {
      const nextIndex = state.level3.cardIndex + 1;
      const isComplete = nextIndex >= state.level3.deck.length;
      if (isComplete) return { ...state, phase: "l3-results" };
      return { ...state, level3: { ...state.level3, cardIndex: nextIndex }, phase: "l3-reflection", currentPlayer: "A" };
    }

    case "L3_REFLECTION_RECORD": {
      // Record the reaction on the most recent answer
      const answers = [...state.level3.answers];
      const lastIdx = answers.length - 1;
      if (lastIdx >= 0) {
        answers[lastIdx] = { ...answers[lastIdx], reaction: action.reaction };
      }
      // Move to next card or results
      const nextIndex = state.level3.cardIndex + 1;
      const isComplete = nextIndex >= state.level3.deck.length;
      if (isComplete) return { ...state, level3: { ...state.level3, answers, cardIndex: nextIndex }, phase: "l3-results" };
      return { ...state, level3: { ...state.level3, answers, cardIndex: nextIndex }, phase: "l3-card", currentPlayer: "A" };
    }

    default:
      return state;
  }
}

const GameContext = createContext(null);

// Initializer function for useReducer - loads state from localStorage if valid
function initializeState(initial) {
  console.log("🔧 Initializing game state...");
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      console.log("   Found localStorage data:", stored);
    } else {
      console.log("   No localStorage data found");
    }
  } catch (e) {
    console.error("   Error reading localStorage:", e);
  }
  
  const loaded = loadState();
  if (loaded) {
    console.log("✅ GameStore initialized from localStorage");
    console.log(`   Loaded phase: "${loaded.phase}"`);
    console.log(`   Full state keys:`, Object.keys(loaded));
    return loaded;
  }
  console.log("📦 GameStore initialized with default state (phase: landing)");
  return initial;
}

export function GameProvider({ children }) {
  const [state, baseDispatch] = useReducer(reducer, initialState, initializeState);
  
  // Wrap dispatch to auto-save after each action
  const dispatch = useCallback((action) => {
    console.log(`📤 Dispatch: ${action.type}`, action);
    baseDispatch(action);
  }, []);
  
  // Save state whenever it changes (after dispatch)
  React.useEffect(() => {
    saveState(state);
  }, [state]);
  
  const go = useCallback((phase) => {
    console.log(`🚀 go() called with phase: ${phase}`);
    dispatch({ type: "GO", phase });
  }, [dispatch]);
  return (
    <GameContext.Provider value={{ state, dispatch, go }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used within GameProvider");
  return ctx;
}
