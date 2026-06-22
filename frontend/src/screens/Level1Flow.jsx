import React, { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Heart, Sparkles, Stars } from "lucide-react";
import { useGame } from "../store/gameStore";
import { Avatar } from "../components/TurnIndicator";
import { LEVEL_1_QUESTIONS } from "../data/content";

// State 3: Answer Locked — auto-advance after 2.5s, manual Pass Device button, mascot, floating hearts
export function Level1Locked() {
  const { state, dispatch } = useGame();
  const next = state.currentPlayer === "A" ? state.players.B : state.players.A;
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Auto-advance after 2.5s (user can tap "Pass Device" to skip)
  useEffect(() => {
    const t = setTimeout(() => {
      setIsTransitioning(prev => {
        if (prev) return prev; // Already transitioning, don't dispatch again
        dispatch({ type: "L1_LOCKED_CONTINUE" });
        return true;
      });
    }, 2500);
    return () => clearTimeout(t);
  }, [dispatch]); // Mount-only: timer should only be set up once

  return (
    <div className="flex-1 flex flex-col px-5 pb-6" data-testid="l1-locked-screen">
      <div className="flex-1 flex items-center justify-center">
        <motion.div initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", bounce: 0.4 }}
          className="w-full rounded-[28px] p-8 text-center text-white relative overflow-hidden shadow-[0_30px_60px_-20px_rgba(108,59,255,0.5)]"
          style={{ background: "linear-gradient(135deg,#6C3BFF 0%,#FF3CAC 100%)" }}>
          {[...Array(7)].map((_, i) => (
            <motion.div key={i}
              animate={{ y: [0, -120], opacity: [0, 0.9, 0], scale: [0.5, 1, 0.6] }}
              transition={{ duration: 3 + i * 0.3, repeat: Infinity, delay: i * 0.4, ease: "easeOut" }}
              className="absolute" style={{ left: `${10 + i * 12}%`, bottom: 20 }}>
              <Heart size={14 + (i % 3) * 4} className="text-white fill-white/90" />
            </motion.div>
          ))}
          <motion.div animate={{ scale: [1, 1.08, 1] }} transition={{ duration: 2, repeat: Infinity }}
            className="relative w-20 h-20 mx-auto rounded-full bg-white/15 backdrop-blur flex items-center justify-center">
            <Heart size={36} className="text-white fill-white" />
          </motion.div>
          <div className="relative mt-5 inline-flex items-center gap-1.5 bg-white/15 backdrop-blur px-3 py-1 rounded-full text-xs font-bold">
            <motion.span animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 1.2, repeat: Infinity }}>✓</motion.span>
            Answer Locked
          </div>
          <h3 className="relative mt-4 text-2xl font-black" style={{ fontFamily: "'Outfit', sans-serif" }}>
            Pass the device
          </h3>
          <p className="relative mt-1 text-sm text-white/85">to {next.name}</p>
        </motion.div>
      </div>
      <motion.button
        data-testid="l1-pass-device-btn"
        onClick={() => {
          if (!isTransitioning) {
            setIsTransitioning(true);
            dispatch({ type: "L1_LOCKED_CONTINUE" });
          }
        }}
        whileTap={{ scale: 0.97 }} whileHover={{ scale: 1.02 }}
        className="w-full py-4 rounded-full bg-[#1A0B2E] text-white font-bold text-lg shadow-[0_20px_40px_-15px_rgba(26,11,46,0.4)] inline-flex items-center justify-center gap-2">
        Pass Device <ArrowRight size={18} />
      </motion.button>
    </div>
  );
}

// State 4: Partner Turn handoff
export function Level1Handoff() {
  const { state, dispatch } = useGame();
  const nextPlayer = state.currentPlayer === "A" ? state.players.B : state.players.A;
  
  // P0.2 Fix: Capture player name once on mount using useRef to prevent instability
  const handoffPlayerNameRef = useRef(nextPlayer.name);
  const displayName = handoffPlayerNameRef.current;
  
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 text-center" data-testid="l1-handoff-screen">
      <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", bounce: 0.4 }}>
        <Avatar player={state.currentPlayer} name={displayName} size={96} />
      </motion.div>
      <div className="mt-6 text-[#6C3BFF] text-xs font-bold tracking-widest uppercase">Partner's Turn</div>
      <h2 className="mt-2 text-3xl font-black text-[#1A0B2E] leading-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>
        Your turn, <span className="text-[#FF3CAC]">{displayName}</span>
      </h2>
      <p className="mt-3 text-[#4B3B60] text-sm max-w-xs">
        Same question. Answer privately — no peeking.
      </p>
      <motion.button data-testid="handoff-ready-btn" onClick={() => dispatch({ type: "L1_HANDOFF_READY" })}
        whileTap={{ scale: 0.96 }} whileHover={{ scale: 1.03 }}
        className="mt-10 px-10 py-4 rounded-full bg-[#FF3CAC] text-white font-bold text-lg shadow-[0_20px_40px_-15px_rgba(255,60,172,0.5)]">
        I'm ready <ArrowRight size={18} className="inline ml-1" />
      </motion.button>
    </div>
  );
}

// State 5: Both Answered with Match!/Different Perspective for 2s
export function Level1BothAnswered({ final = false }) {
  const { state, dispatch } = useGame();
  const idx = state.level1.questionIndex - 1; // most recent
  const last = state.level1.answers[idx];
  const matched = last && last.A === last.B && (last.A === "a" || last.A === "b");
  const q = LEVEL_1_QUESTIONS[idx];
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => {
      setIsTransitioning(prev => {
        if (prev) return prev; // Already transitioning, don't dispatch again
        if (final) dispatch({ type: "GO", phase: "l1-complete" });
        else dispatch({ type: "L1_BOTH_NEXT" });
        return true;
      });
    }, 2000);
    return () => clearTimeout(t);
  }, [dispatch, final]);

  return (
    <div className="flex-1 flex items-center justify-center px-6 relative overflow-hidden" data-testid="l1-both-screen">
      {/* Heart burst */}
      {[...Array(matched ? 14 : 8)].map((_, i) => {
        const angle = (i / (matched ? 14 : 8)) * Math.PI * 2;
        const dist = 110 + Math.random() * 40;
        return (
          <motion.div key={i}
            initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
            animate={{ x: Math.cos(angle) * dist, y: Math.sin(angle) * dist, opacity: [0, 1, 0], scale: [0, 1, 0.5] }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="absolute">
            <Heart size={12 + (i % 3) * 4} className={matched ? "text-[#FF3CAC] fill-[#FF3CAC]" : "text-[#6C3BFF] fill-[#6C3BFF]"} />
          </motion.div>
        );
      })}
      <motion.div initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", bounce: 0.5 }}
        className="w-full rounded-[28px] p-8 text-center text-white shadow-[0_30px_60px_-20px_rgba(108,59,255,0.5)]"
        style={{ background: matched
          ? "linear-gradient(135deg,#FF3CAC 0%,#6C3BFF 100%)"
          : "linear-gradient(135deg,#6C3BFF 0%,#8B5CF6 100%)" }}>
        <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 0.3 }}
          className="w-14 h-14 mx-auto rounded-full bg-white/20 flex items-center justify-center">
          {matched ? <Sparkles size={24} className="text-white" strokeWidth={2.5} /> : <Stars size={24} className="text-white" strokeWidth={2.5} />}
        </motion.div>
        <div className="mt-3 text-xs font-bold tracking-widest uppercase opacity-80">✓ Both Answered</div>
        <h3 className="mt-2 text-3xl font-black" style={{ fontFamily: "'Outfit', sans-serif" }}>
          {matched ? "✨ Match!" : "💫 Different perspective"}
        </h3>
        <p className="mt-2 text-sm text-white/85">
          {matched && q ? `You both picked ${last.A === "a" ? q.a.label : q.b.label}` : "And that's beautiful too."}
        </p>
        <p className="mt-4 text-xs text-white/70">{final ? "Wrapping up Level 1…" : "Moving to next discovery…"}</p>
      </motion.div>
    </div>
  );
}

export function Level1Complete() {
  const { state, dispatch } = useGame();
  const answers = state.level1.answers.filter(Boolean);
  const matches = answers.filter(a => a.A === a.B && (a.A === "a" || a.A === "b")).length;

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 text-center relative overflow-hidden" data-testid="l1-complete-screen">
      <Confetti />
      <motion.div initial={{ scale: 0, rotate: -15 }} animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", bounce: 0.5, duration: 0.8 }} className="relative w-32 h-32">
        <div className="absolute inset-0 rounded-full shadow-[0_30px_60px_-20px_rgba(255,60,172,0.6)]"
          style={{ background: "linear-gradient(135deg,#FF3CAC,#6C3BFF)" }} />
        <div className="absolute inset-0 flex items-center justify-center">
          <Heart size={42} className="text-white fill-white" />
        </div>
        <div className="absolute -bottom-2 -right-2 w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center">
          <span className="font-black text-[#FF3CAC] text-lg">{matches}</span>
        </div>
      </motion.div>
      <h2 className="mt-8 text-4xl font-black text-[#1A0B2E] leading-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>
        Level 1 <span style={{ fontFamily: "'Caveat', cursive", color: "#FF3CAC" }}>complete!</span>
      </h2>
      <p className="mt-3 text-[#4B3B60] text-sm max-w-xs">
        You matched on <span className="font-bold text-[#6C3BFF]">{matches} of {answers.length}</span>. Ready to go deeper?
      </p>
      <motion.button data-testid="l1-continue-btn" onClick={() => dispatch({ type: "L1_COMPLETE_CONTINUE" })}
        whileTap={{ scale: 0.97 }} whileHover={{ scale: 1.02 }}
        className="mt-10 w-full max-w-xs py-4 rounded-full text-white font-bold text-lg shadow-[0_20px_40px_-15px_rgba(108,59,255,0.5)] inline-flex items-center justify-center gap-2"
        style={{ background: "linear-gradient(135deg,#6C3BFF,#FF3CAC)" }}>
        Continue to Level 2 <ArrowRight size={18} />
      </motion.button>
      <button data-testid="l1-end-btn" onClick={() => dispatch({ type: "L1_DECLINE" })}
        className="mt-3 text-sm text-[#6C3BFF]/70 font-semibold hover:text-[#6C3BFF]">
        End here
      </button>
    </div>
  );
}

export function Level1DeclinePrompt() {
  const { state, dispatch } = useGame();
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 text-center" data-testid="l1-decline-screen">
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
        style={{ background: "linear-gradient(135deg,#FCE4EC,#EDE9FE)" }}>
        <Sparkles size={28} className="text-[#6C3BFF]" strokeWidth={2.5} />
      </div>
      <h2 className="mt-6 text-3xl font-black text-[#1A0B2E]" style={{ fontFamily: "'Outfit', sans-serif" }}>
        Ready to go deeper?
      </h2>
      <p className="mt-3 text-[#4B3B60] text-sm max-w-xs">
        {state.players.A.name} & {state.players.B.name} — Level 2 awaits.
      </p>
      <div className="mt-8 w-full max-w-xs space-y-3">
        <motion.button data-testid="l1-accept-btn" onClick={() => dispatch({ type: "L1_ACCEPT" })}
          whileTap={{ scale: 0.97 }}
          className="w-full py-4 rounded-full text-white font-bold text-lg shadow-[0_20px_40px_-15px_rgba(255,60,172,0.5)]"
          style={{ background: "linear-gradient(135deg,#6C3BFF,#FF3CAC)" }}>
          Yes, let's go deeper
        </motion.button>
        <button data-testid="l1-decline-confirm-btn" onClick={() => dispatch({ type: "L1_DECLINE" })}
          className="w-full py-3 rounded-full border-2 border-[#E5E7EB] text-[#4B3B60] font-bold">
          Not today
        </button>
      </div>
    </div>
  );
}

const Confetti = () => {
  const pieces = Array.from({ length: 24 });
  const colors = ["#FF3CAC", "#6C3BFF", "#F59E0B", "#10B981", "#3B82F6", "#F472B6"];
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {pieces.map((_, i) => {
        const left = Math.random() * 100;
        const delay = Math.random() * 0.6;
        const duration = 2 + Math.random() * 2;
        const color = colors[i % colors.length];
        const size = 6 + Math.random() * 8;
        return (
          <motion.div key={i}
            initial={{ y: -20, opacity: 0, rotate: 0 }}
            animate={{ y: 700, opacity: [0, 1, 1, 0], rotate: 360 }}
            transition={{ delay, duration, repeat: Infinity, repeatDelay: 1 }}
            style={{ position: "absolute", left: `${left}%`, width: size, height: size, background: color, borderRadius: i % 2 ? "50%" : "2px" }} />
        );
      })}
    </div>
  );
};
