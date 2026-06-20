import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Lightbulb, RotateCcw, Lock, CheckCircle2, Sparkles } from "lucide-react";
import { LEVEL_2_CATEGORIES, BLIND_LABELS } from "../data/content";
import { useGame } from "../store/gameStore";
import { TurnIndicator, Avatar } from "../components/TurnIndicator";

// ---------- 3D Animated Category Dice ----------
const FACE_ROTATIONS = {
  // face index -> rotateY/rotateX to bring that face to the front
  0: { ry: 0,    rx: 0   },   // front
  1: { ry: -90,  rx: 0   },   // right
  2: { ry: -180, rx: 0   },   // back
  3: { ry: 90,   rx: 0   },   // left
  4: { ry: 0,    rx: -90 },   // top
  5: { ry: 0,    rx: 90  },   // bottom
};

// CSS transform per face placement on the cube (size = 80px half-extent)
const FACE_TRANSFORMS = [
  "translateZ(80px)",                    // 0 front
  "rotateY(90deg) translateZ(80px)",     // 1 right
  "rotateY(180deg) translateZ(80px)",    // 2 back
  "rotateY(-90deg) translateZ(80px)",    // 3 left
  "rotateX(90deg) translateZ(80px)",     // 4 top
  "rotateX(-90deg) translateZ(80px)",    // 5 bottom
];

const DiceFace = ({ cat, transform }) => (
  <div
    className="absolute inset-0 rounded-2xl flex flex-col items-center justify-center text-center border-2 border-white"
    style={{
      transform,
      background: `linear-gradient(135deg, ${cat.color}, ${cat.color}cc)`,
      boxShadow: "inset 0 4px 16px rgba(255,255,255,0.4), inset 0 -8px 16px rgba(0,0,0,0.15)",
      backfaceVisibility: "hidden",
    }}
  >
    <div className="text-4xl drop-shadow-md select-none" aria-hidden>{cat.glyph}</div>
    <div className="mt-1 px-2 text-[10px] font-black tracking-wide text-white uppercase leading-tight">
      {cat.name}
    </div>
  </div>
);

export function Level2Dice() {
  const { dispatch } = useGame();
  const [rolling, setRolling] = useState(false);
  const [target, setTarget] = useState({ ry: 0, rx: 0 });

  const roll = () => {
    if (rolling) return;
    setRolling(true);
    const cat = LEVEL_2_CATEGORIES[Math.floor(Math.random() * LEVEL_2_CATEGORIES.length)];
    const base = FACE_ROTATIONS[cat.faceIndex];
    // Multiple full rotations + final landing
    const finalRy = 360 * 3 + base.ry;
    const finalRx = 360 * 2 + base.rx;
    setTarget({ ry: finalRy, rx: finalRx });
    setTimeout(() => {
      dispatch({ type: "L2_DICE_ROLLED", categoryId: cat.id });
    }, 1400);
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 text-center" data-testid="l2-dice-screen">
      <div className="inline-flex items-center gap-2 mb-3">
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

      <div
        className="mt-10 mb-8 flex items-center justify-center"
        style={{ perspective: 900, width: 200, height: 200 }}
      >
        <motion.div
          animate={{ rotateY: target.ry, rotateX: target.rx }}
          transition={{ duration: 1.4, ease: [0.34, 1.2, 0.64, 1] }}
          style={{
            transformStyle: "preserve-3d",
            width: 160,
            height: 160,
            position: "relative",
          }}
        >
          {LEVEL_2_CATEGORIES.map((cat, i) => (
            <DiceFace key={cat.id} cat={cat} transform={FACE_TRANSFORMS[i]} />
          ))}
        </motion.div>
      </div>

      <motion.button
        data-testid="l2-dice-roll-btn"
        onClick={roll}
        disabled={rolling}
        whileTap={{ scale: rolling ? 1 : 0.95 }}
        whileHover={{ scale: rolling ? 1 : 1.03 }}
        className={`px-10 py-4 rounded-full font-bold text-lg shadow-[0_20px_40px_-15px_rgba(233,30,99,0.5)] ${
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
    <div className="flex-1 flex flex-col items-center px-6 pt-8 pb-6 text-center" data-testid="l2-category-screen">
      <div className="text-[#7C3AED] text-xs font-bold tracking-widest uppercase mb-3">Category revealed</div>
      <motion.div
        initial={{ scaleX: 0.2, opacity: 0 }}
        animate={{ scaleX: 1, opacity: 1 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="w-full rounded-3xl py-8 px-6 relative overflow-hidden shadow-[0_30px_60px_-20px_rgba(0,0,0,0.25)]"
        style={{ background: `linear-gradient(135deg, ${cat.color}, ${cat.color}cc)`, transformOrigin: "center" }}
      >
        <div className="absolute -top-10 -right-8 w-32 h-32 rounded-full bg-white opacity-15 blur-2xl" />
        <div className="absolute -bottom-12 -left-6 w-32 h-32 rounded-full bg-white opacity-10 blur-2xl" />
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.3, type: "spring", bounce: 0.5 }}
          className="relative text-5xl mb-2 select-none"
          aria-hidden
        >
          {cat.glyph}
        </motion.div>
        <motion.h2
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.45 }}
          className="relative text-2xl font-black text-white leading-tight"
          style={{ fontFamily: "'Outfit', sans-serif" }}
        >
          {cat.name}
        </motion.h2>
      </motion.div>
      <p className="mt-6 text-[#4B3B60] text-sm max-w-xs">
        Let's dive deeper. Pick a card.
      </p>
      <motion.button
        data-testid="l2-category-continue-btn"
        onClick={() => dispatch({ type: "L2_CATEGORY_CONTINUE" })}
        whileTap={{ scale: 0.97 }}
        className="mt-auto w-full py-4 rounded-full bg-[#7C3AED] text-white font-bold text-lg shadow-[0_20px_40px_-15px_rgba(124,58,237,0.5)] inline-flex items-center justify-center gap-2"
      >
        Show cards <ArrowRight size={18} />
      </motion.button>
    </div>
  );
}

export function Level2Cards() {
  const { state, dispatch } = useGame();
  const cat = LEVEL_2_CATEGORIES.find(c => c.id === state.level2.selectedCategoryId);
  const usedSet = (state.level2.usedCards && state.level2.usedCards[cat.id]) || [];
  // Build pool of unused card indices, preserve original order
  const pool = cat.cards.map((_, i) => i).filter(i => !usedSet.includes(i));
  const cards = pool.length > 0 ? pool : cat.cards.map((_, i) => i); // fallback if all used
  const [active, setActive] = useState(Math.floor(cards.length / 2));
  const [picking, setPicking] = useState(false);

  const onPick = () => {
    if (picking) return;
    setPicking(true);
    setTimeout(() => dispatch({ type: "L2_CARD_PICKED", cardIndex: cards[active] }), 600);
  };

  return (
    <div className="flex-1 flex flex-col px-6 pt-6 pb-6" data-testid="l2-cards-screen">
      <div className="text-center">
        <div className="inline-flex items-center gap-1.5 bg-white text-[#7C3AED] px-3 py-1 rounded-full text-xs font-semibold border border-[#EDE9FE]">
          <span aria-hidden>{cat.glyph}</span> {cat.name}
        </div>
        <h3 className="mt-3 text-xl font-bold text-[#1A0B2E]">Pick a card</h3>
        <p className="mt-1 text-xs text-[#9CA3AF]">Browse with the sides · question hidden until you pick</p>
      </div>

      <div className="flex-1 flex items-center justify-center relative" style={{ perspective: 1200 }}>
        <div className="relative w-full h-[340px] flex items-center justify-center">
          {cards.map((_, i) => {
            const offset = i - active;
            const abs = Math.abs(offset);
            if (abs > 1) return null;
            const isCenter = abs === 0;
            return (
              <motion.button
                key={i}
                onClick={() => !picking && !isCenter && setActive(i)}
                disabled={picking}
                animate={
                  picking && isCenter
                    ? { x: 0, y: -30, scale: 1.12, rotateY: 180, opacity: 1, filter: "blur(0px)", zIndex: 20 }
                    : {
                        x: offset * 90,
                        y: isCenter ? 0 : 14,
                        scale: isCenter ? 1 : 0.78,
                        rotateY: 0,
                        rotateZ: offset * 6,
                        opacity: isCenter ? 1 : 0.55,
                        filter: isCenter ? "blur(0px)" : "blur(4px)",
                        zIndex: isCenter ? 10 : 5,
                      }
                }
                transition={{ type: "spring", stiffness: 220, damping: 24 }}
                className="absolute w-52 h-72 rounded-3xl shadow-[0_30px_60px_-20px_rgba(0,0,0,0.35)] overflow-hidden"
                style={{
                  background: `linear-gradient(160deg, ${cat.color}, ${cat.color}aa)`,
                  transformStyle: "preserve-3d",
                  cursor: isCenter ? "default" : "pointer",
                }}
                data-testid={isCenter ? "l2-card-active" : `l2-card-side-${offset}`}
              >
                <div
                  className="absolute inset-0 flex flex-col items-center justify-center text-white"
                  style={{ backfaceVisibility: "hidden" }}
                >
                  <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur flex items-center justify-center mb-3">
                    <span className="text-3xl select-none" aria-hidden>{BLIND_LABELS[i % 6].emoji}</span>
                  </div>
                  <div className="text-xs font-bold tracking-widest uppercase opacity-80">#{i + 1} Blind Choice</div>
                  <div className="mt-1 text-sm font-semibold opacity-90">Hidden until picked</div>
                  <div className="mt-4 px-3 py-1 rounded-full bg-white/15 text-[10px] font-bold tracking-wide">
                    TAP TO REVEAL
                  </div>
                </div>
                <div
                  className="absolute inset-0 bg-white flex items-center justify-center px-4 text-center"
                  style={{ transform: "rotateY(180deg)", backfaceVisibility: "hidden" }}
                >
                  <span className="text-sm font-bold text-[#1A0B2E]">Revealing…</span>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      <div className="flex justify-center gap-1.5 mb-4">
        {cards.map((_, i) => (
          <button
            key={i}
            data-testid={`l2-card-dot-${i}`}
            onClick={() => !picking && setActive(i)}
            className={`h-1.5 rounded-full transition-all ${i === active ? "w-6 bg-[#E91E63]" : "w-1.5 bg-[#E5E7EB]"}`}
            aria-label={`Card ${i + 1}`}
          />
        ))}
      </div>

      <motion.button
        data-testid="l2-card-pick-btn"
        onClick={onPick}
        disabled={picking}
        whileTap={{ scale: picking ? 1 : 0.97 }}
        className={`w-full py-4 rounded-full font-bold text-lg shadow-[0_20px_40px_-15px_rgba(233,30,99,0.5)] ${
          picking ? "bg-[#F3E8FF] text-[#7C3AED]" : "bg-[#E91E63] text-white"
        }`}
      >
        {picking ? "Revealing…" : "Reveal this card"}
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
  const { state, dispatch } = useGame();
  const next = state.currentPlayer === "A" ? state.players.B : state.players.A;
  return (
    <div className="flex-1 flex flex-col px-5 pb-6" data-testid="l2-locked-screen">
      <div className="flex-1 flex items-center justify-center">
        <motion.div initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", bounce: 0.4 }}
          className="w-full rounded-[28px] p-8 text-center text-white relative overflow-hidden shadow-[0_30px_60px_-20px_rgba(108,59,255,0.5)]"
          style={{ background: "linear-gradient(135deg,#6C3BFF 0%,#FF3CAC 100%)" }}>
          <motion.div animate={{ scale: [1, 1.08, 1] }} transition={{ duration: 2, repeat: Infinity }}
            className="w-20 h-20 mx-auto rounded-full bg-white/15 backdrop-blur flex items-center justify-center">
            <Lock size={32} className="text-white" strokeWidth={2.5} />
          </motion.div>
          <div className="mt-5 inline-flex items-center gap-1.5 bg-white/15 backdrop-blur px-3 py-1 rounded-full text-xs font-bold">
            ✓ Answer Locked
          </div>
          <h3 className="mt-4 text-2xl font-black" style={{ fontFamily: "'Outfit', sans-serif" }}>Pass the device</h3>
          <p className="mt-1 text-sm text-white/85">to {next.name}</p>
        </motion.div>
      </div>
      <motion.button
        data-testid="l2-pass-device-btn"
        onClick={() => dispatch({ type: "L2_LOCKED_CONTINUE" })}
        whileTap={{ scale: 0.97 }} whileHover={{ scale: 1.02 }}
        className="w-full py-4 rounded-full bg-[#1A0B2E] text-white font-bold text-lg inline-flex items-center justify-center gap-2">
        Pass Device <ArrowRight size={18} />
      </motion.button>
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
