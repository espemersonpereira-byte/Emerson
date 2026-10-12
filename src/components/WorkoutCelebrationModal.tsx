import React, { useEffect, useRef, useState } from 'react';
import { Check, Flame, Sparkles, Trophy, X } from 'lucide-react';
import { CompletedWorkoutSession, WeightUnit } from '../types';
import { formatDurationSeconds } from '../utils/workoutHelpers';

interface WorkoutCelebrationModalProps {
  session: CompletedWorkoutSession | null;
  userName: string;
  weightUnit: WeightUnit;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  onClose: () => void;
}

interface FireworkParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  decay: number;
  color: string;
  size: number;
  shape: 'spark' | 'confetti';
  rotation: number;
  vRot: number;
}

interface FireworkRocket {
  x: number;
  y: number;
  targetY: number;
  vx: number;
  vy: number;
  color: string;
  exploded: boolean;
}

function playCelebrationFanfare(soundEnabled: boolean, vibrationEnabled: boolean) {
  if (vibrationEnabled && typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate([120, 60, 120, 60, 180, 80, 350]);
    } catch {
      // Ignore on unsupported devices
    }
  }

  if (soundEnabled && typeof window !== 'undefined') {
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      // Triumphant major fanfare arpeggio: C5 -> E5 -> G5 -> C6
      const notes = [
        { freq: 523.25, delay: 0.0, dur: 0.16 },
        { freq: 659.25, delay: 0.13, dur: 0.16 },
        { freq: 783.99, delay: 0.26, dur: 0.18 },
        { freq: 1046.5, delay: 0.42, dur: 0.55 },
      ];
      notes.forEach((n) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(n.freq, ctx.currentTime + n.delay);
        gain.gain.setValueAtTime(0.22, ctx.currentTime + n.delay);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + n.delay + n.dur);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + n.delay);
        osc.stop(ctx.currentTime + n.delay + n.dur + 0.02);
      });
    } catch {
      // Ignore audio errors
    }
  }
}

export const WorkoutCelebrationModal: React.FC<WorkoutCelebrationModalProps> = ({
  session,
  userName,
  weightUnit,
  soundEnabled,
  vibrationEnabled,
  onClose,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [burstTrigger, setBurstTrigger] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(7);

  // Play celebratory fanfare on mount
  useEffect(() => {
    if (!session) return;
    playCelebrationFanfare(soundEnabled, vibrationEnabled);
  }, [session, soundEnabled, vibrationEnabled]);

  // Auto-countdown timer (7 seconds of celebration, user can also close or extend anytime)
  useEffect(() => {
    if (!session) return;
    setSecondsLeft(7);
    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onClose();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [session, onClose]);

  // Interactive Fireworks & Confetti Canvas Engine
  useEffect(() => {
    if (!session) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const updateSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    updateSize();
    window.addEventListener('resize', updateSize);

    const accentHex =
      getComputedStyle(document.documentElement).getPropertyValue('--accent-500').trim() ||
      '#f97316';

    const palette = [
      accentHex,
      '#FBBF24', // Gold
      '#10B981', // Emerald
      '#38BDF8', // Sky
      '#F43F5E', // Rose
      '#A855F7', // Purple
      '#FFFFFF', // White spark
    ];

    const rockets: FireworkRocket[] = [];
    const particles: FireworkParticle[] = [];

    const explodeRocket = (x: number, y: number, baseColor: string) => {
      const count = 58;
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.25;
        const speed = 2.2 + Math.random() * 6.5;
        const color =
          Math.random() < 0.45
            ? baseColor
            : palette[Math.floor(Math.random() * palette.length)];
        particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          alpha: 1,
          decay: 0.011 + Math.random() * 0.014,
          color,
          size: 2.2 + Math.random() * 2.8,
          shape: i % 4 === 0 ? 'confetti' : 'spark',
          rotation: Math.random() * Math.PI * 2,
          vRot: (Math.random() - 0.5) * 0.2,
        });
      }
    };

    const launchSalvo = (count = 4) => {
      for (let i = 0; i < count; i++) {
        const startX = canvas.width * (0.18 + Math.random() * 0.64);
        const targetY = canvas.height * (0.14 + Math.random() * 0.36);
        rockets.push({
          x: startX,
          y: canvas.height + 10,
          targetY,
          vx: (Math.random() - 0.5) * 1.8,
          vy: -(9.5 + Math.random() * 4.5),
          color: palette[Math.floor(Math.random() * palette.length)],
          exploded: false,
        });
      }
    };

    // Initial grand salvo + immediate mid-air bursts for instant visual impact
    launchSalvo(4);
    explodeRocket(canvas.width * 0.28, canvas.height * 0.28, accentHex);
    explodeRocket(canvas.width * 0.72, canvas.height * 0.26, '#FBBF24');

    const salvoInterval = setInterval(() => {
      launchSalvo(3);
    }, 950);

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update & draw ascending rockets
      for (let i = rockets.length - 1; i >= 0; i--) {
        const r = rockets[i];
        r.x += r.vx;
        r.y += r.vy;
        r.vy += 0.12;

        // Rocket trail
        ctx.save();
        ctx.beginPath();
        ctx.arc(r.x, r.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = r.color;
        ctx.shadowColor = r.color;
        ctx.shadowBlur = 12;
        ctx.fill();
        ctx.restore();

        if (r.y <= r.targetY || r.vy >= -1) {
          explodeRocket(r.x, r.y, r.color);
          rockets.splice(i, 1);
        }
      }

      // Update & draw explosion sparks and confetti
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.975;
        p.vy = p.vy * 0.975 + 0.09; // Gravity
        p.alpha -= p.decay;
        p.rotation += p.vRot;

        if (p.alpha <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;

        if (p.shape === 'confetti') {
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);
          ctx.fillRect(-p.size * 1.4, -p.size * 0.7, p.size * 2.8, p.size * 1.4);
        } else {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      clearInterval(salvoInterval);
      window.removeEventListener('resize', updateSize);
    };
  }, [session, burstTrigger]);

  if (!session) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 select-none overflow-y-auto">
      {/* Fullscreen Fireworks Canvas */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-0"
      />

      {/* Celebration Card */}
      <div className="relative z-10 w-full max-w-md rounded-3xl bg-white/95 dark:bg-[#13151B]/95 border-2 border-orange-500 p-6 sm:p-7 text-center space-y-5 shadow-2xl shadow-orange-500/25 my-auto">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center"
          aria-label="Fechar comemoração"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Animated Trophy Emblem */}
        <div className="relative mx-auto w-24 h-24 rounded-3xl bg-orange-500 text-white flex items-center justify-center shadow-xl shadow-orange-500/40 animate-bounce">
          <Trophy className="w-12 h-12" />
          <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center shadow-md">
            <Sparkles className="w-4 h-4 fill-slate-950" />
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/15 text-orange-500 text-xs font-bold uppercase tracking-wider">
            <Flame className="w-3.5 h-3.5" />
            <span>Missão Cumprida</span>
          </div>
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white tracking-wide">
            PARABÉNS, {(userName || 'ATLETA').toUpperCase()}!
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Você concluiu o treino <strong>{session.routineName}</strong> com disciplina máxima!
          </p>
        </div>

        {/* Workout Highlights */}
        <div className="grid grid-cols-3 gap-2.5 pt-1">
          <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="text-[10px] uppercase font-bold text-slate-500">Tempo</div>
            <div className="text-base font-mono-num font-bold text-slate-900 dark:text-white mt-0.5">
              {formatDurationSeconds(session.durationSeconds)}
            </div>
          </div>
          <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="text-[10px] uppercase font-bold text-slate-500">Séries Válidas</div>
            <div className="text-base font-mono-num font-bold text-emerald-500 mt-0.5">
              {session.totalValidSets}
            </div>
          </div>
          <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="text-[10px] uppercase font-bold text-slate-500">Volume Total</div>
            <div className="text-base font-mono-num font-bold text-orange-500 mt-0.5">
              {session.totalVolumeKg} {weightUnit}
            </div>
          </div>
        </div>

        {/* Personal Records Achieved */}
        {session.personalRecords.length > 0 && (
          <div className="rounded-2xl bg-orange-500/10 border border-orange-500/30 p-3.5 text-left space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-orange-500">
              <Trophy className="w-4 h-4" />
              <span>{session.personalRecords.length} Recorde(s) Batido(s) Hoje!</span>
            </div>
            <div className="space-y-1 max-h-28 overflow-y-auto">
              {session.personalRecords.map((pr, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between text-xs text-slate-800 dark:text-slate-200"
                >
                  <span className="font-semibold truncate pr-2">{pr.exerciseName}</span>
                  <span className="font-mono-num text-orange-500 font-bold shrink-0">
                    {pr.valueText}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Celebration Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
          <button
            type="button"
            onClick={() => {
              setBurstTrigger((c) => c + 1);
              setSecondsLeft((s) => Math.max(s, 5));
              playCelebrationFanfare(soundEnabled, vibrationEnabled);
            }}
            className="min-h-[48px] px-4 rounded-2xl border border-orange-500/40 bg-orange-500/10 hover:bg-orange-500/20 text-orange-500 text-xs font-bold flex items-center justify-center gap-2 transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            <span>Soltar Mais Fogos</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="min-h-[48px] px-4 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-orange-500/25 transition-colors"
          >
            <Check className="w-4 h-4" />
            <span>Continuar ({secondsLeft}s)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
