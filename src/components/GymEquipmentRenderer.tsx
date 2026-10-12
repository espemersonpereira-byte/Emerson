import React from 'react';

/**
 * Hevy-Style 3D Isometric Commercial Gym Equipment Renderer on Pure White Studio Stage.
 * Uses 3D silver-gray metallic square tubing (#CBD5E1 / #94A3B8 / #475569),
 * matte black weight stack plates (#111827), chrome guide rods, and black upholstered pads.
 */

export const StudioFloor: React.FC = () => (
  <g>
    {/* Soft studio ambient occlusion floor shadow on white stage */}
    <ellipse cx="135" cy="175" rx="76" ry="7" fill="#64748B" opacity="0.18" />
    <ellipse cx="135" cy="175" rx="48" ry="4" fill="#334155" opacity="0.16" />
  </g>
);

/**
 * 3D Dark Commercial Gym Studio Environment (Exact IMG_2627.png Reference)
 * Features recessed LED ceiling panels, dark architectural wall with IRONLOG 3D lettering,
 * subtle out-of-focus background dumbbell rack & cardio silhouettes, and perspective rubber floor tiles.
 */
export const DarkGymStudioEnvironment: React.FC<{ idPrefix: string }> = ({ idPrefix }) => (
  <g>
    <defs>
      <linearGradient id={`${idPrefix}_gym_wall`} x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#12141B" />
        <stop offset="22%" stopColor="#1C202B" />
        <stop offset="76%" stopColor="#171A23" />
        <stop offset="100%" stopColor="#0E1015" />
      </linearGradient>
      <linearGradient id={`${idPrefix}_gym_floor`} x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#1E222D" />
        <stop offset="45%" stopColor="#151821" />
        <stop offset="100%" stopColor="#090B0E" />
      </linearGradient>
      <radialGradient id={`${idPrefix}_spotlight`} cx="50%" cy="38%" r="58%">
        <stop offset="0%" stopColor="#384152" stopOpacity="0.55" />
        <stop offset="60%" stopColor="#1E2330" stopOpacity="0.2" />
        <stop offset="100%" stopColor="#090B0E" stopOpacity="0" />
      </radialGradient>
    </defs>

    {/* Full Dark Studio Backdrop */}
    <rect x="0" y="0" width="270" height="142" fill={`url(#${idPrefix}_gym_wall)`} />
    <rect x="0" y="0" width="270" height="188" fill={`url(#${idPrefix}_spotlight)`} />

    {/* Perspective Dark Ceiling & Recessed LED Light Panels (IMG_2627 top lights) */}
    <polygon points="0,0 270,0 250,22 20,22" fill="#0D0F14" opacity="0.85" />
    {/* Left & Right Ceiling LED Panels */}
    <polygon
      points="42,4 72,4 68,11 45,11"
      fill="#F8FAFC"
      opacity="0.92"
    />
    <polygon
      points="38,3 76,3 71,13 41,13"
      fill="#E2E8F0"
      opacity="0.22"
    />
    <polygon
      points="198,4 228,4 225,11 202,11"
      fill="#F8FAFC"
      opacity="0.92"
    />
    <polygon
      points="194,3 232,3 229,13 198,13"
      fill="#E2E8F0"
      opacity="0.22"
    />

    {/* Subtle Architectural Wall Columns */}
    <rect x="18" y="22" width="6" height="120" fill="#101218" opacity="0.65" />
    <rect x="246" y="22" width="6" height="120" fill="#101218" opacity="0.65" />

    {/* 3D Brushed-Silver Wall Sign (Like "LYFTA" in IMG_2627, branded "IRONLOG") */}
    <text
      x="135"
      y="56"
      textAnchor="middle"
      fill="#94A3B8"
      opacity="0.28"
      fontSize="24"
      fontWeight="900"
      fontFamily="system-ui, -apple-system, sans-serif"
      letterSpacing="3"
    >
      IRONLOG
    </text>

    {/* Background Out-of-Focus Gym Equipment Silhouettes (Left Dumbbell Rack & Right Cardio Bikes) */}
    <g opacity="0.32" fill="#0B0D12" stroke="#262B38" strokeWidth="0.7">
      {/* Left 2-Tier Dumbbell Rack Silhouette */}
      <line x1="28" y1="112" x2="34" y2="142" strokeWidth="2" />
      <line x1="82" y1="112" x2="78" y2="142" strokeWidth="2" />
      <rect x="26" y="116" width="58" height="3" rx="1" />
      <rect x="28" y="127" width="54" height="3" rx="1" />
      {[32, 41, 50, 59, 68, 76].map((dx) => (
        <g key={`db_bg_${dx}`}>
          <circle cx={dx} cy="114" r="2.6" fill="#090B0E" />
          <circle cx={dx} cy="125" r="3" fill="#090B0E" />
        </g>
      ))}

      {/* Right Background Elliptical / Upright Bike Silhouettes */}
      <line x1="214" y1="142" x2="226" y2="104" strokeWidth="2.2" />
      <circle cx="216" cy="132" r="9" fill="#090B0E" />
      <path d="M 222,108 L 230,98 L 236,100" fill="none" strokeWidth="1.8" />
      <line x1="238" y1="142" x2="248" y2="106" strokeWidth="2.2" />
      <circle cx="240" cy="133" r="8" fill="#090B0E" />
    </g>

    {/* Baseboard Wall-to-Floor Divider */}
    <line x1="0" y1="142" x2="270" y2="142" stroke="#090B0E" strokeWidth="2" />
    <line x1="0" y1="143.5" x2="270" y2="143.5" stroke="#2A3040" strokeWidth="0.7" />

    {/* Perspective Dark Rubber Gym Floor Tiles (IMG_2627 Floor Grid) */}
    <rect x="0" y="143" width="270" height="45" fill={`url(#${idPrefix}_gym_floor)`} />
    <g stroke="#262B38" strokeWidth="0.6" opacity="0.55">
      {/* Horizontal perspective floor seams */}
      <line x1="0" y1="153" x2="270" y2="153" />
      <line x1="0" y1="166" x2="270" y2="166" />
      <line x1="0" y1="181" x2="270" y2="181" />
      {/* Perspective radiating floor tile seams */}
      <line x1="45" y1="143" x2="10" y2="188" />
      <line x1="90" y1="143" x2="72" y2="188" />
      <line x1="135" y1="143" x2="135" y2="188" />
      <line x1="180" y1="143" x2="198" y2="188" />
      <line x1="225" y1="143" x2="260" y2="188" />
    </g>

    {/* Ambient Floor Shadow Under Athlete & Equipment */}
    <ellipse cx="135" cy="174" rx="74" ry="8" fill="#000000" opacity="0.55" />
    <ellipse cx="135" cy="174" rx="44" ry="4.5" fill="#000000" opacity="0.65" />
  </g>
);

/**
 * Commercial 3D Weight Stack Cage Tower (Silver-gray 3D frame + Matte Black Weight Stack Plates)
 * Matches the exact machine tower in IMG_2623.png
 */
export const WeightStackTower: React.FC<{
  x: number;
  y?: number;
  height?: number;
  liftProgress: number; // 0..1
  idPrefix: string;
}> = ({ x, y = 20, height = 152, liftProgress, idPrefix }) => {
  const liftOffset = liftProgress * 22;
  return (
    <g transform={`translate(${x}, ${y})`}>
      {/* Base angled stabilizer foot & black rubber end-caps */}
      <path
        d={`M -6,${height - 4} L 34,${height - 2} L 34,${height + 2} L -6,${height} Z`}
        fill="#94A3B8"
        stroke="#475569"
        strokeWidth="0.7"
      />
      <rect x="-8" y={height - 5} width="7" height="6" rx="1.5" fill="#111827" />
      <rect x="30" y={height - 3} width="7" height="6" rx="1.5" fill="#111827" />

      {/* 3D Silver-Gray Square Steel Pillars */}
      <rect
        x="0"
        y="0"
        width="5.5"
        height={height - 2}
        fill={`url(#${idPrefix}_steel)`}
        stroke="#475569"
        strokeWidth="0.6"
      />
      <rect
        x="24"
        y="2"
        width="5.5"
        height={height - 4}
        fill={`url(#${idPrefix}_steel)`}
        stroke="#475569"
        strokeWidth="0.6"
      />

      {/* Top Crossbeam & Pulley Housing */}
      <path
        d="M -2,-2 L 32,0 L 30,6 L -2,4 Z"
        fill="#94A3B8"
        stroke="#475569"
        strokeWidth="0.7"
      />

      {/* Dual Chrome Guide Rods */}
      <rect x="9.5" y="5" width="1.8" height={height - 9} fill={`url(#${idPrefix}_chrome)`} />
      <rect x="18.5" y="5" width="1.8" height={height - 9} fill={`url(#${idPrefix}_chrome)`} />

      {/* Lift Cable */}
      <line x1="14.8" y1="4" x2="14.8" y2={height - 45} stroke="#334155" strokeWidth="1.3" />

      {/* Lower Resting Matte-Black Weight Stack Block */}
      <rect
        x="6.2"
        y={height - 44}
        width="17.2"
        height="39"
        rx="1"
        fill="#111827"
        stroke="#030712"
        strokeWidth="0.7"
      />
      {[0, 1, 2, 3, 4, 5, 6, 7].map((idx) => (
        <line
          key={`groove_rest_${idx}`}
          x1="6.5"
          y1={height - 9 - idx * 4.5}
          x2="23.2"
          y2={height - 9 - idx * 4.5}
          stroke="#374151"
          strokeWidth="0.6"
        />
      ))}

      {/* Active Lifted Weight Stack Plates */}
      <g transform={`translate(0, ${-liftOffset})`}>
        {/* Dome cable weight buffer above active plates */}
        <path
          d={`M 11,${height - 62} C 11,${height - 68} 18.5,${height - 68} 18.5,${height - 62} Z`}
          fill="#111827"
        />
        <rect
          x="6.2"
          y={height - 61}
          width="17.2"
          height="16"
          rx="1"
          fill="#111827"
          stroke="#030712"
          strokeWidth="0.7"
        />
        {[0, 1, 2].map((idx) => (
          <line
            key={`groove_act_${idx}`}
            x1="6.5"
            y1={height - 49 - idx * 4.5}
            x2="23.2"
            y2={height - 49 - idx * 4.5}
            stroke="#4B5563"
            strokeWidth="0.6"
          />
        ))}
      </g>
    </g>
  );
};

/**
 * 3D Commercial Pulley Wheel with Silver Bracket
 */
export const PulleyWheel: React.FC<{ cx: number; cy: number; rotation?: number }> = ({
  cx,
  cy,
  rotation = 0,
}) => (
  <g transform={`translate(${cx}, ${cy})`}>
    <circle r="6" fill="#18181B" stroke="#64748B" strokeWidth="1.4" />
    <g transform={`rotate(${rotation})`}>
      <line x1="-4" y1="0" x2="4" y2="0" stroke="#94A3B8" strokeWidth="0.9" />
      <line x1="0" y1="-4" x2="0" y2="4" stroke="#94A3B8" strokeWidth="0.9" />
    </g>
    <circle r="2" fill="#CBD5E1" />
  </g>
);

/**
 * Olympic Barbell Side/3D View (Loaded with Matte-Black Cast Iron Plates & Chrome Sleeve)
 */
export const OlympicBarbellSide: React.FC<{
  cx: number;
  cy: number;
  idPrefix: string;
}> = ({ cx, cy, idPrefix }) => (
  <g transform={`translate(${cx}, ${cy})`}>
    {/* Outer 20kg Matte Black Olympic Plate */}
    <circle r="15.5" fill="#18181B" stroke="#3F3F46" strokeWidth="1.4" />
    <circle r="11.5" fill="none" stroke="#27272A" strokeWidth="1.8" />
    <circle r="7.5" fill="#09090B" stroke="#3F3F46" strokeWidth="0.9" />
    {/* Inner Steel Hub */}
    <circle r="4.2" fill={`url(#${idPrefix}_chrome)`} stroke="#475569" strokeWidth="0.8" />
    {/* Barbell Sleeve End */}
    <circle r="1.8" fill="#F8FAFC" />
  </g>
);

/**
 * Hex Dumbbell (Matte-Black Rubber Heads + Chrome Knurled Handle)
 */
export const HexDumbbell: React.FC<{
  cx: number;
  cy: number;
  angle?: number;
  scale?: number;
}> = ({ cx, cy, angle = 0, scale = 1 }) => (
  <g transform={`translate(${cx}, ${cy}) rotate(${angle}) scale(${scale})`}>
    <rect x="-11" y="-1.8" width="22" height="3.6" rx="1" fill="#CBD5E1" stroke="#475569" strokeWidth="0.5" />
    <polygon
      points="-15,-6 -9,-8 -7,-6 -7,6 -9,8 -15,6"
      fill="#18181B"
      stroke="#3F3F46"
      strokeWidth="0.8"
    />
    <polygon
      points="15,-6 9,-8 7,-6 7,6 9,8 15,6"
      fill="#18181B"
      stroke="#3F3F46"
      strokeWidth="0.8"
    />
  </g>
);

/**
 * Matte-Black Upholstered Bench / Machine Pad with 3D Silver Backing
 */
export const LeatherPad: React.FC<{
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  thickness?: number;
  idPrefix: string;
}> = ({ x1, y1, x2, y2, thickness = 9, idPrefix }) => {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy);
  const ang = (Math.atan2(dy, dx) * 180) / Math.PI;
  return (
    <g transform={`translate(${x1}, ${y1}) rotate(${ang})`}>
      {/* Silver steel frame backing */}
      <rect
        x="1"
        y={thickness * 0.35}
        width={len - 2}
        height={thickness * 0.45}
        rx="1.5"
        fill="#94A3B8"
        stroke="#475569"
        strokeWidth="0.5"
      />
      {/* Matte black cushion pad */}
      <rect
        x="0"
        y={-thickness / 2}
        width={len}
        height={thickness}
        rx={thickness * 0.35}
        fill={`url(#${idPrefix}_pad)`}
        stroke="#09090B"
        strokeWidth="0.7"
      />
      {/* Subtle top leather highlight */}
      <line
        x1="3"
        y1={-thickness / 2 + 1.5}
        x2={len - 3}
        y2={-thickness / 2 + 1.5}
        stroke="#52525B"
        strokeWidth="0.7"
      />
    </g>
  );
};
