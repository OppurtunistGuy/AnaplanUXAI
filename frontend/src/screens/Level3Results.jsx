import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Sparkles, RotateCcw, Home } from "lucide-react";
import { useGame } from "../store/gameStore";

// Score donut — visual pattern matches Insights.jsx's existing Donut component
// (copied, not imported/modified, to keep Level 3 fully isolated from L1/L2 files).
function ScoreRing({ score, color, label, emoji }) {
  const size = 140, stroke = 14, r = (size - stroke) / 2, cx = size / 2, cy = size / 2;
  const circ = 2 * Math.PI * r;
  const safe = Number.isFinite(score) ? score : 0;
  const [animScore, setAnimScore] = useState(0);

  useEffect(() => {
    const start = performance.now();
    let raf;
    const tick = (t) => {
      const p = Math.min(1, (t - start) / 800);
      setAnimScore(safe * (1 - Math.pow(1 - p, 3)));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [safe]);

  const len = (animScore / 100) * circ;
  const dash = `${len} ${circ - len}`;

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={cx} cy={cy} r={r} stroke="#F3E8FF" strokeWidth={stroke} fill="none" />
        <circle cx={cx} cy={cy} r={r} stroke={color} strokeWidth={stroke} fill="none"
          strokeDasharray={dash} strokeLinecap="round" transform={`rotate(-90 ${cx} ${cy})`} />
        <text x={cx} y={cy + 6} textAnchor="middle" className="font-black"
          style={{ fontSize: 28, fill: "#1A0B2E", fontFamily: "'Outfit', sans-serif" }}>
          {Math.round(animScore)}%
        </text>
      </svg>
      <div className="mt-1 inline-flex items-center gap-1.5 text-sm font-bold text-[#1A0B2E]">
        <span aria-hidden>{emoji}</span> {label}
      </div>
    </div>
  );
}

const ARCHETYPES = [
  { min: 80, name: "Curious Explorers", summary: "You naturally create attraction through curiosity and conversation." },
  { min: 60, name: "Playful Sparks", summary: "You enjoy playful tension and teasing — the chemistry shows." },
  { min: 0, name: "Quiet Discoverers", summary: "You share similar romantic interests with room for discovery." },
];

function computeLevel3Scores(state) {
  const answers = state.level3.answers || [];
  const total = answers.length || 1;

  const byGroup = (key) => answers.filter(a => a.groupKey === key);
  const scoreFor = (key, base) => {
    const group = byGroup(key);
    if (group.length === 0) return base;
    // Lightweight rule-based scoring (no AI): rewards engagement (answered length) and presence of both answers.
    const engaged = group.filter(a => (a.A || "").trim().length > 0 && (a.B || "").trim().length > 0).length;
    const ratio = engaged / group.length;
    return Math.round(base + ratio * (100 - base) * 0.6);
  };

  const chemistry = scoreFor("chemistry", 55);
  const teasing = scoreFor("teasing", 55);
  const fantasy = scoreFor("fantasy", 55);
  const overall = Math.round((chemistry + teasing + fantasy) / 3);
  const archetype = ARCHETYPES.find(a => overall >= a.min) || ARCHETYPES[ARCHETYPES.length - 1];

  return { chemistry, teasing, fantasy, overall, archetype, answeredCount: answers.length, total: state.level3.deck.length || total };
}

export default function Level3Results() {
  const { state, dispatch } = useGame();
  const scores = computeLevel3Scores(state);

  return (
    <div className="flex-1 flex flex-col px-6 pt-6 pb-8 overflow-y-auto" data-testid="l3-results-screen">
      <div className="text-center">
        <motion.div initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", bounce: 0.5 }}
          className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center"
          style={{ background: "linear-gradient(135deg,#FF3CAC,#6C3BFF)" }}>
          <Sparkles size={28} className="text-white" strokeWidth={2.5} />
        </motion.div>
        <h2 className="mt-4 text-3xl font-black text-[#1A0B2E]" style={{ fontFamily: "'Outfit', sans-serif" }}>
          You did it! <span style={{ fontFamily: "'Caveat', cursive", color: "#FF3CAC" }}>Level 3 Completed</span>
        </h2>
        <p className="mt-2 text-sm text-[#4B3B60] max-w-xs mx-auto">
          You opened up, teased, and revealed more about each other.
        </p>
      </div>

      <div className="mt-8 grid grid-cols-3 gap-2" data-testid="l3-results-scores">
        <ScoreRing score={scores.chemistry} color="#FF3CAC" label="Chemistry" emoji="💫" />
        <ScoreRing score={scores.teasing} color="#6C3BFF" label="Teasing" emoji="😈" />
        <ScoreRing score={scores.fantasy} color="#EF4444" label="Fantasy" emoji="🔥" />
      </div>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="mt-8 rounded-2xl p-5 text-center text-white relative overflow-hidden"
        style={{ background: "linear-gradient(135deg,#6C3BFF,#FF3CAC)" }}>
        <div className="text-xs font-bold tracking-widest uppercase opacity-80">Your Relationship Archetype</div>
        <h3 className="mt-1 text-2xl font-black" style={{ fontFamily: "'Outfit', sans-serif" }}>
          {scores.archetype.name} 💗
        </h3>
        <p className="mt-2 text-sm text-white/90 leading-relaxed">{scores.archetype.summary}</p>
      </motion.div>

      <div className="mt-auto pt-8 space-y-3">
        <motion.button
          data-testid="l3-results-play-again-btn"
          onClick={() => dispatch({ type: "RESET" })}
          whileTap={{ scale: 0.97 }}
          className="w-full py-4 rounded-full text-white font-bold text-lg shadow-[0_20px_40px_-15px_rgba(108,59,255,0.5)] inline-flex items-center justify-center gap-2"
          style={{ background: "linear-gradient(135deg,#6C3BFF,#FF3CAC)" }}
        >
          <RotateCcw size={18} /> Play Again
        </motion.button>
        <button
          data-testid="l3-results-home-btn"
          onClick={() => dispatch({ type: "GO", phase: "closure" })}
          className="w-full py-3 rounded-full border-2 border-[#E5E7EB] text-[#4B3B60] font-bold inline-flex items-center justify-center gap-2"
        >
          <Home size={16} /> Back to Home
        </button>
      </div>
    </div>
  );
}
