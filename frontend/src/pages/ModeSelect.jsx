import React from "react";
import { motion } from "framer-motion";
import { Users, Smartphone, ArrowRight } from "lucide-react";
import { useGame } from "../store/gameStore";

const ModeCard = ({ title, description, icon: Icon, onClick, delay }) => (
  <motion.button
    initial={{ y: 20, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    transition={{ delay }}
    onClick={onClick}
    whileTap={{ scale: 0.98 }}
    whileHover={{ scale: 1.02 }}
    className="flex flex-col items-start p-6 rounded-2xl border-2 border-[#F3E8FF] bg-white shadow-[0_10px_30px_-10px_rgba(108,59,255,0.1)] hover:border-[#E91E63] hover:shadow-[0_15px_40px_-10px_rgba(233,30,99,0.15)] transition-all text-left"
  >
    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#FCE4EC] to-[#EDE9FE] flex items-center justify-center mb-4">
      <Icon size={24} className="text-[#E91E63]" strokeWidth={2} />
    </div>
    <h3 className="text-lg font-black text-[#1A0B2E]">{title}</h3>
    <p className="text-sm text-[#4B3B60] mt-2 mb-4">{description}</p>
    <div className="mt-auto flex items-center gap-2 text-[#7C3AED] font-semibold text-sm">
      Choose <ArrowRight size={16} />
    </div>
  </motion.button>
);

export default function ModeSelect() {
  const { dispatch } = useGame();

  const handleLocalPlay = () => {
    dispatch({ type: "GO", phase: "setup" });
  };

  const handleRemotePlay = () => {
    dispatch({ type: "GO", phase: "remote-setup" });
  };

  return (
    <div className="flex-1 flex flex-col px-6 pt-8 pb-6" data-testid="mode-select-screen">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-center mb-8"
      >
        <div className="inline-flex items-center justify-center">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#EDE9FE] text-[#7C3AED] tracking-wide">
            Choose your way
          </span>
        </div>
        <h2
          className="mt-4 text-3xl font-black text-[#1A0B2E] leading-tight"
          style={{ fontFamily: "'Outfit', sans-serif" }}
        >
          How do you want to play?
        </h2>
        <p className="mt-2 text-[#4B3B60] text-sm max-w-xs mx-auto">
          Pick a device. Pick a way to connect.
        </p>
      </motion.div>

      <div className="flex-1 flex flex-col gap-4">
        <ModeCard
          icon={Smartphone}
          title="Play Locally"
          description="Same device, take turns passing the phone back and forth."
          onClick={handleLocalPlay}
          delay={0.1}
        />

        <ModeCard
          icon={Users}
          title="Play Remotely"
          description="Separate devices, play together in real time. (Coming Soon)"
          onClick={handleRemotePlay}
          delay={0.2}
        />
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mt-4 p-3 rounded-lg bg-[#FEF3C7] border border-[#FCD34D] text-[#92400E] text-xs text-center"
      >
        Remote play requires backend connection to sync between devices
      </motion.div>
    </div>
  );
}
