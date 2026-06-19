import React from "react";
import { motion } from "framer-motion";
import { Shield, RefreshCw, Brain, Link2, Smartphone, Heart, Sparkles, Users, TrendingUp } from "lucide-react";
import { Logo } from "../components/Logo";
import { useGame } from "../store/gameStore";

const Pill = ({ children }) => (
  <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-[#EDE9FE] text-[#7C3AED] tracking-wide">
    {children}
  </span>
);

const ValueProp = ({ icon: Icon, title, desc }) => (
  <div className="flex items-start gap-3 bg-white rounded-2xl p-4 border border-[#FBE7F3] shadow-[0_4px_20px_rgba(124,58,237,0.06)]">
    <div className="shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-[#FCE4EC] to-[#EDE9FE] flex items-center justify-center">
      <Icon size={20} className="text-[#7C3AED]" strokeWidth={2.5} />
    </div>
    <div>
      <div className="font-bold text-[#1A0B2E] text-sm">{title}</div>
      <div className="text-xs text-[#4B3B60] mt-0.5">{desc}</div>
    </div>
  </div>
);

const Feature = ({ icon: Icon, title, desc }) => (
  <div className="flex flex-col items-center text-center gap-2">
    <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#FCE4EC] to-[#EDE9FE] flex items-center justify-center">
      <Icon size={20} className="text-[#E91E63]" strokeWidth={2.5} />
    </div>
    <div className="font-bold text-[#1A0B2E] text-sm">{title}</div>
    <div className="text-xs text-[#4B3B60] leading-tight max-w-[140px]">{desc}</div>
  </div>
);

export default function Landing() {
  const { go } = useGame();

  return (
    <div className="flex flex-col flex-1 overflow-y-auto">
      {/* Decorative blobs */}
      <div className="absolute top-0 -right-16 w-64 h-64 rounded-full bg-[#FBCFE8] opacity-40 blur-3xl pointer-events-none" />
      <div className="absolute bottom-32 -left-16 w-64 h-64 rounded-full bg-[#DDD6FE] opacity-40 blur-3xl pointer-events-none" />

      <div className="relative px-6 pt-8 pb-6">
        <div className="flex items-center justify-between">
          <Logo />
          <Pill>For real</Pill>
        </div>

        <div className="mt-10">
          <div className="text-[#7C3AED] text-sm font-bold tracking-widest uppercase">Know each other</div>
          <h1 className="mt-2 text-5xl font-black tracking-tight text-[#1A0B2E] leading-[1.05]" style={{ fontFamily: "'Outfit', sans-serif" }}>
            Discover{" "}
            <span className="text-[#E91E63]" style={{ fontFamily: "'Caveat', cursive", fontSize: "1.2em", fontWeight: 700 }}>
              deeper
            </span>
            <br />
            Connect for{" "}
            <span className="text-[#7C3AED]" style={{ fontFamily: "'Caveat', cursive", fontSize: "1.2em", fontWeight: 700 }}>
              real
            </span>{" "}
            <Heart size={28} className="inline text-[#E91E63] fill-[#E91E63] -mt-2" />
          </h1>
          <p className="mt-3 text-[#4B3B60] text-base leading-relaxed">
            A guided journey for two — to understand what really matters. Pass the phone, discover, grow together.
          </p>
        </div>

        <div className="mt-8 space-y-3">
          <ValueProp icon={Users} title="Play together" desc="Pass the phone, take turns answering" />
          <ValueProp icon={Sparkles} title="Reveal together" desc="See your partner's choices side-by-side" />
          <ValueProp icon={TrendingUp} title="Grow together" desc="Get honest insights, not scores" />
        </div>

        <motion.button
          data-testid="home-start-btn"
          onClick={() => go("setup")}
          whileTap={{ scale: 0.97 }}
          whileHover={{ scale: 1.02 }}
          className="mt-8 w-full py-4 rounded-full bg-[#E91E63] hover:bg-[#C2185B] text-white font-bold text-lg shadow-[0_20px_40px_-15px_rgba(233,30,99,0.5)] transition-colors"
        >
          Start the journey
        </motion.button>
        <p className="mt-3 text-center text-xs text-[#9CA3AF]">
          Not a dating app. A connection app.
        </p>
      </div>

      {/* Feature strip */}
      <div className="relative mt-2 px-6 pb-10" data-testid="home-features">
        <div className="bg-white rounded-3xl p-6 border border-[#FBE7F3] shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
          <div className="grid grid-cols-3 gap-y-6 gap-x-3">
            <Feature icon={Shield} title="Private & Safe" desc="Stays between you two" />
            <Feature icon={RefreshCw} title="No Repeats" desc="Fresh every time" />
            <Feature icon={Brain} title="Smart Insights" desc="From real answers" />
            <Feature icon={Link2} title="Easy to Share" desc="Just pass the phone" />
            <Feature icon={Smartphone} title="Play Anywhere" desc="Mobile or desktop" />
            <Feature icon={Heart} title="Made For Real" desc="A connection app" />
          </div>
        </div>
      </div>
    </div>
  );
}
