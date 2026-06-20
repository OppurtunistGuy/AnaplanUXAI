import React, { createContext, useContext, useReducer, useCallback } from "react";
import { LEVEL_1_QUESTIONS, LEVEL_2_CATEGORIES } from "../data/content";

const initialState = {
  phase: "landing", // landing | setup | l1-question | l1-locked | l1-handoff | l1-both | l1-complete | l1-decline-prompt | l2-dice | l2-category | l2-cards | l2-card-flip | l2-question | l2-locked | l2-handoff | l2-both | insights | l3-teaser | inactivity-end | closure
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
  sessionStatus: "active",
};

function reducer(state, action) {
  switch (action.type) {
    case "RESET":
      return { ...initialState };

    case "GO":
      return { ...state, phase: action.phase };

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

    case "GO_INSIGHTS":
      return { ...state, phase: "insights" };

    default:
      return state;
  }
}

const GameContext = createContext(null);

export function GameProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const go = useCallback((phase) => dispatch({ type: "GO", phase }), []);
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
