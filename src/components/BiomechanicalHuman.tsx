import React from 'react';
import { MuscleGroup } from '../types';

/**
 * Hevy-Style 3D Silver-Gray Anatomical Écorché Renderer.
 * - Inactive muscles: Sculpted 3D metallic silver-gray (#F8FAFC -> #CBD5E1 -> #94A3B8 -> #475569)
 *   with crisp anatomical sulcus lines, white tendon insertions, and muscle fiber striations.
 * - Active target muscles: Vibrant anatomical red-orange (#FF5722 -> #EA580C -> #9A3412) with
 *   realistic white tendon origins/insertions and fiber lines.
 * - Attire: Matte charcoal-black compression shorts (#18181B -> #09090B) and anatomical bare feet.
 */

export const HumanSvgDefs: React.FC<{ idPrefix: string }> = ({ idPrefix }) => (
  <defs>
    {/* 3D Silver-Gray Anatomical Muscle Gradient (Near / Lit side) */}
    <linearGradient id={`${idPrefix}_skin`} x1="15%" y1="10%" x2="85%" y2="90%">
      <stop offset="0%" stopColor="#F8FAFC" />
      <stop offset="35%" stopColor="#E2E8F0" />
      <stop offset="70%" stopColor="#94A3B8" />
      <stop offset="100%" stopColor="#64748B" />
    </linearGradient>

    {/* 3D Silver-Gray Anatomical Muscle Gradient (Far / Shaded side) */}
    <linearGradient id={`${idPrefix}_skin_far`} x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#CBD5E1" />
      <stop offset="55%" stopColor="#94A3B8" />
      <stop offset="100%" stopColor="#475569" />
    </linearGradient>

    {/* 3D Radial Highlight for Sculpted Muscle Bellies */}
    <radialGradient id={`${idPrefix}_muscle_silver`} cx="35%" cy="30%" r="70%">
      <stop offset="0%" stopColor="#FFFFFF" />
      <stop offset="40%" stopColor="#CBD5E1" />
      <stop offset="85%" stopColor="#64748B" />
      <stop offset="100%" stopColor="#334155" />
    </radialGradient>

    {/* Primary Target Muscle Glow (Hevy Anatomical Red-Orange) */}
    <linearGradient id={`${idPrefix}_muscle_primary`} x1="15%" y1="10%" x2="85%" y2="90%">
      <stop offset="0%" stopColor="#FF6B35" />
      <stop offset="45%" stopColor="#FF4500" />
      <stop offset="85%" stopColor="#C2410C" />
      <stop offset="100%" stopColor="#7C2D12" />
    </linearGradient>

    {/* Secondary Synergist Muscle Glow (Warm Coral-Orange) */}
    <linearGradient id={`${idPrefix}_muscle_secondary`} x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#FB923C" />
      <stop offset="60%" stopColor="#F97316" />
      <stop offset="100%" stopColor="#B45309" />
    </linearGradient>

    {/* Shirtless Torso Base (Uses Silver-Gray Anatomical Gradient) */}
    <linearGradient id={`${idPrefix}_shirt`} x1="10%" y1="0%" x2="90%" y2="100%">
      <stop offset="0%" stopColor="#F1F5F9" />
      <stop offset="45%" stopColor="#CBD5E1" />
      <stop offset="85%" stopColor="#94A3B8" />
      <stop offset="100%" stopColor="#475569" />
    </linearGradient>

    {/* Matte Black Compression Shorts */}
    <linearGradient id={`${idPrefix}_shorts`} x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#27272A" />
      <stop offset="50%" stopColor="#18181B" />
      <stop offset="100%" stopColor="#09090B" />
    </linearGradient>

    {/* Commercial Gym 3D Brushed Silver Steel Frame */}
    <linearGradient id={`${idPrefix}_steel`} x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stopColor="#64748B" />
      <stop offset="30%" stopColor="#E2E8F0" />
      <stop offset="60%" stopColor="#94A3B8" />
      <stop offset="100%" stopColor="#475569" />
    </linearGradient>

    {/* Chrome Guide Rods & Olympic Bar */}
    <linearGradient id={`${idPrefix}_chrome`} x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stopColor="#FFFFFF" />
      <stop offset="50%" stopColor="#CBD5E1" />
      <stop offset="100%" stopColor="#64748B" />
    </linearGradient>

    {/* Matte Black Upholstered Pad / Foam Roller */}
    <linearGradient id={`${idPrefix}_pad`} x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#27272A" />
      <stop offset="40%" stopColor="#18181B" />
      <stop offset="100%" stopColor="#050507" />
    </linearGradient>
  </defs>
);

export function isMuscleActive(
  target: MuscleGroup | MuscleGroup[],
  primary: MuscleGroup,
  secondary: MuscleGroup[]
): 'primary' | 'secondary' | null {
  const list = Array.isArray(target) ? target : [target];
  if (list.includes(primary)) return 'primary';
  if (list.some((m) => secondary.includes(m))) return 'secondary';
  return null;
}

/**
 * 3D Silver-Gray Anatomical Head & Sternocleidomastoid Neck
 */
export const AthleteHead: React.FC<{
  x: number;
  y: number;
  angle?: number;
  facing?: 'right' | 'left' | 'front' | 'back';
  idPrefix: string;
  scale?: number;
}> = ({ x, y, angle = 0, facing = 'right', idPrefix, scale = 1 }) => {
  const flip = facing === 'left' ? -1 : 1;
  if (facing === 'front' || facing === 'back') {
    return (
      <g transform={`translate(${x}, ${y}) rotate(${angle}) scale(${scale})`}>
        {/* Trapezius & Sternocleidomastoid Neck Column */}
        <path
          d="M -6.5,5 L -9.5,16 L 9.5,16 L 6.5,5 Z"
          fill={`url(#${idPrefix}_skin)`}
          stroke="#475569"
          strokeWidth="0.7"
        />
        {facing === 'front' && (
          <>
            {/* Sternocleidomastoid V-cords & Clavicle notch */}
            <path
              d="M -5,7 L -1.2,15.5 M 5,7 L 1.2,15.5"
              stroke="#475569"
              strokeWidth="0.75"
              fill="none"
            />
            <path d="M -8,14.5 Q 0,16.5 8,14.5" stroke="#F8FAFC" strokeWidth="0.8" fill="none" />
          </>
        )}
        {/* Ears */}
        <ellipse
          cx="-10.2"
          cy="0.5"
          rx="1.8"
          ry="3.4"
          fill={`url(#${idPrefix}_skin)`}
          stroke="#475569"
          strokeWidth="0.6"
        />
        <ellipse
          cx="10.2"
          cy="0.5"
          rx="1.8"
          ry="3.4"
          fill={`url(#${idPrefix}_skin)`}
          stroke="#475569"
          strokeWidth="0.6"
        />
        {/* Sculpted Silver Cranium & Chiseled Jaw */}
        <path
          d="M -9.8,-4 C -10.2,-13.5 10.2,-13.5 9.8,-4 C 9.8,3.5 7.2,9.5 0,11.2 C -7.2,9.5 -9.8,3.5 -9.8,-4 Z"
          fill={`url(#${idPrefix}_skin)`}
          stroke="#475569"
          strokeWidth="0.75"
        />
        {/* Subtle Buzz-Cut Hairline */}
        <path
          d={
            facing === 'back'
              ? 'M -9.8,-3.5 C -10.2,-13.5 10.2,-13.5 9.8,-3.5 C 9.2,3 6.5,5 0,5 C -6.5,5 -9.2,3 -9.8,-3.5 Z'
              : 'M -9.6,-4 C -9.8,-13.2 9.8,-13.2 9.6,-4 C 7.5,-7.5 4,-8.5 0,-8.2 C -4,-8.5 -7.5,-7.5 -9.6,-4 Z'
          }
          fill="#64748B"
          opacity="0.55"
        />
        {facing === 'front' && (
          <>
            {/* Brow ridge, Nose bridge, Cheekbones & Mouth */}
            <path d="M -6.5,-2.2 L -1.8,-1.8 M 1.8,-1.8 L 6.5,-2.2" stroke="#334155" strokeWidth="1" strokeLinecap="round" />
            <ellipse cx="-4" cy="-0.6" rx="1.3" ry="0.7" fill="#334155" />
            <ellipse cx="4" cy="-0.6" rx="1.3" ry="0.7" fill="#334155" />
            <path d="M 0,-1.8 L -1.1,2.8 L 0,3.4 L 1.1,2.8 Z" fill="#94A3B8" stroke="#475569" strokeWidth="0.5" />
            <path d="M -3,6.2 Q 0,6.8 3,6.2" stroke="#334155" strokeWidth="0.8" fill="none" />
            <path d="M -6.5,2.5 L -4,6.5 M 6.5,2.5 L 4,6.5" stroke="#64748B" strokeWidth="0.5" fill="none" />
          </>
        )}
      </g>
    );
  }

  return (
    <g transform={`translate(${x}, ${y}) rotate(${angle}) scale(${flip * scale}, ${scale})`}>
      {/* Sternocleidomastoid & Trapezius Neck */}
      <path
        d="M -6.5,4 L -9.5,16 L 4,16 L 4.5,5.5 Z"
        fill={`url(#${idPrefix}_skin)`}
        stroke="#475569"
        strokeWidth="0.7"
      />
      <line x1="-2" y1="5" x2="-6" y2="15" stroke="#475569" strokeWidth="0.7" />
      <line x1="1" y1="6" x2="2" y2="15.5" stroke="#F8FAFC" strokeWidth="0.6" />

      {/* 3/4 & Profile Chiseled Silver Head */}
      <path
        d="M -9,-4 C -9.2,-13.2 7,-13.2 9.2,-4.2 L 11.4,-0.2 L 9.4,1.8 L 10,4.8 C 9.4,8.6 5.8,10.2 1,9.6 L -3.5,7.2 C -7.2,5.2 -9,0 -9,-4 Z"
        fill={`url(#${idPrefix}_skin)`}
        stroke="#475569"
        strokeWidth="0.75"
      />
      {/* Cropped Buzz-Cut */}
      <path
        d="M -9,-2.5 C -9.5,-13.2 7.2,-13.5 9,-5.2 C 5.5,-6.2 1.5,-5.2 -1.5,-3 C -3.5,-1 -4.5,1.5 -6.5,2.5 C -8,1.5 -9,-0.5 -9,-2.5 Z"
        fill="#64748B"
        opacity="0.55"
      />
      {/* Sculpted Ear */}
      <ellipse
        cx="-2.6"
        cy="1"
        rx="1.8"
        ry="3.1"
        fill={`url(#${idPrefix}_skin)`}
        stroke="#475569"
        strokeWidth="0.6"
      />
      {/* Brow, Eye, Cheekbone & Jawline */}
      <line x1="5.2" y1="-2.6" x2="8.6" y2="-2.1" stroke="#334155" strokeWidth="1" strokeLinecap="round" />
      <circle cx="6.6" cy="-1" r="0.9" fill="#334155" />
      <path d="M 1.5,3.5 L 5.5,5.5" stroke="#64748B" strokeWidth="0.55" />
      <path d="M 6.5,5.2 L 9.2,5.2" stroke="#334155" strokeWidth="0.75" />
    </g>
  );
};

/**
 * Articulated 3D Silver-Gray Anatomical Arm (Deltoid + Biceps + Triceps + Brachioradialis + Hand)
 */
export const AthleteArm: React.FC<{
  sx: number;
  sy: number;
  ex: number;
  ey: number;
  hx: number;
  hy: number;
  idPrefix: string;
  isFar?: boolean;
  deltStatus?: 'primary' | 'secondary' | null;
  bicepsStatus?: 'primary' | 'secondary' | null;
  tricepsStatus?: 'primary' | 'secondary' | null;
  forearmStatus?: 'primary' | 'secondary' | null;
  contraction?: number;
}> = ({
  sx,
  sy,
  ex,
  ey,
  hx,
  hy,
  idPrefix,
  isFar = false,
  deltStatus = null,
  bicepsStatus = null,
  tricepsStatus = null,
  forearmStatus = null,
  contraction = 0.5,
}) => {
  const skinFill = isFar ? `url(#${idPrefix}_skin_far)` : `url(#${idPrefix}_skin)`;

  // Upper arm vector
  const dx1 = ex - sx;
  const dy1 = ey - sy;
  const len1 = Math.max(8, Math.hypot(dx1, dy1));
  const ang1 = (Math.atan2(dy1, dx1) * 180) / Math.PI;

  // Forearm vector
  const dx2 = hx - ex;
  const dy2 = hy - ey;
  const len2 = Math.max(8, Math.hypot(dx2, dy2));
  const ang2 = (Math.atan2(dy2, dx2) * 180) / Math.PI;

  const peak = 1 + contraction * 0.22;

  return (
    <g opacity={isFar ? 0.88 : 1}>
      {/* Upper Arm Segment */}
      <g transform={`translate(${sx}, ${sy}) rotate(${ang1})`}>
        {/* Base Humerus Anatomical Muscle Mass */}
        <path
          d={`M 0,-6.8 C ${len1 * 0.35},${-8.8 * peak} ${len1 * 0.72},-7.2 ${len1},-5.2 L ${len1},5.2 C ${len1 * 0.68},${7.8 * peak} ${len1 * 0.3},7.8 0,6.8 Z`}
          fill={skinFill}
          stroke="#475569"
          strokeWidth="0.7"
        />
        {/* Anatomical Separation Line between Biceps and Triceps */}
        <path
          d={`M ${len1 * 0.18},0 Q ${len1 * 0.55},-0.8 ${len1 * 0.9},0`}
          stroke="#475569"
          strokeWidth="0.6"
          fill="none"
        />

        {/* Biceps Brachii Belly (Silver when inactive, Glowing Red-Orange when active) */}
        <path
          d={`M ${len1 * 0.18},-0.5 C ${len1 * 0.4},${-8.6 * peak} ${len1 * 0.74},${-7.6 * peak} ${len1 * 0.9},-1.8 C ${len1 * 0.65},-0.5 ${len1 * 0.38},-0.2 ${len1 * 0.18},-0.5 Z`}
          fill={
            bicepsStatus === 'primary'
              ? `url(#${idPrefix}_muscle_primary)`
              : bicepsStatus === 'secondary'
              ? `url(#${idPrefix}_muscle_secondary)`
              : skinFill
          }
          stroke="#475569"
          strokeWidth="0.55"
        />
        {bicepsStatus && (
          <path
            d={`M ${len1 * 0.28},-3.5 Q ${len1 * 0.55},${-6 * peak} ${len1 * 0.82},-3`}
            stroke="#FFF"
            strokeWidth="0.5"
            fill="none"
            opacity="0.45"
          />
        )}

        {/* Triceps Brachii Horseshoe Belly */}
        <path
          d={`M ${len1 * 0.15},0.8 C ${len1 * 0.4},${8 * peak} ${len1 * 0.72},${7.2 * peak} ${len1 * 0.9},2 C ${len1 * 0.65},1 ${len1 * 0.35},1 ${len1 * 0.15},0.8 Z`}
          fill={
            tricepsStatus === 'primary'
              ? `url(#${idPrefix}_muscle_primary)`
              : tricepsStatus === 'secondary'
              ? `url(#${idPrefix}_muscle_secondary)`
              : skinFill
          }
          stroke="#475569"
          strokeWidth="0.55"
        />

        {/* 3-Headed Deltoid Shoulder Cap */}
        <path
          d="M -6.5,-7.8 C 4,-10 13.5,-6.2 14.8,0 C 13.5,6.2 4,10 -6.5,7.8 C -9.5,4 -9.5,-4 -6.5,-7.8 Z"
          fill={
            deltStatus === 'primary'
              ? `url(#${idPrefix}_muscle_primary)`
              : deltStatus === 'secondary'
              ? `url(#${idPrefix}_muscle_secondary)`
              : `url(#${idPrefix}_muscle_silver)`
          }
          stroke="#475569"
          strokeWidth="0.7"
        />
        {/* Deltoid Feather Striations */}
        <path
          d="M -4,-3.8 L 9.5,-1.2 M -5,0 L 11,0 M -4,3.8 L 9.5,1.2"
          stroke={deltStatus ? '#FFF' : '#475569'}
          strokeWidth="0.5"
          opacity={deltStatus ? 0.5 : 0.45}
        />
      </g>

      {/* Forearm (Brachioradialis + Flexors) & Anatomical Hand */}
      <g transform={`translate(${ex}, ${ey}) rotate(${ang2})`}>
        <path
          d={`M -2,-5.4 C ${len2 * 0.28},-7 ${len2 * 0.65},-4.6 ${len2},-3.3 L ${len2},3.3 C ${len2 * 0.65},4.6 ${len2 * 0.28},6.4 -2,5.4 Z`}
          fill={
            forearmStatus === 'primary'
              ? `url(#${idPrefix}_muscle_primary)`
              : forearmStatus === 'secondary'
              ? `url(#${idPrefix}_muscle_secondary)`
              : skinFill
          }
          stroke="#475569"
          strokeWidth="0.7"
        />
        {/* Forearm Extensor/Flexor Striation Line */}
        <path
          d={`M 2,-1.5 L ${len2 * 0.78},-0.5 M 2,1.8 L ${len2 * 0.75},0.8`}
          stroke="#475569"
          strokeWidth="0.5"
          opacity="0.55"
        />
        {/* Anatomical Gripping Hand */}
        <path
          d={`M ${len2 - 1},-4.2 C ${len2 + 4.8},-4.5 ${len2 + 5.5},4.5 ${len2 - 1},4.2 Z`}
          fill={skinFill}
          stroke="#475569"
          strokeWidth="0.65"
        />
        {/* Knuckle lines */}
        <line
          x1={len2 + 2}
          y1="-2.5"
          x2={len2 + 2}
          y2="2.5"
          stroke="#475569"
          strokeWidth="0.5"
        />
      </g>
    </g>
  );
};

/**
 * Articulated 3D Silver-Gray Anatomical Leg (Glutes + Quads + Hamstrings + Knee Patella + Calves + Bare Anatomical Foot)
 */
export const AthleteLeg: React.FC<{
  hx: number;
  hy: number;
  kx: number;
  ky: number;
  ax: number;
  ay: number;
  idPrefix: string;
  isFar?: boolean;
  footAngle?: number;
  gluteStatus?: 'primary' | 'secondary' | null;
  quadStatus?: 'primary' | 'secondary' | null;
  hamstringStatus?: 'primary' | 'secondary' | null;
  calfStatus?: 'primary' | 'secondary' | null;
  contraction?: number;
}> = ({
  hx,
  hy,
  kx,
  ky,
  ax,
  ay,
  idPrefix,
  isFar = false,
  footAngle = 0,
  gluteStatus = null,
  quadStatus = null,
  hamstringStatus = null,
  calfStatus = null,
  contraction = 0.5,
}) => {
  const skinFill = isFar ? `url(#${idPrefix}_skin_far)` : `url(#${idPrefix}_skin)`;

  // Thigh vector
  const dx1 = kx - hx;
  const dy1 = ky - hy;
  const len1 = Math.max(10, Math.hypot(dx1, dy1));
  const ang1 = (Math.atan2(dy1, dx1) * 180) / Math.PI;

  // Lower leg vector
  const dx2 = ax - kx;
  const dy2 = ay - ky;
  const len2 = Math.max(10, Math.hypot(dx2, dy2));
  const ang2 = (Math.atan2(dy2, dx2) * 180) / Math.PI;

  const peak = 1 + contraction * 0.18;

  return (
    <g opacity={isFar ? 0.88 : 1}>
      {/* Thigh & Hip Segment */}
      <g transform={`translate(${hx}, ${hy}) rotate(${ang1})`}>
        {/* Base Anatomical Thigh */}
        <path
          d={`M -4,-10.5 C ${len1 * 0.35},${-12 * peak} ${len1 * 0.75},-8.8 ${len1},-6.8 L ${len1},6.8 C ${len1 * 0.7},9.2 ${len1 * 0.35},${10.8 * peak} -4,10.5 Z`}
          fill={skinFill}
          stroke="#475569"
          strokeWidth="0.75"
        />

        {/* Quadriceps (Rectus Femoris + Vastus Lateralis + Vastus Medialis Teardrop) */}
        <path
          d={`M ${len1 * 0.2},-1.5 C ${len1 * 0.45},${-11.5 * peak} ${len1 * 0.82},-8.8 ${len1 * 0.95},-2.8 C ${len1 * 0.7},-0.5 ${len1 * 0.4},0 ${len1 * 0.2},-1.5 Z`}
          fill={
            quadStatus === 'primary'
              ? `url(#${idPrefix}_muscle_primary)`
              : quadStatus === 'secondary'
              ? `url(#${idPrefix}_muscle_secondary)`
              : `url(#${idPrefix}_muscle_silver)`
          }
          stroke="#475569"
          strokeWidth="0.6"
        />
        {/* Quad Anatomical Separation Grooves (Rectus Femoris & VMO Teardrop) */}
        <path
          d={`M ${len1 * 0.32},-5.5 L ${len1 * 0.88},-3.5 M ${len1 * 0.65},-1.5 Q ${len1 * 0.82},-5.5 ${len1 * 0.94},-2`}
          stroke={quadStatus ? '#FFF' : '#475569'}
          strokeWidth="0.55"
          fill="none"
          opacity="0.55"
        />

        {/* Hamstrings (Biceps Femoris + Semitendinosus) */}
        <path
          d={`M ${len1 * 0.2},2 C ${len1 * 0.45},${10.8 * peak} ${len1 * 0.8},8.8 ${len1 * 0.92},3 C ${len1 * 0.7},1.2 ${len1 * 0.4},1 ${len1 * 0.2},2 Z`}
          fill={
            hamstringStatus === 'primary'
              ? `url(#${idPrefix}_muscle_primary)`
              : hamstringStatus === 'secondary'
              ? `url(#${idPrefix}_muscle_secondary)`
              : skinFill
          }
          stroke="#475569"
          strokeWidth="0.55"
        />

        {/* Matte Black Compression Shorts Thigh Legging */}
        <path
          d={`M -6,-10.8 L ${len1 * 0.38},-9.8 C ${len1 * 0.41},0 ${len1 * 0.41},5 ${len1 * 0.38},9.8 L -6,10.8 Z`}
          fill={`url(#${idPrefix}_shorts)`}
          stroke="#09090B"
          strokeWidth="0.6"
        />

        {/* Gluteus Maximus Overlay on Hip */}
        {gluteStatus && (
          <path
            d="M -10,-6.5 C -2,-11.5 8,-8.5 10.5,2 C 8,10.5 -4,12.5 -10,6.5 C -13.5,2 -13.5,-2 -10,-6.5 Z"
            fill={
              gluteStatus === 'primary'
                ? `url(#${idPrefix}_muscle_primary)`
                : `url(#${idPrefix}_muscle_secondary)`
            }
            stroke="#7C2D12"
            strokeWidth="0.6"
          />
        )}
      </g>

      {/* Lower Leg (Patella + Tibialis Anterior + Gastrocnemius/Soleus) & Sculpted Bare Foot */}
      <g transform={`translate(${kx}, ${ky}) rotate(${ang2})`}>
        {/* Knee Patella Cap */}
        <ellipse cx="0" cy="-2" rx="4.2" ry="3.5" fill={skinFill} stroke="#475569" strokeWidth="0.6" />

        {/* Shin & Gastrocnemius Contour */}
        <path
          d={`M -2,-5.8 C ${len2 * 0.4},-5.4 ${len2 * 0.75},-4.2 ${len2},-3.6 L ${len2},3.8 C ${len2 * 0.75},4.4 ${len2 * 0.48},5.8 ${len2 * 0.35},${9.8 * peak} C ${len2 * 0.15},${10.2 * peak} 2,7.8 -2,6 Z`}
          fill={skinFill}
          stroke="#475569"
          strokeWidth="0.7"
        />

        {/* Gastrocnemius & Soleus Calf Belly */}
        <path
          d={`M ${len2 * 0.08},0.8 C ${len2 * 0.25},${10.2 * peak} ${len2 * 0.55},${8.8 * peak} ${len2 * 0.8},2.5 C ${len2 * 0.5},1.2 ${len2 * 0.25},0.8 ${len2 * 0.08},0.8 Z`}
          fill={
            calfStatus === 'primary'
              ? `url(#${idPrefix}_muscle_primary)`
              : calfStatus === 'secondary'
              ? `url(#${idPrefix}_muscle_secondary)`
              : `url(#${idPrefix}_muscle_silver)`
          }
          stroke="#475569"
          strokeWidth="0.55"
        />
        {/* Tibia Bone & Calf Separation Line */}
        <line
          x1={len2 * 0.12}
          y1="-2"
          x2={len2 * 0.88}
          y2="-1.2"
          stroke="#475569"
          strokeWidth="0.55"
        />

        {/* Sculpted Anatomical Bare Foot (Matching Hevy Reference Image!) */}
        <g transform={`translate(${len2}, 0) rotate(${footAngle - ang2})`}>
          <path
            d="M -4.5,-3.8 L 3.5,-2.5 C 9,-1.5 13.5,0.5 14.5,3.2 C 14.5,4.8 11,5.2 6,5 L -5.5,5 C -6.5,2.5 -5.8,-1.5 -4.5,-3.8 Z"
            fill={skinFill}
            stroke="#475569"
            strokeWidth="0.7"
          />
          {/* Ankle Malleolus & Tendon */}
          <circle cx="-1.5" cy="-0.5" r="1.6" fill="#E2E8F0" stroke="#475569" strokeWidth="0.5" />
          <path d="M 3,-1 L 11,2.2 M 5,0.5 L 12,3.5" stroke="#475569" strokeWidth="0.45" />
        </g>
      </g>
    </g>
  );
};

/**
 * Shirtless 3D Silver-Gray Anatomical Torso (Side / 3-Quarter Profile)
 * Shows sculpted Pectoralis Major, Serratus Anterior, 6-Pack Rectus Abdominis, External Obliques & Latissimus Dorsi
 */
export const AthleteTorsoProfile: React.FC<{
  sx: number;
  sy: number;
  hx: number;
  hy: number;
  idPrefix: string;
  chestStatus?: 'primary' | 'secondary' | null;
  backStatus?: 'primary' | 'secondary' | null;
  absStatus?: 'primary' | 'secondary' | null;
  contraction?: number;
}> = ({
  sx,
  sy,
  hx,
  hy,
  idPrefix,
  chestStatus = null,
  backStatus = null,
  absStatus = null,
  contraction = 0.5,
}) => {
  const dx = hx - sx;
  const dy = hy - sy;
  const len = Math.max(16, Math.hypot(dx, dy));
  const ang = (Math.atan2(dy, dx) * 180) / Math.PI;

  return (
    <g transform={`translate(${sx}, ${sy}) rotate(${ang})`}>
      {/* Shirtless Silver-Gray Anatomical Ribcage & Waist */}
      <path
        d={`M -4,-12.5 C ${len * 0.28},-15 ${len * 0.65},-11.5 ${len},-9.8 L ${len},9.8 C ${len * 0.65},11 ${len * 0.35},14 -4,11.5 Z`}
        fill={`url(#${idPrefix}_skin)`}
        stroke="#475569"
        strokeWidth="0.8"
      />

      {/* Latissimus Dorsi & Teres Major (Upper/Mid Back Sweep) */}
      <path
        d={`M 2,11.2 C ${len * 0.3},14.2 ${len * 0.65},11.8 ${len * 0.82},6 C ${len * 0.5},2.5 10,2.5 2,11.2 Z`}
        fill={
          backStatus === 'primary'
            ? `url(#${idPrefix}_muscle_primary)`
            : backStatus === 'secondary'
            ? `url(#${idPrefix}_muscle_secondary)`
            : `url(#${idPrefix}_muscle_silver)`
        }
        stroke="#475569"
        strokeWidth="0.6"
      />

      {/* Pectoralis Major Chest Slab (With Sternal & Clavicular Fibers) */}
      <path
        d={`M 1,-12.2 C ${len * 0.24},-16 ${len * 0.42},-13.5 ${len * 0.44},-3.5 C ${len * 0.26},-1.5 5,-2.5 1,-12.2 Z`}
        fill={
          chestStatus === 'primary'
            ? `url(#${idPrefix}_muscle_primary)`
            : chestStatus === 'secondary'
            ? `url(#${idPrefix}_muscle_secondary)`
            : `url(#${idPrefix}_muscle_silver)`
        }
        stroke="#475569"
        strokeWidth="0.65"
      />
      {/* Pectoral Muscle Fiber Striations */}
      <path
        d={`M 4,-9 L ${len * 0.36},-7 M 5,-5.5 L ${len * 0.38},-5`}
        stroke={chestStatus ? '#FFF' : '#475569'}
        strokeWidth="0.5"
        opacity="0.55"
      />

      {/* Serratus Anterior Rib Digitations */}
      <path
        d={`M ${len * 0.36},-2 L ${len * 0.46},1 M ${len * 0.42},-0.5 L ${len * 0.52},2.5 M ${len * 0.48},1 L ${len * 0.58},4`}
        stroke="#475569"
        strokeWidth="0.6"
      />

      {/* 6-Pack Rectus Abdominis & External Obliques */}
      <path
        d={`M ${len * 0.42},-11.8 C ${len * 0.65},-11.5 ${len * 0.85},-10.2 ${len * 0.94},-8.5 L ${len * 0.94},-1 C ${len * 0.7},-1 ${len * 0.5},-2 ${len * 0.42},-11.8 Z`}
        fill={
          absStatus === 'primary'
            ? `url(#${idPrefix}_muscle_primary)`
            : absStatus === 'secondary'
            ? `url(#${idPrefix}_muscle_secondary)`
            : `url(#${idPrefix}_muscle_silver)`
        }
        stroke="#475569"
        strokeWidth="0.6"
      />
      {/* Abdominal Tendinous Inscriptions */}
      <path
        d={`M ${len * 0.56},-11.2 L ${len * 0.56},-2.5 M ${len * 0.7},-10.8 L ${len * 0.7},-2 M ${len * 0.83},-10 L ${len * 0.83},-1.5`}
        stroke={absStatus ? '#FFF' : '#475569'}
        strokeWidth="0.55"
        opacity="0.65"
      />

      {/* Matte Black Shorts Waistband */}
      <rect
        x={len - 6.5}
        y="-10.2"
        width="7.5"
        height="20.4"
        rx="1.8"
        fill={`url(#${idPrefix}_shorts)`}
        stroke="#09090B"
        strokeWidth="0.6"
      />
    </g>
  );
};

/**
 * Shirtless 3D Silver-Gray Anatomical Torso (Front / 3-Quarter Front / Back View)
 * Matches IMG_2623.png (Voador / Pec Deck, Lat Pulldown, Lateral Raises, Curls, Triceps Pushdown)
 */
export const AthleteTorsoFrontBack: React.FC<{
  cx: number;
  topY: number;
  bottomY: number;
  view: 'front' | 'back';
  idPrefix: string;
  chestStatus?: 'primary' | 'secondary' | null;
  chestRegion?: 'upper' | 'mid' | 'lower' | 'all';
  backStatus?: 'primary' | 'secondary' | null;
  absStatus?: 'primary' | 'secondary' | null;
  contraction?: number;
}> = ({
  cx,
  topY,
  bottomY,
  view,
  idPrefix,
  chestStatus = null,
  chestRegion = 'all',
  backStatus = null,
  absStatus = null,
  contraction = 0.5,
}) => {
  const h = bottomY - topY;
  const activeFill =
    chestStatus === 'primary'
      ? `url(#${idPrefix}_muscle_primary)`
      : chestStatus === 'secondary'
      ? `url(#${idPrefix}_muscle_secondary)`
      : `url(#${idPrefix}_muscle_silver)`;
  const silverFill = `url(#${idPrefix}_muscle_silver)`;

  const upperChestFill =
    chestStatus && (chestRegion === 'all' || chestRegion === 'upper' || chestRegion === 'mid')
      ? activeFill
      : silverFill;
  const lowerChestFill =
    chestStatus && (chestRegion === 'all' || chestRegion === 'lower' || chestRegion === 'mid')
      ? activeFill
      : silverFill;

  return (
    <g transform={`translate(${cx}, ${topY})`}>
      {/* Sculpted V-Taper Anatomical Silver-Gray Torso */}
      <path
        d={`M -22,0 C -25.5,${h * 0.25} -18.5,${h * 0.65} -14.5,${h} L 14.5,${h} C 18.5,${h * 0.65} 25.5,${h * 0.25} 22,0 Z`}
        fill={`url(#${idPrefix}_skin)`}
        stroke="#475569"
        strokeWidth="0.8"
      />

      {view === 'front' && (
        <>
          {/* Collarbone (Clavicle) Ridge */}
          <path
            d="M -20,2.5 Q -10,4.5 -1.5,2.5 M 1.5,2.5 Q 10,4.5 20,2.5"
            stroke="#F8FAFC"
            strokeWidth="1.1"
            fill="none"
          />

          {/* Left Pectoralis Major — Upper Clavicular & Mid Sternocostal Bundle */}
          <path
            d="M -21,3.5 C -14,1.8 -4,3.5 -0.8,8.5 L -0.8,14.8 C -8,15.5 -17.5,14.2 -21.5,11.5 Z"
            fill={upperChestFill}
            stroke={chestStatus ? '#7C2D12' : '#475569'}
            strokeWidth="0.65"
          />
          {/* Left Pectoralis Major — Lower Costal Bundle (IMG_2627 Top Frame) */}
          <path
            d="M -21.5,11.5 C -17.5,14.2 -8,15.5 -0.8,14.8 L -0.8,21.5 C -8,23.8 -18.5,20.5 -21.5,13.5 Z"
            fill={lowerChestFill}
            stroke={chestStatus ? '#7C2D12' : '#475569'}
            strokeWidth="0.65"
          />

          {/* Right Pectoralis Major — Upper Clavicular & Mid Sternocostal Bundle */}
          <path
            d="M 21,3.5 C 14,1.8 4,3.5 0.8,8.5 L 0.8,14.8 C 8,15.5 17.5,14.2 21.5,11.5 Z"
            fill={upperChestFill}
            stroke={chestStatus ? '#7C2D12' : '#475569'}
            strokeWidth="0.65"
          />
          {/* Right Pectoralis Major — Lower Costal Bundle */}
          <path
            d="M 21.5,11.5 C 17.5,14.2 8,15.5 0.8,14.8 L 0.8,21.5 C 8,23.8 18.5,20.5 21.5,13.5 Z"
            fill={lowerChestFill}
            stroke={chestStatus ? '#7C2D12' : '#475569'}
            strokeWidth="0.65"
          />

          {/* White Sternal Tendon Origin & Anatomical Pectoral Fiber Striations (Exact IMG_2627 look!) */}
          <line x1="0" y1="5" x2="0" y2={h - 4} stroke="#334155" strokeWidth="0.85" />
          <path
            d="M -1.2,7.5 L -16,9.5 M -1.2,11.5 L -18,13 M -1.2,16.5 L -15,18.5 M 1.2,7.5 L 16,9.5 M 1.2,11.5 L 18,13 M 1.2,16.5 L 15,18.5"
            stroke={chestStatus ? '#FFEDD5' : '#475569'}
            strokeWidth="0.55"
            opacity={chestStatus ? 0.72 : 0.45}
          />

          {/* Serratus Anterior & External Obliques (Ribcage Sides) */}
          <path
            d={`M -18.5,22 L -11.5,26 M -17.5,27 L -11,31 M -16.5,32 L -10.5,36 M 18.5,22 L 11.5,26 M 17.5,27 L 11,31 M 16.5,32 L 10.5,36`}
            stroke="#475569"
            strokeWidth="0.6"
          />

          {/* Sculpted 6-Pack Rectus Abdominis (Always visible in silver-gray; glows orange-red when Abs are active!) */}
          <g
            fill={
              absStatus === 'primary'
                ? `url(#${idPrefix}_muscle_primary)`
                : absStatus === 'secondary'
                ? `url(#${idPrefix}_muscle_secondary)`
                : `url(#${idPrefix}_muscle_silver)`
            }
            stroke={absStatus ? '#7C2D12' : '#475569'}
            strokeWidth="0.6"
          >
            {/* Upper Abs */}
            <rect x="-9.5" y="23.5" width="8.2" height="7" rx="2.2" />
            <rect x="1.3" y="23.5" width="8.2" height="7" rx="2.2" />
            {/* Mid Abs */}
            <rect x="-9" y="32" width="7.7" height="7" rx="2" />
            <rect x="1.3" y="32" width="7.7" height="7" rx="2" />
            {/* Lower Abs */}
            <rect x="-8.2" y="40.5" width="7" height="7.5" rx="2" />
            <rect x="1.2" y="40.5" width="7" height="7.5" rx="2" />
          </g>
        </>
      )}

      {view === 'back' && (
        <>
          {/* Spine Median Furrow */}
          <line x1="0" y1="2" x2="0" y2={h - 4} stroke="#334155" strokeWidth="0.8" />
          {/* Trapezius (Upper, Middle, Lower Fibers) */}
          <path
            d="M -15,0 L 15,0 L 7,28 L 0,35 L -7,28 Z"
            fill={
              backStatus === 'primary'
                ? `url(#${idPrefix}_muscle_primary)`
                : backStatus === 'secondary'
                ? `url(#${idPrefix}_muscle_secondary)`
                : `url(#${idPrefix}_muscle_silver)`
            }
            stroke="#475569"
            strokeWidth="0.7"
          />
          {/* Left & Right Latissimus Dorsi Wings */}
          <path
            d={`M -21.5,9.5 L -7,24 L -12,${h - 5} C -17.5,${h * 0.65} -23.5,${h * 0.35} -21.5,9.5 Z`}
            fill={
              backStatus === 'primary'
                ? `url(#${idPrefix}_muscle_primary)`
                : backStatus === 'secondary'
                ? `url(#${idPrefix}_muscle_secondary)`
                : `url(#${idPrefix}_muscle_silver)`
            }
            stroke="#475569"
            strokeWidth="0.7"
          />
          <path
            d={`M 21.5,9.5 L 7,24 L 12,${h - 5} C 17.5,${h * 0.65} 23.5,${h * 0.35} 21.5,9.5 Z`}
            fill={
              backStatus === 'primary'
                ? `url(#${idPrefix}_muscle_primary)`
                : backStatus === 'secondary'
                ? `url(#${idPrefix}_muscle_secondary)`
                : `url(#${idPrefix}_muscle_silver)`
            }
            stroke="#475569"
            strokeWidth="0.7"
          />
          {/* Back Muscle Striations */}
          <path
            d="M -18,16 L -4,22 M -16,24 L -5,30 M 18,16 L 4,22 M 16,24 L 5,30"
            stroke={backStatus ? '#FFEDD5' : '#475569'}
            strokeWidth="0.55"
            opacity="0.55"
          />
        </>
      )}

      {/* Matte Black Athletic Compression Shorts Pelvis */}
      <path
        d={`M -15.5,${h - 4} L 15.5,${h - 4} L 18,${h + 15} L 2,${h + 13} L -2,${h + 13} L -18,${h + 15} Z`}
        fill={`url(#${idPrefix}_shorts)`}
        stroke="#09090B"
        strokeWidth="0.7"
      />
    </g>
  );
};

/**
 * Full Standing 3D Anatomical Écorché Figure (Front or Back View)
 * Used in ExerciseDetailModal for target muscle highlighting (Hevy style)
 */
export const BiomechanicalHuman: React.FC<{
  view: 'front' | 'back';
  pose?: 'standing';
  primaryMuscle: MuscleGroup;
  secondaryMuscles: MuscleGroup[];
  chestRegion?: 'upper' | 'mid' | 'lower' | 'all';
  phase?: number;
  x?: number;
  y?: number;
  scale?: number;
}> = ({
  view,
  primaryMuscle,
  secondaryMuscles,
  chestRegion = 'all',
  x = 110,
  y = 112,
  scale = 0.85,
}) => {
  const idPrefix = `anat_${view}_${primaryMuscle.replace(/\s+/g, '')}_${chestRegion}`;
  const chestStatus = isMuscleActive('Peito', primaryMuscle, secondaryMuscles);
  const backStatus = isMuscleActive('Costas', primaryMuscle, secondaryMuscles);
  const absStatus = isMuscleActive('Abdômen', primaryMuscle, secondaryMuscles);
  const deltStatus = isMuscleActive('Ombros', primaryMuscle, secondaryMuscles);
  const bicepsStatus = isMuscleActive('Bíceps', primaryMuscle, secondaryMuscles);
  const tricepsStatus = isMuscleActive('Tríceps', primaryMuscle, secondaryMuscles);
  const forearmStatus = isMuscleActive('Antebraços', primaryMuscle, secondaryMuscles);
  const gluteStatus = isMuscleActive('Glúteos', primaryMuscle, secondaryMuscles);
  const quadStatus = isMuscleActive('Quadríceps', primaryMuscle, secondaryMuscles);
  const hamstringStatus = isMuscleActive(
    'Posterior da coxa',
    primaryMuscle,
    secondaryMuscles
  );
  const calfStatus = isMuscleActive('Panturrilhas', primaryMuscle, secondaryMuscles);

  return (
    <g transform={`translate(${x}, ${y}) scale(${scale})`}>
      <HumanSvgDefs idPrefix={idPrefix} />
      {/* Left & Right Legs */}
      <AthleteLeg
        hx={-10}
        hy={8}
        kx={-12}
        ky={52}
        ax={-13}
        ay={94}
        idPrefix={idPrefix}
        gluteStatus={view === 'back' ? gluteStatus : null}
        quadStatus={view === 'front' ? quadStatus : null}
        hamstringStatus={view === 'back' ? hamstringStatus : null}
        calfStatus={calfStatus}
        contraction={0.8}
      />
      <AthleteLeg
        hx={10}
        hy={8}
        kx={12}
        ky={52}
        ax={13}
        ay={94}
        idPrefix={idPrefix}
        gluteStatus={view === 'back' ? gluteStatus : null}
        quadStatus={view === 'front' ? quadStatus : null}
        hamstringStatus={view === 'back' ? hamstringStatus : null}
        calfStatus={calfStatus}
        contraction={0.8}
      />
      {/* Torso */}
      <AthleteTorsoFrontBack
        cx={0}
        topY={-46}
        bottomY={6}
        view={view}
        idPrefix={idPrefix}
        chestStatus={chestStatus}
        chestRegion={chestRegion}
        backStatus={backStatus}
        absStatus={absStatus}
        contraction={0.85}
      />
      {/* Left & Right Arms */}
      <AthleteArm
        sx={-22}
        sy={-41}
        ex={-30}
        ey={-12}
        hx={-34}
        hy={16}
        idPrefix={idPrefix}
        deltStatus={deltStatus}
        bicepsStatus={view === 'front' ? bicepsStatus : null}
        tricepsStatus={view === 'back' ? tricepsStatus : null}
        forearmStatus={forearmStatus}
        contraction={0.85}
      />
      <AthleteArm
        sx={22}
        sy={-41}
        ex={30}
        ey={-12}
        hx={34}
        hy={16}
        idPrefix={idPrefix}
        deltStatus={deltStatus}
        bicepsStatus={view === 'front' ? bicepsStatus : null}
        tricepsStatus={view === 'back' ? tricepsStatus : null}
        forearmStatus={forearmStatus}
        contraction={0.85}
      />
      {/* Head */}
      <AthleteHead x={0} y={-64} facing={view} idPrefix={idPrefix} />
    </g>
  );
};

/**
 * Circular Bottom-Left Anatomical Muscle Zoom Inset Badge (Exact IMG_2627.png Overlay!)
 * Renders a dark circular frame in the bottom-left corner with a zoomed-in 3D silver-gray
 * anatomical écorché bust/legs highlighting the exact active muscle fibers in glowing red-orange.
 */
export const AnatomicalMuscleInsetBadge: React.FC<{
  exerciseId: string;
  primaryMuscle: MuscleGroup;
  secondaryMuscles: MuscleGroup[];
}> = ({ exerciseId, primaryMuscle, secondaryMuscles }) => {
  const isBackView = ['Costas', 'Posterior da coxa', 'Glúteos', 'Panturrilhas'].includes(
    primaryMuscle
  );
  const isLowerBody = [
    'Quadríceps',
    'Posterior da coxa',
    'Glúteos',
    'Panturrilhas',
  ].includes(primaryMuscle);

  // Determine specific chest fiber bundle (Upper / Mid / Lower) just like IMG_2627.png!
  const chestRegion: 'upper' | 'mid' | 'lower' | 'all' =
    exerciseId.includes('incline') || exerciseId.includes('low_cable')
      ? 'upper'
      : exerciseId.includes('high_cable') || exerciseId.includes('dips')
      ? 'lower'
      : 'all';

  const clipId = `inset_clip_${exerciseId.replace(/[^a-zA-Z0-9]/g, '')}`;

  return (
    <g transform="translate(38, 144)">
      <defs>
        <clipPath id={clipId}>
          <circle cx="0" cy="0" r="32" />
        </clipPath>
      </defs>
      {/* Outer Dark Circular Backdrop & Subtle Rim (Exact IMG_2627 bottom-left circle) */}
      <circle
        cx="0"
        cy="0"
        r="33"
        fill="#050608"
        stroke="#334155"
        strokeWidth="1.2"
      />
      <g clipPath={`url(#${clipId})`}>
        <circle cx="0" cy="0" r="32" fill="#050608" />
        <BiomechanicalHuman
          view={isBackView ? 'back' : 'front'}
          primaryMuscle={primaryMuscle}
          secondaryMuscles={secondaryMuscles}
          chestRegion={chestRegion}
          x={0}
          y={isLowerBody ? -24 : 26}
          scale={isLowerBody ? 0.68 : 0.92}
        />
      </g>
    </g>
  );
};

/**
 * Dual Front & Back Mini Anatomical Body Silhouettes (Exact IMG_2628.png Top-Right Header!)
 * Displays both Front and Back 3D silver-gray anatomical figures side-by-side, highlighting
 * the muscles worked in the active workout session.
 */
export const DualAnatomicalHeaderMiniFigures: React.FC<{
  primaryMuscles: MuscleGroup[];
  secondaryMuscles?: MuscleGroup[];
  className?: string;
}> = ({ primaryMuscles, secondaryMuscles = [], className = 'w-16 h-12' }) => {
  const leadPrimary: MuscleGroup = primaryMuscles[0] || 'Peito';
  const restMuscles: MuscleGroup[] = [
    ...primaryMuscles.slice(1),
    ...secondaryMuscles,
  ];
  return (
    <svg
      viewBox="0 0 120 110"
      className={`select-none shrink-0 ${className}`}
      aria-label="Mapa anatômico do treino"
    >
      {/* Front Mini Anatomical Body */}
      <BiomechanicalHuman
        view="front"
        primaryMuscle={leadPrimary}
        secondaryMuscles={restMuscles}
        x={34}
        y={48}
        scale={0.48}
      />
      {/* Back Mini Anatomical Body */}
      <BiomechanicalHuman
        view="back"
        primaryMuscle={leadPrimary}
        secondaryMuscles={restMuscles}
        x={88}
        y={48}
        scale={0.48}
      />
    </svg>
  );
};


