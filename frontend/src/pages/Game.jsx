import React from "react";
import { useGame } from "../store/gameStore";
import { PhoneShell, PageBackdrop } from "../components/PhoneShell";
import { ErrorBoundary } from "../components/ErrorBoundary";

import Landing from "./Landing";
import Setup from "./Setup";
import ModeSelect from "./ModeSelect";
import Level1Question from "../screens/Level1Question";
import {
  Level1Locked,
  Level1Handoff,
  Level1BothAnswered,
  Level1Complete,
  Level1DeclinePrompt,
} from "../screens/Level1Flow";
import {
  Level2Dice,
  Level2Category,
  Level2Cards,
  Level2CardFlip,
  Level2Question,
  Level2Locked,
  Level2Handoff,
  Level2BothAnswered,
  Level2Complete,
} from "../screens/Level2Flow";
import Insights from "./Insights";
import SessionRecovery from "../screens/SessionRecovery";
import { RemoteSetup, CreateSession, JoinSession, RemoteLobby } from "../screens/RemoteSession";
import {
  Level3Consent,
  Level3Intro,
  Level3Card,
  Level3Question,
  Level3Locked,
  Level3Handoff,
  Level3Both,
  Level3CategorySelect,
  Level3Reflection,
} from "../screens/Level3Flow";
import Level3HowItWorks from "../screens/Level3HowItWorks";
import Level3Results from "../screens/Level3Results";
import { Level3Teaser, InactivityEnd, Closure } from "../screens/MetaScreens";

const SCREENS = {
  "landing": Landing,
  "mode-select": ModeSelect,
  "setup": Setup,
  "remote-setup": RemoteSetup,
  "remote-create": CreateSession,
  "remote-join": JoinSession,
  "remote-lobby": RemoteLobby,
  "l1-question": Level1Question,
  "l1-locked": Level1Locked,
  "l1-handoff": Level1Handoff,
  "l1-both": () => <Level1BothAnswered final={false} />,
  "l1-both-final": () => <Level1BothAnswered final={true} />,
  "l1-complete": Level1Complete,
  "l1-decline-prompt": Level1DeclinePrompt,
  "l2-dice": Level2Dice,
  "l2-category": Level2Category,
  "l2-cards": Level2Cards,
  "l2-card-flip": Level2CardFlip,
  "l2-question": Level2Question,
  "l2-locked": Level2Locked,
  "l2-handoff": Level2Handoff,
  "l2-both": Level2BothAnswered,
  "l2-complete": Level2Complete,
  "insights": Insights,
  "l3-consent": Level3Consent,
  "l3-intro": Level3Intro,
  "l3-how-it-works": Level3HowItWorks,
  "l3-category-select": Level3CategorySelect,
  "l3-card": Level3Card,
  "l3-question": Level3Question,
  "l3-locked": Level3Locked,
  "l3-handoff": Level3Handoff,
  "l3-both": Level3Both,
  "l3-reflection": Level3Reflection,
  "l3-results": Level3Results,
  "l3-teaser": Level3Teaser,
  "inactivity-end": InactivityEnd,
  "closure": Closure,
};

export default function Game() {
  const { state, dispatch } = useGame();
  
  // DEBUG: Log current state
  console.log("🎮 Game component rendering:", {
    phase: state.phase,
    hasValidScreen: !!SCREENS[state.phase],
    availableScreens: Object.keys(SCREENS)
  });
  
  // SIMPLE TEST: If phase is invalid or missing, force landing
  if (!state.phase || !SCREENS[state.phase]) {
    console.error("❌ Invalid phase detected, forcing landing");
    dispatch({ type: "GO", phase: "landing" });
  }
  
  // Cleanup invalid localStorage on mount
  const STORAGE_KEY = "knowem_session";
  React.useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        const validPhases = Object.keys(SCREENS);
        if (!parsed.phase || !validPhases.includes(parsed.phase)) {
          console.warn("🧹 Cleaning invalid localStorage phase:", parsed.phase);
          localStorage.removeItem(STORAGE_KEY);
          dispatch({ type: "RESET" });
        }
      }
    } catch (e) {
      console.error("Error cleaning localStorage:", e);
      localStorage.removeItem(STORAGE_KEY);
      dispatch({ type: "RESET" });
    }
  }, [dispatch]);
  
  // Check if we should show session recovery
  const shouldShowRecovery = React.useMemo(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return false;
      
      const parsed = JSON.parse(stored);
      console.log("💾 localStorage session found:", { phase: parsed.phase });
      
      // Only show recovery if session is valid (has valid phase and version)
      const hasValidPhase = parsed.phase && Object.keys(SCREENS).includes(parsed.phase);
      const hasValidVersion = parsed.version === 1;
      
      if (!hasValidPhase || !hasValidVersion) {
        console.warn("⚠️ Invalid session in localStorage, clearing it");
        localStorage.removeItem(STORAGE_KEY);
        return false;
      }
      
      return true;
    } catch (e) {
      console.error("Failed to check localStorage:", e);
      return false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Show recovery UI if valid session exists and on landing page
  if (shouldShowRecovery && state.phase === 'landing') {
    return (
      <PageBackdrop>
        <PhoneShell keyId="session-recovery">
          <SessionRecovery />
        </PhoneShell>
      </PageBackdrop>
    );
  }

  const Component = SCREENS[state.phase];
  
  // DEBUG: Check if component exists
  if (!Component) {
    console.error(`❌ No component found for phase: "${state.phase}"`);
    console.error(`   Available phases:`, Object.keys(SCREENS));
    return (
      <PageBackdrop>
        <PhoneShell keyId="error">
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="text-center">
              <h2 className="text-2xl font-black text-[#1A0B2E] mb-2">Configuration Error</h2>
              <p className="text-sm text-[#4B3B60] mb-4">No screen found for phase: {state.phase}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-[#6C3BFF] text-white rounded-full font-bold"
              >
                Reload
              </button>
            </div>
          </div>
        </PhoneShell>
      </PageBackdrop>
    );
  }
  
  // P3: Unique key per question + player ensures full unmount between turns
  const keyId = state.phase === "l1-question"
    ? `l1q-${state.level1.questionIndex}-${state.currentPlayer}`
    : state.phase === "l2-question"
    ? `l2q-${state.level2.answers.length}-${state.currentPlayer}`
    : state.phase;
  return (
    <ErrorBoundary>
      <PageBackdrop>
        <PhoneShell keyId={keyId}>
          <Component />
        </PhoneShell>
      </PageBackdrop>
    </ErrorBoundary>
  );
}
