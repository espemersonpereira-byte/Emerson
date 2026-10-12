import React, { useEffect, useState } from 'react';
import {
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  Dumbbell,
  Flame,
  History,
  Info,
  Minus,
  MoreVertical,
  Pause,
  Play,
  Plus,
  SkipForward,
  Sparkles,
  Timer,
  Trash2,
  Trophy,
  X,
  Zap,
} from 'lucide-react';
import {
  ActiveWorkoutExercise,
  ActiveWorkoutSession,
  ActiveWorkoutSet,
  CompletedWorkoutSession,
  Exercise,
  MuscleGroup,
  UserProfile,
} from '../types';
import { DualAnatomicalHeaderMiniFigures } from './BiomechanicalHuman';
import { ExerciseAnimator } from './ExerciseAnimator';
import { ExerciseDetailModal } from './ExerciseDetailModal';
import {
  detectNewPersonalRecords,
  formatDurationSeconds,
  getLastSessionForExercise,
  playTimerAlert,
} from '../utils/workoutHelpers';

interface WorkoutExecutionModalProps {
  session: ActiveWorkoutSession;
  allExercises: Exercise[];
  completedSessions: CompletedWorkoutSession[];
  profile: UserProfile;
  onUpdateSession: (updated: ActiveWorkoutSession) => void;
  onFinishWorkout: (completed: CompletedWorkoutSession) => void;
  onMinimizeOrExitPartial: () => void;
  onDiscardWorkout: () => void;
  onSwapExerciseInSession?: (exerciseIndex: number) => void;
}

function formatHevyRestLabel(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins === 0) return `${secs}s`;
  return `${mins}min ${secs}s`;
}

export const WorkoutExecutionModal: React.FC<WorkoutExecutionModalProps> = ({
  session,
  allExercises,
  completedSessions,
  profile,
  onUpdateSession,
  onFinishWorkout,
  onMinimizeOrExitPartial,
  onDiscardWorkout,
}) => {
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [restRemainingSeconds, setRestRemainingSeconds] = useState<number>(0);
  const [showExitGuardModal, setShowExitGuardModal] = useState<boolean>(false);
  const [showFinishSummaryModal, setShowFinishSummaryModal] = useState<boolean>(false);
  const [focusedSetIndex, setFocusedSetIndex] = useState<number>(0);
  const [inspectExerciseId, setInspectExerciseId] = useState<string | null>(null);
  const [openMenuExerciseIdx, setOpenMenuExerciseIdx] = useState<number | null>(null);

  const unit = profile.weightUnit;
  const currentIdx = Math.min(
    Math.max(0, session.currentExerciseIndex),
    Math.max(0, session.exercises.length - 1)
  );
  const currentWorkoutEx: ActiveWorkoutExercise | undefined = session.exercises[currentIdx];
  const currentExDef: Exercise | undefined = currentWorkoutEx
    ? allExercises.find((e) => e.id === currentWorkoutEx.exerciseId)
    : undefined;

  // 1. Live Workout Elapsed Timer (Timestamp-based for background accuracy)
  useEffect(() => {
    const startMs = new Date(session.startedAt).getTime();
    const updateElapsed = () => {
      const now = Date.now();
      setElapsedSeconds(Math.max(0, Math.floor((now - startMs) / 1000)));
    };
    updateElapsed();
    const interval = setInterval(updateElapsed, 1000);
    const onVisibility = () => {
      if (document.visibilityState === 'visible') updateElapsed();
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [session.startedAt]);

  // 2. Smart Rest Countdown Timer (Timestamp-based so iOS backgrounding stays 100% accurate)
  useEffect(() => {
    const rt = session.restTimer;
    if (!rt.active) {
      setRestRemainingSeconds(0);
      return;
    }
    if (rt.paused) {
      setRestRemainingSeconds(Math.ceil(rt.remainingWhenPausedMs / 1000));
      return;
    }

    const syncRest = () => {
      if (!rt.targetEndTimestamp) return;
      const diffMs = rt.targetEndTimestamp - Date.now();
      if (diffMs <= 0) {
        setRestRemainingSeconds(0);
        playTimerAlert(profile.soundEnabled, profile.vibrationEnabled);
        onUpdateSession({
          ...session,
          restTimer: {
            ...rt,
            active: false,
            paused: false,
            targetEndTimestamp: null,
            remainingWhenPausedMs: 0,
          },
        });
      } else {
        setRestRemainingSeconds(Math.ceil(diffMs / 1000));
      }
    };

    syncRest();
    const interval = setInterval(syncRest, 250);
    const onVisibility = () => {
      if (document.visibilityState === 'visible') syncRest();
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [
    session,
    session.restTimer,
    profile.soundEnabled,
    profile.vibrationEnabled,
    onUpdateSession,
  ]);

  // Keep focusedSetIndex pointing to first incomplete set when switching exercise
  useEffect(() => {
    if (!currentWorkoutEx) return;
    const firstPending = currentWorkoutEx.sets.findIndex((s) => !s.completed);
    setFocusedSetIndex(
      firstPending >= 0 ? firstPending : Math.max(0, currentWorkoutEx.sets.length - 1)
    );
  }, [currentIdx, currentWorkoutEx?.id]);

  if (!currentWorkoutEx || !currentExDef) {
    return null;
  }

  // Start or restart rest timer
  const startRestTimer = (
    durationSec: number,
    exId: string = currentExDef.id,
    exName: string = currentExDef.name
  ) => {
    const safeSec = Math.max(5, durationSec);
    onUpdateSession({
      ...session,
      restTimer: {
        active: true,
        paused: false,
        targetEndTimestamp: Date.now() + safeSec * 1000,
        remainingWhenPausedMs: safeSec * 1000,
        totalDurationSeconds: safeSec,
        exerciseId: exId,
        exerciseName: exName,
      },
    });
  };

  const togglePauseRestTimer = () => {
    const rt = session.restTimer;
    if (!rt.active) return;
    if (rt.paused) {
      onUpdateSession({
        ...session,
        restTimer: {
          ...rt,
          paused: false,
          targetEndTimestamp: Date.now() + rt.remainingWhenPausedMs,
        },
      });
    } else {
      const rem = rt.targetEndTimestamp
        ? Math.max(0, rt.targetEndTimestamp - Date.now())
        : 0;
      onUpdateSession({
        ...session,
        restTimer: {
          ...rt,
          paused: true,
          targetEndTimestamp: null,
          remainingWhenPausedMs: rem,
        },
      });
    }
  };

  const adjustRestTimerSeconds = (deltaSec: number) => {
    const rt = session.restTimer;
    if (!rt.active) return;
    const deltaMs = deltaSec * 1000;
    if (rt.paused) {
      const nextRem = Math.max(1000, rt.remainingWhenPausedMs + deltaMs);
      onUpdateSession({
        ...session,
        restTimer: {
          ...rt,
          remainingWhenPausedMs: nextRem,
          totalDurationSeconds: Math.max(
            rt.totalDurationSeconds,
            Math.ceil(nextRem / 1000)
          ),
        },
      });
    } else if (rt.targetEndTimestamp) {
      const nextTarget = Math.max(Date.now() + 1000, rt.targetEndTimestamp + deltaMs);
      const nextRemSec = Math.ceil((nextTarget - Date.now()) / 1000);
      onUpdateSession({
        ...session,
        restTimer: {
          ...rt,
          targetEndTimestamp: nextTarget,
          totalDurationSeconds: Math.max(rt.totalDurationSeconds, nextRemSec),
        },
      });
    }
  };

  const stopRestTimer = () => {
    onUpdateSession({
      ...session,
      restTimer: {
        ...session.restTimer,
        active: false,
        paused: false,
        targetEndTimestamp: null,
        remainingWhenPausedMs: 0,
      },
    });
  };

  // Multi-exercise helper functions (work for any exercise index in the vertical list OR currentIdx in Gym Mode)
  const updateExerciseSet = (
    exIdx: number,
    setIdx: number,
    partial: Partial<ActiveWorkoutSet>
  ) => {
    const nextExercises = session.exercises.map((ex, idx) => {
      if (idx !== exIdx) return ex;
      const nextSets = ex.sets.map((s, sIdx) =>
        sIdx === setIdx ? { ...s, ...partial } : s
      );
      return { ...ex, sets: nextSets };
    });
    onUpdateSession({ ...session, exercises: nextExercises });
  };

  const toggleSetWarmupOrValid = (exIdx: number, setIdx: number) => {
    const ex = session.exercises[exIdx];
    if (!ex) return;
    const target = ex.sets[setIdx];
    if (!target) return;
    const nextType: 'valid' | 'warmup' = target.type === 'warmup' ? 'valid' : 'warmup';
    updateExerciseSet(exIdx, setIdx, { type: nextType });
  };

  const toggleCompleteExerciseSet = (exIdx: number, setIdx: number) => {
    const targetEx = session.exercises[exIdx];
    if (!targetEx) return;
    const targetSet = targetEx.sets[setIdx];
    if (!targetSet) return;
    const exDef =
      allExercises.find((e) => e.id === targetEx.exerciseId) || currentExDef;
    const nextCompleted = !targetSet.completed;

    const nextExercises = session.exercises.map((ex, idx) => {
      if (idx !== exIdx) return ex;
      const nextSets = ex.sets.map((s, sIdx) =>
        sIdx === setIdx
          ? {
              ...s,
              completed: nextCompleted,
              completedAt: nextCompleted ? new Date().toISOString() : undefined,
            }
          : s
      );
      return { ...ex, skipped: false, sets: nextSets };
    });

    if (nextCompleted) {
      const restSec = targetEx.restSeconds || profile.defaultRestSeconds || 60;
      onUpdateSession({
        ...session,
        currentExerciseIndex: exIdx,
        exercises: nextExercises,
        restTimer: {
          active: true,
          paused: false,
          targetEndTimestamp: Date.now() + restSec * 1000,
          remainingWhenPausedMs: restSec * 1000,
          totalDurationSeconds: restSec,
          exerciseId: exDef.id,
          exerciseName: exDef.name,
        },
      });
      if (exIdx === currentIdx) {
        const nextPending = nextExercises[exIdx].sets.findIndex(
          (s, idx) => idx > setIdx && !s.completed
        );
        if (nextPending >= 0) {
          setFocusedSetIndex(nextPending);
        }
      }
    } else {
      onUpdateSession({ ...session, exercises: nextExercises });
    }
  };

  const addExerciseSet = (exIdx: number, type: 'valid' | 'warmup') => {
    const targetEx = session.exercises[exIdx];
    if (!targetEx) return;
    const exDef =
      allExercises.find((e) => e.id === targetEx.exerciseId) || currentExDef;
    const validSets = targetEx.sets.filter((s) => s.type === 'valid');
    const lastSet = validSets[validSets.length - 1] || targetEx.sets[0];
    const newSet: ActiveWorkoutSet = {
      id: `set_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      type,
      weight:
        type === 'warmup'
          ? Math.round((lastSet?.weight || exDef.defaultWeight) * 0.65)
          : lastSet?.weight ?? exDef.defaultWeight,
      reps: lastSet?.reps ?? exDef.defaultMaxReps,
      completed: false,
    };

    const nextSets =
      type === 'warmup'
        ? [
            ...targetEx.sets.filter((s) => s.type === 'warmup'),
            newSet,
            ...targetEx.sets.filter((s) => s.type === 'valid'),
          ]
        : [...targetEx.sets, newSet];

    const nextExercises = session.exercises.map((ex, idx) =>
      idx === exIdx ? { ...ex, sets: nextSets } : ex
    );
    onUpdateSession({ ...session, exercises: nextExercises });
  };

  const removeExerciseSet = (exIdx: number, setIdx: number) => {
    const targetEx = session.exercises[exIdx];
    if (!targetEx || targetEx.sets.length <= 1) return;
    const nextSets = targetEx.sets.filter((_, i) => i !== setIdx);
    const nextExercises = session.exercises.map((ex, idx) =>
      idx === exIdx ? { ...ex, sets: nextSets } : ex
    );
    onUpdateSession({ ...session, exercises: nextExercises });
  };

  const applyLastSessionToExercise = (exIdx: number, plusWeight: number = 0) => {
    const targetEx = session.exercises[exIdx];
    if (!targetEx) return;
    const lastPerfForEx = getLastSessionForExercise(
      targetEx.exerciseId,
      completedSessions,
      allExercises
    );
    if (!lastPerfForEx) return;
    let validCounter = 0;
    const nextSets = targetEx.sets.map((s) => {
      if (s.type === 'warmup') return s;
      const refSet =
        lastPerfForEx.validSets[validCounter] ||
        lastPerfForEx.validSets[lastPerfForEx.validSets.length - 1];
      validCounter++;
      if (!refSet || s.completed) return s;
      return {
        ...s,
        weight: Math.max(0, refSet.weight + plusWeight),
        reps: refSet.reps,
      };
    });

    const nextExercises = session.exercises.map((ex, idx) =>
      idx === exIdx ? { ...ex, sets: nextSets } : ex
    );
    onUpdateSession({ ...session, exercises: nextExercises });
  };

  const toggleSkipExercise = (exIdx: number) => {
    const nextExercises = session.exercises.map((ex, idx) =>
      idx === exIdx ? { ...ex, skipped: !ex.skipped } : ex
    );
    onUpdateSession({ ...session, exercises: nextExercises });
  };

  // Compute live session stats (excluding warmup sets from effective volume & valid sets!)
  const totalValidSetsCompleted = session.exercises.reduce((acc, ex) => {
    if (ex.skipped) return acc;
    return acc + ex.sets.filter((s) => s.type === 'valid' && s.completed).length;
  }, 0);

  const totalEffectiveVolume = session.exercises.reduce((acc, ex) => {
    if (ex.skipped) return acc;
    const exDef = allExercises.find((e) => e.id === ex.exerciseId);
    if (exDef && exDef.metricMode !== 'reps_weight') return acc;
    return (
      acc +
      ex.sets
        .filter((s) => s.type === 'valid' && s.completed)
        .reduce((sum, s) => sum + (Number(s.weight) || 0) * (Number(s.reps) || 0), 0)
    );
  }, 0);

  const exercisesCompletedCount = session.exercises.filter(
    (ex) => !ex.skipped && ex.sets.some((s) => s.type === 'valid' && s.completed)
  ).length;

  // Gather active muscles for the top-right Dual Mini Anatomical Figures (IMG_2628.png)
  const workoutPrimaryMuscles: MuscleGroup[] = [];
  const workoutSecondaryMuscles: MuscleGroup[] = [];
  session.exercises.forEach((exItem) => {
    if (exItem.skipped) return;
    const def = allExercises.find((e) => e.id === exItem.exerciseId);
    if (!def) return;
    if (!workoutPrimaryMuscles.includes(def.primaryMuscle)) {
      workoutPrimaryMuscles.push(def.primaryMuscle);
    }
    def.secondaryMuscles.forEach((sm) => {
      if (!workoutSecondaryMuscles.includes(sm)) {
        workoutSecondaryMuscles.push(sm);
      }
    });
  });

  const handleConfirmFinish = () => {
    const prs = detectNewPersonalRecords(
      session.exercises,
      completedSessions,
      allExercises,
      unit
    );
    const nowIso = new Date().toISOString();
    const completed: CompletedWorkoutSession = {
      id: `sess_${Date.now()}`,
      routineId: session.routineId,
      routineName: session.routineName,
      date: nowIso.split('T')[0],
      startedAt: session.startedAt,
      finishedAt: nowIso,
      durationSeconds: Math.max(60, elapsedSeconds),
      exercises: session.exercises,
      totalValidSets: totalValidSetsCompleted,
      totalVolumeKg: totalEffectiveVolume,
      notes: session.notes,
      personalRecords: prs,
    };
    onFinishWorkout(completed);
  };

  // Current exercise sets for Gym Mode
  const lastPerfCurrent = getLastSessionForExercise(
    currentExDef.id,
    completedSessions,
    allExercises
  );
  let validNumberCounter = 0;
  const numberedSetsCurrent = currentWorkoutEx.sets.map((s, idx) => {
    if (s.type === 'warmup') {
      return { ...s, index: idx, displayBadge: 'W', validIndex: -1 };
    }
    validNumberCounter++;
    return {
      ...s,
      index: idx,
      displayBadge: String(validNumberCounter),
      validIndex: validNumberCounter - 1,
    };
  });
  const activeGymSet =
    numberedSetsCurrent[
      Math.min(focusedSetIndex, numberedSetsCurrent.length - 1)
    ] || numberedSetsCurrent[0];
  const metricLabelCurrent =
    currentExDef.metricMode === 'duration_seconds'
      ? 'Segundos'
      : currentExDef.metricMode === 'duration_minutes'
      ? 'Minutos'
      : 'Repetições';

  return (
    <div className="fixed inset-0 z-50 bg-[#F8FAFC] dark:bg-[#050608] text-slate-900 dark:text-slate-100 flex flex-col overflow-hidden">
      {/* =====================================================================
          1. TOP HEADER BAR + SUB-HEADER STATS & DUAL ANATOMICAL FIGURES (IMG_2628.png)
      ====================================================================== */}
      <header className="shrink-0 bg-white dark:bg-[#0B0C10] border-b border-slate-200 dark:border-slate-800/80 pt-safe">
        {/* Row 1: Down Chevron + "Treino" | Stopwatch + Modo Academia + "Concluir" */}
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800/70">
          <button
            type="button"
            onClick={() => setShowExitGuardModal(true)}
            className="min-h-[42px] px-2 -ml-2 rounded-xl flex items-center gap-2 text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors"
          >
            <ChevronDown className="w-6 h-6 text-slate-500 dark:text-slate-300" />
            <div className="text-left">
              <span className="text-lg font-semibold tracking-tight block leading-none">
                Treino
              </span>
              <span className="text-[10px] text-slate-400 font-medium truncate max-w-[140px] sm:max-w-[240px] block mt-0.5">
                {session.routineName}
              </span>
            </div>
          </button>

          <div className="flex items-center gap-2 shrink-0">
            {/* Toggle Modo Academia (Foco Gigante) vs Lista Completa Hevy */}
            <button
              type="button"
              onClick={() =>
                onUpdateSession({ ...session, gymMode: !session.gymMode })
              }
              className={`min-h-[38px] px-2.5 rounded-xl border text-xs font-semibold flex items-center gap-1 transition-colors ${
                session.gymMode
                  ? 'border-orange-500 bg-orange-500/15 text-orange-500'
                  : 'border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-[#15171E] text-slate-600 dark:text-slate-300'
              }`}
              title="Alternar entre Lista Completa (estilo Hevy) e Modo Academia (botões gigantes)"
            >
              <Zap className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">
                {session.gymMode ? 'Lista Hevy' : 'Modo Academia'}
              </span>
            </button>

            {/* Stopwatch Quick Rest Trigger (Exact IMG_2628 icon next to Concluir) */}
            <button
              type="button"
              onClick={() => {
                if (session.restTimer.active) {
                  togglePauseRestTimer();
                } else {
                  startRestTimer(
                    currentWorkoutEx.restSeconds || profile.defaultRestSeconds || 60
                  );
                }
              }}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors relative ${
                session.restTimer.active
                  ? 'bg-orange-500/20 text-orange-500 border border-orange-500/40'
                  : 'text-slate-600 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/70'
              }`}
              title="Cronômetro de descanso"
            >
              <Timer className="w-6 h-6" />
              {session.restTimer.active && (
                <span className="absolute -top-1 -right-1 px-1 py-0.2 rounded-full bg-orange-500 text-white text-[9px] font-mono-num font-bold">
                  {restRemainingSeconds}s
                </span>
              )}
            </button>

            {/* Solid Accent "Concluir" Button (Exact IMG_2628 top-right button) */}
            <button
              type="button"
              onClick={() => setShowFinishSummaryModal(true)}
              className="min-h-[38px] px-4 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold shadow-sm transition-colors"
            >
              Concluir
            </button>
          </div>
        </div>

        {/* Row 2: Duração | Volume | Séries + Dual Mini Anatomical Figures (Exact IMG_2628 sub-bar) */}
        <div className="max-w-3xl mx-auto px-4 py-2.5 flex items-center justify-between gap-4">
          <div className="grid grid-cols-3 gap-6 sm:gap-12 flex-1">
            <div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                Duração
              </div>
              <div className="text-base sm:text-lg font-mono-num font-semibold text-orange-500 mt-0.5">
                {formatDurationSeconds(elapsedSeconds)}
              </div>
            </div>

            <div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                Volume
              </div>
              <div className="text-base sm:text-lg font-mono-num font-semibold text-slate-900 dark:text-white mt-0.5">
                {totalEffectiveVolume.toLocaleString('pt-BR')} {unit}
              </div>
            </div>

            <div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                Séries
              </div>
              <div className="text-base sm:text-lg font-mono-num font-semibold text-slate-900 dark:text-white mt-0.5">
                {totalValidSetsCompleted}
              </div>
            </div>
          </div>

          {/* Front & Back Mini Anatomical Body Silhouettes (IMG_2628 top-right) */}
          <DualAnatomicalHeaderMiniFigures
            primaryMuscles={workoutPrimaryMuscles}
            secondaryMuscles={workoutSecondaryMuscles}
            className="w-16 h-12"
          />
        </div>
      </header>

      {/* =====================================================================
          2. MAIN SCROLLABLE WORKOUT AREA
      ====================================================================== */}
      <div className="flex-1 overflow-y-auto px-4 py-4 pb-32">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Active Rest Timer Floating Bar when Running */}
          {session.restTimer.active && (
            <div className="rounded-2xl bg-slate-900 dark:bg-[#13151C] border border-orange-500/80 p-3.5 text-white shadow-xl">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center shrink-0">
                    <Timer className="w-5 h-5 text-orange-400" />
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-orange-400 font-semibold">
                      Cronômetro de Descanso{' '}
                      {session.restTimer.paused ? '(Pausado)' : ''}
                    </div>
                    <div className="text-2xl font-mono-num font-bold tracking-tight">
                      {formatDurationSeconds(restRemainingSeconds)}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-end gap-1.5">
                  <button
                    type="button"
                    onClick={() => adjustRestTimerSeconds(-15)}
                    className="min-h-[38px] px-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-mono-num font-semibold"
                  >
                    -15s
                  </button>
                  <button
                    type="button"
                    onClick={() => adjustRestTimerSeconds(15)}
                    className="min-h-[38px] px-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-mono-num font-semibold"
                  >
                    +15s
                  </button>
                  <button
                    type="button"
                    onClick={togglePauseRestTimer}
                    className="min-h-[38px] min-w-[38px] rounded-xl bg-slate-800 hover:bg-slate-700 flex items-center justify-center"
                    title={session.restTimer.paused ? 'Retomar' : 'Pausar'}
                  >
                    {session.restTimer.paused ? (
                      <Play className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Pause className="w-4 h-4 text-amber-400" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={stopRestTimer}
                    className="min-h-[38px] px-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-xs font-bold text-white"
                  >
                    Pular
                  </button>
                </div>
              </div>
            </div>
          )}

          {session.gymMode ? (
            /* =================================================================
               MODO ACADEMIA (20.2) — FOCO EM UM EXERCÍCIO COM BOTÕES GIGANTES
            ================================================================== */
            <div className="space-y-4">
              {/* Exercise Selector Strip */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
                {session.exercises.map((exItem, idx) => {
                  const exObj = allExercises.find((e) => e.id === exItem.exerciseId);
                  const allValidDone =
                    exItem.sets.filter((s) => s.type === 'valid').length > 0 &&
                    exItem.sets
                      .filter((s) => s.type === 'valid')
                      .every((s) => s.completed);
                  const isCurrent = idx === currentIdx;
                  return (
                    <button
                      key={exItem.id}
                      type="button"
                      onClick={() =>
                        onUpdateSession({ ...session, currentExerciseIndex: idx })
                      }
                      className={`min-h-[34px] px-3 py-1 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                        isCurrent
                          ? 'bg-orange-500 text-white font-semibold'
                          : allValidDone
                          ? 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/30'
                          : 'bg-slate-200/70 dark:bg-slate-900 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <span className="font-mono-num">{idx + 1}.</span>
                      <span className="max-w-[130px] truncate">
                        {exObj?.name || 'Exercício'}
                      </span>
                      {allValidDone && <Check className="w-3.5 h-3.5 shrink-0" />}
                    </button>
                  );
                })}
              </div>

              {/* 3D Dark Gym Demonstration Stage (IMG_2627.png) */}
              <div className="rounded-3xl bg-white dark:bg-[#11131A] border border-slate-200 dark:border-slate-800 p-4 space-y-3">
                <div
                  onClick={() => setInspectExerciseId(currentExDef.id)}
                  className="cursor-pointer"
                >
                  <ExerciseAnimator
                    exercise={currentExDef}
                    className="h-56 sm:h-64 w-full"
                  />
                </div>
                <div className="flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setInspectExerciseId(currentExDef.id)}
                    className="text-left font-display text-2xl font-bold text-orange-500 hover:underline flex items-center gap-1.5"
                  >
                    <span>{currentExDef.name}</span>
                    <ChevronRight className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setInspectExerciseId(currentExDef.id)}
                    className="min-h-[36px] px-3 rounded-xl bg-orange-500/10 text-orange-500 text-xs font-bold flex items-center gap-1"
                  >
                    <Info className="w-3.5 h-3.5" />
                    <span>Detalhes</span>
                  </button>
                </div>
              </div>

              {/* Giant Controls Card */}
              <div className="rounded-3xl bg-white dark:bg-[#11131A] border-2 border-orange-500/40 p-5 space-y-5 shadow-lg">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                    {numberedSetsCurrent.map((s) => {
                      const isSel = s.index === activeGymSet.index;
                      return (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => setFocusedSetIndex(s.index)}
                          className={`min-h-[48px] px-4 rounded-2xl font-mono-num text-sm font-bold flex items-center gap-1.5 transition-all shrink-0 ${
                            isSel
                              ? 'bg-orange-500 text-white shadow-md shadow-orange-500/25 scale-105'
                              : s.completed
                              ? 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/30'
                              : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          <span>
                            {s.type === 'warmup'
                              ? 'Aquec. W'
                              : `Série ${s.displayBadge}`}
                          </span>
                          {s.completed && <Check className="w-4 h-4" />}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    type="button"
                    onClick={() => addExerciseSet(currentIdx, 'valid')}
                    className="min-h-[48px] px-3.5 rounded-2xl bg-slate-100 dark:bg-slate-900 hover:bg-orange-500/15 text-orange-500 text-xs font-bold flex items-center gap-1 shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+Série</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {currentExDef.metricMode === 'reps_weight' && (
                    <div className="rounded-2xl bg-slate-50 dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                          Carga ({unit})
                        </span>
                        {lastPerfCurrent &&
                          activeGymSet.validIndex >= 0 &&
                          lastPerfCurrent.validSets[activeGymSet.validIndex] && (
                            <button
                              type="button"
                              onClick={() =>
                                updateExerciseSet(currentIdx, activeGymSet.index, {
                                  weight:
                                    lastPerfCurrent.validSets[activeGymSet.validIndex]
                                      .weight,
                                })
                              }
                              className="text-xs font-mono-num text-orange-500 hover:underline"
                            >
                              Última:{' '}
                              {
                                lastPerfCurrent.validSets[activeGymSet.validIndex]
                                  .weight
                              }{' '}
                              {unit}
                            </button>
                          )}
                      </div>

                      <div className="flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            updateExerciseSet(currentIdx, activeGymSet.index, {
                              weight: Math.max(
                                0,
                                Number(activeGymSet.weight || 0) - 2.5
                              ),
                              userEditedWeight: true,
                            })
                          }
                          className="min-h-[56px] min-w-[56px] rounded-2xl bg-white dark:bg-[#13151B] border border-slate-200 dark:border-slate-800 flex items-center justify-center text-lg font-mono-num font-bold active:scale-95"
                        >
                          -2.5
                        </button>

                        <input
                          type="number"
                          step="0.5"
                          value={activeGymSet.weight}
                          onChange={(e) =>
                            updateExerciseSet(currentIdx, activeGymSet.index, {
                              weight: Math.max(0, Number(e.target.value)),
                              userEditedWeight: true,
                            })
                          }
                          className="w-full text-center text-4xl font-mono-num font-bold bg-transparent text-slate-900 dark:text-white focus:outline-none"
                        />

                        <button
                          type="button"
                          onClick={() =>
                            updateExerciseSet(currentIdx, activeGymSet.index, {
                              weight: Number(activeGymSet.weight || 0) + 2.5,
                              userEditedWeight: true,
                            })
                          }
                          className="min-h-[56px] min-w-[56px] rounded-2xl bg-white dark:bg-[#13151B] border border-slate-200 dark:border-slate-800 flex items-center justify-center text-lg font-mono-num font-bold active:scale-95"
                        >
                          +2.5
                        </button>
                      </div>
                    </div>
                  )}

                  <div
                    className={`rounded-2xl bg-slate-50 dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 ${
                      currentExDef.metricMode !== 'reps_weight' ? 'sm:col-span-2' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        {metricLabelCurrent}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          updateExerciseSet(currentIdx, activeGymSet.index, {
                            reps: Math.max(1, Number(activeGymSet.reps || 0) - 1),
                            userEditedReps: true,
                          })
                        }
                        className="min-h-[56px] min-w-[56px] rounded-2xl bg-white dark:bg-[#13151B] border border-slate-200 dark:border-slate-800 flex items-center justify-center text-xl font-mono-num font-bold active:scale-95"
                      >
                        <Minus className="w-5 h-5" />
                      </button>

                      <input
                        type="number"
                        value={activeGymSet.reps}
                        onChange={(e) =>
                          updateExerciseSet(currentIdx, activeGymSet.index, {
                            reps: Math.max(0, Number(e.target.value)),
                            userEditedReps: true,
                          })
                        }
                        className="w-full text-center text-4xl font-mono-num font-bold bg-transparent text-slate-900 dark:text-white focus:outline-none"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          updateExerciseSet(currentIdx, activeGymSet.index, {
                            reps: Number(activeGymSet.reps || 0) + 1,
                            userEditedReps: true,
                          })
                        }
                        className="min-h-[56px] min-w-[56px] rounded-2xl bg-white dark:bg-[#13151B] border border-slate-200 dark:border-slate-800 flex items-center justify-center text-xl font-mono-num font-bold active:scale-95"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    toggleCompleteExerciseSet(currentIdx, activeGymSet.index)
                  }
                  className={`w-full min-h-[60px] rounded-2xl font-display text-2xl font-bold tracking-wide flex items-center justify-center gap-3 transition-all shadow-lg ${
                    activeGymSet.completed
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                      : 'bg-orange-500 hover:bg-orange-600 text-white shadow-orange-500/25'
                  }`}
                >
                  <Check className="w-7 h-7" />
                  <span>
                    {activeGymSet.completed
                      ? `SÉRIE ${activeGymSet.displayBadge} CONCLUÍDA`
                      : `CONCLUIR SÉRIE ${activeGymSet.displayBadge}`}
                  </span>
                </button>
              </div>
            </div>
          ) : (
            /* =================================================================
               MODO HEVY (IMG_2628.png) — LISTA VERTICAL DE TODOS OS EXERCÍCIOS DO TREINO
            ================================================================== */
            <div className="space-y-8 divide-y divide-slate-200 dark:divide-slate-800/70">
              {session.exercises.map((workoutEx, exIdx) => {
                const exDef =
                  allExercises.find((e) => e.id === workoutEx.exerciseId) ||
                  currentExDef;
                const lastPerfEx = getLastSessionForExercise(
                  exDef.id,
                  completedSessions,
                  allExercises
                );

                let vCounter = 0;
                const rows = workoutEx.sets.map((s, sIdx) => {
                  if (s.type === 'warmup') {
                    return {
                      ...s,
                      index: sIdx,
                      displayBadge: 'W',
                      validIndex: -1,
                    };
                  }
                  vCounter++;
                  return {
                    ...s,
                    index: sIdx,
                    displayBadge: String(vCounter),
                    validIndex: vCounter - 1,
                  };
                });

                const restSeconds = workoutEx.restSeconds || 60;
                const isMenuOpen = openMenuExerciseIdx === exIdx;

                return (
                  <div
                    key={workoutEx.id || exIdx}
                    className={`pt-6 first:pt-1 space-y-3 ${
                      workoutEx.skipped ? 'opacity-50' : ''
                    }`}
                  >
                    {/* 1. Exercise Header: Circular White Thumbnail + Accent Title + ⋮ Menu (IMG_2628.png) */}
                    <div className="flex items-center justify-between gap-3 relative">
                      <div
                        onClick={() => setInspectExerciseId(exDef.id)}
                        className="flex items-center gap-3.5 min-w-0 cursor-pointer group"
                      >
                        <div className="w-12 h-12 rounded-full bg-white border border-slate-200 dark:border-slate-700 overflow-hidden shrink-0 flex items-center justify-center shadow-sm">
                          <ExerciseAnimator
                            exercise={exDef}
                            compact
                            className="w-full h-full !rounded-full !border-0"
                          />
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-base sm:text-lg font-bold text-orange-500 group-hover:underline truncate">
                            {exDef.name}
                          </h3>
                          {workoutEx.skipped && (
                            <span className="text-[11px] text-amber-500 font-semibold">
                              Exercício pulado nesta sessão
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() =>
                            setOpenMenuExerciseIdx(isMenuOpen ? null : exIdx)
                          }
                          className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-500 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          aria-label="Opções do exercício"
                        >
                          <MoreVertical className="w-5 h-5" />
                        </button>
                      </div>

                      {/* Dropdown Menu for ⋮ */}
                      {isMenuOpen && (
                        <div className="absolute right-0 top-12 z-30 w-64 rounded-2xl bg-white dark:bg-[#181A22] border border-slate-200 dark:border-slate-700 shadow-2xl p-1.5 space-y-1">
                          <button
                            type="button"
                            onClick={() => {
                              setOpenMenuExerciseIdx(null);
                              setInspectExerciseId(exDef.id);
                            }}
                            className="w-full px-3 py-2.5 rounded-xl text-left text-xs font-semibold text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2"
                          >
                            <Info className="w-4 h-4 text-orange-500" />
                            <span>Ver Exemplo 3D, Músculos e Gráfico</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setOpenMenuExerciseIdx(null);
                              addExerciseSet(exIdx, 'warmup');
                            }}
                            className="w-full px-3 py-2.5 rounded-xl text-left text-xs font-semibold text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2"
                          >
                            <Flame className="w-4 h-4" />
                            <span>+ Adicionar Série de Aquecimento (W)</span>
                          </button>

                          {lastPerfEx && (
                            <>
                              <button
                                type="button"
                                onClick={() => {
                                  setOpenMenuExerciseIdx(null);
                                  applyLastSessionToExercise(exIdx, 0);
                                }}
                                className="w-full px-3 py-2.5 rounded-xl text-left text-xs font-semibold text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2"
                              >
                                <History className="w-4 h-4 text-orange-500" />
                                <span>Usar cargas do último treino</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setOpenMenuExerciseIdx(null);
                                  applyLastSessionToExercise(exIdx, 2.5);
                                }}
                                className="w-full px-3 py-2.5 rounded-xl text-left text-xs font-semibold text-emerald-500 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2"
                              >
                                <Sparkles className="w-4 h-4" />
                                <span>Progredir carga (+2.5 {unit})</span>
                              </button>
                            </>
                          )}

                          <button
                            type="button"
                            onClick={() => {
                              setOpenMenuExerciseIdx(null);
                              toggleSkipExercise(exIdx);
                            }}
                            className="w-full px-3 py-2.5 rounded-xl text-left text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2"
                          >
                            <SkipForward className="w-4 h-4" />
                            <span>
                              {workoutEx.skipped
                                ? 'Reativar exercício'
                                : 'Pular exercício hoje'}
                            </span>
                          </button>

                          {workoutEx.sets.length > 1 && (
                            <button
                              type="button"
                              onClick={() => {
                                setOpenMenuExerciseIdx(null);
                                removeExerciseSet(
                                  exIdx,
                                  workoutEx.sets.length - 1
                                );
                              }}
                              className="w-full px-3 py-2.5 rounded-xl text-left text-xs font-semibold text-rose-500 hover:bg-rose-500/10 flex items-center gap-2"
                            >
                              <Trash2 className="w-4 h-4" />
                              <span>Remover última série</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {/* 2. Inline Notes Input ("Adicione notas aqui..." — Exact IMG_2628.png) */}
                    <div>
                      <input
                        type="text"
                        value={workoutEx.notes || ''}
                        onChange={(e) => {
                          const nextExercises = session.exercises.map((ex, idx) =>
                            idx === exIdx ? { ...ex, notes: e.target.value } : ex
                          );
                          onUpdateSession({ ...session, exercises: nextExercises });
                        }}
                        placeholder="Adicione notas aqui..."
                        className="w-full bg-transparent text-sm text-slate-700 dark:text-slate-300 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none py-0.5"
                      />
                    </div>

                    {/* 3. Stopwatch Rest Timer Row ("⏱ Descanso: 1min 0s" — Exact IMG_2628.png) */}
                    <div className="flex items-center gap-2">
                      <Timer className="w-4 h-4 text-orange-500 shrink-0" />
                      <span className="text-sm font-medium text-orange-500">
                        Descanso:
                      </span>
                      <select
                        value={restSeconds}
                        onChange={(e) => {
                          const sec = Number(e.target.value);
                          const nextExercises = session.exercises.map((ex, idx) =>
                            idx === exIdx ? { ...ex, restSeconds: sec } : ex
                          );
                          onUpdateSession({ ...session, exercises: nextExercises });
                        }}
                        className="bg-transparent text-sm font-semibold text-orange-500 focus:outline-none cursor-pointer"
                      >
                        <option value={45} className="bg-slate-900 text-white">
                          45s
                        </option>
                        <option value={60} className="bg-slate-900 text-white">
                          {formatHevyRestLabel(60)}
                        </option>
                        <option value={75} className="bg-slate-900 text-white">
                          {formatHevyRestLabel(75)}
                        </option>
                        <option value={90} className="bg-slate-900 text-white">
                          {formatHevyRestLabel(90)}
                        </option>
                        <option value={120} className="bg-slate-900 text-white">
                          {formatHevyRestLabel(120)}
                        </option>
                        <option value={150} className="bg-slate-900 text-white">
                          {formatHevyRestLabel(150)}
                        </option>
                        <option value={180} className="bg-slate-900 text-white">
                          {formatHevyRestLabel(180)}
                        </option>
                      </select>
                    </div>

                    {/* 4. Set Table (SÉRIE | ANTERIOR | 🏋️ KG | REPS | ✓ — Exact IMG_2628.png) */}
                    <div className="space-y-2 pt-1">
                      {/* Table Column Headers */}
                      <div className="grid grid-cols-12 gap-2 items-center text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-400">
                        <div className="col-span-2 text-center">SÉRIE</div>
                        <div className="col-span-3 text-center">ANTERIOR</div>
                        {exDef.metricMode === 'reps_weight' ? (
                          <>
                            <div className="col-span-3 flex items-center justify-center gap-1">
                              <Dumbbell className="w-3 h-3" />
                              <span>{unit.toUpperCase()}</span>
                            </div>
                            <div className="col-span-2 text-center">REPS</div>
                          </>
                        ) : (
                          <div className="col-span-5 text-center">
                            {exDef.metricMode === 'duration_seconds'
                              ? 'SEGUNDOS'
                              : 'MINUTOS'}
                          </div>
                        )}
                        <div className="col-span-2 flex justify-center">
                          <Check className="w-4 h-4" />
                        </div>
                      </div>

                      {/* Set Rows */}
                      {rows.map((s) => {
                        const prevSet =
                          s.validIndex >= 0 && lastPerfEx
                            ? lastPerfEx.validSets[s.validIndex] ||
                              lastPerfEx.validSets[
                                lastPerfEx.validSets.length - 1
                              ]
                            : null;

                        const prevWeight = prevSet?.weight ?? s.weight;
                        const prevReps = prevSet?.reps ?? s.reps;

                        return (
                          <div
                            key={s.id}
                            className={`grid grid-cols-12 gap-2 items-center py-1.5 px-1 rounded-xl transition-colors ${
                              s.completed
                                ? 'bg-emerald-500/10'
                                : 'bg-transparent'
                            }`}
                          >
                            {/* Col 1: SÉRIE Badge ("W" in yellow for warmup, "1", "2", "3" in white for valid) */}
                            <div className="col-span-2 flex justify-center">
                              <button
                                type="button"
                                onClick={() =>
                                  toggleSetWarmupOrValid(exIdx, s.index)
                                }
                                title="Toque para alternar entre Série Válida (1, 2...) e Aquecimento (W)"
                                className={`w-9 h-9 rounded-xl font-mono-num text-sm font-bold flex items-center justify-center transition-colors ${
                                  s.type === 'warmup'
                                    ? 'bg-slate-200/80 dark:bg-[#1C1D24] text-amber-400 font-extrabold'
                                    : 'bg-slate-200/80 dark:bg-[#1C1D24] text-slate-900 dark:text-white'
                                }`}
                              >
                                {s.displayBadge}
                              </button>
                            </div>

                            {/* Col 2: ANTERIOR ("25kg x 12" / "38kg x 12") */}
                            <div className="col-span-3 text-center">
                              <button
                                type="button"
                                onClick={() =>
                                  updateExerciseSet(exIdx, s.index, {
                                    weight: prevWeight,
                                    reps: prevReps,
                                  })
                                }
                                className="text-xs sm:text-sm font-mono-num text-slate-500 dark:text-slate-400 hover:text-orange-500 transition-colors"
                                title="Toque para copiar carga e repetições anteriores"
                              >
                                {exDef.metricMode === 'reps_weight'
                                  ? `${prevWeight}${unit} x ${prevReps}`
                                  : `${prevReps} ${
                                      exDef.metricMode === 'duration_seconds'
                                        ? 's'
                                        : 'min'
                                    }`}
                              </button>
                            </div>

                            {/* Col 3 & 4: Outlined Rounded Inputs for KG and REPS */}
                            {exDef.metricMode === 'reps_weight' ? (
                              <>
                                <div className="col-span-3 flex justify-center">
                                  <input
                                    type="number"
                                    step="0.5"
                                    min={0}
                                    value={s.weight}
                                    onChange={(e) =>
                                      updateExerciseSet(exIdx, s.index, {
                                        weight: Math.max(
                                          0,
                                          Number(e.target.value)
                                        ),
                                        userEditedWeight: true,
                                      })
                                    }
                                    className="h-9 w-full max-w-[92px] rounded-xl bg-transparent border border-slate-300 dark:border-slate-700/90 text-center font-mono-num text-sm sm:text-base font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-orange-500"
                                  />
                                </div>

                                <div className="col-span-2 flex justify-center">
                                  <input
                                    type="number"
                                    min={0}
                                    value={s.reps}
                                    onChange={(e) =>
                                      updateExerciseSet(exIdx, s.index, {
                                        reps: Math.max(
                                          0,
                                          Number(e.target.value)
                                        ),
                                        userEditedReps: true,
                                      })
                                    }
                                    className="h-9 w-full max-w-[84px] rounded-xl bg-transparent border border-slate-300 dark:border-slate-700/90 text-center font-mono-num text-sm sm:text-base font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-orange-500"
                                  />
                                </div>
                              </>
                            ) : (
                              <div className="col-span-5 flex justify-center">
                                <input
                                  type="number"
                                  min={1}
                                  value={s.reps}
                                  onChange={(e) =>
                                    updateExerciseSet(exIdx, s.index, {
                                      reps: Math.max(1, Number(e.target.value)),
                                      userEditedReps: true,
                                    })
                                  }
                                  className="h-9 w-full max-w-[140px] rounded-xl bg-transparent border border-slate-300 dark:border-slate-700/90 text-center font-mono-num text-sm sm:text-base font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-orange-500"
                                />
                              </div>
                            )}

                            {/* Col 5: Checkmark Button (✓) */}
                            <div className="col-span-2 flex justify-center">
                              <button
                                type="button"
                                onClick={() =>
                                  toggleCompleteExerciseSet(exIdx, s.index)
                                }
                                className={`w-10 h-9 rounded-xl flex items-center justify-center transition-all ${
                                  s.completed
                                    ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/30'
                                    : 'bg-slate-200/80 dark:bg-[#1E2028] text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                }`}
                                aria-label="Marcar série como concluída"
                              >
                                <Check className="w-4 h-4 stroke-[2.5]" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* 5. Full-Width "+ Adicionar série" Button (Exact IMG_2628.png) */}
                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={() => addExerciseSet(exIdx, 'valid')}
                        className="w-full h-11 rounded-xl bg-slate-200/75 dark:bg-[#1C1D22] hover:bg-slate-300/75 dark:hover:bg-[#252730] text-slate-900 dark:text-white text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Adicionar série</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Sticky Exercise Navigation Bar (Only shown in Modo Academia single-exercise mode) */}
      {session.gymMode && (
        <footer className="shrink-0 bg-white/95 dark:bg-[#13151B]/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-4 py-3 pb-safe">
          <div className="max-w-3xl mx-auto flex items-center justify-between gap-3">
            <button
              type="button"
              disabled={currentIdx === 0}
              onClick={() =>
                onUpdateSession({
                  ...session,
                  currentExerciseIndex: Math.max(0, currentIdx - 1),
                })
              }
              className="min-h-[48px] px-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 disabled:opacity-40 text-sm font-semibold flex items-center gap-1.5"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Anterior</span>
            </button>

            <div className="text-center text-xs font-mono-num text-slate-500 dark:text-slate-400">
              <div>{totalValidSetsCompleted} séries válidas</div>
              <div>
                {totalEffectiveVolume} {unit} volume
              </div>
            </div>

            {currentIdx < session.exercises.length - 1 ? (
              <button
                type="button"
                onClick={() =>
                  onUpdateSession({
                    ...session,
                    currentExerciseIndex: Math.min(
                      session.exercises.length - 1,
                      currentIdx + 1
                    ),
                  })
                }
                className="min-h-[48px] px-5 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold flex items-center gap-1.5 shadow-md shadow-orange-500/20"
              >
                <span>Próximo Exercício</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setShowFinishSummaryModal(true)}
                className="min-h-[48px] px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold flex items-center gap-1.5 shadow-md shadow-emerald-600/20"
              >
                <Check className="w-4 h-4" />
                <span>Concluir Treino</span>
              </button>
            )}
          </div>
        </footer>
      )}

      {/* =====================================================================
          MODAL DE PROTEÇÃO CONTRA ENCERRAMENTO ACIDENTAL (20.2)
      ====================================================================== */}
      {showExitGuardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-[#13151B] border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-2xl">
            <h3 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
              Treino em Andamento
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Seu progresso está salvo automaticamente. Como deseja prosseguir com esta sessão?
            </p>

            <div className="space-y-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowExitGuardModal(false)}
                className="w-full min-h-[48px] rounded-2xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold transition-colors"
              >
                Continuar treinando
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowExitGuardModal(false);
                  setShowFinishSummaryModal(true);
                }}
                className="w-full min-h-[48px] rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold transition-colors"
              >
                Finalizar e salvar treino
              </button>

              <button
                type="button"
                onClick={onMinimizeOrExitPartial}
                className="w-full min-h-[48px] rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 text-sm font-semibold transition-colors"
              >
                Sair sem finalizar (preservar progresso parcial)
              </button>

              <button
                type="button"
                onClick={onDiscardWorkout}
                className="w-full min-h-[44px] rounded-2xl text-rose-500 hover:bg-rose-500/10 text-xs font-semibold transition-colors"
              >
                Descartar sessão atual
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL DE FINALIZAÇÃO E RESUMO DO TREINO (SEÇÃO 7)
      ====================================================================== */}
      {showFinishSummaryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-[#13151B] border border-slate-200 dark:border-slate-800 p-6 space-y-5 shadow-2xl my-auto">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-orange-500">
                  Resumo da Sessão
                </span>
                <h3 className="font-display text-3xl font-bold text-slate-900 dark:text-white">
                  {session.routineName}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowFinishSummaryModal(false)}
                className="min-h-[44px] min-w-[44px] rounded-xl flex items-center justify-center text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800">
                <div className="text-[11px] text-slate-500 dark:text-slate-400">Duração</div>
                <div className="text-lg font-mono-num font-bold text-slate-900 dark:text-white mt-0.5">
                  {formatDurationSeconds(elapsedSeconds)}
                </div>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800">
                <div className="text-[11px] text-slate-500 dark:text-slate-400">Exercícios</div>
                <div className="text-lg font-mono-num font-bold text-slate-900 dark:text-white mt-0.5">
                  {exercisesCompletedCount}/{session.exercises.length}
                </div>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800">
                <div className="text-[11px] text-slate-500 dark:text-slate-400">Séries Válidas</div>
                <div className="text-lg font-mono-num font-bold text-emerald-500 mt-0.5">
                  {totalValidSetsCompleted}
                </div>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800">
                <div className="text-[11px] text-slate-500 dark:text-slate-400">Volume Efetivo</div>
                <div className="text-lg font-mono-num font-bold text-orange-500 mt-0.5">
                  {totalEffectiveVolume} {unit}
                </div>
              </div>
            </div>

            {/* Detected Personal Records */}
            {(() => {
              const newPrs = detectNewPersonalRecords(
                session.exercises,
                completedSessions,
                allExercises,
                unit
              );
              if (newPrs.length === 0) return null;
              return (
                <div className="rounded-2xl bg-orange-500/10 border border-orange-500/30 p-4 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-orange-500">
                    <Trophy className="w-4 h-4" />
                    <span>Novos Recordes Pessoais ({newPrs.length})</span>
                  </div>
                  <div className="space-y-1.5 max-h-36 overflow-y-auto">
                    {newPrs.map((pr, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between text-xs text-slate-800 dark:text-slate-200"
                      >
                        <span className="font-semibold">{pr.exerciseName}</span>
                        <span className="font-mono-num text-orange-500 font-bold">
                          {pr.label}: {pr.valueText}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* Session General Notes */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                Observações gerais da sessão
              </label>
              <textarea
                rows={2}
                value={session.notes}
                onChange={(e) => onUpdateSession({ ...session, notes: e.target.value })}
                placeholder="Como você se sentiu hoje? Nível de energia, foco, recuperação..."
                className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-orange-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowFinishSummaryModal(false)}
                className="min-h-[48px] rounded-2xl border border-slate-200 dark:border-slate-800 text-sm font-semibold text-slate-700 dark:text-slate-300"
              >
                Voltar ao Treino
              </button>
              <button
                type="button"
                onClick={handleConfirmFinish}
                className="min-h-[48px] rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                <span>Salvar no Histórico</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL DETALHADO DO EXERCÍCIO (ESTILO HEVY & IMG_2627.png)
      ====================================================================== */}
      {inspectExerciseId && (() => {
        const inspectEx =
          allExercises.find((e) => e.id === inspectExerciseId) || currentExDef;
        const targetWorkoutEx =
          session.exercises.find((e) => e.exerciseId === inspectEx.id) ||
          currentWorkoutEx;
        return (
          <ExerciseDetailModal
            exercise={inspectEx}
            sessions={completedSessions}
            allExercises={allExercises}
            weightUnit={unit}
            inActiveWorkout
            targetSets={targetWorkoutEx.sets.map((s, idx) => ({
              id: s.id || `set_${idx}`,
              type: s.type,
              minReps: s.reps || inspectEx.defaultMinReps,
              maxReps: s.reps || inspectEx.defaultMaxReps,
              targetWeight: s.weight,
              restSeconds:
                targetWorkoutEx.restSeconds || inspectEx.defaultRestSeconds,
            }))}
            onClose={() => setInspectExerciseId(null)}
          />
        );
      })()}
    </div>
  );
};
