import React, { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Copy, Plus, Link2 } from "lucide-react";
import { useGame } from "../store/gameStore";

// RemoteSetup: Choose to create or join
export function RemoteSetup() {
  const { dispatch } = useGame();

  return (
    <div className="flex-1 flex flex-col px-6 pt-8 pb-6" data-testid="remote-setup-screen">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-center mb-8"
      >
        <div className="inline-flex items-center justify-center">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#EDE9FE] text-[#7C3AED] tracking-wide">
            Remote Play
          </span>
        </div>
        <h2 className="mt-4 text-3xl font-black text-[#1A0B2E]" style={{ fontFamily: "'Outfit', sans-serif" }}>
          Ready to connect
        </h2>
        <p className="mt-2 text-[#4B3B60] text-sm max-w-xs mx-auto">
          Start a new game or join your partner.
        </p>
      </motion.div>

      <div className="flex-1 flex flex-col gap-4">
        <motion.button
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          onClick={() => dispatch({ type: "GO", phase: "remote-create" })}
          whileTap={{ scale: 0.98 }}
          whileHover={{ scale: 1.02 }}
          className="flex flex-col items-start p-6 rounded-2xl border-2 border-[#F3E8FF] bg-white shadow-[0_10px_30px_-10px_rgba(108,59,255,0.1)] hover:border-[#E91E63] hover:shadow-[0_15px_40px_-10px_rgba(233,30,99,0.15)] transition-all"
        >
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#FCE4EC] to-[#EDE9FE] flex items-center justify-center mb-4">
            <Plus size={24} className="text-[#E91E63]" strokeWidth={2} />
          </div>
          <h3 className="text-lg font-black text-[#1A0B2E]">Create Session</h3>
          <p className="text-sm text-[#4B3B60] mt-2 mb-4">Start a new game and share the code with your partner.</p>
          <div className="mt-auto flex items-center gap-2 text-[#7C3AED] font-semibold text-sm">
            Create <ArrowRight size={16} />
          </div>
        </motion.button>

        <motion.button
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          onClick={() => dispatch({ type: "GO", phase: "remote-join" })}
          whileTap={{ scale: 0.98 }}
          whileHover={{ scale: 1.02 }}
          className="flex flex-col items-start p-6 rounded-2xl border-2 border-[#F3E8FF] bg-white shadow-[0_10px_30px_-10px_rgba(108,59,255,0.1)] hover:border-[#E91E63] hover:shadow-[0_15px_40px_-10px_rgba(233,30,99,0.15)] transition-all"
        >
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#FCE4EC] to-[#EDE9FE] flex items-center justify-center mb-4">
            <Link2 size={24} className="text-[#E91E63]" strokeWidth={2} />
          </div>
          <h3 className="text-lg font-black text-[#1A0B2E]">Join Session</h3>
          <p className="text-sm text-[#4B3B60] mt-2 mb-4">Enter a code from your partner to join their game.</p>
          <div className="mt-auto flex items-center gap-2 text-[#7C3AED] font-semibold text-sm">
            Join <ArrowRight size={16} />
          </div>
        </motion.button>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mt-4 p-3 rounded-lg bg-[#FEF3C7] border border-[#FCD34D] text-[#92400E] text-xs text-center"
      >
        🚀 Remote play is pending backend connection
      </motion.div>
    </div>
  );
}

// CreateSession: Generate code, enter name, wait for partner
export function CreateSession() {
  const { dispatch, state } = useGame();
  const [playerName, setPlayerName] = useState("");
  const [sessionCode] = useState(() => {
    // Generate random 6-character alphanumeric code (stub)
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  });
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(sessionCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleContinue = () => {
    if (playerName.trim()) {
      dispatch({
        type: "CREATE_REMOTE_SESSION",
        playerName: playerName.trim(),
        sessionCode,
      });
      dispatch({ type: "GO", phase: "remote-lobby" });
    }
  };

  return (
    <div className="flex-1 flex flex-col px-6 pt-8 pb-6" data-testid="remote-create-screen">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-center mb-6"
      >
        <h2 className="text-3xl font-black text-[#1A0B2E]" style={{ fontFamily: "'Outfit', sans-serif" }}>
          Create Session
        </h2>
      </motion.div>

      <div className="space-y-6">
        {/* Session Code Display */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="p-6 rounded-2xl bg-gradient-to-br from-[#7C3AED] to-[#E91E63] text-white text-center"
        >
          <div className="text-xs font-semibold tracking-widest opacity-80">SHARE THIS CODE</div>
          <div className="mt-3 text-4xl font-black tracking-wider font-mono">{sessionCode}</div>
          <motion.button
            onClick={handleCopy}
            whileTap={{ scale: 0.97 }}
            className="mt-4 w-full py-2 rounded-lg bg-white/20 hover:bg-white/30 font-semibold text-sm flex items-center justify-center gap-2 transition-colors"
          >
            <Copy size={14} />
            {copied ? "Copied!" : "Copy code"}
          </motion.button>
        </motion.div>

        {/* Player Name Input */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <label className="block text-sm font-bold text-[#1A0B2E] mb-2">Your name</label>
          <input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value.slice(0, 32))}
            placeholder="Enter your name"
            maxLength={32}
            data-testid="remote-player-name-input"
            className="w-full px-4 py-3 rounded-lg border-2 border-[#F3E8FF] focus:border-[#E91E63] outline-none text-[#1A0B2E]"
          />
        </motion.div>

        {/* Status */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center text-sm text-[#4B3B60]"
        >
          Waiting for partner to join with this code...
        </motion.div>
      </div>

      <motion.button
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        onClick={handleContinue}
        disabled={!playerName.trim()}
        whileTap={{ scale: 0.97 }}
        className="mt-8 w-full py-4 rounded-full bg-[#E91E63] disabled:bg-[#E5E7EB] disabled:text-[#9CA3AF] text-white font-bold text-lg shadow-[0_20px_40px_-15px_rgba(233,30,99,0.5)]"
      >
        Continue
      </motion.button>
    </div>
  );
}

// JoinSession: Enter code and name, then join
export function JoinSession() {
  const { dispatch } = useGame();
  const [sessionCode, setSessionCode] = useState("");
  const [playerName, setPlayerName] = useState("");

  const handleJoin = () => {
    if (sessionCode.trim() && playerName.trim()) {
      dispatch({
        type: "JOIN_REMOTE_SESSION",
        sessionCode: sessionCode.trim().toUpperCase(),
        playerName: playerName.trim(),
      });
      dispatch({ type: "GO", phase: "remote-lobby" });
    }
  };

  return (
    <div className="flex-1 flex flex-col px-6 pt-8 pb-6" data-testid="remote-join-screen">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-center mb-6"
      >
        <h2 className="text-3xl font-black text-[#1A0B2E]" style={{ fontFamily: "'Outfit', sans-serif" }}>
          Join Session
        </h2>
        <p className="mt-2 text-[#4B3B60] text-sm">Enter the code your partner shared</p>
      </motion.div>

      <div className="flex-1 space-y-6 flex flex-col">
        {/* Session Code Input */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <label className="block text-sm font-bold text-[#1A0B2E] mb-2">Session Code</label>
          <input
            type="text"
            value={sessionCode}
            onChange={(e) => setSessionCode(e.target.value.slice(0, 6).toUpperCase())}
            placeholder="ABCDEF"
            maxLength={6}
            data-testid="remote-code-input"
            className="w-full px-4 py-3 rounded-lg border-2 border-[#F3E8FF] focus:border-[#E91E63] outline-none text-[#1A0B2E] font-mono text-xl tracking-widest text-center"
          />
        </motion.div>

        {/* Player Name Input */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <label className="block text-sm font-bold text-[#1A0B2E] mb-2">Your name</label>
          <input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value.slice(0, 32))}
            placeholder="Enter your name"
            maxLength={32}
            data-testid="remote-join-player-name-input"
            className="w-full px-4 py-3 rounded-lg border-2 border-[#F3E8FF] focus:border-[#E91E63] outline-none text-[#1A0B2E]"
          />
        </motion.div>
      </div>

      <motion.button
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        onClick={handleJoin}
        disabled={!sessionCode.trim() || !playerName.trim() || sessionCode.length < 6}
        whileTap={{ scale: 0.97 }}
        className="mt-8 w-full py-4 rounded-full bg-[#E91E63] disabled:bg-[#E5E7EB] disabled:text-[#9CA3AF] text-white font-bold text-lg shadow-[0_20px_40px_-15px_rgba(233,30,99,0.5)]"
      >
        Join Game
      </motion.button>
    </div>
  );
}

// RemoteLobby: Display both player names, start button for host
export function RemoteLobby() {
  const { state, dispatch } = useGame();
  const { remoteSession } = state;

  return (
    <div className="flex-1 flex flex-col px-6 pt-8 pb-6" data-testid="remote-lobby-screen">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-center mb-8"
      >
        <h2 className="text-3xl font-black text-[#1A0B2E]" style={{ fontFamily: "'Outfit', sans-serif" }}>
          Connected!
        </h2>
        <p className="mt-2 text-[#4B3B60] text-sm">Ready to begin your journey together</p>
      </motion.div>

      <div className="flex-1 flex flex-col items-center justify-center gap-6">
        {/* Player 1 (Host) */}
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-center"
        >
          <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-[#7C3AED] to-[#E91E63] flex items-center justify-center text-2xl">
            👤
          </div>
          <div className="mt-3 font-bold text-[#1A0B2E]">{state.players.A.name}</div>
          <div className="text-xs text-[#9CA3AF]">Game Creator</div>
        </motion.div>

        {/* Connection indicator */}
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-2xl"
        >
          🔗
        </motion.div>

        {/* Player 2 (Guest) */}
        <motion.div
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center"
        >
          <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-[#FCE4EC] to-[#EDE9FE] flex items-center justify-center text-2xl">
            👤
          </div>
          <div className="mt-3 font-bold text-[#1A0B2E]">{remoteSession?.partnerName || "Waiting..."}</div>
          <div className="text-xs text-[#9CA3AF]">
            {remoteSession?.partnerName ? "Connected" : "Connecting..."}
          </div>
        </motion.div>
      </div>

      {remoteSession?.isHost && (
        <motion.button
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          onClick={() => dispatch({ type: "GO", phase: "setup" })}
          whileTap={{ scale: 0.97 }}
          whileHover={{ scale: 1.02 }}
          className="w-full py-4 rounded-full bg-[#E91E63] text-white font-bold text-lg shadow-[0_20px_40px_-15px_rgba(233,30,99,0.5)]"
        >
          Start Game
        </motion.button>
      )}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mt-4 p-3 rounded-lg bg-[#FEF3C7] border border-[#FCD34D] text-[#92400E] text-xs text-center"
      >
        💡 This is a preview. Backend connection coming soon.
      </motion.div>
    </div>
  );
}
