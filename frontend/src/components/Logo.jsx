import React from "react";

export const Logo = ({ size = 40, withText = true }) => (
  <div className="inline-flex items-center gap-2" data-testid="knowem-logo">
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <defs>
        <linearGradient id="heart-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#E91E63" />
          <stop offset="100%" stopColor="#7C3AED" />
        </linearGradient>
      </defs>
      <path
        d="M24 42s-14-8.5-14-20a8 8 0 0 1 14-5.3A8 8 0 0 1 38 22c0 11.5-14 20-14 20z"
        fill="url(#heart-grad)"
      />
      <path
        d="M30 18s-3-2-6 0-6 0-6 0"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.5"
      />
    </svg>
    {withText && (
      <div className="leading-tight">
        <div className="font-black text-xl bg-gradient-to-br from-[#E91E63] to-[#7C3AED] bg-clip-text text-transparent">
          KnowEm
        </div>
      </div>
    )}
  </div>
);
