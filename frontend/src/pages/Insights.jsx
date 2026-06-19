import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { Sparkles, Heart, Compass, Star, MessageCircle, Award, Brain, ArrowRight, RotateCcw } from "lucide-react";
import { useGame } from "../store/gameStore";
import { LEVEL_1_QUESTIONS } from "../data/content";

function buildInsights(state) {
  const l1 = state.level1.answers.filter(Boolean);
  const matches = l1.filter(a => a.A === a.B && (a.A === "a" || a.A === "b"));
  const diffs = l1.filter(a => a.A !== a.B && (a.A === "a" || a.A === "b") && (a.B === "a" || a.B === "b"));

  const agreedTopics = matches.slice(0, 4).map(m => {
    const q = LEVEL_1_QUESTIONS.find(x => x.id === m.qid);
    if (!q) return null;
    const label = m.A === "a" ? q.a.label : q.b.label;
    return { topic: q.prompt, agreed: label, chip: q.chip };
  }).filter(Boolean);

  const surprises = diffs.slice(0, 3).map(d => {
    const q = LEVEL_1_QUESTIONS.find(x => x.id === d.qid);
    if (!q) return null;
    return { topic: q.prompt, you: d.A === "a" ? q.a.label : q.b.label, partner: d.B === "a" ? q.a.label : q.b.label };
  }).filter(Boolean);

  const chipCounts = {};
  l1.forEach(a => {
    const q = LEVEL_1_QUESTIONS.find(x => x.id === a.qid);
    if (!q) return;
    chipCounts[q.chip] = (chipCounts[q.chip] || 0) + (a.A === a.B ? 1 : 0);
  });
  const topChips = Object.entries(chipCounts).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([k, v]) => ({ k, v }));

  const total = l1.length || 1;
  const matchPct = Math.round((matches.length / total) * 100);

  const l2 = state.level2.answers;
  const worthTalking = l2.slice(-3).map(x => x.prompt);

  const enoughData = l1.filter(a => a.A === a.B).length >= 2;

  return { agreedTopics, surprises, topChips, matchPct, worthTalking, enoughData, l2 };
}

const cardIcons = {
  agreed: { icon: Heart, color: "#10B981", bg: "#D1FAE5" },
  surprise: { icon: Sparkles, color: "#7C3AED", bg: "#EDE9FE" },
  matters: { icon: Compass, color: "#3B82F6", bg: "#DBEAFE" },
  approach: { icon: Brain, color: "#E91E63", bg: "#FCE4EC" },
  worth: { icon: MessageCircle, color: "#F59E0B", bg: "#FEF3C7" },
  compat: { icon: Award, color: "#EF4444", bg: "#FEE2E2" },
};

const InsightCard = ({ kind, title, subtitle, items, fallback }) => {
  const cfg = cardIcons[kind];
  const Icon = cfg.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl p-4 border border-[#FBE7F3] shadow-[0_4px_20px_rgba(0,0,0,0.04)]"
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: cfg.bg }}>
          <Icon size={18} style={{ color: cfg.color }} strokeWidth={2.5} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-black text-[#1A0B2E] text-sm">{title}</div>
          <div className="text-[10px] text-[#9CA3AF] font-semibold tracking-wide uppercase mt-0.5">{subtitle}</div>
          <div className="mt-2 space-y-1.5">
            {items && items.length > 0 ? (
              items.map((it, i) => (
                <div key={i} className="text-xs text-[#4B3B60] leading-relaxed">{it}</div>
              ))
            ) : (
              <div className="text-xs text-[#9CA3AF] italic">{fallback}</div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default function Insights() {
  const { state, dispatch } = useGame();
  const data = useMemo(() => buildInsights(state), [state]);

  return (
    <div className="flex flex-col flex-1 overflow-y-auto">
      <div className="px-6 pt-6 pb-2">
        <div className="text-[#E91E63] text-xs font-bold tracking-widest uppercase">Your Insights</div>
        <h2 className="mt-1 text-3xl font-black text-[#1A0B2E]" style={{ fontFamily: "'Outfit', sans-serif" }}>
          From{" "}
          <span style={{ fontFamily: "'Caveat', cursive", color: "#7C3AED" }}>
            each other
          </span>
        </h2>
        <p className="mt-2 text-[#4B3B60] text-sm">
          {data.enoughData ? `You vibed on ${data.matchPct}% of things. Here's what you both said — for real.` : "A snapshot of where you stand together so far."}
        </p>
      </div>

      <div className="px-6 mt-4 space-y-3 pb-6" data-testid="insights-grid">
        <InsightCard
          kind="agreed"
          title="What We Agreed On"
          subtitle="Your common ground"
          items={data.agreedTopics.map(a => `${a.topic} → ${a.agreed}`)}
          fallback="Not enough overlap yet — try another round."
        />
        <InsightCard
          kind="surprise"
          title="What Surprised Us"
          subtitle="Unexpected but beautiful"
          items={data.surprises.map(s => `${s.topic} — you: ${s.you}, them: ${s.partner}`)}
          fallback="You're more aligned than you'd think."
        />
        <InsightCard
          kind="matters"
          title="What Matters To Each Other"
          subtitle="Top recurring themes"
          items={data.topChips.map(c => `${c.k} — strong overlap (${c.v})`)}
          fallback="Not enough answers yet to detect a pattern."
        />
        <InsightCard
          kind="approach"
          title="How You Approach Life"
          subtitle="Their perspective"
          items={
            state.level2.answers.slice(0, 2).map(a => `${state.players.A.name}: "${a.A}" • ${state.players.B.name}: "${a.B}"`)
          }
          fallback="Play Level 2 to unlock this."
        />
        <InsightCard
          kind="worth"
          title="Worth Talking About"
          subtitle="Topics to explore more"
          items={data.worthTalking}
          fallback="Roll the dice a few more times to surface deep topics."
        />
        <InsightCard
          kind="compat"
          title="Compatibility Snapshot"
          subtitle="Your connection vibe"
          items={[
            `${data.matchPct}% same-pick on Level 1`,
            `${data.l2.length} deep cards answered together`,
            data.matchPct > 60 ? "Strong tonal alignment — you get each other." :
              data.matchPct > 30 ? "Healthy mix of overlap and contrast." :
                "Lots to learn about each other. Lean in.",
          ]}
        />
      </div>

      <div className="px-6 pb-8 mt-2 space-y-3">
        <motion.button
          data-testid="insights-l3-btn"
          onClick={() => dispatch({ type: "GO", phase: "l3-teaser" })}
          whileTap={{ scale: 0.97 }}
          className="w-full py-4 rounded-full bg-gradient-to-r from-[#7C3AED] to-[#E91E63] text-white font-bold text-lg shadow-[0_20px_40px_-15px_rgba(124,58,237,0.5)] inline-flex items-center justify-center gap-2"
        >
          Peek Level 3 <ArrowRight size={18} />
        </motion.button>
        <button
          data-testid="insights-restart-btn"
          onClick={() => dispatch({ type: "RESET" })}
          className="w-full py-3 rounded-full border-2 border-[#E5E7EB] text-[#4B3B60] font-bold inline-flex items-center justify-center gap-2"
        >
          <RotateCcw size={16} /> Play again
        </button>
      </div>
    </div>
  );
}
