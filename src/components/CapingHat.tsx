import React from 'react';

interface CapingHatProps {
  className?: string;
}

export const CapingHat: React.FC<CapingHatProps> = ({ className = '' }) => {
  return (
    <div className={`relative select-none pointer-events-none ${className}`}>
      <svg
        viewBox="0 0 280 180"
        className="w-full h-full drop-shadow-[0_18px_24px_rgba(0,0,0,0.65)]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Bamboo Weave Pattern */}
          <pattern
            id="bambooWeave"
            width="14"
            height="14"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(35)"
          >
            {/* Base weave background */}
            <rect width="14" height="14" fill="#bb8c54" />
            {/* Woven strips horizontal and vertical */}
            <path
              d="M0 0h7v7H0z M7 7h7v7H7z"
              fill="#d9aa6f"
              stroke="#8a5c2b"
              strokeWidth="0.75"
            />
            <path
              d="M7 0h7v7H7z M0 7h7v7H0z"
              fill="#a77640"
              stroke="#68421b"
              strokeWidth="0.75"
            />
            {/* Subtle inner fiber highlight */}
            <line x1="1" y1="3.5" x2="6" y2="3.5" stroke="#f6d39d" strokeWidth="0.6" strokeOpacity="0.8" />
            <line x1="8" y1="10.5" x2="13" y2="10.5" stroke="#f6d39d" strokeWidth="0.6" strokeOpacity="0.8" />
            <line x1="3.5" y1="8" x2="3.5" y2="13" stroke="#875825" strokeWidth="0.6" strokeOpacity="0.6" />
            <line x1="10.5" y1="1" x2="10.5" y2="6" stroke="#875825" strokeWidth="0.6" strokeOpacity="0.6" />
          </pattern>

          {/* Secondary Fine Crosshatch for high fidelity */}
          <pattern
            id="fineBambooLines"
            width="6"
            height="6"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(-40)"
          >
            <line x1="0" y1="0" x2="6" y2="6" stroke="#5d3913" strokeWidth="0.5" strokeOpacity="0.35" />
            <line x1="6" y1="0" x2="0" y2="6" stroke="#ffe0ab" strokeWidth="0.5" strokeOpacity="0.25" />
          </pattern>

          {/* 3D Conical Lighting Gradient */}
          <linearGradient id="coneLight3D" x1="0%" y1="20%" x2="100%" y2="80%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.35" />
            <stop offset="30%" stopColor="#ffffff" stopOpacity="0.1" />
            <stop offset="60%" stopColor="#000000" stopOpacity="0.0" />
            <stop offset="85%" stopColor="#2e1804" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#140801" stopOpacity="0.75" />
          </linearGradient>

          {/* Vertical highlight stripe for cylindrical curvature */}
          <linearGradient id="peakHighlight" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#000000" stopOpacity="0.4" />
            <stop offset="28%" stopColor="#fff3db" stopOpacity="0.28" />
            <stop offset="42%" stopColor="#ffffff" stopOpacity="0.45" />
            <stop offset="55%" stopColor="#000000" stopOpacity="0.0" />
            <stop offset="85%" stopColor="#000000" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0.7" />
          </linearGradient>

          {/* Rim Gradient */}
          <linearGradient id="rimGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#543314" />
            <stop offset="30%" stopColor="#d4a366" />
            <stop offset="50%" stopColor="#f5cf96" />
            <stop offset="70%" stopColor="#96632f" />
            <stop offset="100%" stopColor="#3d2109" />
          </linearGradient>

          {/* Rim Inner Shadow */}
          <linearGradient id="rimInnerShadow" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1a0c02" stopOpacity="0.9" />
            <stop offset="40%" stopColor="#472608" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#8c5825" stopOpacity="0.1" />
          </linearGradient>

          {/* Top Tip Gradient */}
          <radialGradient id="topTipGrad" cx="40%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#ffe6ba" />
            <stop offset="50%" stopColor="#c59151" />
            <stop offset="85%" stopColor="#693b12" />
            <stop offset="100%" stopColor="#301704" />
          </radialGradient>

          {/* Soft Drop Shadow under brim onto head */}
          <filter id="brimShadow" x="-20%" y="0%" width="140%" height="200%">
            <feDropShadow dx="0" dy="14" stdDeviation="10" floodColor="#000000" floodOpacity="0.75" />
          </filter>
        </defs>

        {/* Ambient shadow cast on the head behind the caping */}
        <ellipse
          cx="140"
          cy="120"
          rx="90"
          ry="14"
          fill="#000000"
          opacity="0.35"
          filter="url(#brimShadow)"
        />

        {/* Hat Under-brim (concave underside view) */}
        <path
          d="M 24 116 C 60 134, 220 134, 256 116 C 220 125, 60 125, 24 116 Z"
          fill="#2d1706"
        />

        {/* Main Conical Hat Body */}
        {/* Curved Cone Shape: apex at (140, 14), base curves from (24, 116) to (256, 116) */}
        <g id="caping-cone">
          {/* Base Bamboo Texture Layer */}
          <path
            d="M 140 12 
               C 152 40, 215 88, 256 116 
               C 212 134, 68 134, 24 116 
               C 65 88, 128 40, 140 12 Z"
            fill="url(#bambooWeave)"
          />

          {/* Fine Bamboo overlay lines */}
          <path
            d="M 140 12 
               C 152 40, 215 88, 256 116 
               C 212 134, 68 134, 24 116 
               C 65 88, 128 40, 140 12 Z"
            fill="url(#fineBambooLines)"
            opacity="0.6"
          />

          {/* Bamboo Rib Struts radiating from peak to base */}
          <g stroke="#533111" strokeWidth="1.2" opacity="0.45">
            <path d="M 140 14 Q 139 65 140 132" />
            <path d="M 140 14 Q 163 65 182 130" />
            <path d="M 140 14 Q 117 65 98 130" />
            <path d="M 140 14 Q 188 68 220 124" />
            <path d="M 140 14 Q 92 68 60 124" />
            <path d="M 140 14 Q 212 75 250 118" />
            <path d="M 140 14 Q 68 75 30 118" />
          </g>

          {/* 3D Global Lighting Overlay */}
          <path
            d="M 140 12 
               C 152 40, 215 88, 256 116 
               C 212 134, 68 134, 24 116 
               C 65 88, 128 40, 140 12 Z"
            fill="url(#coneLight3D)"
          />

          {/* Cylindrical Sheen Highlight */}
          <path
            d="M 140 12 
               C 152 40, 215 88, 256 116 
               C 212 134, 68 134, 24 116 
               C 65 88, 128 40, 140 12 Z"
            fill="url(#peakHighlight)"
            style={{ mixBlendMode: 'overlay' }}
          />

          {/* Circular Weaving Ridge Rings (Concentric circles of woven bamboo) */}
          <ellipse cx="140" cy="42" rx="34" ry="6" fill="none" stroke="#ffe0a6" strokeWidth="0.8" strokeOpacity="0.4" />
          <ellipse cx="140" cy="43" rx="34" ry="6" fill="none" stroke="#3b2007" strokeWidth="0.8" strokeOpacity="0.5" />

          <ellipse cx="140" cy="68" rx="64" ry="9" fill="none" stroke="#ffe0a6" strokeWidth="0.9" strokeOpacity="0.4" />
          <ellipse cx="140" cy="69" rx="64" ry="9" fill="none" stroke="#3b2007" strokeWidth="0.9" strokeOpacity="0.5" />

          <ellipse cx="140" cy="94" rx="92" ry="11" fill="none" stroke="#ffe0a6" strokeWidth="1" strokeOpacity="0.35" />
          <ellipse cx="140" cy="95" rx="92" ry="11" fill="none" stroke="#3b2007" strokeWidth="1" strokeOpacity="0.5" />

          {/* Bottom Rim - Thick Solid Bamboo Trim */}
          <path
            d="M 22 115 C 64 136, 216 136, 258 115 C 216 142, 64 142, 22 115 Z"
            fill="url(#rimGrad)"
            stroke="#45240a"
            strokeWidth="1.2"
          />

          {/* Stitches/Lacing around the rim */}
          <g stroke="#261203" strokeWidth="1.1" strokeLinecap="round" opacity="0.75">
            {Array.from({ length: 22 }).map((_, i) => {
              const t = (i + 1) / 24;
              const x = 28 + t * 224;
              const y = 116 + Math.sin(t * Math.PI) * 18;
              return (
                <line
                  key={i}
                  x1={x - 2}
                  y1={y - 2.5}
                  x2={x + 2}
                  y2={y + 2.5}
                  stroke="#261203"
                />
              );
            })}
          </g>

          {/* Cone Apex Top Crown / Knot */}
          <ellipse
            cx="140"
            cy="14"
            rx="11"
            ry="6"
            fill="url(#topTipGrad)"
            stroke="#402008"
            strokeWidth="1"
          />
          {/* Bamboo Tip Conelet */}
          <path
            d="M 134 14 C 137 7, 143 7, 146 14 Z"
            fill="#d6a76b"
            stroke="#5c3410"
            strokeWidth="0.8"
          />
          <circle cx="140" cy="9" r="2.2" fill="#f7e1b5" />
        </g>
      </svg>
    </div>
  );
};
