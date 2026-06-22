import React, { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Heart, MessageCircle, Sparkles, Compass, TrendingUp, RotateCcw, ArrowRight } from "lucide-react";
import { useGame } from "../store/gameStore";
import { LEVEL_1_QUESTIONS } from "../data/content";

const CHIP_TO_DIM = {
  "Comfort Habit": "lifestyle",
  "Lifestyle Indicator": "lifestyle",
  "Future Outlook": "growth",
  "Communication Style": "communication",
  "Adventure Level": "shared",
};

const ARCHETYPE_INFO = {
  "Mirror Souls": "You move through the world in almost the same rhythm — uncanny alignment on the things that matter.",
  "Warm Companions": "Strong shared ground with just enough contrast to keep things interesting.",
  "Curious Opposites": "You share core values but often approach decisions from different perspectives.",
  "Bold Explorers": "More different than similar — and that's where the most interesting conversations live.",
};

function computeMetrics(state) {
  const l1 = state.level1.answers.filter(Boolean);
  const skipsA = state.level1.skipsUsed?.A || 0;
  const skipsB = state.level1.skipsUsed?.B || 0;
  const totalSkips = skipsA + skipsB;
  const l2 = state.level2.answers || [];

  const dim = { shared: { m: 0, t: 0 }, communication: { m: 0, t: 0 }, lifestyle: { m: 0, t: 0 }, growth: { m: 0, t: 0 } };
  let validAnswerPairs = 0; // Track questions where at least one player gave a real answer
  let realMatches = 0; // Track matches between real (non-skip, non-timeout) answers
  
  l1.forEach(a => {
    const q = LEVEL_1_QUESTIONS.find(x => x.id === a.qid);
    if (!q) return;
    const d = CHIP_TO_DIM[q.chip] || "shared";
    
    // Check if answers are real (not skip/timeout)
    const aIsReal = a.A === "a" || a.A === "b";
    const bIsReal = a.B === "a" || a.B === "b";
    
    // Exclude if both players skipped or timed out
    if (!aIsReal && !bIsReal) return;
    
    dim[d].t += 1;
    validAnswerPairs += 1;
    
    // Count match only if both gave real answers AND they match
    if (a.A === a.B && aIsReal && bIsReal) {
      dim[d].m += 1;
      realMatches += 1;
    }
  });
  
  const total = validAnswerPairs || 1;
  const matches = realMatches;

  const pct = (k) => dim[k].t === 0 ? null : Math.round((dim[k].m / dim[k].t) * 100);
  const sharedPct = pct("shared");
  const commPct = pct("communication");
  const lifePct = pct("lifestyle");
  const growthAlign = pct("growth");
  const dynamicScore = l2.length > 0 ? Math.min(100, 65 + l2.length * 10) : (totalSkips < 3 ? 70 : 50);

  // Overall: average of available dims + dynamic
  const avail = [sharedPct, commPct, lifePct, growthAlign, dynamicScore].filter(v => v !== null);
  const overall = avail.length ? Math.round(avail.reduce((a, b) => a + b, 0) / avail.length) : 50;

  const archetype =
    overall >= 80 ? "Mirror Souls" :
    overall >= 65 ? "Warm Companions" :
    overall >= 45 ? "Curious Opposites" :
    "Bold Explorers";

  // Build segments with raw contribution; null means insufficient data
  const rawSegs = [
    { key: "shared", title: "Shared Strengths", emoji: "❤️", color: "#FF3CAC", icon: Heart, raw: sharedPct,
      insight: (sharedPct ?? 0) >= 60
        ? "You both value emotional safety, trust and meaningful conversations."
        : "Quiet but real common ground — your shared values surface when it matters." },
    { key: "comm", title: "Communication Alignment", emoji: "💬", color: "#6C3BFF", icon: MessageCircle, raw: commPct,
      insight: (commPct ?? 0) >= 60
        ? "You speak the same emotional language — directness, warmth and clarity."
        : "You approach conversations differently, but both show willingness to understand each other." },
    { key: "life", title: "Lifestyle Alignment", emoji: "🏡", color: "#10B981", icon: Sparkles, raw: lifePct,
      insight: (lifePct ?? 0) >= 60
        ? "Your answers suggest similar comfort preferences and day-to-day priorities."
        : "Your rhythms differ — and that contrast can keep things refreshing." },
    { key: "growth", title: "Growth Opportunities", emoji: "🌱", color: "#F59E0B", icon: TrendingUp, raw: growthAlign === null ? null : 100 - growthAlign,
      insight: "There's room to better understand how each of you approaches rest, recovery and personal space." },
    { key: "dynamic", title: "Relationship Dynamic", emoji: "✨", color: "#3B82F6", icon: Compass, raw: dynamicScore,
      insight: "Your connection balances familiarity with curiosity — creating room for deeper conversations." },
  ];

  // Filter out null + zero, normalize the rest to 100%
  const active = rawSegs.filter(s => s.raw !== null && s.raw > 0);
  const sum = active.reduce((acc, s) => acc + s.raw, 0) || 1;
  const segments = active.map(s => ({ ...s, pct: Math.round((s.raw / sum) * 100) }));

  // Personalized story — derived from specific patterns
  const story = [];
  // pattern: which dimension was strongest / weakest
  const sortedDims = [
    { name: "lifestyle", v: lifePct, label: "Comfort and daily routines" },
    { name: "shared", v: sharedPct, label: "Shared values" },
    { name: "communication", v: commPct, label: "Communication" },
    { name: "growth", v: growthAlign, label: "Future planning" },
  ].filter(d => d.v !== null).sort((a, b) => b.v - a.v);

  if (sortedDims.length > 0) {
    const top = sortedDims[0];
    if (top.v >= 60) story.push(`${top.label} created your strongest overlap (${top.v}% aligned).`);
    else if (top.v >= 40) story.push(`${top.label} is where you align most — though there's still room to deepen it.`);
  }
  if (sortedDims.length > 1) {
    const bottom = sortedDims[sortedDims.length - 1];
    if (bottom.v <= 30) story.push(`${bottom.label} revealed the biggest differences between you.`);
  }

  // skip pattern
  if (totalSkips === 0) story.push("You both answered every question — that openness says a lot.");
  else if (totalSkips <= 2) story.push(`Only ${totalSkips} skip${totalSkips === 1 ? "" : "s"} between you — strong willingness to engage.`);
  else story.push(`${totalSkips} skips total — some questions hit harder than others, and that's worth noticing.`);

  // L2 engagement
  if (l2.length >= 3) story.push("You leaned into the deeper Level 2 cards — that's where real connection lives.");
  else if (l2.length >= 1) story.push("You went past surface preferences into reflective territory — meaningful.");

  // match-rate texture
  const matchPct = Math.round((matches / total) * 100);
  if (matchPct >= 70) story.push(`You picked the same option ${matches}/${total} times — your instincts often run parallel.`);
  else if (matchPct >= 40) story.push(`You agreed on ${matches}/${total} — a healthy mix of overlap and contrast.`);
  else story.push(`You agreed on ${matches}/${total} — you're more different than alike, and that's not a problem.`);

  return { overall, archetype, segments, story: story.slice(0, 5) };
}

function Donut({ score, segments, active, setActive }) {
  const size = 220, stroke = 22, r = (size - stroke) / 2, cx = size / 2, cy = size / 2;
  const circ = 2 * Math.PI * r;
  let offset = 0;
  if (segments.length === 0) {
    return (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={cx} cy={cy} r={r} stroke="#F3E8FF" strokeWidth={stroke} fill="none" />
        <text x={cx} y={cy + 4} textAnchor="middle" style={{ fontSize: 14, fill: "#9CA3AF" }}>Not enough data yet</text>
      </svg>
    );
  }
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={cx} cy={cy} r={r} stroke="#F3E8FF" strokeWidth={stroke} fill="none" />
      {segments.map((s, i) => {
        const len = (s.pct / 100) * circ;
        const dash = `${len} ${circ - len}`;
        const el = (
          <circle key={s.key} cx={cx} cy={cy} r={r} stroke={s.color}
            strokeWidth={active === i ? stroke + 4 : stroke}
            fill="none" strokeDasharray={dash} strokeDashoffset={-offset}
            transform={`rotate(-90 ${cx} ${cy})`} strokeLinecap="butt"
            onMouseEnter={() => setActive(i)} onClick={() => setActive(i)}
            style={{ cursor: "pointer", transition: "stroke-width 250ms, filter 250ms",
              filter: active === i ? `drop-shadow(0 0 8px ${s.color})` : "none" }} />
        );
        offset += len;
        return el;
      })}
      <text x={cx} y={cy + 4} textAnchor="middle" className="font-black"
        style={{ fontSize: 38, fill: "#1A0B2E", fontFamily: "'Outfit', sans-serif" }}>
        {Math.max(0, Math.round(score))}%
      </text>
      <text x={cx} y={cy + 24} textAnchor="middle"
        style={{ fontSize: 10, fill: "#6B5B7A", fontWeight: 700, letterSpacing: 1.5 }}>
        COMPATIBILITY
      </text>
    </svg>
  );
}

function useAnimatedScore(target) {
  const safe = Number.isFinite(target) ? target : 0;
  const [n, setN] = useState(0);
  useEffect(() => {
    const start = performance.now();
    let raf;
    const tick = (t) => {
      const p = Math.min(1, (t - start) / 800);
      setN(safe * (1 - Math.pow(1 - p, 3)));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [safe]);
  return n;
}

export default function Insights() {
  const { state, dispatch } = useGame();
  const data = useMemo(() => computeMetrics(state), [state]);
  const [active, setActive] = useState(0);
  const animScore = useAnimatedScore(data.overall);
  const hasSegments = data.segments.length > 0;
  const seg = hasSegments ? data.segments[Math.min(active, data.segments.length - 1)] : null;
  const SegIcon = seg?.icon;

  return (
    <div className="flex flex-col flex-1 overflow-y-auto">
      <div className="px-6 pt-6 pb-2 text-center">
        <div className="text-[#FF3CAC] text-xs font-bold tracking-widest uppercase">Your Insights</div>
        <h2 className="mt-1 text-3xl font-black text-[#1A0B2E]" style={{ fontFamily: "'Outfit', sans-serif" }}>
          {data.archetype}
        </h2>
        <p className="mt-1.5 text-xs text-[#6B5B7A] max-w-[280px] mx-auto leading-relaxed">
          {ARCHETYPE_INFO[data.archetype]}
        </p>
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        className="flex justify-center mt-3" data-testid="insights-wheel">
        <Donut score={animScore} segments={data.segments} active={active} setActive={setActive} />
      </motion.div>

      {/* Labeled legend */}
      {hasSegments && (
        <div className="px-6 mt-4 space-y-1.5" data-testid="insights-legend">
          {data.segments.map((s, i) => (
            <button key={s.key} onClick={() => setActive(i)} data-testid={`segment-${s.key}`}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${
                active === i ? "bg-white shadow-sm border border-[#FBE7F3]" : "hover:bg-white/60"
              }`}>
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: s.color }} />
              <span className="text-sm" aria-hidden>{s.emoji}</span>
              <span className="flex-1 text-left text-sm font-semibold text-[#1A0B2E]">{s.title}</span>
              <span className="text-sm font-black" style={{ color: s.color }}>{s.pct}%</span>
            </button>
          ))}
        </div>
      )}

      {/* Insight card */}
      {seg && (
        <motion.div key={seg.key} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}
          className="mx-6 mt-3 bg-white rounded-2xl p-4 border border-[#FBE7F3] shadow-[0_4px_20px_rgba(0,0,0,0.05)]"
          data-testid="insight-card">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: seg.color + "22" }}>
              <SegIcon size={18} style={{ color: seg.color }} strokeWidth={2.5} />
            </div>
            <div className="flex-1">
              <div className="font-black text-[#1A0B2E] text-sm">{seg.title}</div>
              <p className="mt-1.5 text-xs text-[#4B3B60] leading-relaxed">{seg.insight}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Story so far */}
      <div className="mx-6 mt-4 rounded-2xl p-4 border border-[#EDE9FE]"
        style={{ background: "linear-gradient(135deg,#FDF2F8,#EDE9FE)" }}>
        <div className="flex items-center gap-1.5 text-[#6C3BFF] text-xs font-bold tracking-widest uppercase">
          <Sparkles size={12} /> Your Story So Far
        </div>
        <div className="mt-3 space-y-2">
          {data.story.map((line, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + i * 0.08 }}
              className="text-sm text-[#1A0B2E] leading-relaxed flex gap-2">
              <span className="text-[#FF3CAC] font-bold shrink-0">·</span><span>{line}</span>
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
