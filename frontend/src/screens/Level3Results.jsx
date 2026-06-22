import React from "react";
import { motion } from "framer-motion";
import { Sparkles, RotateCcw, Home, ArrowRight } from "lucide-react";
import { useGame } from "../store/gameStore";

export default function Level3Results() {
  const { dispatch } = useGame();

  return (
    <div className="flex-1 flex flex-col px-6 pt-8 pb-8 overflow-y-auto" data-testid="l3-results-screen">
      <motion.div
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", bounce: 0.5 }}
        className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center"
        style={{ background: "linear-gradient(135deg,#FF3CAC,#6C3BFF)" }}
      >
        <Sparkles size={28} className="text-white" strokeWidth={2.5} />
      </motion.div>

      <motion.h2
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="mt-6 text-3xl font-black text-[#1A0B2E] text-center"
        style={{ fontFamily: "'Outfit', sans-serif" }}
      >
        Level 3 Completed
      </motion.h2>

      <motion.p
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="mt-3 text-sm text-[#4B3B60] text-center max-w-xs mx-auto"
      >
        You explored deeper, shared vulnerabilities, and discovered more about each other. That's real connection.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-8 rounded-2xl p-6 text-center"
        style={{ background: "linear-gradient(135deg,rgba(255,60,172,0.1),rgba(124,59,237,0.1))" }}
      >
        <div className="text-xs font-bold tracking-widest uppercase text-[#7C3AED] mb-2">Your Journey</div>
        <p className="text-sm text-[#4B3B60] leading-relaxed">
          Through 6 categories and 30 reflective prompts, you've touched on what matters most — relationships, values, dreams, future, vulnerability, and intimacy.
        </p>
      </motion.div>

      <div className="mt-auto pt-8 space-y-3">
        <motion.button
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          data-testid="l3-results-home-btn"
          onClick={() => dispatch({ type: "GO", phase: "landing" })}
          whileTap={{ scale: 0.97 }}
          whileHover={{ scale: 1.02 }}
          className="w-full py-4 rounded-full text-white font-bold text-lg shadow-[0_20px_40px_-15px_rgba(124,59,237,0.5)] inline-flex items-center justify-center gap-2"
          style={{ background: "linear-gradient(135deg,#6C3BFF,#FF3CAC)" }}
        >
          Return to Home
          <ArrowRight size={18} />
        </motion.button>

        <motion.button
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          data-testid="l3-results-play-again-btn"
          onClick={() => dispatch({ type: "RESET" })}
          whileTap={{ scale: 0.97 }}
          whileHover={{ scale: 1.02 }}
          className="w-full py-4 rounded-full border-2 border-[#E5E7EB] text-[#4B3B60] font-bold text-lg inline-flex items-center justify-center gap-2 hover:border-[#E91E63] hover:text-[#E91E63] transition-colors"
        >
          <RotateCcw size={18} /> Play Again
        </motion.button>
      </div>
    </div>
  );
}
