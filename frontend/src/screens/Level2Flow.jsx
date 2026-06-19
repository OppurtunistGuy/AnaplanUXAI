import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dices, ArrowRight, Lightbulb, RotateCcw, Lock, CheckCircle2 } from "lucide-react";
import { LEVEL_2_CATEGORIES } from "../data/content";
import { useGame } from "../store/gameStore";
import { TurnIndicator, Avatar } from "../components/TurnIndicator";

export function Level2Dice() {
  const { dispatch } = useGame();
  const [rolling, setRolling] = useState(false);

  const roll = () => {
    if (rolling) return;
    setRolling(true);
    setTimeout(() => {
      const cat = LEVEL_2_CATEGORIES[Math.floor(Math.random() * LEVEL_2_CATEGORIES.length)];
      dispatch({ type: "L2_DICE_ROLLED", categoryId: cat.id });
    }, 1600);
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 text-center" data-testid="l2-dice-screen">
      <div className="inline-flex items-center gap-2 mb-4">
        <span className="px-2.5 py-1 rounded-full text-[10px] font-black tracking-widest bg-[#E91E63] text-white">LEVEL 2</span>
        <span className="text-xs font-semibold text-[#4B3B60]">Explore Deeper</span>
      </div>
      <h2 className="text-3xl font-black text-[#1A0B2E]" style={{ fontFamily: "'Outfit', sans-serif" }}>
        Roll the{" "}
        <span style={{ fontFamily: "'Caveat', cursive", color: "#E91E63" }}>dice</span>
      </h2>
      <p className="mt-2 text-[#4B3B60] text-sm max-w-xs">
        Let chance pick the category. Both of you answer the same card.
      </p>

      <motion.div
        animate={rolling ? { rotateX: [0, 360, 720, 1080], rotateY: [0, 360, 720, 1080], rotateZ: [0, 180, 360] } : {}}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="mt-10 w-40 h-40 relative"
        style={{ perspective: 800 }}
      >
        <div className="w-full h-full rounded-3xl bg-gradient-to-br from-white to-[#FCE4EC] shadow-[0_30px_60px_-20px_rgba(124,58,237,0.4)] border-4 border-white flex items-center justify-center">
          <Dices size={80} className="text-[#7C3AED]" strokeWidth={1.8} />
        </div>
      </motion.div>

      <motion.button
        data-testid="l2-dice-roll-btn"
        onClick={roll}
        disabled={rolling}
        whileTap={{ scale: rolling ? 1 : 0.95 }}
        whileHover={{ scale: rolling ? 1 : 1.03 }}
        className={`mt-10 px-10 py-4 rounded-full font-bold text-lg shadow-[0_20px_40px_-15px_rgba(233,30,99,0.5)] ${
          rolling ? "bg-[#F3E8FF] text-[#7C3AED]" : "bg-[#E91E63] text-white"
        }`}
      >
        {rolling ? "Rolling…" : "Tap to roll"}
      </motion.button>
    </div>
  );
}

export function Level2Category() {
  const { state, dispatch } = useGame();
  const cat = LEVEL_2_CATEGORIES.find(c => c.id === state.level2.selectedCategoryId);
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 text-center" data-testid="l2-category-screen">
      <div className="text-[#7C3AED] text-xs font-bold tracking-widest uppercase mb-3">Category revealed</div>
      <motion.div
        initial={{ scale: 0, rotate: -10 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", bounce: 0.5 }}
        className="w-28 h-28 rounded-3xl shadow-[0_30px_60px_-20px_rgba(0,0,0,0.25)] flex items-center justify-center"
        style={{ background: `linear-gradient(135deg, ${cat.color}, ${cat.color}cc)` }}
      >
        <span className="text-white text-4xl font-black">
          {cat.name.charAt(0)}
        </span>
      </motion.div>
      <h2 className="mt-6 text-3xl font-black text-[#1A0B2E] leading-tight max-w-xs" style={{ fontFamily: "'Outfit', sans-serif" }}>
        {cat.name}
      </h2>
      <p className="mt-3 text-[#4B3B60] text-sm max-w-xs">
        Let's dive deeper into this topic. Pick a card.
      </p>
      <motion.button
        data-testid="l2-category-continue-btn"
        onClick={() => dispatch({ type: "L2_CATEGORY_CONTINUE" })}
        whileTap={{ scale: 0.97 }}
        className="mt-10 px-10 py-4 rounded-full bg-[#7C3AED] text-white font-bold text-lg shadow-[0_20px_40px_-15px_rgba(124,58,237,0.5)] inline-flex items-center gap-2"
      >
        Show cards <ArrowRight size={18} />
      </motion.button>
    </div>
  );
}

export function Level2Cards() {
  const { state, dispatch } = useGame();
  const cat = LEVEL_2_CATEGORIES.find(c => c.id === state.level2.selectedCategoryId);
  const [active, setActive] = useState(0);
  const cards = cat.cards;

  return (
    <div className="flex-1 flex flex-col px-6 pt-6 pb-8" data-testid="l2-cards-screen">
      <div className="text-center">
        <div className="text-[#7C3AED] text-xs font-bold tracking-widest uppercase">Pick a card</div>
        <h3 className="mt-1 text-xl font-bold text-[#1A0B2E]">{cat.name}</h3>
      </div>

      <div className="flex-1 flex items-center justify-center relative" style={{ perspective: 1000 }}>
        <div className="relative w-full h-[360px] flex items-center justify-center">
          {cards.map((_, i) => {
            const offset = i - active;
            const abs = Math.abs(offset);
            if (abs > 2) return null;
            return (
              <motion.div
                key={i}
                onClick={() => setActive(i)}
                animate={{
                  x: offset * 50,
                  scale: 1 - abs * 0.08,
                  opacity: 1 - abs * 0.3,
                  rotateZ: offset * 4,
                  zIndex: 10 - abs,
                  filter: abs === 0 ? "blur(0px)" : `blur(${abs * 2}px)`,
                }}
                transition={{ type: "spring", stiffness: 200, damping: 22 }}
                className="absolute w-56 h-80 rounded-3xl cursor-pointer shadow-[0_30px_60px_-20px_rgba(0,0,0,0.3)]"
                style={{
                  background: `linear-gradient(160deg, ${cat.color}, ${cat.color}aa)`,
                }}
              >
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                  <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur flex items-center justify-center mb-3">
                    <span className="text-4xl font-black">?</span>
                  </div>
                  <div className="text-xs font-bold tracking-widest uppercase opacity-80">Discover</div>
                  <div className="mt-1 text-sm font-semibold">Card {i + 1} of {cards.length}</div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      <div className="flex justify-center gap-1.5 mb-4">
        {cards.map((_, i) => (
          <button
            key={i}
            data-testid={`l2-card-dot-${i}`}
            onClick={() => setActive(i)}
            className={`h-1.5 rounded-full transition-all ${i === active ? "w-6 bg-[#E91E63]" : "w-1.5 bg-[#E5E7EB]"}`}
          />
        ))}
      </div>

      <motion.button
        data-testid="l2-card-pick-btn"
        onClick={() => dispatch({ type: "L2_CARD_PICKED", cardIndex: active })}
        whileTap={{ scale: 0.97 }}
        className="w-full py-4 rounded-full bg-[#E91E63] text-white font-bold text-lg shadow-[0_20px_40px_-15px_rgba(233,30,99,0.5)]"
      >
        Reveal this card
      </motion.button>
    </div>
  );
}

export function Level2CardFlip() {
  const { dispatch } = useGame();
  useEffect(() => {
    const t = setTimeout(() => dispatch({ type: "L2_CARD_REVEALED" }), 1400);
    return () => clearTimeout(t);
  }, [dispatch]);
  return (
    <div className="flex-1 flex items-center justify-center px-6" data-testid="l2-flip-screen">
      <motion.div
        initial={{ rotateY: 0 }}
        animate={{ rotateY: 180 }}
        transition={{ duration: 1, type: "spring", bounce: 0.3 }}
        className="w-56 h-80 rounded-3xl shadow-[0_30px_60px_-20px_rgba(233,30,99,0.4)] bg-gradient-to-br from-[#E91E63] to-[#7C3AED]"
        style={{ transformStyle: "preserve-3d" }}
      />
    </div>
  );
}

export function Level2Question() {
  const { state, dispatch } = useGame();
  const cat = LEVEL_2_CATEGORIES.find(c => c.id === state.level2.selectedCategoryId);
  const prompt = cat.cards[state.level2.cardIndex];
  const player = state.currentPlayer;
  const [text, setText] = useState("");

  const submit = () => {
    if (text.trim().length === 0) return;
    dispatch({ type: "L2_ANSWER", text: text.trim() });
    setText("");
  };

  return (
    <div className="flex-1 flex flex-col px-6 pt-6 pb-6" data-testid="l2-question-screen">
      <div className="flex items-center justify-between mb-4">
        <div className="inline-flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-full text-[10px] font-black tracking-widest bg-[#E91E63] text-white">LEVEL 2</span>
        </div>
        <TurnIndicator player={player} name={state.players[player].name} />
      </div>

      <div className="inline-flex items-center gap-1.5 self-start bg-[#FCE4EC] text-[#E91E63] px-3 py-1 rounded-full text-xs font-semibold mb-3">
        <Lightbulb size={12} strokeWidth={2.5} />
        {cat.name}
      </div>

      <div className="text-xs text-[#9CA3AF] font-semibold">Card {state.level2.cardIndex + 1} of {cat.cards.length}</div>
      <h2 className="mt-2 text-2xl font-black text-[#1A0B2E] leading-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>
        {prompt}
      </h2>

      <div className="mt-5 flex-1 flex flex-col">
        <textarea
          data-testid="l2-answer-input"
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, 120))}
          placeholder="Type your answer…"
          className="w-full flex-1 min-h-[140px] bg-white rounded-2xl border-2 border-[#FBE7F3] focus:border-[#E91E63]/40 outline-none p-4 text-[#1A0B2E] resize-none"
        />
        <div className="mt-1 text-right text-xs text-[#9CA3AF]">{text.length}/120</div>
      </div>

      <motion.button
        data-testid="l2-submit-btn"
        onClick={submit}
        disabled={text.trim().length === 0}
        whileTap={{ scale: text.trim().length === 0 ? 1 : 0.97 }}
        className={`mt-4 w-full py-4 rounded-full font-bold text-lg shadow-[0_20px_40px_-15px_rgba(233,30,99,0.5)] ${
          text.trim().length === 0 ? "bg-[#F3E8FF] text-[#9CA3AF]" : "bg-[#E91E63] text-white"
        }`}
      >
        {player === "A" ? "Lock my answer" : "Lock & reveal"}
      </motion.button>
    </div>
  );
}

export function Level2Locked() {
  const { dispatch } = useGame();
  useEffect(() => {
    const t = setTimeout(() => dispatch({ type: "L2_LOCKED_CONTINUE" }), 1500);
    return () => clearTimeout(t);
  }, [dispatch]);
  return (
    <div className="flex-1 flex items-center justify-center px-6" data-testid="l2-locked-screen">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full bg-gradient-to-br from-[#7C3AED] to-[#5B21B6] rounded-3xl p-8 text-center text-white shadow-[0_30px_60px_-20px_rgba(124,58,237,0.5)]"
      >
        <div className="w-16 h-16 mx-auto rounded-full bg-white/15 flex items-center justify-center">
          <Lock size={28} className="text-white" />
        </div>
        <h3 className="mt-4 text-2xl font-black">Answer locked</h3>
        <p className="mt-2 text-sm text-white/80">Pass the phone…</p>
      </motion.div>
    </div>
  );
}

export function Level2Handoff() {
  const { state, dispatch } = useGame();
  const next = state.players[state.currentPlayer];
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 text-center" data-testid="l2-handoff-screen">
      <Avatar player={state.currentPlayer} name={next.name} size={96} />
      <div className="mt-6 text-[#E91E63] text-xs font-bold tracking-widest uppercase">Handoff</div>
      <h2 className="mt-2 text-3xl font-black text-[#1A0B2E] leading-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>
        Pass to <span className="text-[#E91E63]">{next.name}</span>
      </h2>
      <p className="mt-3 text-[#4B3B60] text-sm max-w-xs">
        Same card. No timer. Take your time, write what's real.
      </p>
      <motion.button
        data-testid="l2-handoff-ready-btn"
        onClick={() => dispatch({ type: "L2_HANDOFF_READY" })}
        whileTap={{ scale: 0.96 }}
        className="mt-10 px-10 py-4 rounded-full bg-[#E91E63] text-white font-bold text-lg shadow-[0_20px_40px_-15px_rgba(233,30,99,0.5)]"
      >
        I'm ready <ArrowRight size={18} className="inline ml-1" />
      </motion.button>
    </div>
  );
}

export function Level2BothAnswered() {
  const { state, dispatch } = useGame();
  const last = state.level2.answers[state.level2.answers.length - 1];
  return (
    <div className="flex-1 flex flex-col px-6 pt-6 pb-6" data-testid="l2-both-screen">
      <div className="text-center mb-4">
        <div className="w-14 h-14 mx-auto rounded-full bg-gradient-to-br from-[#10B981] to-[#059669] flex items-center justify-center shadow-md">
          <CheckCircle2 size={24} className="text-white" strokeWidth={2.5} />
        </div>
        <h3 className="mt-3 text-2xl font-black text-[#1A0B2E]">Both answered</h3>
        <p className="text-xs text-[#4B3B60]">{last?.categoryName}</p>
      </div>

      <div className="space-y-3 flex-1 overflow-y-auto">
        <RevealCard player="A" name={state.players.A.name} text={last?.A} />
        <RevealCard player="B" name={state.players.B.name} text={last?.B} />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <motion.button
          data-testid="l2-roll-again-btn"
          onClick={() => dispatch({ type: "L2_ROLL_AGAIN" })}
          whileTap={{ scale: 0.97 }}
          className="py-3 rounded-full bg-[#E91E63] text-white font-bold inline-flex items-center justify-center gap-2"
        >
          <RotateCcw size={16} />
          Roll again
        </motion.button>
        <motion.button
          data-testid="l2-insights-btn"
          onClick={() => dispatch({ type: "GO_INSIGHTS" })}
          whileTap={{ scale: 0.97 }}
          className="py-3 rounded-full bg-[#7C3AED] text-white font-bold"
        >
          See insights
        </motion.button>
      </div>
    </div>
  );
}

const RevealCard = ({ player, name, text }) => (
  <div className="bg-white rounded-2xl p-4 border border-[#FBE7F3]">
    <div className="flex items-center gap-2 mb-2">
      <Avatar player={player} name={name} size={28} />
      <div className="text-sm font-bold text-[#1A0B2E]">{name}</div>
    </div>
    <p className="text-sm text-[#4B3B60] leading-relaxed">{text}</p>
  </div>
);
