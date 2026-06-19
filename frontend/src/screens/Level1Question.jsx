import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { SkipForward, Lightbulb } from "lucide-react";
import { LEVEL_1_QUESTIONS } from "../data/content";
import { useGame } from "../store/gameStore";
import { TurnIndicator } from "../components/TurnIndicator";

const TIMER_SECONDS = 30;

export default function Level1Question() {
  const { state, dispatch } = useGame();
  const { questionIndex, skipsUsed } = state.level1;
  const player = state.currentPlayer;
  const q = LEVEL_1_QUESTIONS[questionIndex];
  const [seconds, setSeconds] = useState(TIMER_SECONDS);

  useEffect(() => {
    setSeconds(TIMER_SECONDS);
  }, [questionIndex, player]);

  useEffect(() => {
    if (!q) return; // No more questions; phase is transitioning
    if (seconds <= 0) {
      dispatch({ type: "L1_ANSWER", choice: "timeout" });
      return;
    }
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds, dispatch, q]);

  if (!q) return null;

  const skipsLeft = 3 - (skipsUsed[player] || 0);

  const pick = (choice) => dispatch({ type: "L1_ANSWER", choice });
  const skip = () => {
    if (skipsLeft <= 0) return;
    dispatch({ type: "L1_ANSWER", choice: "skip" });
  };

  const progress = ((questionIndex) / LEVEL_1_QUESTIONS.length) * 100;
  const timerPct = (seconds / TIMER_SECONDS) * 100;

  return (
    <div className="flex flex-col flex-1 overflow-y-auto">
      {/* Header: progress + turn */}
      <div className="px-6 pt-6">
        <div className="flex items-center justify-between mb-3">
          <div className="inline-flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-[10px] font-black tracking-widest bg-[#7C3AED] text-white">LEVEL 1</span>
            <span className="text-xs font-semibold text-[#4B3B60]">
              Question {questionIndex + 1} of {LEVEL_1_QUESTIONS.length}
            </span>
          </div>
          <TurnIndicator player={player} name={state.players[player].name} />
        </div>
        <div className="h-2 w-full bg-[#F3E8FF] rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-[#E91E63] to-[#7C3AED]"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="px-6 mt-6">
        <h2 className="text-2xl font-black text-center text-[#1A0B2E] leading-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>
          {q.prompt}
        </h2>
      </div>

      {/* Options */}
      <div className="px-6 mt-5 space-y-3">
        <OptionCard label={q.a.label} image={q.a.image} onClick={() => pick("a")} testid="l1-option-a" />
        <div className="text-center text-xs font-bold tracking-widest text-[#7C3AED]">OR</div>
        <OptionCard label={q.b.label} image={q.b.image} onClick={() => pick("b")} testid="l1-option-b" />
      </div>

      {/* Hint chip */}
      <div className="px-6 mt-4 flex justify-center">
        <div className="inline-flex items-center gap-1.5 bg-[#EDE9FE] text-[#7C3AED] px-3 py-1 rounded-full text-xs font-semibold">
          <Lightbulb size={12} strokeWidth={2.5} />
          {q.chip}
        </div>
      </div>

      {/* Footer: skips + timer */}
      <div className="mt-auto px-6 py-5 flex items-center justify-between">
        <button
          data-testid="l1-skip-btn"
          onClick={skip}
          disabled={skipsLeft <= 0}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold border ${
            skipsLeft > 0
              ? "border-[#7C3AED]/20 text-[#7C3AED] bg-white hover:bg-[#F5F3FF]"
              : "border-[#E5E7EB] text-[#9CA3AF] bg-[#F9FAFB] cursor-not-allowed"
          }`}
        >
          <SkipForward size={14} strokeWidth={2.5} />
          Skips: {skipsLeft}/3
        </button>
        <TimerRing seconds={seconds} pct={timerPct} />
      </div>
    </div>
  );
}

const OptionCard = ({ label, image, onClick, testid }) => (
  <motion.button
    data-testid={testid}
    onClick={onClick}
    whileTap={{ scale: 0.97 }}
    whileHover={{ scale: 1.02 }}
    className="w-full relative h-32 rounded-3xl overflow-hidden border-2 border-white shadow-[0_10px_30px_-10px_rgba(0,0,0,0.15)]"
  >
    <img src={image} alt={label} className="absolute inset-0 w-full h-full object-cover" />
    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
    <div className="absolute bottom-3 left-4 text-white font-black text-2xl drop-shadow-lg" style={{ fontFamily: "'Outfit', sans-serif" }}>
      {label}
    </div>
  </motion.button>
);

const TimerRing = ({ seconds, pct }) => {
  const r = 18;
  const c = 2 * Math.PI * r;
  const offset = c - (pct / 100) * c;
  const color = seconds <= 5 ? "#E91E63" : "#7C3AED";
  return (
    <div className="relative w-12 h-12">
      <svg className="absolute inset-0 -rotate-90" viewBox="0 0 48 48">
        <circle cx="24" cy="24" r={r} stroke="#F3E8FF" strokeWidth="4" fill="none" />
        <circle
          cx="24"
          cy="24"
          r={r}
          stroke={color}
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1s linear, stroke 0.3s" }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-xs font-black" style={{ color }}>
        {seconds}s
      </div>
    </div>
  );
};
