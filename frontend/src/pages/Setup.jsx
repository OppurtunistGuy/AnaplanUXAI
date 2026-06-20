import React, { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Heart } from "lucide-react";
import { Logo } from "../components/Logo";
import { Avatar } from "../components/TurnIndicator";
import { useGame } from "../store/gameStore";

const AVATARS = ["🌸", "🌿", "✨", "🌊", "🔥", "🌙", "☀️", "🍀"];

export default function Setup() {
  const { go, dispatch } = useGame();
  const [a, setA] = useState("");
  const [b, setB] = useState("");

  const trimmedA = a.trim();
  const trimmedB = b.trim();
  let error = "";
  if (trimmedA && trimmedB) {
    if (trimmedA.length < 2 || trimmedB.length < 2) error = "Names must be at least 2 characters.";
    else if (trimmedA.length > 20 || trimmedB.length > 20) error = "Names must be 20 characters or less.";
    else if (trimmedA.toLowerCase() === trimmedB.toLowerCase()) error = "Each player must use a unique name.";
  }
  const canStart = trimmedA.length >= 2 && trimmedB.length >= 2 && !error;

  const start = () => {
    if (!canStart) return;
    dispatch({
      type: "SET_PLAYERS",
      players: {
        A: { name: trimmedA, avatar: "A" },
        B: { name: trimmedB, avatar: "B" },
      },
    });
  };

  return (
    <div className="flex flex-col flex-1 overflow-y-auto">
      <div className="absolute top-0 right-0 w-60 h-60 rounded-full bg-[#FBCFE8] opacity-30 blur-3xl pointer-events-none" />

      <div className="relative px-6 pt-8 pb-6 flex items-center justify-between">
        <button
          data-testid="setup-back-btn"
          onClick={() => go("landing")}
          className="w-10 h-10 rounded-full bg-white border border-[#FBE7F3] flex items-center justify-center shadow-sm"
        >
          <ArrowLeft size={18} className="text-[#7C3AED]" />
        </button>
        <Logo withText={false} size={36} />
      </div>

      <div className="relative px-6 mt-4">
        <h2 className="text-3xl font-black text-[#1A0B2E] tracking-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>
          Who's playing?
        </h2>
        <p className="mt-2 text-[#4B3B60] text-sm">
          One device. Two of you. Pass it back and forth.
        </p>
      </div>

      <div className="relative px-6 mt-8 space-y-4">
        <PlayerCard
          tag="Player 1"
          color="pink"
          value={a}
          onChange={setA}
          testid="setup-player1-input"
          avatarKey="A"
        />
        <div className="flex justify-center">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#E91E63] to-[#7C3AED] flex items-center justify-center shadow-md">
            <Heart size={18} className="text-white fill-white" />
          </div>
        </div>
        <PlayerCard
          tag="Player 2"
          color="violet"
          value={b}
          onChange={setB}
          testid="setup-player2-input"
          avatarKey="B"
        />
      </div>

      <div className="relative mt-auto px-6 pb-8 pt-8">
        {error && (
          <div data-testid="setup-error" className="mb-3 text-center text-sm font-semibold text-[#FF3CAC]">
            {error}
          </div>
        )}
        <motion.button
          data-testid="setup-start-btn"
          onClick={start}
          disabled={!canStart}
          whileTap={{ scale: canStart ? 0.97 : 1 }}
          className={`w-full py-4 rounded-full font-bold text-lg shadow-[0_20px_40px_-15px_rgba(233,30,99,0.5)] transition-colors ${
            canStart ? "bg-[#E91E63] hover:bg-[#C2185B] text-white" : "bg-[#F3E8FF] text-[#9CA3AF] cursor-not-allowed"
          }`}
        >
          Begin Level 1
        </motion.button>
        <p className="mt-3 text-center text-xs text-[#9CA3AF]">
          15 this-or-that. ~5 minutes.
        </p>
      </div>
    </div>
  );
}

const PlayerCard = ({ tag, color, value, onChange, testid, avatarKey }) => {
  const ringColor = color === "pink" ? "focus:ring-[#E91E63]/30 border-[#FBE7F3]" : "focus:ring-[#7C3AED]/30 border-[#EDE9FE]";
  const tagBg = color === "pink" ? "bg-[#FCE4EC] text-[#E91E63]" : "bg-[#EDE9FE] text-[#7C3AED]";
  return (
    <div className="bg-white rounded-3xl p-5 border border-[#FBE7F3] shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
      <div className="flex items-center gap-3">
        <Avatar player={avatarKey} name={value} size={44} />
        <div className="flex-1">
          <div className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${tagBg}`}>
            {tag}
          </div>
          <input
            data-testid={testid}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Your name"
            maxLength={20}
            className={`mt-1 w-full bg-transparent outline-none text-lg font-bold text-[#1A0B2E] placeholder:text-[#D1B5E6] focus:ring-2 ${ringColor} rounded-md`}
          />
        </div>
      </div>
    </div>
  );
};
