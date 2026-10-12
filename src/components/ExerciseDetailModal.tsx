import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  Award,
  BarChart2,
  Check,
  ChevronRight,
  Clock,
  Copy,
  Dumbbell,
  Edit3,
  Heart,
  HelpCircle,
  History,
  Layers,
  Plus,
  ShieldCheck,
  Trash2,
  TrendingUp,
  Wind,
} from 'lucide-react';
import {
  CompletedWorkoutSession,
  Exercise,
  Routine,
  RoutineSetTemplate,
  WeightUnit,
} from '../types';
import { ExerciseAnimator } from './ExerciseAnimator';
import { BiomechanicalHuman } from './BiomechanicalHuman';
import {
  formatDateBR,
  getExerciseRecords,
  getLastSessionForExercise,
  resolveHistoryExerciseId,
} from '../utils/workoutHelpers';

interface ExerciseDetailModalProps {
  exercise: Exercise | null;
  allExercises: Exercise[];
  sessions: CompletedWorkoutSession[];
  routines?: Routine[];
  favoriteIds?: string[];
  weightUnit: WeightUnit;
  onClose: () => void;
  onToggleFavorite?: (exerciseId: string) => void;
  onEditExercise?: (exercise: Exercise, duplicate: boolean) => void;
  onDeleteOrArchiveCustomExercise?: (exerciseId: string) => void;
  onAddExerciseToRoutine?: (routineId: string, exerciseId: string) => void;
  inActiveWorkout?: boolean;
  programmedSetsCount?: number;
  programmedMinReps?: number;
  programmedMaxReps?: number;
  programmedRestSeconds?: number;
  targetSets?: RoutineSetTemplate[];
  actionButton?: {
    label: string;
    onClick: () => void;
  };
}

export const ExerciseDetailModal: React.FC<ExerciseDetailModalProps> = ({
  exercise,
  allExercises,
  sessions,
  routines = [],
  favoriteIds = [],
  weightUnit,
  onClose,
  onToggleFavorite,
  onEditExercise,
  onDeleteOrArchiveCustomExercise,
  onAddExerciseToRoutine,
  inActiveWorkout = false,
  programmedSetsCount,
  programmedMinReps,
  programmedMaxReps,
  programmedRestSeconds,
  targetSets,
  actionButton,
}) => {
  const [activeTab, setActiveTab] = useState<'resumo' | 'evolucao' | 'historico' | 'instrucoes'>(
    'resumo'
  );
  const [chartMetric, setChartMetric] = useState<'max_weight' | 'one_rm' | 'best_set_volume'>(
    'max_weight'
  );
  const [periodFilter, setPeriodFilter] = useState<'7d' | '30d' | '90d' | 'all'>('all');
  const [showPrHelp, setShowPrHelp] = useState(false);
  const [targetRoutineIdForAdd, setTargetRoutineIdForAdd] = useState<string>(
    routines.find((r) => !r.isRestDay)?.id || ''
  );
  const [addedFeedback, setAddedFeedback] = useState(false);

  const canonicalId = exercise
    ? resolveHistoryExerciseId(exercise.id, allExercises)
    : '';

  const matchingSessions = useMemo(() => {
    if (!canonicalId) return [];
    const now = new Date();
    return sessions.filter((s) => {
      if (s.isRestLog) return false;
      if (periodFilter !== 'all') {
        const d = new Date(`${s.date}T12:00:00`);
        const daysMap = { '7d': 7, '30d': 30, '90d': 90 };
        const diff = (now.getTime() - d.getTime()) / (1000 * 3600 * 24);
        if (diff > daysMap[periodFilter]) return false;
      }
      return s.exercises.some(
        (e) =>
          !e.skipped &&
          resolveHistoryExerciseId(e.exerciseId, allExercises) === canonicalId &&
          e.sets.some((st) => st.type === 'valid' && st.completed)
      );
    });
  }, [sessions, allExercises, canonicalId, periodFilter]);

  const allTimeMatchingSessions = useMemo(() => {
    if (!canonicalId) return [];
    return sessions.filter(
      (s) =>
        !s.isRestLog &&
        s.exercises.some(
          (e) =>
            !e.skipped &&
            resolveHistoryExerciseId(e.exerciseId, allExercises) === canonicalId &&
            e.sets.some((st) => st.type === 'valid' && st.completed)
        )
    );
  }, [sessions, allExercises, canonicalId]);

  // Data points sorted oldest -> newest for the Hevy line chart
  const chartPoints = useMemo(() => {
    if (!canonicalId) return [];
    return [...matchingSessions].reverse().map((s) => {
      const exItem = s.exercises.find(
        (e) => resolveHistoryExerciseId(e.exerciseId, allExercises) === canonicalId
      );
      const vSets =
        exItem?.sets.filter((st) => st.type === 'valid' && st.completed) || [];
      const maxW = Math.max(0, ...vSets.map((st) => Number(st.weight) || 0));
      const maxOneRm = Math.max(
        0,
        ...vSets.map((st) =>
          Math.round((Number(st.weight) || 0) * (1 + (Number(st.reps) || 0) / 30))
        )
      );
      const maxSetVol = Math.max(
        0,
        ...vSets.map((st) => (Number(st.weight) || 0) * (Number(st.reps) || 0))
      );
      const val =
        chartMetric === 'max_weight'
          ? maxW
          : chartMetric === 'one_rm'
          ? maxOneRm
          : maxSetVol;
      return {
        date: formatDateBR(s.date).slice(0, 5),
        fullDate: formatDateBR(s.date),
        val,
        sets: vSets,
      };
    });
  }, [matchingSessions, allExercises, canonicalId, chartMetric]);

  if (!exercise) return null;

  const rec = getExerciseRecords(exercise.id, sessions, allExercises);
  const lastPerf = getLastSessionForExercise(exercise.id, sessions, allExercises);
  const best1RM = rec.maxWeight
    ? Math.round(rec.maxWeight.weight * (1 + rec.maxWeight.reps / 30))
    : null;

  const validTargetSets = targetSets?.filter((s) => s.type === 'valid') || [];
  const setsTarget =
    programmedSetsCount ??
    (validTargetSets.length > 0 ? validTargetSets.length : exercise.defaultSets);
  const minRepsTarget =
    programmedMinReps ??
    (validTargetSets[0]?.minReps ? validTargetSets[0].minReps : exercise.defaultMinReps);
  const maxRepsTarget =
    programmedMaxReps ??
    (validTargetSets[0]?.maxReps ? validTargetSets[0].maxReps : exercise.defaultMaxReps);
  const restTarget =
    programmedRestSeconds ??
    (validTargetSets[0]?.restSeconds
      ? validTargetSets[0].restSeconds
      : exercise.defaultRestSeconds);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-0 sm:p-4 overflow-y-auto animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl min-h-screen sm:min-h-0 sm:rounded-3xl bg-white dark:bg-[#0D0F14] border-0 sm:border border-slate-200 dark:border-slate-800 shadow-2xl my-auto sm:max-h-[92vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top App Bar (Hevy Style) */}
        <div className="px-4 pt-safe h-14 flex items-center justify-between bg-white dark:bg-[#13151B] border-b border-slate-200 dark:border-slate-800/80 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="min-h-[40px] px-2 -ml-2 rounded-xl flex items-center gap-1.5 text-slate-800 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Voltar"
          >
            <ArrowLeft className="w-5 h-5" />
            {inActiveWorkout && (
              <span className="text-xs font-semibold text-orange-500">Voltar ao treino</span>
            )}
          </button>

          <div className="text-center min-w-0 px-2 flex-1">
            <h2 className="font-semibold text-base text-slate-900 dark:text-white truncate">
              {exercise.name}
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
              {exercise.primaryMuscle} · {exercise.type} · {exercise.equipment}
            </p>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {onToggleFavorite && (
              <button
                type="button"
                onClick={() => onToggleFavorite(exercise.id)}
                className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800"
                title="Favoritar"
              >
                <Heart
                  className={`w-5 h-5 ${
                    favoriteIds.includes(exercise.id)
                      ? 'fill-orange-500 text-orange-500'
                      : 'text-slate-400'
                  }`}
                />
              </button>
            )}
            {onEditExercise && (
              <button
                type="button"
                onClick={() => onEditExercise(exercise, false)}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                title="Editar ou Duplicar Exercício"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Navigation Tabs (Resumo | Desempenho | Histórico | Instruções) */}
        <div className="grid grid-cols-4 bg-white dark:bg-[#13151B] border-b border-slate-200 dark:border-slate-800 shrink-0">
          {(
            [
              { id: 'resumo', label: 'Resumo' },
              { id: 'evolucao', label: 'Evolução' },
              { id: 'historico', label: 'Histórico' },
              { id: 'instrucoes', label: 'Instruções' },
            ] as const
          ).map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`h-11 text-xs sm:text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
                  active
                    ? 'border-orange-500 text-orange-500'
                    : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
          {/* =================================================================
              ABA 1: RESUMO & EXECUÇÃO (ESTILO HEVY — EXEMPLO SUPINO RETO)
          ================================================================== */}
          {activeTab === 'resumo' && (
            <div className="pb-6">
              {/* Full-Width 3D Dark Gym Studio Stage + Circular Anatomical Muscle Inset (IMG_2627.png) */}
              <div className="bg-[#0E1015] border-b border-slate-200 dark:border-slate-800">
                <ExerciseAnimator
                  exercise={exercise}
                  className="w-full h-64 sm:h-72 rounded-none border-0"
                />
              </div>

              <div className="p-5 space-y-5">
                {/* Exercise Title, Primary & Secondary Muscles, Equipment */}
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                    {exercise.name}
                  </h3>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600 dark:text-slate-300">
                    <span>
                      <strong className="text-slate-900 dark:text-white">
                        Grupo muscular principal:
                      </strong>{' '}
                      <span className="text-orange-500 font-semibold">
                        {exercise.primaryMuscle}
                      </span>
                    </span>
                    <span>·</span>
                    <span>
                      <strong className="text-slate-900 dark:text-white">
                        Secundários:
                      </strong>{' '}
                      {exercise.secondaryMuscles.length > 0
                        ? exercise.secondaryMuscles.join(', ')
                        : 'Estabilizadores'}
                    </span>
                    <span>·</span>
                    <span>
                      <strong className="text-slate-900 dark:text-white">
                        Equipamento:
                      </strong>{' '}
                      {exercise.equipment} ({exercise.type})
                    </span>
                  </div>
                </div>

                {/* Summarized Numbered Execution Steps (Exact Hevy Layout) */}
                <div className="rounded-2xl bg-slate-50 dark:bg-[#16181F] border border-slate-200/80 dark:border-slate-800 p-4 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Instruções Resumidas de Execução
                    </span>
                    <button
                      type="button"
                      onClick={() => setActiveTab('instrucoes')}
                      className="text-xs font-semibold text-orange-500 hover:underline flex items-center gap-0.5"
                    >
                      <span>Guia completo</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <ol className="space-y-1.5 text-xs text-slate-700 dark:text-slate-200">
                    {exercise.stepByStep.map((step, idx) => (
                      <li key={idx} className="flex items-start gap-2 leading-relaxed">
                        <span className="font-mono-num font-bold text-orange-500 shrink-0">
                          {idx + 1}.
                        </span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>

                {/* Último Treino (Last Workout Loads Card — Exact Hevy Reference) */}
                <div className="rounded-2xl bg-slate-50 dark:bg-[#16181F] border border-slate-200/80 dark:border-slate-800 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Último treino
                      </span>
                      <div className="text-base font-bold font-mono-num text-slate-900 dark:text-white mt-0.5">
                        {lastPerf
                          ? `${lastPerf.validSets.length} séries · Máx ${lastPerf.maxWeightKg} ${weightUnit} (${lastPerf.formattedDate})`
                          : 'Sem sessão anterior registrada'}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTab('historico')}
                      className="text-xs font-semibold text-orange-500 hover:underline flex items-center gap-0.5 shrink-0"
                    >
                      <span>Ver histórico</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  {lastPerf && (
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      {lastPerf.validSets.map((st, i) => (
                        <div
                          key={st.id || i}
                          className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#0D0F14] border border-slate-200 dark:border-slate-800 text-xs font-mono-num flex items-center gap-1.5"
                        >
                          <span className="w-5 h-5 rounded-md bg-orange-500/15 text-orange-500 font-bold flex items-center justify-center text-[11px]">
                            {i + 1}
                          </span>
                          <span className="font-bold text-slate-900 dark:text-white">
                            {exercise.metricMode === 'reps_weight'
                              ? `${st.weight} ${weightUnit}`
                              : `${st.reps}s`}
                          </span>
                          {exercise.metricMode === 'reps_weight' && (
                            <span className="text-slate-500 dark:text-slate-400">
                              × {st.reps} reps
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Séries Programadas & Tempo de Descanso (Target Sets Card — Exact Hevy Reference) */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-slate-50 dark:bg-[#16181F] border border-slate-200/80 dark:border-slate-800 p-4">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                      <Layers className="w-3.5 h-3.5 text-orange-500" />
                      <span>Séries programadas</span>
                    </div>
                    <div className="text-lg font-mono-num font-bold text-slate-900 dark:text-white mt-1">
                      {setsTarget} ×{' '}
                      {exercise.metricMode === 'reps_weight'
                        ? `${minRepsTarget}–${maxRepsTarget} reps`
                        : `${maxRepsTarget} ${
                            exercise.metricMode === 'duration_seconds' ? 'seg' : 'min'
                          }`}
                    </div>
                  </div>

                  <div className="rounded-2xl bg-slate-50 dark:bg-[#16181F] border border-slate-200/80 dark:border-slate-800 p-4">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                      <Clock className="w-3.5 h-3.5 text-orange-500" />
                      <span>Tempo de descanso</span>
                    </div>
                    <div className="text-lg font-mono-num font-bold text-slate-900 dark:text-white mt-1">
                      {restTarget}s descanso
                    </div>
                  </div>
                </div>

                {/* Button to Consult Exercise Evolution (Section 3 Requirement) */}
                <button
                  type="button"
                  onClick={() => setActiveTab('evolucao')}
                  className="w-full min-h-[48px] rounded-2xl bg-orange-500/15 hover:bg-orange-500/25 border border-orange-500/30 text-orange-500 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-colors"
                >
                  <TrendingUp className="w-4 h-4" />
                  <span>Consultar Evolução de Cargas e Recordes deste Exercício</span>
                  <ChevronRight className="w-4 h-4" />
                </button>

                {/* Quick Add to Routine (when browsing library) */}
                {!inActiveWorkout &&
                  onAddExerciseToRoutine &&
                  routines.filter((r) => !r.isRestDay).length > 0 && (
                    <div className="rounded-2xl bg-slate-50 dark:bg-[#16181F] border border-slate-200 dark:border-slate-800 p-3.5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
                      <select
                        value={targetRoutineIdForAdd}
                        onChange={(e) => setTargetRoutineIdForAdd(e.target.value)}
                        className="flex-1 min-h-[42px] px-3 rounded-xl bg-white dark:bg-[#0D0F14] border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-900 dark:text-white"
                      >
                        {routines
                          .filter((r) => !r.isRestDay)
                          .map((r) => (
                            <option key={r.id} value={r.id}>
                              {r.subtitle ? `${r.subtitle} — ${r.name}` : r.name}
                            </option>
                          ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => {
                          if (!targetRoutineIdForAdd) return;
                          onAddExerciseToRoutine(targetRoutineIdForAdd, exercise.id);
                          setAddedFeedback(true);
                          setTimeout(() => setAddedFeedback(false), 2000);
                        }}
                        className="min-h-[42px] px-4 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold flex items-center justify-center gap-1.5 shrink-0"
                      >
                        {addedFeedback ? (
                          <>
                            <Check className="w-4 h-4" />
                            <span>Adicionado!</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-4 h-4" />
                            <span>Adicionar à Rotina</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
              </div>
            </div>
          )}

          {/* =================================================================
              ABA 2: EVOLUÇÃO & DESEMPENHO (GRÁFICO DE LINHA HEVY + RECORDES)
          ================================================================== */}
          {activeTab === 'evolucao' && (
            <div className="p-5 space-y-5">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Progressão de Carga — {exercise.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Evolução real registrada nas suas sessões concluídas
                  </p>
                </div>

                {/* Period Filter Pills (7D | 30D | 90D | Tudo) */}
                <div className="flex items-center gap-1 bg-slate-100 dark:bg-[#16181F] p-1 rounded-xl">
                  {(
                    [
                      { id: '7d', label: '7D' },
                      { id: '30d', label: '30D' },
                      { id: '90d', label: '90D' },
                      { id: 'all', label: 'Tudo' },
                    ] as const
                  ).map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setPeriodFilter(p.id)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors ${
                        periodFilter === p.id
                          ? 'bg-orange-500 text-white'
                          : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Hevy-Style Smooth SVG Line + Area Progression Chart */}
              <div className="rounded-2xl bg-slate-100 dark:bg-[#16181F] border border-slate-200/80 dark:border-slate-800/80 p-4 min-h-[190px] flex flex-col justify-center">
                {chartPoints.length === 0 ? (
                  <div className="flex flex-col items-center justify-center text-center py-6 space-y-2.5 text-slate-400 dark:text-slate-500">
                    <BarChart2 className="w-12 h-12 stroke-[1.6]" />
                    <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                      Ainda sem dados neste período
                    </span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <svg viewBox="0 0 360 150" className="w-full h-40 overflow-visible">
                      <defs>
                        <linearGradient id="exChartAreaGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop
                            offset="0%"
                            style={{ stopColor: 'var(--accent-500, #F97316)', stopOpacity: 0.35 }}
                          />
                          <stop
                            offset="100%"
                            style={{ stopColor: 'var(--accent-500, #F97316)', stopOpacity: 0.0 }}
                          />
                        </linearGradient>
                      </defs>

                      {(() => {
                        const vals = chartPoints.map((p) => p.val);
                        const maxVal = Math.max(10, ...vals);
                        const minVal = Math.max(0, Math.min(...vals) * 0.8);
                        const span = Math.max(5, maxVal - minVal);

                        const padLeft = 42;
                        const padRight = 18;
                        const padTop = 18;
                        const padBottom = 26;
                        const plotW = 360 - padLeft - padRight;
                        const plotH = 150 - padTop - padBottom;

                        const gridSteps = [0, 0.5, 1];
                        const coords = chartPoints.map((pt, i) => {
                          const x =
                            chartPoints.length === 1
                              ? padLeft + plotW / 2
                              : padLeft + (i / (chartPoints.length - 1)) * plotW;
                          const y =
                            padTop + plotH - ((pt.val - minVal) / span) * plotH;
                          return { x, y, ...pt };
                        });

                        const polylinePoints = coords.map((c) => `${c.x},${c.y}`).join(' ');
                        const areaPoints =
                          coords.length > 1
                            ? `${coords[0].x},${padTop + plotH} ${polylinePoints} ${
                                coords[coords.length - 1].x
                              },${padTop + plotH}`
                            : '';

                        return (
                          <>
                            {/* Horizontal Y-Axis Gridlines */}
                            {gridSteps.map((step, idx) => {
                              const y = padTop + plotH - step * plotH;
                              const labelVal = Math.round(minVal + step * span);
                              return (
                                <g key={idx}>
                                  <line
                                    x1={padLeft}
                                    y1={y}
                                    x2={360 - padRight}
                                    y2={y}
                                    stroke="currentColor"
                                    className="text-slate-300 dark:text-slate-800"
                                    strokeDasharray="3 3"
                                    strokeWidth="1"
                                  />
                                  <text
                                    x={padLeft - 6}
                                    y={y + 3}
                                    textAnchor="end"
                                    className="fill-slate-400 text-[9px] font-mono-num"
                                  >
                                    {labelVal} {weightUnit}
                                  </text>
                                </g>
                              );
                            })}

                            {/* Area Fill */}
                            {areaPoints && (
                              <polygon points={areaPoints} fill="url(#exChartAreaGrad)" />
                            )}

                            {/* Line Path */}
                            {coords.length > 1 && (
                              <polyline
                                fill="none"
                                style={{ stroke: 'var(--accent-500, #F97316)' }}
                                strokeWidth="2.75"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                points={polylinePoints}
                              />
                            )}

                            {/* Data Dots & Labels */}
                            {coords.map((c, idx) => (
                              <g key={idx}>
                                <circle
                                  cx={c.x}
                                  cy={c.y}
                                  r="4.5"
                                  style={{ fill: 'var(--accent-500, #F97316)' }}
                                  stroke="#FFFFFF"
                                  strokeWidth="1.5"
                                />
                                <text
                                  x={c.x}
                                  y={c.y - 8}
                                  textAnchor="middle"
                                  style={{ fill: 'var(--accent-500, #F97316)' }}
                                  className="text-[9px] font-mono-num font-bold"
                                >
                                  {c.val}
                                  {weightUnit}
                                </text>
                                <text
                                  x={c.x}
                                  y={padTop + plotH + 16}
                                  textAnchor="middle"
                                  className="fill-slate-400 text-[9px] font-mono-num"
                                >
                                  {c.date}
                                </text>
                              </g>
                            ))}
                          </>
                        );
                      })()}
                    </svg>
                  </div>
                )}
              </div>

              {/* Metric Filter Buttons */}
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                {(
                  [
                    { id: 'max_weight', label: 'Maior peso' },
                    { id: 'one_rm', label: 'Máximo para 1 repetição' },
                    { id: 'best_set_volume', label: 'Melhor volume da série' },
                  ] as const
                ).map((m) => {
                  const active = chartMetric === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setChartMetric(m.id)}
                      className={`min-h-[36px] px-3.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                        active
                          ? 'bg-orange-500 text-white'
                          : 'bg-slate-100 dark:bg-[#16181F] text-slate-700 dark:text-slate-200'
                      }`}
                    >
                      {m.label}
                    </button>
                  );
                })}
              </div>

              {/* Recordes Pessoais (Hevy Highlight Cards + Detailed Rows) */}
              <div className="space-y-3 pt-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-amber-400 fill-amber-400" />
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Recordes pessoais
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowPrHelp((p) => !p)}
                    className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 flex items-center justify-center"
                    title="Como funcionam os recordes pessoais"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                  </button>
                </div>

                {showPrHelp && (
                  <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-900 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    Calculados automaticamente a partir das séries válidas concluídas: Maior peso levantado, estimativa de 1 repetição máxima (1RM de Epley) e maior volume (carga × repetições).
                  </div>
                )}

                {/* Hevy 2-Card Top PR Highlights */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-slate-50 dark:bg-[#16181F] border border-slate-200 dark:border-slate-800 p-4">
                    <div className="text-xs text-slate-500 dark:text-slate-400">Maior carga</div>
                    <div className="text-2xl font-mono-num font-bold text-orange-500 mt-1">
                      {rec.maxWeight ? `${rec.maxWeight.weight} ${weightUnit}` : '—'}
                    </div>
                    <div className="text-[11px] font-mono-num text-slate-400 mt-0.5">
                      {rec.maxWeight ? `${rec.maxWeight.reps} repetições` : 'Sem registro'}
                    </div>
                  </div>

                  <div className="rounded-2xl bg-slate-50 dark:bg-[#16181F] border border-slate-200 dark:border-slate-800 p-4">
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      Melhor 1RM estimado
                    </div>
                    <div className="text-2xl font-mono-num font-bold text-slate-900 dark:text-white mt-1">
                      {best1RM ? `${best1RM} ${weightUnit}` : '—'}
                    </div>
                    <div className="text-[11px] font-mono-num text-slate-400 mt-0.5">
                      1 repetição máxima
                    </div>
                  </div>
                </div>

                <div className="divide-y divide-slate-200/70 dark:divide-slate-800/80 text-sm">
                  <div className="py-3 flex items-center justify-between">
                    <span className="font-semibold text-slate-900 dark:text-white">
                      Melhor volume (série)
                    </span>
                    <span className="font-mono-num font-bold text-slate-900 dark:text-white">
                      {rec.maxSetVolume
                        ? `${rec.maxSetVolume.volume} ${weightUnit} (${rec.maxSetVolume.weight}${weightUnit} × ${rec.maxSetVolume.reps})`
                        : '-'}
                    </span>
                  </div>

                  <div className="py-3 flex items-center justify-between">
                    <span className="font-semibold text-slate-900 dark:text-white">
                      Maior volume (sessão)
                    </span>
                    <span className="font-mono-num font-bold text-slate-900 dark:text-white">
                      {rec.maxSessionVolume
                        ? `${rec.maxSessionVolume.volume} ${weightUnit}`
                        : '-'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =================================================================
              ABA 3: HISTÓRICO COMPLETO DO EXERCÍCIO
          ================================================================== */}
          {activeTab === 'historico' && (
            <div className="p-5 space-y-3">
              {allTimeMatchingSessions.length > 0 ? (
                allTimeMatchingSessions.map((sess) => {
                  const exItem = sess.exercises.find(
                    (e) =>
                      resolveHistoryExerciseId(e.exerciseId, allExercises) === canonicalId
                  );
                  const validSets =
                    exItem?.sets.filter((st) => st.type === 'valid' && st.completed) || [];
                  const sessionExVolume = validSets.reduce(
                    (acc, st) => acc + (Number(st.weight) || 0) * (Number(st.reps) || 0),
                    0
                  );
                  return (
                    <div
                      key={sess.id}
                      className="p-4 rounded-2xl bg-slate-50 dark:bg-[#16181F] border border-slate-200 dark:border-slate-800 space-y-2.5"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-sm font-bold text-slate-900 dark:text-white block">
                            {sess.routineName}
                          </span>
                          <span className="text-xs font-mono-num text-orange-500 font-semibold">
                            {formatDateBR(sess.date)}
                          </span>
                        </div>
                        {exercise.metricMode === 'reps_weight' && (
                          <div className="text-right">
                            <span className="text-[11px] text-slate-400 block">Volume</span>
                            <span className="text-xs font-mono-num font-bold text-slate-900 dark:text-white">
                              {sessionExVolume} {weightUnit}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="space-y-1.5 pt-1 border-t border-slate-200/60 dark:border-slate-800">
                        {validSets.map((st, idx) => (
                          <div
                            key={st.id}
                            className="flex items-center justify-between text-xs font-mono-num text-slate-600 dark:text-slate-300"
                          >
                            <span className="flex items-center gap-2">
                              <span className="w-5 h-5 rounded-md bg-orange-500/15 text-orange-500 font-bold flex items-center justify-center text-[11px]">
                                {idx + 1}
                              </span>
                              <span>Série {idx + 1}</span>
                            </span>
                            <span className="font-bold text-slate-900 dark:text-white">
                              {st.weight} {weightUnit} × {st.reps} reps
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-12 text-center space-y-2">
                  <History className="w-10 h-10 text-slate-500 mx-auto" />
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Ainda sem histórico para este exercício
                  </p>
                  <p className="text-xs text-slate-500">
                    Conclua séries válidas deste exercício em um treino para ver todas as cargas aqui.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* =================================================================
              ABA 4: INSTRUÇÕES DETALHADAS, RESPIRAÇÃO E SEGURANÇA
          ================================================================== */}
          {activeTab === 'instrucoes' && (
            <div className="p-5 space-y-4 text-sm">
              <ExerciseAnimator
                exercise={exercise}
                className="w-full h-52 rounded-2xl border border-slate-200 dark:border-slate-800"
              />

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#16181F] border border-slate-200 dark:border-slate-800 space-y-2">
                <h4 className="font-bold text-slate-900 dark:text-white">
                  Posição Inicial e Execução
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {exercise.description}
                </p>
                <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed">
                  <strong>Posição inicial:</strong> {exercise.initialPosition}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#16181F] border border-slate-200 dark:border-slate-800 space-y-2">
                <h4 className="font-bold text-slate-900 dark:text-white">
                  Passo a Passo Biomecânico
                </h4>
                <ol className="list-decimal list-inside space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                  {exercise.stepByStep.map((step, i) => (
                    <li key={i} className="leading-relaxed">
                      {step}
                    </li>
                  ))}
                </ol>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#16181F] border border-slate-200 dark:border-slate-800 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-sky-500">
                    <Wind className="w-4 h-4" />
                    <span>Respiração Recomendada</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {exercise.breathing}
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#16181F] border border-slate-200 dark:border-slate-800 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-500">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Erros Comuns a Evitar</span>
                  </div>
                  <ul className="space-y-1 text-xs text-slate-600 dark:text-slate-300">
                    {exercise.commonMistakes.map((m, i) => (
                      <li key={i}>• {m}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#16181F] border border-slate-200 dark:border-slate-800 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-500">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Dicas de Segurança Articular</span>
                  </div>
                  <ul className="space-y-1 text-xs text-slate-600 dark:text-slate-300">
                    {exercise.safetyTips.map((tip, i) => (
                      <li key={i}>• {tip}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {onEditExercise && (
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onEditExercise(exercise, true)}
                      className="min-h-[42px] px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold flex items-center gap-1.5 text-slate-700 dark:text-slate-300"
                    >
                      <Copy className="w-4 h-4 text-orange-500" />
                      <span>Duplicar</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onEditExercise(exercise, false)}
                      className="min-h-[42px] px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold flex items-center gap-1.5 text-slate-700 dark:text-slate-300"
                    >
                      <Edit3 className="w-4 h-4 text-orange-500" />
                      <span>Editar</span>
                    </button>
                  </div>

                  {exercise.isCustom && onDeleteOrArchiveCustomExercise && (
                    <button
                      type="button"
                      onClick={() => {
                        onDeleteOrArchiveCustomExercise(exercise.id);
                        onClose();
                      }}
                      className="min-h-[42px] px-3.5 rounded-xl text-rose-500 hover:bg-rose-500/10 text-xs font-semibold flex items-center gap-1.5"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Excluir</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {actionButton && (
          <div className="p-4 bg-white dark:bg-[#13151B] border-t border-slate-200 dark:border-slate-800 shrink-0 pb-safe">
            <button
              type="button"
              onClick={actionButton.onClick}
              className="w-full min-h-[48px] rounded-2xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-orange-500/25 transition-colors"
            >
              <span>{actionButton.label}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
