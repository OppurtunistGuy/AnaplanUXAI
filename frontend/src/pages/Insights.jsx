import React, { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Heart, MessageCircle, Sparkles, Compass, TrendingUp, RotateCcw, ArrowRight } from "lucide-react";
import { useGame } from "../store/gameStore";
import { LEVEL_1_QUESTIONS } from "../data/content";

// Bucket L1 questions by dimension via hint chip
const CHIP_TO_DIM = {
  "Comfort Habit": "lifestyle",
  "Lifestyle Indicator": "lifestyle",
  "Future Outlook": "growth",
  "Communication Style": "communication",
  "Adventure Level": "shared",
};

function computeMetrics(state) {
  const l1 = state.level1.answers.filter(Boolean);
  const total = l1.length || 1;
  const matches = l1.filter(a => a.A === a.B && (a.A === "a" || a.A === "b")).length;
  const skipsA = state.level1.skipsUsed?.A || 0;
  const skipsB = state.level1.skipsUsed?.B || 0;
  const totalSkips = skipsA + skipsB;
  const l2 = state.level2.answers || [];

  // Per-dimension matches
  const dim = { shared: { m: 0, t: 0 }, communication: { m: 0, t: 0 }, lifestyle: { m: 0, t: 0 }, growth: { m: 0, t: 0 } };
  l1.forEach(a => {
    const q = LEVEL_1_QUESTIONS.find(x => x.id === a.qid);
    if (!q) return;
    const d = CHIP_TO_DIM[q.chip] || "shared";
    dim[d].t += 1;
    if (a.A === a.B) dim[d].m += 1;
  });

  const pct = (k) => dim[k].t === 0 ? 50 : Math.round((dim[k].m / dim[k].t) * 100);
  const sharedPct = pct("shared");
  const commPct = pct("communication");
  const lifePct = pct("lifestyle");
  const growthGap = 100 - pct("growth"); // growth = difference area
  const dynamicScore = Math.round(((l2.length > 0 ? 100 : 70) + (totalSkips < 3 ? 100 : 70)) / 2);

  const overall = Math.round((sharedPct + commPct + lifePct + (100 - growthGap) + dynamicScore) / 5);

  const archetype =
    overall >= 80 ? "Mirror Souls" :
    overall >= 65 ? "Warm Companions" :
    overall >= 45 ? "Curious Opposites" :
    "Bold Explorers";

  // Normalize to 5 contributions summing ~100
  const raw = [sharedPct, commPct, lifePct, growthGap, dynamicScore];
  const sum = raw.reduce((a, b) => a + b, 0) || 1;
  const contrib = raw.map(v => Math.round((v / sum) * 100));

  const segments = [
    { key: "shared", title: "Shared Strengths", pct: contrib[0], color: "#FF3CAC", icon: Heart,
      insight: matches >= total * 0.6
        ? "You both value emotional safety, trust and meaningful conversations."
        : "Quiet but real common ground — your shared values surface when it matters." },
    { key: "comm", title: "Communication Alignment", pct: contrib[1], color: "#6C3BFF", icon: MessageCircle,
      insight: commPct >= 60
        ? "You speak the same emotional language — directness, warmth and clarity."
        : "You approach conversations differently, but both show willingness to understand each other." },
    { key: "life", title: "Lifestyle Alignment", pct: contrib[2], color: "#10B981", icon: Sparkles,
      insight: lifePct >= 60
        ? "Your answers suggest similar comfort preferences and day-to-day priorities."
        : "Your rhythms differ — and that contrast can keep things refreshing." },
    { key: "growth", title: "Growth Opportunities", pct: contrib[3], color: "#F59E0B", icon: TrendingUp,
      insight: "There is room to better understand how each of you approaches rest, recovery and personal space." },
    { key: "dynamic", title: "Relationship Dynamic", pct: contrib[4], color: "#3B82F6", icon: Compass,
      insight: "Your connection balances familiarity with curiosity — creating room for deeper conversations." },
  ];

  // Story so far (3-5 narrative observations)
  const story = [];
  if (matches >= total * 0.7) story.push("Your overlap runs deep — you align on the things that matter daily.");
  else if (matches >= total * 0.4) story.push("You approach life differently, but share surprisingly similar future hopes.");
  else story.push("You're more different than similar — and that's a fertile ground for real conversation.");

  if (lifePct >= 60) story.push("Comfort and daily routines created your strongest overlap.");
  if (growthGap > 50) story.push("Future planning surfaced the most distance between you — worth a real talk.");
  if (totalSkips <= 1) story.push("You answered openly and skipped almost nothing — suggesting curiosity and trust.");
  if (l2.length >= 2) story.push("You leaned into the harder questions in Level 2 — that says something.");
  if (story.length < 3) story.push("Every answer added a brushstroke. Keep painting the picture together.");

  return { overall, archetype, segments, story };
}

// SVG Donut
function Donut({ score, segments, active, setActive }) {
  const size = 220, stroke = 22, r = (size - stroke) / 2, cx = size / 2, cy = size / 2;
  const circ = 2 * Math.PI * r;
  let offset = 0;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="block">
      <circle cx={cx} cy={cy} r={r} stroke="#F3E8FF" strokeWidth={stroke} fill="none" />
      {segments.map((s, i) => {
        const len = (s.pct / 100) * circ;
        const dash = `${len} ${circ - len}`;
        const el = (
          <circle
            key={s.key}
            cx={cx} cy={cy} r={r}
            stroke={s.color}
            strokeWidth={active === i ? stroke + 4 : stroke}
            fill="none"
            strokeDasharray={dash}
            strokeDashoffset={-offset}
            transform={`rotate(-90 ${cx} ${cy})`}
            strokeLinecap="butt"
            onMouseEnter={() => setActive(i)}
            onClick={() => setActive(i)}
            style={{
              cursor: "pointer",
              transition: "stroke-width 250ms, filter 250ms",
              filter: active === i ? `drop-shadow(0 0 8px ${s.color})` : "none",
            }}
          />
        );
        offset += len;
        return el;
      })}
      <text x={cx} y={cy - 6} textAnchor="middle" className="font-black" style={{ fontSize: 36, fill: "#1A0B2E", fontFamily: "'Outfit', sans-serif" }}>
        {Number.isFinite(score) ? score : 0}%
      </text>
      <text x={cx} y={cy + 18} textAnchor="middle" style={{ fontSize: 11, fill: "#6B5B7A", fontWeight: 600, letterSpacing: 1 }}>
        COMPATIBILITY
      </text>
    </svg>
  );
}

function AnimatedScore({ target }) {
  const safeTarget = Number.isFinite(target) ? target : 0;
  const [n, setN] = useState(0);
  useEffect(() => {
    const start = performance.now();
    const dur = 800;
    let raf;
    const tick = (t) => {
      const p = Math.min(1, (t - start) / dur);
      setN(Math.round(safeTarget * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [safeTarget]);
  return n;
}

export default function Insights() {
  const { state, dispatch } = useGame();
  const data = useMemo(() => computeMetrics(state), [state]);
  const [active, setActive] = useState(0);
  const animScore = AnimatedScore({ target: data.overall });
  const seg = data.segments[active];
  const SegIcon = seg.icon;

  return (
    <div className="flex flex-col flex-1 overflow-y-auto">
      <div className="px-6 pt-6 pb-2 text-center">
        <div className="text-[#FF3CAC] text-xs font-bold tracking-widest uppercase">Your Insights</div>
        <h2 className="mt-1 text-3xl font-black text-[#1A0B2E]" style={{ fontFamily: "'Outfit', sans-serif" }}>
          {data.archetype}
        </h2>
        <p className="mt-1 text-xs text-[#6B5B7A]">Built from your conversation patterns</p>
      </div>

      {/* Donut */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        className="flex justify-center mt-2" data-testid="insights-wheel">
        <Donut score={animScore} segments={data.segments} active={active} setActive={setActive} />
      </motion.div>

      {/* Legend */}
      <div className="px-6 mt-3 grid grid-cols-5 gap-1">
        {data.segments.map((s, i) => (
          <button key={s.key} onClick={() => setActive(i)} data-testid={`segment-${i}`}
            className={`flex flex-col items-center gap-1 py-1.5 rounded-xl transition-all ${active === i ? "bg-white shadow-sm" : "opacity-70"}`}>
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: s.color }} />
            <span className="text-[9px] font-bold text-[#4B3B60] leading-none text-center">{s.pct}%</span>
          </button>
        ))}
      </div>

      {/* Insight card (inline updates) */}
      <motion.div key={seg.key}
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}
        className="mx-6 mt-3 bg-white rounded-2xl p-4 border border-[#FBE7F3] shadow-[0_4px_20px_rgba(0,0,0,0.05)]"
        data-testid="insight-card">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: seg.color + "22" }}>
            <SegIcon size={18} style={{ color: seg.color }} strokeWidth={2.5} />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div className="font-black text-[#1A0B2E] text-sm">{seg.title}</div>
              <div className="text-xs font-bold" style={{ color: seg.color }}>{seg.pct}%</div>
            </div>
            <p className="mt-1.5 text-xs text-[#4B3B60] leading-relaxed">{seg.insight}</p>
          </div>
        </div>
      </motion.div>

      {/* Story so far */}
      <div className="mx-6 mt-4 rounded-2xl p-4 border border-[#EDE9FE]" style={{ background: "linear-gradient(135deg,#FDF2F8,#EDE9FE)" }}>
        <div className="flex items-center gap-1.5 text-[#6C3BFF] text-xs font-bold tracking-widest uppercase">
          <Sparkles size={12} /> Your Story So Far
        </div>
        <div className="mt-3 space-y-2">
          {data.story.slice(0, 5).map((line, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + i * 0.08 }}
              className="text-sm text-[#1A0B2E] leading-relaxed">
              <span className="font-bold text-[#FF3CAC] mr-1">·</span>{line}
            </motion.div>
          ))}
        </div>
      </div>

      <div className="px-6 pb-8 pt-5 space-y-3">
        <motion.button data-testid="insights-l3-btn" onClick={() => dispatch({ type: "GO", phase: "l3-teaser" })}
          whileTap={{ scale: 0.97 }}
          className="w-full py-4 rounded-full text-white font-bold text-lg shadow-[0_20px_40px_-15px_rgba(108,59,255,0.5)] inline-flex items-center justify-center gap-2"
          style={{ background: "linear-gradient(135deg,#6C3BFF,#FF3CAC)" }}>
          Peek Level 3 <ArrowRight size={18} />
        </motion.button>
        <button data-testid="insights-restart-btn" onClick={() => dispatch({ type: "RESET" })}
          className="w-full py-3 rounded-full border-2 border-[#E5E7EB] text-[#4B3B60] font-bold inline-flex items-center justify-center gap-2">
          <RotateCcw size={16} /> Play again
        </button>
      </div>
    </div>
  );
}
