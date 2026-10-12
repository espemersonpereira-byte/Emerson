import React, { useEffect, useState } from 'react';
import { Camera, Gauge, Pause, Play, Sparkles } from 'lucide-react';
import { Exercise } from '../types';
import {
  AnatomicalMuscleInsetBadge,
  AthleteArm,
  AthleteHead,
  AthleteLeg,
  AthleteTorsoFrontBack,
  AthleteTorsoProfile,
  HumanSvgDefs,
  isMuscleActive,
} from './BiomechanicalHuman';
import {
  DarkGymStudioEnvironment,
  HexDumbbell,
  LeatherPad,
  OlympicBarbellSide,
  PulleyWheel,
  StudioFloor,
  WeightStackTower,
} from './GymEquipmentRenderer';

interface ExerciseAnimatorProps {
  exercise: Exercise;
  compact?: boolean;
  className?: string;
}

const FREE_EXERCISE_DB_BASE =
  'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises';

const REAL_PHOTO_FOLDER_BY_ID: Record<string, string> = {
  peck_deck: 'Butterfly',
  incline_bench_press: 'Barbell_Incline_Bench_Press_-_Medium-Grip',
  flat_bench_press: 'Barbell_Bench_Press_-_Medium_Grip',
  high_cable_crossover: 'Cable_Crossover',
  low_cable_crossover: 'Low_Cable_Crossover',
  french_press: 'Seated_Triceps_Press',
  triceps_pushdown: 'Triceps_Pushdown',
  leg_extension: 'Leg_Extensions',
  leg_press_45: 'Leg_Press',
  squat: 'Barbell_Full_Squat',
  hip_abduction: 'Thigh_Abductor',
  seated_calf_raise: 'Seated_Calf_Raise',
  stationary_bike: 'Bicycling_Stationary',
  lat_pulldown: 'Wide-Grip_Lat_Pulldown',
  seated_cable_row: 'Seated_Cable_Rows',
  t_bar_row: 'Lying_T-Bar_Row',
  hammer_curl: 'Hammer_Curls',
  ez_bar_curl: 'EZ-Bar_Curl',
  lateral_raise: 'Side_Lateral_Raise',
  shoulder_press: 'Dumbbell_Shoulder_Press',
  front_raise: 'Front_Dumbbell_Raise',
  reverse_pec_deck: 'Reverse_Machine_Flyes',
  abs_crunch: 'Crunches',
  abs_leg_raise: 'Flat_Bench_Lying_Leg_Raise',
  plank: 'Plank',
  seated_leg_curl: 'Seated_Leg_Curl',
  machine_squat: 'Hack_Squat',
  bulgarian_split_squat: 'Single_Leg_Squat',
  lying_leg_curl: 'Lying_Leg_Curls',
  hip_thrust: 'Barbell_Glute_Bridge',
  abs_cable_crunch: 'Cable_Crunch',
  abs_machine: 'Ab_Crunch_Machine',
  abs_russian_twist: 'Russian_Twist',
  abs_wheel: 'Ab_Roller',
  dumbbell_bench_press: 'Dumbbell_Bench_Press',
  incline_dumbbell_press: 'Incline_Dumbbell_Press',
  push_up: 'Pushups',
  pull_up: 'Pullups',
  one_arm_dumbbell_row: 'One-Arm_Dumbbell_Row',
  straight_arm_pulldown: 'Straight-Arm_Pulldown',
  incline_dumbbell_curl: 'Incline_Dumbbell_Curl',
  preacher_curl: 'Preacher_Curl',
  skull_crusher: 'EZ-Bar_Skullcrusher',
  parallel_dips: 'Dips_-_Triceps_Version',
  wrist_curl: 'Palms-Up_Barbell_Wrist_Curl_Over_A_Bench',
  band_face_pull: 'Face_Pull',
  romanian_deadlift: 'Romanian_Deadlift',
  walking_lunge: 'Dumbbell_Lunges',
  hip_adduction: 'Thigh_Adductor',
  standing_calf_raise: 'Standing_Calf_Raises',
  treadmill_run: 'Running_Treadmill',
  conventional_deadlift: 'Barbell_Deadlift',
  kettlebell_thruster: 'Thrusters',
};

export const ExerciseAnimator: React.FC<ExerciseAnimatorProps> = ({
  exercise,
  compact = false,
  className = '',
}) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [slowMo, setSlowMo] = useState(false);
  const [viewMode, setViewMode] = useState<'studio3d' | 'realphoto'>('studio3d');
  const [photoError, setPhotoError] = useState(false);
  const [t, setT] = useState(0.35);
  const [phaseLabel, setPhaseLabel] = useState('Fase Concêntrica');

  useEffect(() => {
    setPhotoError(false);
  }, [exercise.id]);

  useEffect(() => {
    if (!isPlaying) return;
    let animId: number;
    const startTime = performance.now();

    const animate = (now: number) => {
      const cycleDuration = slowMo ? 5200 : 2600;
      const elapsed = (now - startTime) % cycleDuration;
      const normalized = elapsed / cycleDuration;

      let val = 0;
      let label = 'Posição Inicial';
      if (exercise.metricMode === 'duration_seconds') {
        val = 0.8 + 0.15 * Math.sin(normalized * Math.PI * 2);
        label = 'Sustentação Isométrica';
      } else if (exercise.metricMode === 'duration_minutes') {
        val = normalized;
        label = 'Cadência Contínua';
      } else {
        if (normalized < 0.12) {
          val = 0;
          label = 'Posição Inicial';
        } else if (normalized < 0.45) {
          const p = (normalized - 0.12) / 0.33;
          val = 0.5 - 0.5 * Math.cos(p * Math.PI);
          label = 'Fase Concêntrica';
        } else if (normalized < 0.58) {
          val = 1;
          label = 'Pico de Contração';
        } else if (normalized < 0.92) {
          const p = (normalized - 0.58) / 0.34;
          val = 0.5 + 0.5 * Math.cos(p * Math.PI);
          label = 'Fase Excêntrica';
        } else {
          val = 0;
          label = 'Posição Inicial';
        }
      }

      setT(val);
      setPhaseLabel(label);
      animId = requestAnimationFrame(animate);
    };

    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, slowMo, exercise.metricMode]);

  if (exercise.mediaUrl && exercise.mediaUrl.trim() !== '') {
    return (
      <div className={`relative overflow-hidden rounded-2xl bg-slate-900 border border-slate-800 ${className}`}>
        <img
          src={exercise.mediaUrl}
          alt={exercise.name}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.display = 'none';
          }}
        />
      </div>
    );
  }

  const idPrefix = `hevy_${exercise.id}`;
  const arch = exercise.archetype;
  const pMuscle = exercise.primaryMuscle;
  const sMuscles = exercise.secondaryMuscles;

  const chestStat = isMuscleActive('Peito', pMuscle, sMuscles);
  const backStat = isMuscleActive('Costas', pMuscle, sMuscles);
  const deltStat = isMuscleActive('Ombros', pMuscle, sMuscles);
  const bicepsStat = isMuscleActive('Bíceps', pMuscle, sMuscles);
  const tricepsStat = isMuscleActive('Tríceps', pMuscle, sMuscles);
  const forearmStat = isMuscleActive('Antebraços', pMuscle, sMuscles);
  const quadStat = isMuscleActive('Quadríceps', pMuscle, sMuscles);
  const hamStat = isMuscleActive('Posterior da coxa', pMuscle, sMuscles);
  const gluteStat = isMuscleActive('Glúteos', pMuscle, sMuscles);
  const calfStat = isMuscleActive('Panturrilhas', pMuscle, sMuscles);
  const absStat = isMuscleActive('Abdômen', pMuscle, sMuscles);

  const renderHevyStudioScene = () => {
    switch (arch) {
      case 'incline_press':
      case 'flat_press': {
        const isIncline = arch === 'incline_press';
        const lift = t * 28;
        const sx = isIncline ? 102 : 98;
        const sy = isIncline ? 92 : 114;
        const hx = isIncline ? 142 : 154;
        const hy = isIncline ? 124 : 116;
        const handX = isIncline ? 106 : 102;
        const handY = (isIncline ? 76 : 96) - lift;
        const elbowX = isIncline ? 100 : 96;
        const elbowY = (isIncline ? 106 : 124) - lift * 0.55;

        return (
          <g>
            <StudioFloor />
            {/* Power Rack Uprights */}
            <rect x="74" y="26" width="7" height="150" rx="2" fill={`url(#${idPrefix}_steel)`} />
            <rect x="66" y="170" width="98" height="6" rx="2" fill="#1E293B" />
            {/* J-Hook */}
            <path d="M 81,74 L 88,74 L 88,67" fill="none" stroke="#F97316" strokeWidth="2.5" />

            {/* Bench Support Legs */}
            <rect x="92" y={isIncline ? 112 : 124} width="6" height={isIncline ? 62 : 50} fill={`url(#${idPrefix}_steel)`} />
            <rect x="148" y="128" width="6" height="46" fill={`url(#${idPrefix}_steel)`} />

            {/* Far Arm & Leg */}
            <AthleteLeg
              hx={hx}
              hy={hy}
              kx={176}
              ky={122}
              ax={180}
              ay={169}
              idPrefix={idPrefix}
              isFar
              quadStatus={quadStat}
              contraction={t}
            />
            <AthleteArm
              sx={sx}
              sy={sy}
              ex={elbowX - 4}
              ey={elbowY - 3}
              hx={handX}
              hy={handY}
              idPrefix={idPrefix}
              isFar
              deltStatus={deltStat}
              tricepsStatus={tricepsStat}
              contraction={t}
            />

            {/* Upholstered Bench Pads */}
            {isIncline ? (
              <>
                <LeatherPad x1={78} y1={84} x2={138} y2={132} thickness={10} idPrefix={idPrefix} />
                <LeatherPad x1={138} y1={132} x2={166} y2={124} thickness={9} idPrefix={idPrefix} />
              </>
            ) : (
              <LeatherPad x1={74} y1={124} x2={170} y2={124} thickness={10} idPrefix={idPrefix} />
            )}

            {/* Athlete Head & Torso */}
            <AthleteHead
              x={isIncline ? 86 : 78}
              y={isIncline ? 76 : 110}
              angle={isIncline ? -48 : -82}
              facing="right"
              idPrefix={idPrefix}
            />
            <AthleteTorsoProfile
              sx={sx}
              sy={sy}
              hx={hx}
              hy={hy}
              idPrefix={idPrefix}
              chestStatus={chestStat}
              absStatus={absStat}
              contraction={t}
            />

            {/* Near Leg */}
            <AthleteLeg
              hx={hx}
              hy={hy}
              kx={180}
              ky={125}
              ax={184}
              ay={170}
              idPrefix={idPrefix}
              quadStatus={quadStat}
              contraction={t}
            />

            {/* Near Arm */}
            <AthleteArm
              sx={sx}
              sy={sy}
              ex={elbowX}
              ey={elbowY}
              hx={handX}
              hy={handY}
              idPrefix={idPrefix}
              deltStatus={deltStat}
              tricepsStatus={tricepsStat}
              contraction={t}
            />

            {/* Loaded Olympic Barbell */}
            <OlympicBarbellSide cx={handX} cy={handY} idPrefix={idPrefix} />
          </g>
        );
      }

      case 'peck_deck':
      case 'reverse_fly':
      case 'cable_high':
      case 'cable_low': {
        const isReverse = arch === 'reverse_fly';
        const isLow = arch === 'cable_low';
        const isPeckDeck = arch === 'peck_deck' || arch === 'reverse_fly';
        const spread = isReverse ? 12 + t * 36 : 44 - t * 30;
        const handY = isLow ? 124 - t * 36 : arch === 'cable_high' ? 68 + t * 38 : 74;
        const elbowY = isLow ? 106 - t * 18 : arch === 'cable_high' ? 76 + t * 18 : 88;

        if (isPeckDeck) {
          // Exact 3/4 Isometric Commercial Pec Deck Machine + Seated Anatomical Athlete (IMG_2623.png)
          const leftArmX = 140 - spread;
          const rightArmX = 144 + spread * 0.92;
          return (
            <g>
              <StudioFloor />

              {/* 1. Rear Left Weight Stack Cage & 3D Isometric Base Frame */}
              <WeightStackTower x={86} y={22} height={144} liftProgress={t} idPrefix={idPrefix} />

              {/* Isometric Lower Floor Stabilizer Bars connecting Weight Stack to Seat Post */}
              <path
                d="M 86,164 L 126,174 L 166,166 L 166,170 L 126,179 L 86,168 Z"
                fill={`url(#${idPrefix}_steel)`}
                stroke="#475569"
                strokeWidth="0.7"
              />
              {/* Black rubber base feet */}
              <rect x="121" y="173" width="9" height="6" rx="1.5" fill="#111827" />
              <rect x="161" y="165" width="9" height="6" rx="1.5" fill="#111827" />

              {/* Central Vertical Frame Column behind Athlete */}
              <rect
                x="133"
                y="18"
                width="7.5"
                height="156"
                fill={`url(#${idPrefix}_steel)`}
                stroke="#475569"
                strokeWidth="0.7"
              />

              {/* Overhead Cantilevered Dual-Cam Assembly (Exact top mechanism from IMG_2623) */}
              <path
                d="M 84,22 L 136,12 L 172,18 L 166,24 L 135,18 L 88,27 Z"
                fill={`url(#${idPrefix}_steel)`}
                stroke="#475569"
                strokeWidth="0.7"
              />
              {/* Dual Overhead Cam Discs */}
              <ellipse
                cx="126"
                cy="12"
                rx="11"
                ry="3.6"
                fill={`url(#${idPrefix}_steel)`}
                stroke="#475569"
                strokeWidth="0.7"
              />
              <ellipse
                cx="152"
                cy="15"
                rx="11"
                ry="3.6"
                fill={`url(#${idPrefix}_steel)`}
                stroke="#475569"
                strokeWidth="0.7"
              />

              {/* Upholstered Black Vertical Backrest Pad */}
              <rect
                x="128"
                y="60"
                width="18"
                height="56"
                rx="3"
                fill="#111827"
                stroke="#374151"
                strokeWidth="0.7"
              />

              {/* Adjustable Chrome Seat Post & Matte Black Seat Pad */}
              <rect
                x="141"
                y="126"
                width="6"
                height="44"
                fill={`url(#${idPrefix}_chrome)`}
                stroke="#475569"
                strokeWidth="0.6"
              />
              <path
                d="M 122,123 L 162,123 L 166,130 L 120,130 Z"
                fill="#111827"
                stroke="#030712"
                strokeWidth="0.7"
              />

              {/* Overhead Pivoting Silver Fly Arms dropping down to Forearm Pads */}
              <path
                d={`M 124,16 L ${leftArmX - 6},26 L ${leftArmX - 6},${elbowY + 6}`}
                fill="none"
                stroke={`url(#${idPrefix}_steel)`}
                strokeWidth="4.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d={`M 152,18 L ${rightArmX + 6},28 L ${rightArmX + 6},${elbowY + 6}`}
                fill="none"
                stroke={`url(#${idPrefix}_steel)`}
                strokeWidth="4.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Seated Anatomical Legs (3/4 Perspective with Bare Anatomical Feet on Floor) */}
              <AthleteLeg
                hx={130}
                hy={120}
                kx={124}
                ky={144}
                ax={125}
                ay={175}
                idPrefix={idPrefix}
                footAngle={98}
                quadStatus={quadStat}
                contraction={t}
              />
              <AthleteLeg
                hx={149}
                hy={118}
                kx={168}
                ky={138}
                ax={166}
                ay={171}
                idPrefix={idPrefix}
                footAngle={22}
                quadStatus={quadStat}
                contraction={t}
              />

              {/* 3D Silver-Gray Anatomical Head & Shirtless Torso */}
              <AthleteHead
                x={140}
                y={47}
                facing={isReverse ? 'back' : 'right'}
                idPrefix={idPrefix}
              />
              <AthleteTorsoFrontBack
                cx={140}
                topY={62}
                bottomY={116}
                view={isReverse ? 'back' : 'front'}
                idPrefix={idPrefix}
                chestStatus={chestStat || (!isReverse ? 'primary' : null)}
                backStatus={backStat || (isReverse ? 'primary' : null)}
                absStatus={absStat}
                contraction={t}
              />

              {/* Left & Right Articulated Anatomical Arms */}
              <AthleteArm
                sx={119}
                sy={69}
                ex={leftArmX}
                ey={elbowY}
                hx={leftArmX - 2}
                hy={handY - 12}
                idPrefix={idPrefix}
                deltStatus={deltStat || 'secondary'}
                bicepsStatus={bicepsStat}
                contraction={t}
              />
              <AthleteArm
                sx={160}
                sy={69}
                ex={rightArmX}
                ey={elbowY}
                hx={rightArmX + 2}
                hy={handY - 12}
                idPrefix={idPrefix}
                deltStatus={deltStat || 'secondary'}
                bicepsStatus={bicepsStat}
                contraction={t}
              />

              {/* Thick Black Cylindrical Pec Deck Forearm Roller Pads & Curved Handles */}
              <rect
                x={leftArmX - 10}
                y={elbowY - 16}
                width="10"
                height="24"
                rx="3.5"
                fill="#09090B"
                stroke="#27272A"
                strokeWidth="0.8"
              />
              <path
                d={`M ${leftArmX - 5},${elbowY - 16} C ${leftArmX - 5},${handY - 22} ${leftArmX + 2},${handY - 20} ${leftArmX - 2},${handY - 8}`}
                fill="none"
                stroke="#18181B"
                strokeWidth="2.2"
                strokeLinecap="round"
              />

              <rect
                x={rightArmX}
                y={elbowY - 16}
                width="10"
                height="24"
                rx="3.5"
                fill="#09090B"
                stroke="#27272A"
                strokeWidth="0.8"
              />
              <path
                d={`M ${rightArmX + 5},${elbowY - 16} C ${rightArmX + 5},${handY - 22} ${rightArmX + 12},${handY - 20} ${rightArmX + 10},${handY - 8}`}
                fill="none"
                stroke="#18181B"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
            </g>
          );
        }

        return (
          <g>
            <StudioFloor />
            {/* Dual Cable Crossover Stations */}
            <WeightStackTower x={20} y={22} height={150} liftProgress={t} idPrefix={idPrefix} />
            <WeightStackTower x={220} y={22} height={150} liftProgress={t} idPrefix={idPrefix} />
            <rect x="20" y="18" width="230" height="5.5" rx="2" fill={`url(#${idPrefix}_steel)`} stroke="#475569" strokeWidth="0.6" />
            <PulleyWheel cx={52} cy={isLow ? 160 : 30} rotation={t * 180} />
            <PulleyWheel cx={218} cy={isLow ? 160 : 30} rotation={-t * 180} />
            {/* Steel Cables */}
            <line
              x1={52}
              y1={isLow ? 160 : 30}
              x2={135 - spread}
              y2={handY}
              stroke="#475569"
              strokeWidth="1.4"
            />
            <line
              x1={218}
              y1={isLow ? 160 : 30}
              x2={135 + spread}
              y2={handY}
              stroke="#475569"
              strokeWidth="1.4"
            />

            {/* Athlete Legs */}
            <AthleteLeg
              hx={124}
              hy={118}
              kx={120}
              ky={145}
              ax={118}
              ay={170}
              idPrefix={idPrefix}
              footAngle={90}
            />
            <AthleteLeg
              hx={146}
              hy={118}
              kx={150}
              ky={145}
              ax={152}
              ay={170}
              idPrefix={idPrefix}
              footAngle={90}
            />

            {/* Athlete Head & Front/Back Torso */}
            <AthleteHead
              x={135}
              y={46}
              facing="front"
              idPrefix={idPrefix}
            />
            <AthleteTorsoFrontBack
              cx={135}
              topY={62}
              bottomY={116}
              view="front"
              idPrefix={idPrefix}
              chestStatus={chestStat || 'primary'}
              chestRegion={isLow ? 'upper' : 'lower'}
              backStatus={backStat}
              absStatus={absStat}
              contraction={t}
            />

            {/* Left & Right Articulated Arms */}
            <AthleteArm
              sx={113}
              sy={68}
              ex={135 - spread * 0.72}
              ey={elbowY}
              hx={135 - spread}
              hy={handY}
              idPrefix={idPrefix}
              deltStatus={deltStat || 'secondary'}
              bicepsStatus={bicepsStat}
              contraction={t}
            />
            <AthleteArm
              sx={157}
              sy={68}
              ex={135 + spread * 0.72}
              ey={elbowY}
              hx={135 + spread}
              hy={handY}
              idPrefix={idPrefix}
              deltStatus={deltStat || 'secondary'}
              bicepsStatus={bicepsStat}
              contraction={t}
            />

            {/* Stirrup D-Handles */}
            <rect
              x={131 - spread}
              y={handY - 6}
              width="7"
              height="12"
              rx="2"
              fill="#111827"
              stroke="#475569"
              strokeWidth="1"
            />
            <rect
              x={131 + spread}
              y={handY - 6}
              width="7"
              height="12"
              rx="2"
              fill="#111827"
              stroke="#475569"
              strokeWidth="1"
            />
          </g>
        );
      }

      case 'french_press':
      case 'triceps_pushdown': {
        const isPushdown = arch === 'triceps_pushdown';
        const sx = 114;
        const sy = 68;
        const hx = 112;
        const hy = 118;
        const elbowX = isPushdown ? 120 : 118;
        const elbowY = isPushdown ? 94 : 46;
        const angle = isPushdown ? -30 + t * 85 : 135 - t * 85;
        const rad = (angle * Math.PI) / 180;
        const handX = elbowX + Math.cos(rad) * 30;
        const handY = elbowY + Math.sin(rad) * 30;

        return (
          <g>
            <StudioFloor />
            {isPushdown && (
              <>
                <WeightStackTower x={182} y={22} height={154} liftProgress={t} idPrefix={idPrefix} />
                <rect x="148" y="20" width="62" height="6" rx="2" fill={`url(#${idPrefix}_steel)`} />
                <PulleyWheel cx={152} cy={28} rotation={t * 180} />
                <line x1={152} y1={28} x2={handX} y2={handY} stroke="#94A3B8" strokeWidth="1.8" />
              </>
            )}

            <AthleteLeg
              hx={hx - 4}
              hy={hy}
              kx={110}
              ky={144}
              ax={108}
              ay={170}
              idPrefix={idPrefix}
              isFar
            />
            <AthleteHead x={114} y={48} facing="right" idPrefix={idPrefix} />
            <AthleteTorsoProfile
              sx={sx}
              sy={sy}
              hx={hx}
              hy={hy}
              idPrefix={idPrefix}
              absStatus={absStat}
              contraction={t}
            />
            <AthleteLeg
              hx={hx}
              hy={hy}
              kx={114}
              ky={145}
              ax={112}
              ay={170}
              idPrefix={idPrefix}
            />
            <AthleteArm
              sx={sx}
              sy={sy}
              ex={elbowX}
              ey={elbowY}
              hx={handX}
              hy={handY}
              idPrefix={idPrefix}
              tricepsStatus="primary"
              deltStatus={deltStat}
              forearmStatus={forearmStat}
              contraction={t}
            />
            {isPushdown ? (
              <circle cx={handX} cy={handY} r="4.5" fill="#F97316" stroke="#0F172A" strokeWidth="1.5" />
            ) : (
              <HexDumbbell cx={handX} cy={handY} angle={angle + 90} scale={0.85} />
            )}
          </g>
        );
      }

      case 'leg_extension':
      case 'leg_curl_seated': {
        const isCurl = arch === 'leg_curl_seated';
        const sx = 92;
        const sy = 64;
        const hx = 102;
        const hy = 112;
        const kx = 144;
        const ky = 110;
        const deg = isCurl ? 12 + t * 76 : 82 - t * 72;
        const rad = (deg * Math.PI) / 180;
        const ax = kx + Math.cos(rad) * 42;
        const ay = ky + Math.sin(rad) * 42;

        return (
          <g>
            <StudioFloor />
            {/* Connected Commercial Weight Stack Tower */}
            <WeightStackTower x={36} y={26} height={150} liftProgress={t} idPrefix={idPrefix} />
            {/* Machine Frame Base & Seat Support */}
            <line x1="64" y1="168" x2="152" y2="168" stroke={`url(#${idPrefix}_steel)`} strokeWidth="6" />
            <line x1="96" y1="116" x2="88" y2="168" stroke={`url(#${idPrefix}_steel)`} strokeWidth="6" />
            <line x1="138" y1="114" x2="144" y2="168" stroke={`url(#${idPrefix}_steel)`} strokeWidth="6" />

            {/* Backrest & Seat Leather Pads */}
            <LeatherPad x1={80} y1={56} x2={96} y2={116} thickness={11} idPrefix={idPrefix} />
            <LeatherPad x1={96} y1={116} x2={144} y2={114} thickness={10} idPrefix={idPrefix} />

            {/* Athlete Head & Torso */}
            <AthleteHead x={90} y={44} facing="right" idPrefix={idPrefix} />
            <AthleteTorsoProfile sx={sx} sy={sy} hx={hx} hy={hy} idPrefix={idPrefix} contraction={t} />

            {/* Far Leg */}
            <AthleteLeg
              hx={hx}
              hy={hy - 2}
              kx={kx}
              ky={ky - 2}
              ax={ax}
              ay={ay - 2}
              idPrefix={idPrefix}
              isFar
              quadStatus={quadStat}
              hamstringStatus={hamStat}
              contraction={t}
            />

            {/* Near Leg */}
            <AthleteLeg
              hx={hx}
              hy={hy}
              kx={kx}
              ky={ky}
              ax={ax}
              ay={ay}
              idPrefix={idPrefix}
              quadStatus={quadStat}
              hamstringStatus={hamStat}
              calfStatus={calfStat}
              contraction={t}
            />

            {/* Thigh Lock Pad for Seated Leg Curl */}
            {isCurl && (
              <g>
                <line x1="124" y1="96" x2="144" y2="110" stroke="#475569" strokeWidth="3.5" />
                <circle cx="124" cy="96" r="6.5" fill="#0F172A" stroke="#94A3B8" strokeWidth="1.5" />
              </g>
            )}

            {/* Machine Cam Axis & Pivoting Roller Arm */}
            <line x1={kx} y1={ky} x2={ax} y2={ay} stroke="#94A3B8" strokeWidth="4" />
            <circle cx={kx} cy={ky} r="7" fill="#1E293B" stroke="#F97316" strokeWidth="2" />
            <circle
              cx={ax + (isCurl ? -4 : 4)}
              cy={ay}
              r="7.5"
              fill="#0F172A"
              stroke="#F97316"
              strokeWidth="1.8"
            />

            {/* Athlete Arm gripping side handle */}
            <AthleteArm
              sx={sx}
              sy={sy}
              ex={92}
              ey={94}
              hx={110}
              hy={114}
              idPrefix={idPrefix}
              contraction={t}
            />
          </g>
        );
      }

      case 'leg_press':
      case 'machine_squat': {
        const push = t * 26;
        const sledX = 148 + push;
        const sledY = 98 - push * 0.72;
        const hx = 92;
        const hy = 144;
        const kx = 114 + push * 0.35;
        const ky = 94 - push * 0.15;

        return (
          <g>
            <StudioFloor />
            {/* 45-Degree Linear Guide Rails */}
            <line x1="104" y1="138" x2="222" y2="48" stroke={`url(#${idPrefix}_chrome)`} strokeWidth="5" />
            <line x1="108" y1="143" x2="226" y2="53" stroke="#334155" strokeWidth="4" />
            <line x1="184" y1="78" x2="196" y2="174" stroke={`url(#${idPrefix}_steel)`} strokeWidth="7" />

            {/* Angled Backrest & Seat Pad */}
            <LeatherPad x1={52} y1={112} x2={88} y2={148} thickness={11} idPrefix={idPrefix} />
            <LeatherPad x1={88} y1={148} x2={110} y2={134} thickness={10} idPrefix={idPrefix} />

            {/* Far Leg */}
            <AthleteLeg
              hx={hx}
              hy={hy - 3}
              kx={kx - 3}
              ky={ky - 3}
              ax={sledX - 3}
              ay={sledY - 3}
              idPrefix={idPrefix}
              isFar
              footAngle={-40}
              quadStatus={quadStat}
              gluteStatus={gluteStat}
              contraction={t}
            />

            {/* Athlete Head & Torso */}
            <AthleteHead x={56} y={98} angle={-35} facing="right" idPrefix={idPrefix} />
            <AthleteTorsoProfile
              sx={66}
              sy={114}
              hx={hx}
              hy={hy}
              idPrefix={idPrefix}
              contraction={t}
            />

            {/* Near Leg */}
            <AthleteLeg
              hx={hx}
              hy={hy}
              kx={kx}
              ky={ky}
              ax={sledX}
              ay={sledY}
              idPrefix={idPrefix}
              footAngle={-40}
              quadStatus={quadStat}
              gluteStatus={gluteStat}
              hamstringStatus={hamStat}
              contraction={t}
            />

            {/* Athlete Arm on Safety Handle */}
            <AthleteArm sx={66} sy={114} ex={76} ey={136} hx={98} hy={138} idPrefix={idPrefix} />

            {/* Sled Carriage & Loaded Olympic Plates */}
            <LeatherPad
              x1={sledX - 10}
              y1={sledY - 16}
              x2={sledX + 14}
              y2={sledY + 16}
              thickness={8}
              idPrefix={idPrefix}
            />
            <OlympicBarbellSide cx={sledX + 18} cy={sledY - 10} idPrefix={idPrefix} />
          </g>
        );
      }

      case 'squat':
      case 'bulgarian_squat':
      case 'lunge':
      case 'full_body': {
        const isBulgarian = arch === 'bulgarian_squat';
        const depth = (1 - t) * 30;
        const hx = 114 - depth * 0.45;
        const hy = 98 + depth;
        const sx = 124 - depth * 0.15;
        const sy = 56 + depth * 0.85;
        const kx = 138 + depth * 0.35;
        const ky = 132;
        const ax = 130;
        const ay = 169;

        return (
          <g>
            <StudioFloor />
            {/* Squat Rack Upright */}
            {!isBulgarian && (
              <>
                <rect x="148" y="20" width="7" height="154" rx="2" fill={`url(#${idPrefix}_steel)`} />
                <rect x="116" y="128" width="38" height="4" rx="1" fill="#475569" />
              </>
            )}

            {/* Rear Support Bench for Bulgarian Split Squat */}
            {isBulgarian && (
              <g>
                <LeatherPad x1={54} y1={134} x2={82} y2={134} thickness={9} idPrefix={idPrefix} />
                <rect x="64" y="138" width="6" height="36" fill={`url(#${idPrefix}_steel)`} />
                <AthleteLeg
                  hx={hx}
                  hy={hy}
                  kx={92}
                  ky={136 + depth * 0.35}
                  ax={68}
                  ay={128}
                  idPrefix={idPrefix}
                  isFar
                  quadStatus={quadStat}
                  gluteStatus={gluteStat}
                  contraction={t}
                />
              </g>
            )}

            {!isBulgarian && (
              <AthleteLeg
                hx={hx - 4}
                hy={hy - 2}
                kx={kx - 4}
                ky={ky - 2}
                ax={ax - 4}
                ay={ay - 2}
                idPrefix={idPrefix}
                isFar
                quadStatus={quadStat}
                gluteStatus={gluteStat}
                contraction={t}
              />
            )}

            {/* Athlete Head & Torso */}
            <AthleteHead x={sx + 4} y={sy - 14} facing="right" idPrefix={idPrefix} />
            <AthleteTorsoProfile
              sx={sx}
              sy={sy}
              hx={hx}
              hy={hy}
              idPrefix={idPrefix}
              absStatus={absStat}
              backStatus={backStat}
              contraction={t}
            />

            {/* Primary Front Leg */}
            <AthleteLeg
              hx={hx}
              hy={hy}
              kx={kx}
              ky={ky}
              ax={ax}
              ay={ay}
              idPrefix={idPrefix}
              quadStatus={quadStat}
              gluteStatus={gluteStat}
              hamstringStatus={hamStat}
              contraction={t}
            />

            {/* Arms & Barbell or Dumbbells */}
            {isBulgarian || arch === 'lunge' ? (
              <>
                <AthleteArm
                  sx={sx}
                  sy={sy}
                  ex={sx - 2}
                  ey={sy + 24}
                  hx={sx}
                  hy={sy + 46}
                  idPrefix={idPrefix}
                />
                <HexDumbbell cx={sx} cy={sy + 48} />
              </>
            ) : (
              <>
                <AthleteArm
                  sx={sx}
                  sy={sy}
                  ex={sx - 10}
                  ey={sy + 14}
                  hx={sx - 2}
                  hy={sy - 2}
                  idPrefix={idPrefix}
                  deltStatus={deltStat}
                />
                <OlympicBarbellSide cx={sx - 2} cy={sy - 2} idPrefix={idPrefix} />
              </>
            )}
          </g>
        );
      }

      case 'abduction': {
        const spread = 12 + t * 28;
        return (
          <g>
            <StudioFloor />
            {/* Seated Hip Abduction Machine */}
            <WeightStackTower x={198} y={26} height={150} liftProgress={t} idPrefix={idPrefix} />
            <rect x="96" y="42" width="78" height="72" rx="10" fill={`url(#${idPrefix}_pad)`} stroke="#475569" strokeWidth="1.5" />

            <AthleteHead x={135} y={48} facing="front" idPrefix={idPrefix} />
            <AthleteTorsoFrontBack
              cx={135}
              topY={62}
              bottomY={110}
              view="front"
              idPrefix={idPrefix}
              contraction={t}
            />

            {/* Left & Right Thighs Opening Against Swivel Pads */}
            <AthleteLeg
              hx={120}
              hy={108}
              kx={122 - spread}
              ky={142}
              ax={120 - spread}
              ay={168}
              idPrefix={idPrefix}
              gluteStatus="primary"
              quadStatus={quadStat}
              contraction={t}
            />
            <AthleteLeg
              hx={150}
              hy={108}
              kx={148 + spread}
              ky={142}
              ax={150 + spread}
              ay={168}
              idPrefix={idPrefix}
              gluteStatus="primary"
              quadStatus={quadStat}
              contraction={t}
            />

            {/* Swivel Knee Pads */}
            <rect
              x={108 - spread}
              y="128"
              width="8"
              height="22"
              rx="3"
              fill="#0F172A"
              stroke="#F97316"
              strokeWidth="1.5"
            />
            <rect
              x={154 + spread}
              y="128"
              width="8"
              height="22"
              rx="3"
              fill="#0F172A"
              stroke="#F97316"
              strokeWidth="1.5"
            />
          </g>
        );
      }

      case 'calf_raise': {
        const rise = t * 14;
        const sx = 128;
        const sy = 56 - rise;
        const hx = 126;
        const hy = 104 - rise;
        const kx = 128;
        const ky = 136 - rise;
        const ax = 126;
        const ay = 164 - rise;

        return (
          <g>
            <StudioFloor />
            {/* Calf Machine Frame & Step Platform */}
            <WeightStackTower x={182} y={24} height={152} liftProgress={t} idPrefix={idPrefix} />
            <rect x="108" y="164" width="44" height="12" rx="2" fill="#1E293B" stroke="#475569" strokeWidth="1" />
            <LeatherPad x1={116} y1={sy - 8} x2={156} y2={sy - 8} thickness={9} idPrefix={idPrefix} />

            <AthleteHead x={sx + 2} y={sy - 16} facing="right" idPrefix={idPrefix} />
            <AthleteTorsoProfile sx={sx} sy={sy} hx={hx} hy={hy} idPrefix={idPrefix} />
            <AthleteLeg
              hx={hx}
              hy={hy}
              kx={kx}
              ky={ky}
              ax={ax}
              ay={ay}
              idPrefix={idPrefix}
              footAngle={rise * 1.8}
              calfStatus="primary"
              contraction={t}
            />
            <AthleteArm sx={sx} sy={sy} ex={136} ey={sy + 18} hx={146} hy={sy - 4} idPrefix={idPrefix} />
          </g>
        );
      }

      case 'bike':
      case 'treadmill': {
        const isTreadmill = arch === 'treadmill';
        const angle = t * Math.PI * 2;
        if (isTreadmill) {
          const stride = Math.sin(angle) * 18;
          return (
            <g>
              <StudioFloor />
              {/* Commercial Treadmill Deck & Console */}
              <path d="M 64,168 L 196,168 L 190,176 L 58,176 Z" fill="#0F172A" stroke="#475569" strokeWidth="1.5" />
              <line x1="176" y1="168" x2="162" y2="68" stroke={`url(#${idPrefix}_steel)`} strokeWidth="6" />
              <rect x="148" y="56" width="24" height="14" rx="3" fill="#1E293B" stroke="#F97316" strokeWidth="1" />

              <AthleteLeg
                hx={118}
                hy={106}
                kx={122 - stride * 0.6}
                ky={136}
                ax={118 - stride}
                ay={162}
                idPrefix={idPrefix}
                isFar
                quadStatus="secondary"
                calfStatus="secondary"
              />
              <AthleteHead x={122} y={48} facing="right" idPrefix={idPrefix} />
              <AthleteTorsoProfile sx={120} sy={64} hx={118} hy={106} idPrefix={idPrefix} />
              <AthleteLeg
                hx={118}
                hy={106}
                kx={122 + stride * 0.6}
                ky={136}
                ax={118 + stride}
                ay={162}
                idPrefix={idPrefix}
                quadStatus="secondary"
                calfStatus="secondary"
              />
              <AthleteArm
                sx={120}
                sy={64}
                ex={116 - stride * 0.4}
                ey={88}
                hx={128 - stride * 0.5}
                hy={84}
                idPrefix={idPrefix}
              />
            </g>
          );
        }

        const wheelX = 166;
        const wheelY = 142;
        const crankX = 122;
        const crankY = 142;
        const pedalX = crankX + Math.cos(angle) * 15;
        const pedalY = crankY + Math.sin(angle) * 15;
        const farPedalX = crankX - Math.cos(angle) * 15;
        const farPedalY = crankY - Math.sin(angle) * 15;

        return (
          <g>
            <StudioFloor />
            {/* Far Leg */}
            <AthleteLeg
              hx={98}
              hy={98}
              kx={120 - Math.sin(angle) * 6}
              ky={114 + Math.cos(angle) * 5}
              ax={farPedalX}
              ay={farPedalY}
              idPrefix={idPrefix}
              isFar
              quadStatus="secondary"
              calfStatus="secondary"
            />

            {/* Commercial Spin Bike Frame & Perimeter Flywheel */}
            <circle cx={wheelX} cy={wheelY} r="24" fill="#0F172A" stroke="#CBD5E1" strokeWidth="4" />
            <circle cx={wheelX} cy={wheelY} r="18" fill="none" stroke="#F97316" strokeWidth="1.5" strokeDasharray="8 6" />
            <line x1="94" y1="98" x2={crankX} y2={crankY} stroke={`url(#${idPrefix}_steel)`} strokeWidth="5" />
            <line x1={crankX} y1={crankY} x2={wheelX} y2={wheelY} stroke={`url(#${idPrefix}_steel)`} strokeWidth="5" />
            <line x1={crankX} y1={crankY} x2="154" y2="78" stroke={`url(#${idPrefix}_steel)`} strokeWidth="5" />
            <line x1="154" y1="78" x2={wheelX} y2={wheelY} stroke={`url(#${idPrefix}_steel)`} strokeWidth="4" />
            <LeatherPad x1={86} y1={98} x2={106} y2={98} thickness={7} idPrefix={idPrefix} />

            {/* Athlete Head & Torso */}
            <AthleteHead x={124} y={48} facing="right" idPrefix={idPrefix} />
            <AthleteTorsoProfile sx={118} sy={62} hx={98} hy={98} idPrefix={idPrefix} />

            {/* Near Leg Pedaling */}
            <AthleteLeg
              hx={98}
              hy={98}
              kx={124 + Math.sin(angle) * 6}
              ky={114 - Math.cos(angle) * 5}
              ax={pedalX}
              ay={pedalY}
              idPrefix={idPrefix}
              quadStatus="secondary"
              calfStatus="secondary"
            />
            <AthleteArm sx={118} sy={62} ex={134} ey={76} hx={154} hy={74} idPrefix={idPrefix} />
          </g>
        );
      }

      case 'lat_pulldown':
      case 'pullup': {
        const pull = t * 34;
        const barY = 38 + pull;
        const elbowY = 54 + pull * 1.1;

        return (
          <g>
            <StudioFloor />
            {/* Lat Pulldown Tower & Weight Stack */}
            <WeightStackTower x={34} y={22} height={154} liftProgress={t} idPrefix={idPrefix} />
            <rect x="34" y="18" width="108" height="6" rx="2" fill={`url(#${idPrefix}_steel)`} />
            <PulleyWheel cx={135} cy={24} rotation={t * 180} />
            <line x1="135" y1="24" x2="135" y2={barY} stroke="#94A3B8" strokeWidth="2" />

            {/* Wide Angled Lat Bar */}
            <path
              d={`M 84,${barY + 7} L 100,${barY} L 170,${barY} L 186,${barY + 7}`}
              fill="none"
              stroke={`url(#${idPrefix}_chrome)`}
              strokeWidth="4"
              strokeLinecap="round"
            />

            {/* Athlete Seated Back View */}
            <AthleteLeg hx={122} hy={124} kx={116} ky={148} ax={116} ay={170} idPrefix={idPrefix} footAngle={90} />
            <AthleteLeg hx={148} hy={124} kx={154} ky={148} ax={154} ay={170} idPrefix={idPrefix} footAngle={90} />
            <AthleteHead x={135} y={56} facing="back" idPrefix={idPrefix} />
            <AthleteTorsoFrontBack
              cx={135}
              topY={72}
              bottomY={124}
              view="back"
              idPrefix={idPrefix}
              backStatus="primary"
              contraction={t}
            />

            {/* Left & Right Arms Pulling Elbows Down */}
            <AthleteArm
              sx={113}
              sy={76}
              ex={92}
              ey={elbowY}
              hx={90}
              hy={barY + 4}
              idPrefix={idPrefix}
              bicepsStatus="secondary"
              deltStatus={deltStat}
              contraction={t}
            />
            <AthleteArm
              sx={157}
              sy={76}
              ex={178}
              ey={elbowY}
              hx={180}
              hy={barY + 4}
              idPrefix={idPrefix}
              bicepsStatus="secondary"
              deltStatus={deltStat}
              contraction={t}
            />
          </g>
        );
      }

      case 'seated_row':
      case 't_bar_row': {
        const pull = t * 28;
        const sx = 104 - pull * 0.2;
        const sy = 72;
        const hx = 98;
        const hy = 124;
        const handX = 148 - pull;
        const handY = 104;
        const elbowX = 124 - pull * 0.95;
        const elbowY = 102;

        return (
          <g>
            <StudioFloor />
            {/* Seated Cable Row Tower & Footplate */}
            <WeightStackTower x={198} y={24} height={152} liftProgress={t} idPrefix={idPrefix} />
            <PulleyWheel cx={190} cy={104} rotation={t * 180} />
            <line x1={190} y1={104} x2={handX} y2={handY} stroke="#94A3B8" strokeWidth="2" />
            <LeatherPad x1={74} y1={132} x2={148} y2={132} thickness={9} idPrefix={idPrefix} />
            <line x1="176" y1="116" x2="184" y2="142" stroke="#475569" strokeWidth="6" strokeLinecap="round" />

            <AthleteLeg hx={hx} hy={hy - 2} kx={138} ky={118} ax={174} ay={128} idPrefix={idPrefix} isFar footAngle={-25} />
            <AthleteHead x={sx + 2} y={sy - 16} facing="right" idPrefix={idPrefix} />
            <AthleteTorsoProfile
              sx={sx}
              sy={sy}
              hx={hx}
              hy={hy}
              idPrefix={idPrefix}
              backStatus="primary"
              contraction={t}
            />
            <AthleteLeg hx={hx} hy={hy} kx={140} ky={120} ax={176} ay={130} idPrefix={idPrefix} footAngle={-25} />
            <AthleteArm
              sx={sx}
              sy={sy}
              ex={elbowX}
              ey={elbowY}
              hx={handX}
              hy={handY}
              idPrefix={idPrefix}
              bicepsStatus="secondary"
              deltStatus={deltStat}
              contraction={t}
            />
            {/* V-Grip Triangle Handle */}
            <polygon
              points={`${handX},${handY - 6} ${handX + 8},${handY} ${handX},${handY + 6}`}
              fill="none"
              stroke={`url(#${idPrefix}_chrome)`}
              strokeWidth="2.5"
            />
          </g>
        );
      }

      case 'curl_dumbbell':
      case 'curl_bar':
      case 'forearm_curl': {
        const sx = 122;
        const sy = 64;
        const hx = 120;
        const hy = 116;
        const elbowX = 126;
        const elbowY = 94;
        const angle = 75 - t * 118;
        const rad = (angle * Math.PI) / 180;
        const handX = elbowX + Math.cos(rad) * 30;
        const handY = elbowY + Math.sin(rad) * 30;

        return (
          <g>
            <StudioFloor />
            <AthleteLeg hx={hx - 4} hy={hy} kx={118} ky={144} ax={116} ay={170} idPrefix={idPrefix} isFar />
            <AthleteHead x={sx + 2} y={sy - 16} facing="right" idPrefix={idPrefix} />
            <AthleteTorsoProfile sx={sx} sy={sy} hx={hx} hy={hy} idPrefix={idPrefix} />
            <AthleteLeg hx={hx} hy={hy} kx={122} ky={145} ax={120} ay={170} idPrefix={idPrefix} />
            <AthleteArm
              sx={sx}
              sy={sy}
              ex={elbowX}
              ey={elbowY}
              hx={handX}
              hy={handY}
              idPrefix={idPrefix}
              bicepsStatus="primary"
              forearmStatus={forearmStat || 'secondary'}
              contraction={t}
            />
            {arch === 'curl_bar' ? (
              <OlympicBarbellSide cx={handX} cy={handY} idPrefix={idPrefix} />
            ) : (
              <HexDumbbell cx={handX} cy={handY} angle={angle} scale={0.95} />
            )}
          </g>
        );
      }

      case 'lateral_raise':
      case 'front_raise':
      case 'shoulder_press': {
        const isPress = arch === 'shoulder_press';
        const liftAngle = isPress ? -10 - t * 70 : 72 - t * 74;
        const rad = (liftAngle * Math.PI) / 180;
        const armLen = isPress ? 36 : 42;
        const leftHx = 113 - Math.cos(rad) * armLen;
        const leftHy = 72 + Math.sin(rad) * armLen;
        const rightHx = 157 + Math.cos(rad) * armLen;
        const rightHy = 72 + Math.sin(rad) * armLen;

        return (
          <g>
            <StudioFloor />
            <AthleteLeg hx={123} hy={118} kx={121} ky={144} ax={120} ay={170} idPrefix={idPrefix} footAngle={90} />
            <AthleteLeg hx={147} hy={118} kx={149} ky={144} ax={150} ay={170} idPrefix={idPrefix} footAngle={90} />
            <AthleteHead x={135} y={48} facing="front" idPrefix={idPrefix} />
            <AthleteTorsoFrontBack
              cx={135}
              topY={64}
              bottomY={118}
              view="front"
              idPrefix={idPrefix}
              chestStatus={chestStat}
              contraction={t}
            />
            <AthleteArm
              sx={113}
              sy={70}
              ex={(113 + leftHx) / 2 - 4}
              ey={(70 + leftHy) / 2 + (isPress ? 10 : -2)}
              hx={leftHx}
              hy={leftHy}
              idPrefix={idPrefix}
              deltStatus="primary"
              tricepsStatus={tricepsStat}
              contraction={t}
            />
            <AthleteArm
              sx={157}
              sy={70}
              ex={(157 + rightHx) / 2 + 4}
              ey={(70 + rightHy) / 2 + (isPress ? 10 : -2)}
              hx={rightHx}
              hy={rightHy}
              idPrefix={idPrefix}
              deltStatus="primary"
              tricepsStatus={tricepsStat}
              contraction={t}
            />
            <HexDumbbell cx={leftHx} cy={leftHy} scale={0.85} />
            <HexDumbbell cx={rightHx} cy={rightHy} scale={0.85} />
          </g>
        );
      }

      case 'crunch':
      case 'leg_raise':
      case 'plank':
      case 'pushup':
      case 'dip': {
        const isPlank = arch === 'plank' || arch === 'pushup';
        const isLegRaise = arch === 'leg_raise';
        return (
          <g>
            <StudioFloor />
            {/* Cushioned Gym Mat */}
            <LeatherPad x1={38} y1={168} x2={232} y2={168} thickness={7} idPrefix={idPrefix} />

            {isPlank ? (
              <>
                <AthleteHead
                  x={74}
                  y={114 - (arch === 'pushup' ? t * 18 : 0)}
                  angle={20}
                  facing="left"
                  idPrefix={idPrefix}
                />
                <AthleteTorsoProfile
                  sx={86}
                  sy={118 - (arch === 'pushup' ? t * 18 : 0)}
                  hx={140}
                  hy={132 - (arch === 'pushup' ? t * 9 : 0)}
                  idPrefix={idPrefix}
                  absStatus={absStat || 'primary'}
                  chestStatus={chestStat}
                  contraction={t}
                />
                <AthleteLeg
                  hx={140}
                  hy={132 - (arch === 'pushup' ? t * 9 : 0)}
                  kx={172}
                  ky={146}
                  ax={202}
                  ay={160}
                  idPrefix={idPrefix}
                  footAngle={-70}
                  quadStatus={quadStat}
                  gluteStatus={gluteStat}
                />
                <AthleteArm
                  sx={86}
                  sy={118 - (arch === 'pushup' ? t * 18 : 0)}
                  ex={88}
                  ey={158}
                  hx={74}
                  hy={162}
                  idPrefix={idPrefix}
                  deltStatus={deltStat}
                  tricepsStatus={tricepsStat}
                />
              </>
            ) : isLegRaise ? (
              <>
                <AthleteHead x={68} y={148} angle={-75} facing="right" idPrefix={idPrefix} />
                <AthleteTorsoProfile
                  sx={82}
                  sy={154}
                  hx={132}
                  hy={156}
                  idPrefix={idPrefix}
                  absStatus="primary"
                  contraction={t}
                />
                <AthleteLeg
                  hx={132}
                  hy={156}
                  kx={132 + Math.cos((t * 72 * Math.PI) / 180) * 30}
                  ky={156 - Math.sin((t * 72 * Math.PI) / 180) * 30}
                  ax={132 + Math.cos((t * 72 * Math.PI) / 180) * 60}
                  ay={156 - Math.sin((t * 72 * Math.PI) / 180) * 60}
                  idPrefix={idPrefix}
                  quadStatus={quadStat}
                />
                <AthleteArm sx={82} sy={154} ex={104} ey={160} hx={126} hy={162} idPrefix={idPrefix} />
              </>
            ) : (
              <>
                {/* Crunch */}
                <AthleteHead
                  x={74 + t * 16}
                  y={142 - t * 22}
                  angle={-55 + t * 35}
                  facing="right"
                  idPrefix={idPrefix}
                />
                <AthleteTorsoProfile
                  sx={86 + t * 12}
                  sy={150 - t * 16}
                  hx={136}
                  hy={156}
                  idPrefix={idPrefix}
                  absStatus="primary"
                  contraction={t}
                />
                <AthleteLeg hx={136} hy={156} kx={164} ky={124} ax={190} ay={160} idPrefix={idPrefix} />
                <AthleteArm
                  sx={86 + t * 12}
                  sy={150 - t * 16}
                  ex={96 + t * 14}
                  ey={126 - t * 20}
                  hx={78 + t * 16}
                  hy={138 - t * 22}
                  idPrefix={idPrefix}
                />
              </>
            )}
          </g>
        );
      }

      case 'leg_curl_lying':
      case 'hip_thrust':
      case 'deadlift':
      default: {
        if (arch === 'leg_curl_lying') {
          const curlRad = ((14 + t * 76) * Math.PI) / 180;
          const kx = 166;
          const ky = 136;
          const ax = kx - Math.cos(curlRad) * 38;
          const ay = ky - Math.sin(curlRad) * 38;
          return (
            <g>
              <StudioFloor />
              <WeightStackTower x={212} y={28} height={148} liftProgress={t} idPrefix={idPrefix} />
              <LeatherPad x1={54} y1={142} x2={168} y2={136} thickness={10} idPrefix={idPrefix} />
              <rect x="74" y="144" width="6" height="30" fill={`url(#${idPrefix}_steel)`} />
              <rect x="148" y="140" width="6" height="34" fill={`url(#${idPrefix}_steel)`} />

              <AthleteHead x={62} y={128} angle={15} facing="left" idPrefix={idPrefix} />
              <AthleteTorsoProfile sx={76} sy={130} hx={126} hy={128} idPrefix={idPrefix} />
              <AthleteLeg
                hx={126}
                hy={128}
                kx={kx}
                ky={ky}
                ax={ax}
                ay={ay}
                idPrefix={idPrefix}
                hamstringStatus="primary"
                gluteStatus={gluteStat}
                calfStatus={calfStat}
                contraction={t}
              />
              <circle cx={ax} cy={ay} r="6.5" fill="#0F172A" stroke="#F97316" strokeWidth="1.8" />
            </g>
          );
        }

        if (arch === 'hip_thrust') {
          const hipY = 144 - t * 28;
          return (
            <g>
              <StudioFloor />
              {/* Hip Thrust Back Bench */}
              <rect x="52" y="114" width="38" height="60" rx="6" fill={`url(#${idPrefix}_pad)`} stroke="#475569" strokeWidth="1.5" />
              <AthleteHead x={78} y={96} angle={-40} facing="right" idPrefix={idPrefix} />
              <AthleteTorsoProfile
                sx={88}
                sy={112}
                hx={136}
                hy={hipY}
                idPrefix={idPrefix}
                absStatus={absStat}
                contraction={t}
              />
              <AthleteLeg
                hx={136}
                hy={hipY}
                kx={174}
                ky={116}
                ax={178}
                ay={169}
                idPrefix={idPrefix}
                gluteStatus="primary"
                hamstringStatus="secondary"
                contraction={t}
              />
              <AthleteArm sx={88} sy={112} ex={112} ey={124} hx={136} hy={hipY - 6} idPrefix={idPrefix} />
              <OlympicBarbellSide cx={136} cy={hipY - 8} idPrefix={idPrefix} />
            </g>
          );
        }

        // Romanian / Conventional Deadlift
        const hinge = (1 - t) * 32;
        const hx = 108 - hinge * 0.35;
        const hy = 104 + hinge * 0.15;
        const sx = 124 + hinge * 0.45;
        const sy = 62 + hinge * 0.65;
        return (
          <g>
            <StudioFloor />
            <AthleteHead x={sx + 6} y={sy - 12} angle={hinge * 0.8} facing="right" idPrefix={idPrefix} />
            <AthleteTorsoProfile
              sx={sx}
              sy={sy}
              hx={hx}
              hy={hy}
              idPrefix={idPrefix}
              backStatus={backStat || 'secondary'}
              contraction={t}
            />
            <AthleteLeg
              hx={hx}
              hy={hy}
              kx={124}
              ky={138}
              ax={122}
              ay={169}
              idPrefix={idPrefix}
              hamstringStatus="primary"
              gluteStatus="secondary"
              contraction={t}
            />
            <AthleteArm
              sx={sx}
              sy={sy}
              ex={sx}
              ey={sy + 26}
              hx={128}
              hy={112 + hinge * 0.75}
              idPrefix={idPrefix}
              forearmStatus={forearmStat}
            />
            <OlympicBarbellSide cx={128} cy={114 + hinge * 0.75} idPrefix={idPrefix} />
          </g>
        );
      }
    }
  };

  const photoFolder = REAL_PHOTO_FOLDER_BY_ID[exercise.id];
  const frameIndex = t >= 0.5 ? 1 : 0;
  const realPhotoUrl = photoFolder
    ? `${FREE_EXERCISE_DB_BASE}/${photoFolder}/${frameIndex}.jpg`
    : null;

  return (
    <div
      className={`relative overflow-hidden select-none ${
        compact
          ? 'bg-white border border-slate-200 dark:border-slate-700/80 rounded-2xl'
          : 'bg-[#0E1015] border border-slate-800 rounded-2xl'
      } ${className}`}
    >
      {viewMode === 'realphoto' && realPhotoUrl && !photoError ? (
        <img
          src={realPhotoUrl}
          alt={exercise.name}
          referrerPolicy="no-referrer"
          onError={() => setPhotoError(true)}
          className="w-full h-full object-contain bg-white"
        />
      ) : (
        <svg
          viewBox="0 0 270 188"
          className={`w-full h-full block ${compact ? 'bg-white' : 'bg-[#0E1015]'}`}
          aria-label={`Demonstração anatômica 3D de ${exercise.name}`}
        >
          <HumanSvgDefs idPrefix={idPrefix} />
          {!compact && <DarkGymStudioEnvironment idPrefix={idPrefix} />}
          {renderHevyStudioScene()}
          {!compact && (
            <AnatomicalMuscleInsetBadge
              exerciseId={exercise.id}
              primaryMuscle={pMuscle}
              secondaryMuscles={sMuscles}
            />
          )}
        </svg>
      )}

      {!compact && (
        <>
          {/* Top-Right Pause/Play Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsPlaying((prev) => !prev);
            }}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 border border-white/15 text-white flex items-center justify-center shadow-md transition-colors"
            title={isPlaying ? 'Pausar demonstração' : 'Reproduzir demonstração'}
          >
            {isPlaying ? (
              <Pause className="w-3.5 h-3.5 fill-white text-white" />
            ) : (
              <Play className="w-3.5 h-3.5 fill-white text-white ml-0.5" />
            )}
          </button>
        </>
      )}
    </div>
  );
};
