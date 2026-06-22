import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Heart, ListChecks, Sparkles } from "lucide-react";
import { useGame } from "../store/gameStore";
import { Avatar } from "../components/TurnIndicator";

// ---------- Screen 1: Mutual Consent ----------
export function Level3Consent() {
  const { state, dispatch } = useGame();
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 text-center overflow-y-auto" data-testid="l3-consent-screen">
      <motion.div initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", bounce: 0.5 }}
        className="w-16 h-16 rounded-2xl flex items-center justify-center"
        style={{ background: "linear-gradient(135deg,#FCE4EC,#EDE9FE)" }}>
        <Heart size={28} className="text-[#FF3CAC]" strokeWidth={2.5} fill="#FF3CAC" />
      </motion.div>
      <h2 className="mt-6 text-3xl font-black text-[#1A0B2E]" style={{ fontFamily: "'Outfit', sans-serif" }}>
        Ready to go <span style={{ fontFamily: "'Caveat', cursive", color: "#FF3CAC" }}>deeper?</span>
      </h2>
      <p className="mt-3 text-[#4B3B60] text-sm max-w-xs">
        Level 3 contains more personal, teasing and fantasy questions. Continue only if both of you are comfortable.
      </p>

      <div className="mt-6 flex items-center gap-6">
        <div className="flex flex-col items-center gap-1.5">
          <Avatar player="A" name={state.players.A.name} size={56} />
          <div className="text-xs font-bold text-[#1A0B2E]">{state.players.A.name}</div>
          <div className="text-[10px] font-semibold text-[#10B981]">Ready ✓</div>
        </div>
        <div className="flex flex-col items-center gap-1.5">
          <Avatar player="B" name={state.players.B.name} size={56} />
          <div className="text-xs font-bold text-[#1A0B2E]">{state.players.B.name}</div>
          <div className="text-[10px] font-semibold text-[#10B981]">Ready ✓</div>
        </div>
      </div>

      <div className="mt-8 w-full max-w-xs space-y-3">
        <motion.button data-testid="l3-consent-agree-btn" onClick={() => dispatch({ type: "L3_CONSENT_AGREE" })}
          whileTap={{ scale: 0.97 }}
          className="w-full py-4 rounded-full text-white font-bold text-lg shadow-[0_20px_40px_-15px_rgba(255,60,172,0.5)]"
          style={{ background: "linear-gradient(135deg,#6C3BFF,#FF3CAC)" }}>
          Continue Together
        </motion.button>
        <button data-testid="l3-consent-decline-btn" onClick={() => dispatch({ type: "L3_CONSENT_DECLINE" })}
          className="w-full py-3 rounded-full border-2 border-[#E5E7EB] text-[#4B3B60] font-bold">
          Not Now
        </button>
      </div>
    </div>
  );
}

// ---------- Screen 2: Level 3 Introduction ----------
export function Level3Intro() {
  const { dispatch } = useGame();
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 text-center overflow-y-auto" data-testid="l3-intro-screen">
      <div className="text-[#FF3CAC] text-xs font-bold tracking-widest uppercase">Level 3</div>
      <h2 className="mt-2 text-4xl font-black text-[#1A0B2E] leading-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>
        Truths. Dares.{" "}
        <span style={{ fontFamily: "'Caveat', cursive", color: "#FF3CAC" }}>Temptations.</span> Discoveries.
      </h2>
      <motion.div animate={{ scale: [1, 1.06, 1] }} transition={{ duration: 2.4, repeat: Infinity }}
        className="mt-8 w-24 h-24 rounded-full flex items-center justify-center"
        style={{ background: "linear-gradient(135deg,#FCE4EC,#EDE9FE)" }}>
        <Heart size={40} className="text-[#FF3CAC]" fill="#FF3CAC" />
      </motion.div>
      <p className="mt-6 text-sm text-[#4B3B60] max-w-xs">
        20 questions. Truths, dares and fantasies to unlock your connection insights.
      </p>
      <motion.button data-testid="l3-intro-begin-btn" onClick={() => dispatch({ type: "L3_INTRO_CONTINUE" })}
        whileTap={{ scale: 0.97 }} whileHover={{ scale: 1.02 }}
        className="mt-10 w-full max-w-xs py-4 rounded-full text-white font-bold text-lg shadow-[0_20px_40px_-15px_rgba(108,59,255,0.5)] inline-flex items-center justify-center gap-2"
        style={{ background: "linear-gradient(135deg,#6C3BFF,#FF3CAC)" }}>
        Let's Begin <ArrowRight size={18} />
      </motion.button>
    </div>
  );
}

// ---------- Screen 3: How It Works (optional quick reminder) ----------
const STEPS = [
  { n: 1, text: "A card appears — it's either Truth or Dare." },
  { n: 2, text: "Answer honestly — share your real thoughts." },
  { n: 3, text: "Pass the device to your partner." },
  { n: 4, text: "Reveal & react — see both answers." },
  { n: 5, text: "Complete 20 cards to unlock your connection insights." },
];

export function Level3HowItWorks() {
  const { dispatch } = useGame();
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 text-center overflow-y-auto" data-testid="l3-how-it-works-screen">
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
        style={{ background: "linear-gradient(135deg,#FCE4EC,#EDE9FE)" }}>
        <ListChecks size={24} className="text-[#6C3BFF]" strokeWidth={2.5} />
      </div>
      <h2 className="mt-4 text-2xl font-black text-[#1A0B2E]" style={{ fontFamily: "'Outfit', sans-serif" }}>
        How Level 3 Works
      </h2>
      <div className="mt-6 w-full max-w-xs space-y-4 text-left">
        {STEPS.map(s => (
          <div key={s.n} className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-[#F3E8FF] text-[#6C3BFF] text-xs font-black flex items-center justify-center shrink-0 mt-0.5">
              {s.n}
            </div>
            <p className="text-sm text-[#4B3B60] leading-relaxed">{s.text}</p>
          </div>
        ))}
      </div>
      <motion.button data-testid="l3-how-it-works-continue-btn" onClick={() => dispatch({ type: "L3_HOW_IT_WORKS_CONTINUE" })}
        whileTap={{ scale: 0.97 }} whileHover={{ scale: 1.02 }}
        className="mt-8 w-full max-w-xs py-4 rounded-full text-white font-bold text-lg shadow-[0_20px_40px_-15px_rgba(255,60,172,0.5)]"
        style={{ background: "linear-gradient(135deg,#6C3BFF,#FF3CAC)" }}>
        Got It
      </motion.button>
    </div>
  );
}

// ---------- Screen 4/5: Card back (hidden) -> tap to reveal Truth/Dare + prompt ----------
export function Level3Card() {
  const { state, dispatch } = useGame();
  const [revealed, setRevealed] = useState(false);
  const card = state.level3.deck[state.level3.cardIndex];
  const total = state.level3.deck.length;
  const progress = (state.level3.cardIndex / total) * 100;

  // Inline phase-unlock toast: fires only on the exact card where a new
  // prompt pool begins (card 6 = Teasing, card 11 = Fantasy/Deep Dive).
  // Purely visual - the underlying card.groupKey/groupName already reflect
  // the right pool via buildLevel3Deck(); this just surfaces the moment.
  // Hooks declared unconditionally (before any early return) per Rules of Hooks.
  const cardNumber = state.level3.cardIndex + 1;
  const phaseUnlockMessage =
    cardNumber === 6 ? "Phase 2 Unlocked: Teasing & Rapport"
    : cardNumber === 11 ? "Final Phase Unlocked: Deep Dive"
    : null;
  const [showUnlockToast, setShowUnlockToast] = useState(false);
  useEffect(() => {
    if (!phaseUnlockMessage) return;
    setShowUnlockToast(true);
    const t = setTimeout(() => setShowUnlockToast(false), 2200);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cardNumber]);

  if (!card) return null;

  const isTruth = card.type === "truth";
  const onReveal = () => { if (!revealed) setRevealed(true); };
  const onContinue = () => dispatch({ type: "L3_CARD_REVEALED" });

  return (
    <div className="flex-1 flex flex-col px-6 pt-6 pb-6 overflow-y-auto" data-testid="l3-card-screen">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold text-[#4B3B60]">Card {state.level3.cardIndex + 1} of {total}</span>
        <Heart size={16} className="text-[#FF3CAC]" />
      </div>
      <div className="h-1.5 w-full bg-[#F3E8FF] rounded-full overflow-hidden">
        <motion.div className="h-full bg-gradient-to-r from-[#FF3CAC] to-[#6C3BFF]"
          initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.4 }} />
      </div>

      <AnimatePresence>
        {phaseUnlockMessage && showUnlockToast && (
          <motion.div
            data-testid="l3-phase-unlock-toast"
            initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
            className="mt-3 self-center inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold"
            style={{ background: "linear-gradient(135deg,#FCE4EC,#EDE9FE)", color: "#FF3CAC" }}
          >
            <Sparkles size={12} strokeWidth={2.5} />
            {phaseUnlockMessage}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 flex items-center justify-center" style={{ perspective: 1200 }}>
        <motion.button
          data-testid="l3-card-tap"
          onClick={onReveal}
          animate={{ rotateY: revealed ? 180 : 0 }}
          transition={{ duration: 0.6, type: "spring", bounce: 0.25 }}
          style={{ transformStyle: "preserve-3d", cursor: revealed ? "default" : "pointer" }}
          className="relative w-56 h-80 rounded-3xl shadow-[0_30px_60px_-20px_rgba(108,59,255,0.4)]"
        >
          <div className="absolute inset-0 rounded-3xl flex flex-col items-center justify-center gap-2"
            style={{ background: "linear-gradient(160deg,#6C3BFF,#FF3CAC)", backfaceVisibility: "hidden" }}>
            <Heart size={32} className="text-white/80" />
            <span className="text-white/90 text-xs font-bold tracking-widest uppercase mt-2">Tap to reveal</span>
          </div>
          <div className="absolute inset-0 rounded-3xl bg-white flex flex-col items-center justify-center px-6 text-center"
            style={{ transform: "rotateY(180deg)", backfaceVisibility: "hidden" }}>
            <span className={`px-3 py-1 rounded-full text-xs font-black tracking-widest uppercase ${
              isTruth ? "bg-[#FCE4EC] text-[#FF3CAC]" : "bg-[#EDE9FE] text-[#6C3BFF]"
            }`}>
              {isTruth ? "❤️ Truth" : "😈 Dare"}
            </span>
            <h3 className="mt-4 text-2xl font-black text-[#1A0B2E] leading-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>
              {card.prompt}
            </h3>
          </div>
        </motion.button>
      </div>

      {revealed && (
        <motion.button data-testid="l3-card-continue-btn" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          onClick={onContinue} whileTap={{ scale: 0.97 }}
          className="mt-4 w-full py-4 rounded-full text-white font-bold text-lg shadow-[0_20px_40px_-15px_rgba(108,59,255,0.5)]"
          style={{ background: "linear-gradient(135deg,#6C3BFF,#FF3CAC)" }}>
          Answer Honestly
        </motion.button>
      )}
    </div>
  );
}

// ---------- Screen 6/8: Answer screen — same text-input pattern as Level 2 (new component, per spec: "no new answer UI") ----------
export function Level3Question() {
  const { state, dispatch } = useGame();
  const card = state.level3.deck[state.level3.cardIndex];
  const player = state.currentPlayer;
  const [text, setText] = useState("");

  if (!card) return null;
  const isTruth = card.type === "truth";

  const submit = () => {
    if (text.trim().length === 0) return;
    dispatch({ type: "L3_ANSWER", text: text.trim() });
    setText("");
  };

  return (
    <div className="flex-1 flex flex-col px-6 pt-6 pb-6 overflow-y-auto" data-testid="l3-question-screen">
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-bold text-[#4B3B60]">Card {state.level3.cardIndex + 1} of {state.level3.deck.length}</span>
        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black tracking-widest ${
          isTruth ? "bg-[#FCE4EC] text-[#FF3CAC]" : "bg-[#EDE9FE] text-[#6C3BFF]"
        }`}>
          {isTruth ? "❤️ TRUTH" : "😈 DARE"}
        </span>
      </div>

      <h2 className="mt-1 text-2xl font-black text-[#1A0B2E] leading-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>
        {card.prompt}
      </h2>

      <div className="mt-5 flex-1 flex flex-col">
        <textarea
          data-testid="l3-answer-input"
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, 500))}
          placeholder="Type your answer…"
          className="w-full flex-1 min-h-[140px] bg-white rounded-2xl border-2 border-[#FBE7F3] focus:border-[#FF3CAC]/40 outline-none p-4 text-[#1A0B2E] resize-none"
        />
        <div className="mt-1 text-right text-xs text-[#9CA3AF]">{text.length}/500</div>
      </div>

      <motion.button
        data-testid="l3-submit-btn"
        onClick={submit}
        disabled={text.trim().length === 0}
        whileTap={{ scale: text.trim().length === 0 ? 1 : 0.97 }}
        className={`mt-4 w-full py-4 rounded-full font-bold text-lg shadow-[0_20px_40px_-15px_rgba(255,60,172,0.5)] ${
          text.trim().length === 0 ? "bg-[#F3E8FF] text-[#9CA3AF]" : "bg-[#FF3CAC] text-white"
        }`}
      >
        Submit Answer
      </motion.button>
    </div>
  );
}

// ---------- Screen 7: Pass the device ----------
export function Level3Locked() {
  const { state, dispatch } = useGame();
  const next = state.currentPlayer === "A" ? state.players.B : state.players.A;
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 text-center overflow-y-auto" data-testid="l3-locked-screen">
      <motion.div animate={{ scale: [1, 1.06, 1] }} transition={{ duration: 2, repeat: Infinity }}
        className="w-20 h-20 rounded-full flex items-center justify-center"
        style={{ background: "linear-gradient(135deg,#6C3BFF,#FF3CAC)" }}>
        <Heart size={32} className="text-white" fill="white" />
      </motion.div>
      <h3 className="mt-6 text-2xl font-black text-[#1A0B2E]" style={{ fontFamily: "'Outfit', sans-serif" }}>
        Pass The Device
      </h3>
      <p className="mt-1 text-sm text-[#4B3B60]">Your partner's turn.</p>
      <motion.button data-testid="l3-pass-device-btn" onClick={() => dispatch({ type: "L3_LOCKED_CONTINUE" })}
        whileTap={{ scale: 0.97 }} whileHover={{ scale: 1.02 }}
        className="mt-10 px-10 py-4 rounded-full bg-[#1A0B2E] text-white font-bold text-lg inline-flex items-center justify-center gap-2">
        Pass to {next.name} <ArrowRight size={18} />
      </motion.button>
    </div>
  );
}

export function Level3Handoff() {
  const { state, dispatch } = useGame();
  const next = state.players[state.currentPlayer];
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 text-center overflow-y-auto" data-testid="l3-handoff-screen">
      <Avatar player={state.currentPlayer} name={next.name} size={96} />
      <div className="mt-6 text-[#FF3CAC] text-xs font-bold tracking-widest uppercase">Your Turn</div>
      <h2 className="mt-2 text-3xl font-black text-[#1A0B2E] leading-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>
        Same card, <span className="text-[#FF3CAC]">{next.name}</span>
      </h2>
      <p className="mt-3 text-[#4B3B60] text-sm max-w-xs">They'll answer the same question — no peeking.</p>
      <motion.button data-testid="l3-handoff-ready-btn" onClick={() => dispatch({ type: "L3_HANDOFF_READY" })}
        whileTap={{ scale: 0.96 }} whileHover={{ scale: 1.03 }}
        className="mt-10 px-10 py-4 rounded-full bg-[#FF3CAC] text-white font-bold text-lg shadow-[0_20px_40px_-15px_rgba(255,60,172,0.5)]">
        I'm ready <ArrowRight size={18} className="inline ml-1" />
      </motion.button>
    </div>
  );
}

// ---------- Screen 9: Reveal both answers ----------
const RevealRow = ({ player, name, text }) => (
  <div className="bg-white rounded-2xl p-4 border border-[#FBE7F3]">
    <div className="flex items-center gap-2 mb-2">
      <Avatar player={player} name={name} size={28} />
      <div className="text-sm font-bold text-[#1A0B2E]">{name}</div>
    </div>
    <p className="text-sm text-[#4B3B60] leading-relaxed">{text}</p>
  </div>
);

export function Level3Both() {
  const { state, dispatch } = useGame();
  const last = state.level3.answers[state.level3.answers.length - 1];
  const isLastCard = state.level3.cardIndex + 1 >= state.level3.deck.length;

  return (
    <div className="flex-1 flex flex-col px-6 pt-6 pb-6 overflow-y-auto" data-testid="l3-both-screen">
      <div className="text-center mb-4">
        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black tracking-widest ${
          last?.type === "truth" ? "bg-[#FCE4EC] text-[#FF3CAC]" : "bg-[#EDE9FE] text-[#6C3BFF]"
        }`}>
          {last?.type === "truth" ? "❤️ TRUTH" : "😈 DARE"}
        </span>
        <h3 className="mt-3 text-xl font-black text-[#1A0B2E]">{last?.prompt}</h3>
      </div>

      <div className="space-y-3 flex-1 overflow-y-auto">
        <RevealRow player="A" name={state.players.A.name} text={last?.A} />
        <RevealRow player="B" name={state.players.B.name} text={last?.B} />
      </div>

      <motion.button
        data-testid="l3-next-card-btn"
        onClick={() => dispatch({ type: "L3_NEXT_CARD" })}
        whileTap={{ scale: 0.97 }}
        className="mt-4 w-full py-4 rounded-full text-white font-bold text-lg shadow-[0_20px_40px_-15px_rgba(255,60,172,0.5)]"
        style={{ background: "linear-gradient(135deg,#6C3BFF,#FF3CAC)" }}
      >
        {isLastCard ? "See Results" : "Next Card"}
      </motion.button>
    </div>
  );
}
