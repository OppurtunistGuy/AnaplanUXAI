import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import * as LucideIcons from "lucide-react";
import { SkipForward, Lightbulb, X, Check } from "lucide-react";
import { LEVEL_1_QUESTIONS } from "../data/content";
import { useGame } from "../store/gameStore";

const TIMER_SECONDS = 30;

const IconTile = ({ name, gradient }) => {
  const Icon = LucideIcons[name] || LucideIcons.Sparkles;
  return (
    <div className="relative w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 overflow-hidden" style={{ background: gradient }}>
      <div className="absolute inset-0 bg-white/10" />
      <Icon size={30} className="relative text-white drop-shadow-md" strokeWidth={2.2} />
    </div>
  );
};

export default function Level1Question() {
  const { state, dispatch, go } = useGame();
  const { questionIndex, skipsUsed } = state.level1;
  const player = state.currentPlayer;
  const q = LEVEL_1_QUESTIONS[questionIndex];
  const [seconds, setSeconds] = useState(TIMER_SECONDS);
  const [selected, setSelected] = useState(null);
  const [showHint, setShowHint] = useState(false);
  const [exitConfirm, setExitConfirm] = useState(false);

  // Reset state on question / player change
  useEffect(() => {
    setSeconds(TIMER_SECONDS);
    setSelected(null);
    setShowHint(false);
  }, [questionIndex, player]);

  // Timer
  useEffect(() => {
    if (!q || selected) return;
    if (seconds <= 0) {
      dispatch({ type: "L1_ANSWER", choice: "timeout" });
      return;
    }
    const t = setTimeout(() => setSeconds(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds, dispatch, q, selected]);

  // Auto-lock 1s after selection
  useEffect(() => {
    if (!selected) return;
    const t = setTimeout(() => dispatch({ type: "L1_ANSWER", choice: selected }), 1000);
    return () => clearTimeout(t);
  }, [selected, dispatch]);

  if (!q) return null;

  const skipsLeft = 3 - (skipsUsed[player] || 0);
  const pick = (choice) => { if (!selected) setSelected(choice); };
  const skip = () => { if (skipsLeft > 0 && !selected) dispatch({ type: "L1_ANSWER", choice: "skip" }); };

  const progress = ((questionIndex) / LEVEL_1_QUESTIONS.length) * 100;
  const timerPct = (seconds / TIMER_SECONDS) * 100;

  return (
    <div className="flex flex-col flex-1 relative">
      {/* Top bar */}
      <div className="px-5 pt-5">
        <div className="flex items-center justify-between mb-3">
          <button
            data-testid="l1-exit-btn"
            onClick={() => setExitConfirm(true)}
            className="w-9 h-9 rounded-full bg-white border border-[#EDE9FE] flex items-center justify-center shadow-sm"
            aria-label="Exit"
          >
            <X size={16} className="text-[#6C3BFF]" />
          </button>
          <div className="text-xs font-bold text-[#4B3B60]">
            Question <span className="text-[#6C3BFF]">{questionIndex + 1}</span> of {LEVEL_1_QUESTIONS.length}
          </div>
          <TimerRing seconds={seconds} pct={timerPct} />
        </div>
        <div className="h-1.5 w-full bg-[#F3E8FF] rounded-full overflow-hidden">
          <motion.div className="h-full bg-gradient-to-r from-[#FF3CAC] to-[#6C3BFF]"
            initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.5 }} />
        </div>
        <div className="mt-2 flex items-center justify-between text-xs">
          <span className="font-semibold text-[#4B3B60]">{state.players[player].name}'s turn</span>
          <button
            data-testid="l1-skip-btn"
            onClick={skip}
            disabled={skipsLeft <= 0 || !!selected}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
              skipsLeft > 0 && !selected ? "text-[#6C3BFF] bg-[#F3E8FF]" : "text-[#9CA3AF] bg-[#F3F4F6]"
            }`}
          >
            <SkipForward size={11} strokeWidth={2.5} /> Skips {skipsLeft}/3
          </button>
        </div>
      </div>

      {/* Question */}
      <div className="px-6 mt-6 text-center">
        <h2 className="text-[26px] leading-tight font-black text-[#1A0B2E]" style={{ fontFamily: "'Outfit', sans-serif" }}>
          {q.prompt}
        </h2>
        <div className="mt-3 inline-flex items-center justify-center">
          {!showHint ? (
            <button
              data-testid="l1-hint-toggle"
              onClick={() => setShowHint(true)}
              className="w-8 h-8 rounded-full bg-white border border-[#EDE9FE] flex items-center justify-center shadow-sm hover:bg-[#F3E8FF] transition-colors"
              aria-label="Show hint"
            >
              <Lightbulb size={14} className="text-[#F59E0B]" strokeWidth={2.5} />
            </button>
          ) : (
            <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-1.5 bg-[#FEF3C7] text-[#92400E] px-3 py-1 rounded-full text-xs font-semibold">
              <Lightbulb size={12} strokeWidth={2.5} /> {q.chip}
            </motion.div>
          )}
        </div>
      </div>

      {/* Answer cards */}
      <div className="px-5 mt-5 flex-1 flex flex-col justify-center gap-3">
        <AnswerCard
          testid="l1-option-a"
          option={q.a}
          selected={selected === "a"}
          dimmed={selected && selected !== "a"}
          onPick={() => pick("a")}
        />
        <div className="text-center text-[11px] font-black tracking-[0.3em] text-[#6C3BFF]/60">OR</div>
        <AnswerCard
          testid="l1-option-b"
          option={q.b}
          selected={selected === "b"}
          dimmed={selected && selected !== "b"}
          onPick={() => pick("b")}
        />
      </div>

      <div className="px-5 pb-5 mt-3 text-center text-[11px] text-[#9CA3AF] font-medium">
        {selected ? "Locking your answer…" : "Tap a card to choose"}
      </div>

      {/* Exit confirm */}
      <AnimatePresence>
        {exitConfirm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-4 z-50">
            <motion.div initial={{ y: 30 }} animate={{ y: 0 }} className="w-full max-w-sm bg-white rounded-3xl p-6">
              <h3 className="text-lg font-black text-[#1A0B2E]">Exit this journey?</h3>
              <p className="text-sm text-[#4B3B60] mt-1">Your progress so far will be lost.</p>
              <div className="mt-4 flex gap-2">
                <button data-testid="l1-exit-cancel" onClick={() => setExitConfirm(false)} className="flex-1 py-3 rounded-full border-2 border-[#E5E7EB] font-bold text-[#4B3B60]">Keep playing</button>
                <button data-testid="l1-exit-confirm" onClick={() => go("landing")} className="flex-1 py-3 rounded-full bg-[#FF3CAC] text-white font-bold">Exit</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const AnswerCard = ({ option, selected, dimmed, onPick, testid }) => (
  <motion.button
    data-testid={testid}
    onClick={onPick}
    disabled={dimmed || selected}
    whileHover={!selected && !dimmed ? { scale: 1.015, y: -2 } : {}}
    whileTap={!selected && !dimmed ? { scale: 0.985 } : {}}
    animate={{
      scale: selected ? 1.035 : 1,
      opacity: dimmed ? 0.55 : 1,
      boxShadow: selected
        ? "0 25px 50px -15px rgba(108,59,255,0.45), 0 0 0 3px rgba(255,60,172,0.35)"
        : "0 10px 30px -10px rgba(108,59,255,0.15)",
    }}
    transition={{ duration: 0.25, ease: [0.34, 1.2, 0.64, 1] }}
    className="relative w-full bg-white rounded-[24px] p-4 text-left border border-[#F3E8FF] overflow-hidden"
  >
    {selected && (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.10 }} transition={{ delay: 0.05, duration: 0.3 }}
        className="absolute inset-0 pointer-events-none" style={{ background: option.gradient }} />
    )}
    <div className="relative flex items-center gap-4">
      <IconTile name={option.icon} gradient={option.gradient} />
      <div className="flex-1 min-w-0">
        <div className="font-black text-[#1A0B2E] text-lg leading-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>
          {option.label}
        </div>
        {option.subtitle && (
          <div className="text-xs text-[#6B5B7A] mt-0.5 truncate">{option.subtitle}</div>
        )}
      </div>
      <motion.div
        initial={false}
        animate={{
          scale: selected ? 1 : 0,
          opacity: selected ? 1 : 0,
        }}
        transition={{ delay: selected ? 0.4 : 0, type: "spring", bounce: 0.5 }}
        className="w-8 h-8 rounded-full bg-gradient-to-br from-[#6C3BFF] to-[#FF3CAC] flex items-center justify-center shadow-md"
      >
        <Check size={16} className="text-white" strokeWidth={3} />
      </motion.div>
    </div>
  </motion.button>
);

const TimerRing = ({ seconds, pct }) => {
  const r = 14;
  const c = 2 * Math.PI * r;
  const offset = c - (pct / 100) * c;
  const color = seconds <= 5 ? "#FF3CAC" : "#6C3BFF";
  return (
    <div className="relative w-9 h-9">
      <svg className="absolute inset-0 -rotate-90" viewBox="0 0 36 36">
        <circle cx="18" cy="18" r={r} stroke="#F3E8FF" strokeWidth="3" fill="none" />
        <circle cx="18" cy="18" r={r} stroke={color} strokeWidth="3" fill="none" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1s linear, stroke 0.3s" }} />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-[10px] font-black" style={{ color }}>
        {seconds}
      </div>
    </div>
  );
};
