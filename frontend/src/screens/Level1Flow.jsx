import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { Lock, ArrowRight, Heart, CheckCircle2, Sparkles } from "lucide-react";
import { useGame } from "../store/gameStore";
import { Avatar } from "../components/TurnIndicator";

export function Level1Locked() {
  const { state, dispatch } = useGame();
  useEffect(() => {
    const t = setTimeout(() => dispatch({ type: "L1_LOCKED_CONTINUE" }), 1600);
    return () => clearTimeout(t);
  }, [dispatch]);

  return (
    <div className="flex-1 flex items-center justify-center px-6" data-testid="l1-locked-screen">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full bg-gradient-to-br from-[#7C3AED] to-[#5B21B6] rounded-3xl p-8 text-center text-white shadow-[0_30px_60px_-20px_rgba(124,58,237,0.5)]"
      >
        <div className="w-16 h-16 mx-auto rounded-full bg-white/15 flex items-center justify-center backdrop-blur">
          <Lock size={28} className="text-white" strokeWidth={2.5} />
        </div>
        <h3 className="mt-4 text-2xl font-black">Answer locked</h3>
        <p className="mt-2 text-sm text-white/80">Nice. Now pass the phone.</p>
      </motion.div>
    </div>
  );
}

export function Level1Handoff() {
  const { state, dispatch } = useGame();
  const next = state.players[state.currentPlayer]; // currentPlayer was switched to B by reducer
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 text-center" data-testid="l1-handoff-screen">
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", bounce: 0.4 }}
      >
        <Avatar player={state.currentPlayer} name={next.name} size={96} />
      </motion.div>
      <div className="mt-6 text-[#7C3AED] text-xs font-bold tracking-widest uppercase">Handoff</div>
      <h2 className="mt-2 text-3xl font-black text-[#1A0B2E] leading-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>
        Pass the phone to{" "}
        <span className="text-[#E91E63]">{next.name}</span>
      </h2>
      <p className="mt-3 text-[#4B3B60] text-sm max-w-xs">
        Same question. Their turn to choose. Timer starts when they're ready.
      </p>
      <motion.button
        data-testid="handoff-ready-btn"
        onClick={() => dispatch({ type: "L1_HANDOFF_READY" })}
        whileTap={{ scale: 0.96 }}
        whileHover={{ scale: 1.03 }}
        className="mt-10 px-10 py-4 rounded-full bg-[#E91E63] text-white font-bold text-lg shadow-[0_20px_40px_-15px_rgba(233,30,99,0.5)]"
      >
        I'm ready <ArrowRight size={18} className="inline ml-1" />
      </motion.button>
    </div>
  );
}

export function Level1BothAnswered({ final = false }) {
  const { state, dispatch } = useGame();
  useEffect(() => {
    const t = setTimeout(() => {
      if (final) dispatch({ type: "GO", phase: "l1-complete" });
      else dispatch({ type: "L1_BOTH_NEXT" });
    }, 1400);
    return () => clearTimeout(t);
  }, [dispatch, final]);

  return (
    <div className="flex-1 flex items-center justify-center px-6" data-testid="l1-both-screen">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full bg-gradient-to-br from-[#E91E63] to-[#F472B6] rounded-3xl p-8 text-center text-white shadow-[0_30px_60px_-20px_rgba(233,30,99,0.5)]"
      >
        <div className="w-16 h-16 mx-auto rounded-full bg-white/20 flex items-center justify-center">
          <CheckCircle2 size={32} className="text-white" strokeWidth={2.5} />
        </div>
        <h3 className="mt-4 text-2xl font-black">Both answered</h3>
        <p className="mt-2 text-sm text-white/90">{final ? "Wrapping up Level 1…" : "Moving to the next one…"}</p>
      </motion.div>
    </div>
  );
}

export function Level1Complete() {
  const { state, dispatch } = useGame();
  const answers = state.level1.answers;
  const total = answers.length;
  const answered = answers.filter(x => x && (x.A === "a" || x.A === "b") && (x.B === "a" || x.B === "b")).length;

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 text-center" data-testid="l1-complete-screen">
      <Confetti />
      <motion.div
        initial={{ scale: 0, rotate: -15 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", bounce: 0.5, duration: 0.8 }}
        className="relative w-32 h-32"
      >
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#E91E63] to-[#7C3AED] shadow-[0_30px_60px_-20px_rgba(233,30,99,0.6)]" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Heart size={42} className="text-white fill-white" />
        </div>
        <div className="absolute -bottom-2 -right-2 w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center">
          <span className="font-black text-[#E91E63] text-lg">{total}</span>
        </div>
      </motion.div>

      <h2 className="mt-8 text-4xl font-black text-[#1A0B2E] leading-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>
        Level 1{" "}
        <span style={{ fontFamily: "'Caveat', cursive", color: "#E91E63" }}>complete!</span>
      </h2>
      <p className="mt-3 text-[#4B3B60] text-sm max-w-xs">
        Great job, you two. You answered {answered} out of {total} together. Ready to go deeper?
      </p>

      <motion.button
        data-testid="l1-continue-btn"
        onClick={() => dispatch({ type: "L1_COMPLETE_CONTINUE" })}
        whileTap={{ scale: 0.97 }}
        whileHover={{ scale: 1.02 }}
        className="mt-10 w-full max-w-xs py-4 rounded-full bg-[#7C3AED] text-white font-bold text-lg shadow-[0_20px_40px_-15px_rgba(124,58,237,0.5)] inline-flex items-center justify-center gap-2"
      >
        Continue to Level 2 <ArrowRight size={18} />
      </motion.button>
      <button
        data-testid="l1-end-btn"
        onClick={() => dispatch({ type: "L1_DECLINE" })}
        className="mt-3 text-sm text-[#7C3AED]/70 font-semibold hover:text-[#7C3AED]"
      >
        End here
      </button>
    </div>
  );
}

export function Level1DeclinePrompt() {
  const { state, dispatch } = useGame();
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 text-center" data-testid="l1-decline-screen">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#FCE4EC] to-[#EDE9FE] flex items-center justify-center">
        <Sparkles size={28} className="text-[#7C3AED]" strokeWidth={2.5} />
      </div>
      <h2 className="mt-6 text-3xl font-black text-[#1A0B2E]" style={{ fontFamily: "'Outfit', sans-serif" }}>
        Ready to keep tweaking?
      </h2>
      <p className="mt-3 text-[#4B3B60] text-sm max-w-xs">
        {state.players.A.name} wants to go deeper. {state.players.B.name}, you decide.
      </p>
      <div className="mt-8 w-full max-w-xs space-y-3">
        <motion.button
          data-testid="l1-accept-btn"
          onClick={() => dispatch({ type: "L1_ACCEPT" })}
          whileTap={{ scale: 0.97 }}
          className="w-full py-4 rounded-full bg-[#E91E63] text-white font-bold text-lg shadow-[0_20px_40px_-15px_rgba(233,30,99,0.5)]"
        >
          Yes, let's go deeper
        </motion.button>
        <button
          data-testid="l1-decline-confirm-btn"
          onClick={() => dispatch({ type: "L1_DECLINE" })}
          className="w-full py-3 rounded-full border-2 border-[#E5E7EB] text-[#4B3B60] font-bold"
        >
          Not today
        </button>
      </div>
    </div>
  );
}

// Lightweight CSS-only confetti
const Confetti = () => {
  const pieces = Array.from({ length: 28 });
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {pieces.map((_, i) => {
        const left = Math.random() * 100;
        const delay = Math.random() * 0.6;
        const duration = 2 + Math.random() * 2;
        const colors = ["#E91E63", "#7C3AED", "#F59E0B", "#10B981", "#3B82F6", "#F472B6"];
        const color = colors[i % colors.length];
        const size = 6 + Math.random() * 8;
        return (
          <motion.div
            key={i}
            initial={{ y: -20, opacity: 0, rotate: 0 }}
            animate={{ y: 700, opacity: [0, 1, 1, 0], rotate: 360 }}
            transition={{ delay, duration, repeat: Infinity, repeatDelay: 1 }}
            style={{ position: "absolute", left: `${left}%`, width: size, height: size, background: color, borderRadius: i % 2 ? "50%" : "2px" }}
          />
        );
      })}
    </div>
  );
};
