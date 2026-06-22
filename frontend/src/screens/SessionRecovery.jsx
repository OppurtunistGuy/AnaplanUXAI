import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, RotateCcw } from "lucide-react";
import { useGame } from "../store/gameStore";

const STORAGE_KEY = "knowem_session";

export default function SessionRecovery() {
  const { state, dispatch, go } = useGame();
  const [hasValidSession, setHasValidSession] = useState(false);

  useEffect(() => {
    // Check if there's a valid session in localStorage
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      console.log("🔍 SessionRecovery mounted");
      console.log(`   localStorage key "${STORAGE_KEY}":`, stored ? "EXISTS" : "MISSING");
      console.log(`   state.phase: ${state.phase}`);
      
      if (stored) {
        const parsed = JSON.parse(stored);
        console.log(`   Parsed phase from localStorage: ${parsed.phase}`);
        // Valid session if it's not on landing page
        if (parsed.phase && parsed.phase !== "landing") {
          console.log(`   ✓ Valid session found, showing recovery UI`);
          setHasValidSession(true);
        } else {
          console.log(`   ✗ Invalid session (phase is landing or missing)`);
        }
      } else {
        console.log(`   ✗ No session in localStorage`);
      }
    } catch (e) {
      console.error("Failed to check session:", e);
    }
  }, [state.phase]);

  const handleContinue = () => {
    console.log("🔄 SessionRecovery: Continue clicked");
    console.log(`   Current state.phase: ${state.phase}`);
    console.log(`   Navigating to saved phase...`);
    // State is already loaded from localStorage, just navigate to the saved phase
    go(state.phase);
  };

  const handleStartFresh = () => {
    console.log("🔄 SessionRecovery: Start Fresh clicked");
    console.log(`   Clearing session...`);
    // Clear session and navigate to landing
    dispatch({ type: "CLEAR_SESSION" });
    console.log(`   Session cleared, navigating to landing...`);
    go("landing");
  };

  if (!hasValidSession) {
    console.log("🔍 SessionRecovery: No valid session, returning null");
    return null; // Don't render if no valid session
  }

  console.log("🎨 SessionRecovery: Rendering recovery UI");
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 text-center" data-testid="session-recovery-screen">
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", bounce: 0.5, delay: 0.1 }}
        className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-[#7C3AED] to-[#E91E63] flex items-center justify-center shadow-lg"
      >
        <span className="text-3xl">✨</span>
      </motion.div>

      <motion.h2
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="mt-6 text-3xl font-black text-[#1A0B2E]"
        style={{ fontFamily: "'Outfit', sans-serif" }}
      >
        Welcome back
      </motion.h2>

      <motion.p
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-2 text-[#4B3B60] text-sm max-w-xs"
      >
        We found your previous session. Continue where you left off or start fresh.
      </motion.p>

      <div className="mt-12 w-full space-y-3">
        <motion.button
          data-testid="session-recovery-continue-btn"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          onClick={handleContinue}
          whileTap={{ scale: 0.97 }}
          whileHover={{ scale: 1.02 }}
          className="w-full py-4 rounded-full bg-[#7C3AED] text-white font-bold text-lg shadow-[0_20px_40px_-15px_rgba(124,59,237,0.5)] inline-flex items-center justify-center gap-2"
        >
          Continue where you left off
          <ArrowRight size={18} />
        </motion.button>

        <motion.button
          data-testid="session-recovery-fresh-btn"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          onClick={handleStartFresh}
          whileTap={{ scale: 0.97 }}
          whileHover={{ scale: 1.02 }}
          className="w-full py-4 rounded-full border-2 border-[#E5E7EB] text-[#4B3B60] font-bold text-lg inline-flex items-center justify-center gap-2"
        >
          <RotateCcw size={18} />
          Start fresh
        </motion.button>
      </div>
    </div>
  );
}
