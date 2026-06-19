import React from "react";

const AVATAR_COLORS = {
  A: "from-[#E91E63] to-[#F472B6]",
  B: "from-[#7C3AED] to-[#A78BFA]",
};

export const Avatar = ({ player, name, size = 36 }) => (
  <div
    style={{ width: size, height: size }}
    className={`rounded-full bg-gradient-to-br ${AVATAR_COLORS[player]} flex items-center justify-center text-white font-bold shadow-md`}
  >
    {name ? name.charAt(0).toUpperCase() : player}
  </div>
);

export const TurnIndicator = ({ player, name, label = "Your turn" }) => (
  <div className="inline-flex items-center gap-2 bg-white rounded-full pl-1 pr-4 py-1 shadow-sm border border-[#F3E8FF]" data-testid="turn-indicator">
    <Avatar player={player} name={name} size={28} />
    <div className="text-xs">
      <div className="text-[#4B3B60] leading-none">{label}</div>
      <div className="font-bold text-[#1A0B2E] leading-tight">{name || `Player ${player}`}</div>
    </div>
  </div>
);
