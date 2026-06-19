import React from "react";
import { motion } from "framer-motion";
import { Lock, Gift, ArrowLeft } from "lucide-react";
import { useGame } from "../store/gameStore";

export function Level3Teaser() {
  const { dispatch } = useGame();
  return (
    <div className="flex-1 flex flex-col bg-gradient-to-br from-[#0F0518] via-[#1F0838] to-[#2A0A4A] relative overflow-hidden" data-testid="l3-teaser-card">
      {/* glow effects */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full bg-[#E91E63] opacity-25 blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-40 h-40 rounded-full bg-[#7C3AED] opacity-30 blur-3xl pointer-events-none" />

      <div className="relative px-6 pt-6">
        <button
          data-testid="l3-back-btn"
          onClick={() => dispatch({ type: "GO", phase: "insights" })}
          className="w-10 h-10 rounded-full bg-white/10 backdrop-blur flex items-center justify-center"
        >
          <ArrowLeft size={18} className="text-white" />
        </button>
      </div>

      <div className="relative flex-1 flex flex-col items-center justify-center text-center px-6">
        <div className="text-[#F472B6] text-xs font-bold tracking-widest uppercase">Level 3</div>
        <h2 className="mt-2 text-4xl font-black text-white leading-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>
          Ready for the{" "}
          <span style={{ fontFamily: "'Caveat', cursive", color: "#F472B6" }}>last ride?</span>
        </h2>

        <motion.div
          animate={{ scale: [1, 1.05, 1], filter: ["drop-shadow(0 0 40px #E91E63)", "drop-shadow(0 0 60px #F472B6)", "drop-shadow(0 0 40px #E91E63)"] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="mt-10 relative w-48 h-48 flex items-center justify-center"
        >
          <svg viewBox="0 0 200 200" width="180" height="180">
            <defs>
              <linearGradient id="neon" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#F472B6" />
                <stop offset="100%" stopColor="#A78BFA" />
              </linearGradient>
            </defs>
            <path
              d="M100 170s-55-34-55-80a30 30 0 0 1 55-17 30 30 0 0 1 55 17c0 46-55 80-55 80z"
              fill="none"
              stroke="url(#neon)"
              strokeWidth="4"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur border border-white/20 flex items-center justify-center">
              <Lock size={24} className="text-white" strokeWidth={2.5} />
            </div>
          </div>
        </motion.div>

        <div className="mt-10 px-6 py-3 rounded-full bg-white/10 backdrop-blur border border-white/20 inline-block">
          <span className="text-white font-bold text-sm tracking-wide">Coming Soon</span>
        </div>

        <p className="mt-6 text-white/70 text-sm max-w-xs leading-relaxed">
          More intimate questions.<br />
          More real conversations.<br />
          Stronger connection.
        </p>

        <div className="mt-8 inline-flex items-center gap-2 text-white/60 text-xs">
          <Gift size={14} />
          <span>Stay tuned</span>
        </div>
      </div>
    </div>
  );
}

export function InactivityEnd() {
  const { dispatch } = useGame();
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 text-center" data-testid="inactivity-screen">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#FCE4EC] to-[#EDE9FE] flex items-center justify-center" />
      <h2 className="mt-6 text-2xl font-black text-[#1A0B2E] leading-tight max-w-xs" style={{ fontFamily: "'Outfit', sans-serif" }}>
        It looks like your partner stepped away.
      </h2>
      <p className="mt-3 text-[#4B3B60] text-sm max-w-xs">
        We'll keep your journey safe — come back anytime to start fresh.
      </p>
      <motion.button
        data-testid="inactivity-restart-btn"
        onClick={() => dispatch({ type: "RESET" })}
        whileTap={{ scale: 0.97 }}
        className="mt-10 px-10 py-4 rounded-full bg-[#E91E63] text-white font-bold text-lg shadow-[0_20px_40px_-15px_rgba(233,30,99,0.5)]"
      >
        Start fresh
      </motion.button>
    </div>
  );
}

export function Closure() {
  const { state, dispatch } = useGame();
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 text-center" data-testid="closure-screen">
      <div className="text-[#7C3AED] text-xs font-bold tracking-widest uppercase">Until next time</div>
      <h2 className="mt-3 text-3xl font-black text-[#1A0B2E] leading-tight max-w-xs" style={{ fontFamily: "'Outfit', sans-serif" }}>
        Thanks for{" "}
        <span style={{ fontFamily: "'Caveat', cursive", color: "#E91E63" }}>playing.</span>
      </h2>
      <p className="mt-3 text-[#4B3B60] text-sm max-w-xs">
        {state.players.A.name} & {state.players.B.name} — you took the time. That already says something.
      </p>
      <div className="mt-8 w-full max-w-xs space-y-3">
        <motion.button
          data-testid="closure-insights-btn"
          onClick={() => dispatch({ type: "GO", phase: "insights" })}
          whileTap={{ scale: 0.97 }}
          className="w-full py-4 rounded-full bg-[#7C3AED] text-white font-bold text-lg"
        >
          See our insights
        </motion.button>
        <button
          data-testid="closure-restart-btn"
          onClick={() => dispatch({ type: "RESET" })}
          className="w-full py-3 rounded-full border-2 border-[#E5E7EB] text-[#4B3B60] font-bold"
        >
          Play again
        </button>
      </div>
    </div>
  );
}
