import React from "react";
import { motion } from "framer-motion";
import { ListChecks, ArrowRight } from "lucide-react";
import { useGame } from "../store/gameStore";

const STEPS = [
  { n: 1, text: "A card appears — it's either Truth or Dare." },
  { n: 2, text: "Answer honestly — share your real thoughts." },
  { n: 3, text: "Pass the device to your partner." },
  { n: 4, text: "Reveal & react — see both answers." },
  { n: 5, text: "Complete 20 cards to unlock your connection insights." },
];

export default function Level3HowItWorks() {
  const { dispatch } = useGame();

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 text-center overflow-y-auto" data-testid="l3-how-it-works-screen">
      <div className="text-[#FF3CAC] text-xs font-bold tracking-widest uppercase">How It Works</div>
      <h2 className="mt-2 text-3xl font-black text-[#1A0B2E] leading-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>
        Simple. Honest. <span style={{ fontFamily: "'Caveat', cursive", color: "#FF3CAC" }}>Fun.</span>
      </h2>

      <div className="mt-8 w-full max-w-xs space-y-4">
        {STEPS.map((s) => (
          <motion.div
            key={s.n}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: s.n * 0.1 }}
            className="flex items-start gap-3"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#FCE4EC] to-[#EDE9FE] text-[#6C3BFF] text-sm font-black flex items-center justify-center shrink-0">
              {s.n}
            </div>
            <p className="text-sm text-[#4B3B60] leading-relaxed text-left pt-1">{s.text}</p>
          </motion.div>
        ))}
      </div>

      <motion.button
        data-testid="l3-how-it-works-continue-btn"
        onClick={() => dispatch({ type: "L3_INTRO_CONTINUE" })}
        whileTap={{ scale: 0.97 }}
        whileHover={{ scale: 1.02 }}
        className="mt-10 w-full max-w-xs py-4 rounded-full text-white font-bold text-lg shadow-[0_20px_40px_-15px_rgba(108,59,255,0.5)] inline-flex items-center justify-center gap-2"
        style={{ background: "linear-gradient(135deg,#6C3BFF,#FF3CAC)" }}
      >
        Got it <ArrowRight size={18} />
      </motion.button>
    </div>
  );
}