import React, { useState } from 'react';
import {
  Activity,
  BarChart3,
  Calendar,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Edit3,
  HelpCircle,
  History,
  Info,
  Play,
  Scale,
  Trash2,
  TrendingUp,
  Trophy,
  X,
} from 'lucide-react';
import {
  BodyMeasurementEntry,
  CompletedWorkoutSession,
  Exercise,
  MuscleGroup,
  WeightUnit,
} from '../types';
import {
  formatDateBR,
  formatDurationSeconds,
  getExerciseRecords,
  resolveHistoryExerciseId,
} from '../utils/workoutHelpers';
import { ExerciseDetailModal } from './ExerciseDetailModal';

interface EvolutionHistoryViewProps {
  sessions: CompletedWorkoutSession[];
  measurements: BodyMeasurementEntry[];
  allExercises: Exercise[];
  weightUnit: WeightUnit;
  onRepeatSession: (session: CompletedWorkoutSession) => void;
  onUpdateSessionInHistory: (updated: CompletedWorkoutSession) => void;
  onDeleteSessionFromHistory: (sessionId: string) => void;
}

type PeriodFilter = '7d' | '30d' | '90d' | '180d' | '365d' | 'custom';

export const EvolutionHistoryView: React.FC<EvolutionHistoryViewProps> = ({
  sessions,
  measurements,
  allExercises,
  weightUnit,
  onRepeatSession,
  onUpdateSessionInHistory,
  onDeleteSessionFromHistory,
}) => {
  const [subTab, setSubTab] = useState<'stats' | 'history' | 'records'>('stats');
  const [period, setPeriod] = useState<PeriodFilter>('30d');
  const [customStartDate, setCustomStartDate] = useState<string>('2026-09-01');
  const [customEndDate, setCustomEndDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>(
    allExercises[1]?.id || allExercises[0]?.id || ''
  );

  // Session inspection / edit modal
  const [selectedSession, setSelectedSession] = useState<CompletedWorkoutSession | null>(
    null
  );
  const [isEditingSession, setIsEditingSession] = useState(false);
  const [calendarMonthOffset, setCalendarMonthOffset] = useState<number>(0);
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string | null>(null);
  const [inspectExercise, setInspectExercise] = useState<Exercise | null>(null);

  // Filter sessions by period
  const filterByPeriod = <T extends { date: string }>(items: T[]): T[] => {
    const now = new Date();
    return items.filter((item) => {
      const d = new Date(`${item.date}T12:00:00`);
      if (isNaN(d.getTime())) return true;
      if (period === 'custom') {
        const s = customStartDate ? new Date(`${customStartDate}T00:00:00`) : null;
        const e = customEndDate ? new Date(`${customEndDate}T23:59:59`) : null;
        if (s && d < s) return false;
        if (e && d > e) return false;
        return true;
      }
      const daysMap: Record<Exclude<PeriodFilter, 'custom'>, number> = {
        '7d': 7,
        '30d': 30,
        '90d': 90,
        '180d': 180,
        '365d': 365,
      };
      const diffDays = (now.getTime() - d.getTime()) / (1000 * 3600 * 24);
      return diffDays <= daysMap[period];
    });
  };

  const filteredSessions = filterByPeriod(sessions).filter((s) => !s.isRestLog);
  const filteredMeasurements = filterByPeriod(measurements);

  // Summary KPIs
  const totalSessionsCount = filteredSessions.length;
  const totalVolumePeriod = filteredSessions.reduce(
    (acc, s) => acc + (s.totalVolumeKg || 0),
    0
  );
  const avgDurationSec =
    totalSessionsCount > 0
      ? Math.round(
          filteredSessions.reduce((acc, s) => acc + (s.durationSeconds || 0), 0) /
            totalSessionsCount
        )
      : 0;

  // Muscle Group distribution (valid sets completed)
  const muscleDistribution: Record<string, number> = {};
  filteredSessions.forEach((sess) => {
    sess.exercises.forEach((exItem) => {
      if (exItem.skipped) return;
      const exDef = allExercises.find((e) => e.id === exItem.exerciseId);
      if (!exDef) return;
      const validCount = exItem.sets.filter(
        (s) => s.type === 'valid' && s.completed
      ).length;
      if (validCount > 0) {
        muscleDistribution[exDef.primaryMuscle] =
          (muscleDistribution[exDef.primaryMuscle] || 0) + validCount;
      }
    });
  });

  // Exercise progression points (sorted oldest -> newest)
  const targetCanonicalId = resolveHistoryExerciseId(selectedExerciseId, allExercises);
  const exerciseProgressPoints = [...filteredSessions]
    .reverse()
    .map((sess) => {
      const exItem = sess.exercises.find(
        (e) =>
          !e.skipped &&
          resolveHistoryExerciseId(e.exerciseId, allExercises) === targetCanonicalId
      );
      if (!exItem) return null;
      const validSets = exItem.sets.filter((s) => s.type === 'valid' && s.completed);
      if (validSets.length === 0) return null;
      const maxWeight = Math.max(...validSets.map((s) => Number(s.weight) || 0));
      const maxReps = Math.max(...validSets.map((s) => Number(s.reps) || 0));
      const volume = validSets.reduce(
        (sum, s) => sum + (Number(s.weight) || 0) * (Number(s.reps) || 0),
        0
      );
      return {
        date: formatDateBR(sess.date),
        maxWeight,
        maxReps,
        volume,
      };
    })
    .filter(Boolean) as {
    date: string;
    maxWeight: number;
    maxReps: number;
    volume: number;
  }[];

  const handleSaveEditedSession = () => {
    if (!selectedSession) return;
    // Recalculate totalValidSets and totalVolumeKg consistently
    let validSetsCount = 0;
    let totalVol = 0;
    selectedSession.exercises.forEach((ex) => {
      if (ex.skipped) return;
      const exDef = allExercises.find((e) => e.id === ex.exerciseId);
      ex.sets.forEach((s) => {
        if (s.type === 'valid' && s.completed) {
          validSetsCount++;
          if (!exDef || exDef.metricMode === 'reps_weight') {
            totalVol += (Number(s.weight) || 0) * (Number(s.reps) || 0);
          }
        }
      });
    });

    const recalculated: CompletedWorkoutSession = {
      ...selectedSession,
      totalValidSets: validSetsCount,
      totalVolumeKg: totalVol,
    };
    onUpdateSessionInHistory(recalculated);
    setSelectedSession(recalculated);
    setIsEditingSession(false);
  };

  return (
    <div className="space-y-5">
      {/* Header & Sub-navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-white">
            Evolução e Histórico
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Estatísticas reais de progressão de carga, volume semanal, recordes e sessões concluídas
          </p>
        </div>

        <div className="flex items-center gap-1 p-1 rounded-2xl bg-slate-200/70 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 self-start">
          {(
            [
              { id: 'stats', label: 'Gráficos', icon: TrendingUp },
              { id: 'history', label: 'Histórico', icon: History },
              { id: 'records', label: 'Recordes', icon: Trophy },
            ] as const
          ).map((t) => {
            const Icon = t.icon;
            const active = subTab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setSubTab(t.id)}
                className={`min-h-[38px] px-3.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors ${
                  active
                    ? 'bg-orange-500 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Period Filter Bar */}
      <div className="rounded-3xl bg-white dark:bg-[#13151B] border border-slate-200 dark:border-slate-800 p-4 space-y-3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Período de análise:
          </span>
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {(
              [
                { id: '7d', label: '7 dias' },
                { id: '30d', label: '30 dias' },
                { id: '90d', label: '90 dias' },
                { id: '180d', label: '6 meses' },
                { id: '365d', label: '1 ano' },
                { id: 'custom', label: 'Personalizado' },
              ] as { id: PeriodFilter; label: string }[]
            ).map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setPeriod(p.id)}
                className={`min-h-[34px] px-3 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                  period === p.id
                    ? 'bg-orange-500 text-white'
                    : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {period === 'custom' && (
          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div>
              <label className="block text-[11px] text-slate-500 mb-1">Data inicial</label>
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="w-full min-h-[40px] px-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-mono-num"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-500 mb-1">Data final</label>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="w-full min-h-[40px] px-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-mono-num"
              />
            </div>
          </div>
        )}
      </div>

      {/* =====================================================================
          ABA 1: ESTATÍSTICAS E GRÁFICOS INTERATIVOS (SEÇÃO 11)
      ====================================================================== */}
      {subTab === 'stats' && (
        <div className="space-y-5">
          {/* Top KPI Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div className="rounded-3xl bg-white dark:bg-[#13151B] border border-slate-200 dark:border-slate-800 p-4">
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Treinos no Período
              </div>
              <div className="text-3xl font-mono-num font-bold text-slate-900 dark:text-white mt-1">
                {totalSessionsCount}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                Sessões registradas e validadas
              </div>
            </div>

            <div className="rounded-3xl bg-white dark:bg-[#13151B] border border-slate-200 dark:border-slate-800 p-4">
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Volume Efetivo Total
              </div>
              <div className="text-3xl font-mono-num font-bold text-orange-500 mt-1">
                {totalVolumePeriod.toLocaleString('pt-BR')} {weightUnit}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                Exclui séries de aquecimento
              </div>
            </div>

            <div className="rounded-3xl bg-white dark:bg-[#13151B] border border-slate-200 dark:border-slate-800 p-4">
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Duração Média
              </div>
              <div className="text-3xl font-mono-num font-bold text-slate-900 dark:text-white mt-1">
                {avgDurationSec > 0 ? `${Math.round(avgDurationSec / 60)} min` : '—'}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                Tempo médio por sessão
              </div>
            </div>
          </div>

          {/* Exercise Load & Reps Progression Chart */}
          <div className="rounded-3xl bg-white dark:bg-[#13151B] border border-slate-200 dark:border-slate-800 p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Evolução de Carga e Repetições por Exercício
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Acompanhe a progressão real de carga máxima e volume a cada sessão
                </p>
              </div>
              <select
                value={selectedExerciseId}
                onChange={(e) => setSelectedExerciseId(e.target.value)}
                className="min-h-[42px] px-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-900 dark:text-white"
              >
                {allExercises
                  .filter((e) => !e.isArchived)
                  .map((ex) => (
                    <option key={ex.id} value={ex.id}>
                      {ex.name} ({ex.primaryMuscle})
                    </option>
                  ))}
              </select>
            </div>

            {exerciseProgressPoints.length > 0 ? (
              <div className="space-y-3">
                {/* Interactive Bar/Line SVG Chart */}
                <div className="h-48 pt-4 pb-2 px-2 rounded-2xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200/70 dark:border-slate-800 flex items-end gap-3 overflow-x-auto">
                  {(() => {
                    const maxW = Math.max(
                      1,
                      ...exerciseProgressPoints.map((p) => p.maxWeight || p.maxReps)
                    );
                    return exerciseProgressPoints.map((pt, i) => {
                      const metricVal = pt.maxWeight > 0 ? pt.maxWeight : pt.maxReps;
                      const heightPct = Math.max(15, Math.round((metricVal / maxW) * 100));
                      return (
                        <div
                          key={i}
                          className="flex-1 min-w-[56px] h-full flex flex-col justify-end items-center gap-1.5"
                        >
                          <span className="text-[11px] font-mono-num font-bold text-orange-500">
                            {pt.maxWeight > 0
                              ? `${pt.maxWeight}${weightUnit}`
                              : `${pt.maxReps}r`}
                          </span>
                          <div
                            className="w-full max-w-[38px] rounded-t-xl bg-orange-500 transition-all"
                            style={{ height: `${heightPct}%` }}
                            title={`${pt.date}: ${pt.maxWeight} ${weightUnit} (${pt.maxReps} reps)`}
                          />
                          <span className="text-[10px] font-mono-num text-slate-500">
                            {pt.date.slice(0, 5)}
                          </span>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>
            ) : (
              <div className="p-8 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-dashed border-slate-200 dark:border-slate-800 text-center space-y-2">
                <BarChart3 className="w-8 h-8 text-slate-400 mx-auto" />
                <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  Sem registros para este exercício no período selecionado
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                  O IRONLOG não inventa dados fictícios. Os gráficos serão preenchidos automaticamente conforme você registrar suas séries nos treinos.
                </p>
              </div>
            )}
          </div>

          {/* Muscle Groups Trained & Body Weight Evolution */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-3xl bg-white dark:bg-[#13151B] border border-slate-200 dark:border-slate-800 p-5 space-y-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Séries Válidas por Grupo Muscular
              </h3>
              {Object.keys(muscleDistribution).length > 0 ? (
                <div className="space-y-2.5">
                  {Object.entries(muscleDistribution)
                    .sort((a, b) => b[1] - a[1])
                    .map(([muscle, count]) => {
                      const maxCount = Math.max(...Object.values(muscleDistribution));
                      const pct = Math.round((count / maxCount) * 100);
                      return (
                        <div key={muscle} className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="font-semibold text-slate-700 dark:text-slate-200">
                              {muscle}
                            </span>
                            <span className="font-mono-num text-orange-500 font-bold">
                              {count} séries
                            </span>
                          </div>
                          <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-900 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-orange-500"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                </div>
              ) : (
                <p className="text-xs text-slate-500 dark:text-slate-400 py-6 text-center">
                  Conclua seu primeiro treino para visualizar a distribuição de volume por grupo muscular.
                </p>
              )}
            </div>

            <div className="rounded-3xl bg-white dark:bg-[#13151B] border border-slate-200 dark:border-slate-800 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Evolução do Peso Corporal
                </h3>
                <Scale className="w-4 h-4 text-orange-500" />
              </div>

              {filteredMeasurements.filter((m) => m.weightKg).length > 0 ? (
                <div className="space-y-2">
                  {filteredMeasurements
                    .filter((m) => m.weightKg)
                    .slice(0, 6)
                    .map((m) => (
                      <div
                        key={m.id}
                        className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200/70 dark:border-slate-800 flex items-center justify-between text-xs"
                      >
                        <span className="text-slate-600 dark:text-slate-400">
                          {formatDateBR(m.date)}
                        </span>
                        <span className="font-mono-num font-bold text-slate-900 dark:text-white">
                          {m.weightKg} {weightUnit}
                        </span>
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 dark:text-slate-400 py-6 text-center">
                  Registre seu peso e medidas na aba Perfil para acompanhar sua curva de evolução corporal.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          ABA 2: HISTÓRICO COMPLETO DE SESSÕES E CALENDÁRIO ESTILO HEVY (SEÇÃO 10)
      ====================================================================== */}
      {subTab === 'history' && (
        <div className="space-y-4">
          {/* Interactive Monthly Workout Calendar (Hevy Screen 6 Style) */}
          {(() => {
            const baseNow = new Date();
            const viewDate = new Date(
              baseNow.getFullYear(),
              baseNow.getMonth() + calendarMonthOffset,
              1
            );
            const year = viewDate.getFullYear();
            const month = viewDate.getMonth();
            const monthLabel = viewDate.toLocaleDateString('pt-BR', {
              month: 'long',
              year: 'numeric',
            });

            const daysInMonth = new Date(year, month + 1, 0).getDate();
            // Monday-first index (0 = Seg ... 6 = Dom)
            const firstDayJs = new Date(year, month, 1).getDay();
            const startOffset = firstDayJs === 0 ? 6 : firstDayJs - 1;

            const workoutDatesMap = new Map<
              string,
              { hasWorkout: boolean; hasRest: boolean; count: number }
            >();
            sessions.forEach((s) => {
              const prev = workoutDatesMap.get(s.date) || {
                hasWorkout: false,
                hasRest: false,
                count: 0,
              };
              if (s.isRestLog) {
                prev.hasRest = true;
              } else {
                prev.hasWorkout = true;
                prev.count += 1;
              }
              workoutDatesMap.set(s.date, prev);
            });

            const cells: Array<{ day: number | null; iso: string }> = [];
            for (let i = 0; i < startOffset; i++) {
              cells.push({ day: null, iso: `empty_${i}` });
            }
            for (let d = 1; d <= daysInMonth; d++) {
              const iso = `${year}-${String(month + 1).padStart(2, '0')}-${String(
                d
              ).padStart(2, '0')}`;
              cells.push({ day: d, iso });
            }

            const totalMonthWorkouts = Array.from(workoutDatesMap.entries()).filter(
              ([iso, info]) =>
                iso.startsWith(`${year}-${String(month + 1).padStart(2, '0')}`) &&
                info.hasWorkout
            ).length;

            return (
              <div className="rounded-3xl bg-white dark:bg-[#13151B] border border-slate-200 dark:border-slate-800 p-4 sm:p-5 space-y-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold capitalize text-slate-900 dark:text-white">
                      {monthLabel}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {totalMonthWorkouts}{' '}
                      {totalMonthWorkouts === 1
                        ? 'dia treinado neste mês'
                        : 'dias treinados neste mês'}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setCalendarMonthOffset((p) => p - 1)}
                      className="min-h-[38px] min-w-[38px] rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:border-orange-500"
                      title="Mês anterior"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    {calendarMonthOffset !== 0 && (
                      <button
                        type="button"
                        onClick={() => setCalendarMonthOffset(0)}
                        className="min-h-[38px] px-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-orange-500"
                      >
                        Hoje
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setCalendarMonthOffset((p) => p + 1)}
                      className="min-h-[38px] min-w-[38px] rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:border-orange-500"
                      title="Próximo mês"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Weekday Headers */}
                <div className="grid grid-cols-7 gap-1.5 text-center text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <div>Seg</div>
                  <div>Ter</div>
                  <div>Qua</div>
                  <div>Qui</div>
                  <div>Sex</div>
                  <div>Sáb</div>
                  <div>Dom</div>
                </div>

                {/* Days Grid */}
                <div className="grid grid-cols-7 gap-1.5">
                  {cells.map((cell) => {
                    if (cell.day === null) {
                      return <div key={cell.iso} className="h-10" />;
                    }
                    const info = workoutDatesMap.get(cell.iso);
                    const isSelected = selectedCalendarDate === cell.iso;
                    const todayIso = new Date().toISOString().split('T')[0];
                    const isToday = cell.iso === todayIso;

                    return (
                      <button
                        key={cell.iso}
                        type="button"
                        onClick={() =>
                          setSelectedCalendarDate(isSelected ? null : cell.iso)
                        }
                        className={`h-10 rounded-xl font-mono-num text-xs font-bold flex flex-col items-center justify-center relative transition-all ${
                          isSelected
                            ? 'ring-2 ring-orange-500 bg-orange-500 text-white shadow-md'
                            : info?.hasWorkout
                            ? 'bg-orange-500/20 text-orange-500 border border-orange-500/40 hover:bg-orange-500/30'
                            : info?.hasRest
                            ? 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/30'
                            : isToday
                            ? 'bg-slate-200/80 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-400/40'
                            : 'bg-slate-50 dark:bg-slate-900/50 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900'
                        }`}
                      >
                        <span>{cell.day}</span>
                        {info?.hasWorkout && (
                          <span
                            className={`w-1.5 h-1.5 rounded-full mt-0.5 ${
                              isSelected ? 'bg-white' : 'bg-orange-500'
                            }`}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>

                {selectedCalendarDate && (
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80 text-xs">
                    <span className="text-slate-600 dark:text-slate-300">
                      Filtrando por data:{' '}
                      <strong className="text-orange-500 font-mono-num">
                        {formatDateBR(selectedCalendarDate)}
                      </strong>
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedCalendarDate(null)}
                      className="text-orange-500 font-bold hover:underline"
                    >
                      Mostrar todos os treinos
                    </button>
                  </div>
                )}
              </div>
            );
          })()}

          {sessions.length === 0 ? (
            <div className="rounded-3xl bg-white dark:bg-[#13151B] border border-slate-200 dark:border-slate-800 p-10 text-center space-y-3">
              <Calendar className="w-10 h-10 text-slate-400 mx-auto" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Nenhum treino finalizado ainda
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                Todas as sessões concluídas aparecerão aqui com data, duração, cargas, séries válidas e recordes batidos.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {sessions
                .filter((sess) =>
                  selectedCalendarDate ? sess.date === selectedCalendarDate : true
                )
                .map((sess) => (
                  <div
                    key={sess.id}
                    onClick={() => {
                      setSelectedSession(sess);
                      setIsEditingSession(false);
                    }}
                    className="rounded-3xl bg-white dark:bg-[#13151B] border border-slate-200 dark:border-slate-800 hover:border-orange-500/60 p-4 sm:p-5 cursor-pointer transition-colors space-y-3 shadow-sm"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2 text-xs font-mono-num text-orange-500 font-semibold">
                          <span>{formatDateBR(sess.date)}</span>
                          {!sess.isRestLog && (
                            <>
                              <span>·</span>
                              <span>{formatDurationSeconds(sess.durationSeconds)}</span>
                            </>
                          )}
                        </div>
                        <h3 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
                          {sess.routineName}
                        </h3>
                      </div>

                      {!sess.isRestLog && (
                        <div className="flex items-center gap-3 text-xs font-mono-num">
                          <span className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300">
                            <strong>{sess.totalValidSets}</strong> séries
                          </span>
                          <span className="px-2.5 py-1 rounded-xl bg-orange-500/10 text-orange-500 font-bold">
                            {sess.totalVolumeKg.toLocaleString('pt-BR')} {weightUnit}
                          </span>
                        </div>
                      )}
                    </div>

                    {sess.isRestLog ? (
                      <p className="text-xs text-emerald-500 font-medium">
                        Registro de Descanso / Recuperação: {sess.notes}
                      </p>
                    ) : (
                      <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                        {sess.exercises
                          .filter((e) => !e.skipped)
                          .map((e, idx) => {
                            const exObj = allExercises.find((x) => x.id === e.exerciseId);
                            const validSets = e.sets.filter(
                              (s) => s.type === 'valid' && s.completed
                            );
                            if (validSets.length === 0) return null;
                            const bestSet = validSets.reduce(
                              (best, cur) =>
                                cur.weight > best.weight ||
                                (cur.weight === best.weight && cur.reps > best.reps)
                                  ? cur
                                  : best,
                              validSets[0]
                            );
                            return (
                              <div
                                key={e.id || idx}
                                className="flex items-center justify-between text-xs py-1 px-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900/80 transition-colors"
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <span className="font-mono-num font-bold text-orange-500">
                                    {validSets.length}×
                                  </span>
                                  <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                                    {exObj?.name || 'Exercício'}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 shrink-0 font-mono-num text-slate-500 dark:text-slate-400">
                                  <span>
                                    Melhor: {bestSet.weight} {weightUnit} × {bestSet.reps}
                                  </span>
                                  {exObj && (
                                    <button
                                      type="button"
                                      onClick={(ev) => {
                                        ev.stopPropagation();
                                        setInspectExercise(exObj);
                                      }}
                                      className="p-1 rounded-lg hover:bg-orange-500/15 text-orange-500"
                                      title="Ver detalhes e gráfico do exercício"
                                    >
                                      <Info className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    )}
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* =====================================================================
          ABA 3: RECORDES PESSOAIS E EXPLICAÇÃO DE CÁLCULO (SEÇÃO 11)
      ====================================================================== */}
      {subTab === 'records' && (
        <div className="space-y-4">
          <div className="rounded-3xl bg-white dark:bg-[#13151B] border border-slate-200 dark:border-slate-800 p-5 space-y-3">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
              <HelpCircle className="w-4 h-4 text-orange-500" />
              <span>Como os Recordes Pessoais (PRs) são calculados no IRONLOG</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600 dark:text-slate-300">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900">
                <strong className="text-slate-900 dark:text-white block mb-0.5">
                  1. Maior Carga Registrada
                </strong>
                Maior peso absoluto concluído em uma série válida daquele exercício.
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900">
                <strong className="text-slate-900 dark:text-white block mb-0.5">
                  2. Maior Número de Repetições na Carga
                </strong>
                Maior quantidade de repetições realizadas para um mesmo peso já utilizado antes.
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900">
                <strong className="text-slate-900 dark:text-white block mb-0.5">
                  3. Maior Volume em uma Série
                </strong>
                Maior produto de (Carga × Repetições) atingido em uma única série válida.
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900">
                <strong className="text-slate-900 dark:text-white block mb-0.5">
                  4. Maior Volume em um Treino
                </strong>
                Soma total de (Carga × Repetições) de todas as séries válidas do exercício na sessão.
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {allExercises
              .filter((e) => !e.isArchived && e.metricMode === 'reps_weight')
              .map((ex) => {
                const rec = getExerciseRecords(ex.id, sessions, allExercises);
                if (!rec.maxWeight) return null;
                return (
                  <div
                    key={ex.id}
                    onClick={() => setInspectExercise(ex)}
                    className="rounded-3xl bg-white dark:bg-[#13151B] border border-slate-200 dark:border-slate-800 hover:border-orange-500/60 p-4 space-y-2.5 cursor-pointer transition-colors group"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-orange-500 transition-colors flex items-center gap-1">
                          <span>{ex.name}</span>
                          <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-orange-500" />
                        </h4>
                        <span className="text-[11px] text-slate-500">
                          {ex.primaryMuscle} · {ex.equipment}
                        </span>
                      </div>
                      <Trophy className="w-5 h-5 text-orange-500 shrink-0" />
                    </div>
                    <div className="grid grid-cols-3 gap-2 pt-1 text-xs font-mono-num">
                      <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900">
                        <div className="text-[10px] text-slate-400">Carga Máx</div>
                        <div className="font-bold text-orange-500">
                          {rec.maxWeight.weight} {weightUnit}
                        </div>
                      </div>
                      <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900">
                        <div className="text-[10px] text-slate-400">Melhor Série</div>
                        <div className="font-bold text-slate-800 dark:text-slate-200">
                          {rec.maxSetVolume?.volume || 0} {weightUnit}
                        </div>
                      </div>
                      <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900">
                        <div className="text-[10px] text-slate-400">Vol. Sessão</div>
                        <div className="font-bold text-slate-800 dark:text-slate-200">
                          {rec.maxSessionVolume?.volume || 0} {weightUnit}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL DETALHADO DE SESSÃO ANTIGA (CONSULTAR, REPETIR OU EDITAR — SEÇÃO 10)
      ====================================================================== */}
      {selectedSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-2xl rounded-3xl bg-white dark:bg-[#13151B] border border-slate-200 dark:border-slate-800 p-5 sm:p-6 space-y-4 shadow-2xl my-auto max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-xs font-mono-num text-orange-500 font-semibold">
                  {formatDateBR(selectedSession.date)} ·{' '}
                  {formatDurationSeconds(selectedSession.durationSeconds)}
                </div>
                <h3 className="font-display text-3xl font-bold text-slate-900 dark:text-white">
                  {selectedSession.routineName}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedSession(null)}
                className="min-h-[44px] min-w-[44px] rounded-xl flex items-center justify-center text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {!selectedSession.isRestLog && (
              <div className="space-y-3">
                {selectedSession.exercises.map((exItem, exIdx) => {
                  const exObj = allExercises.find((x) => x.id === exItem.exerciseId);
                  return (
                    <div
                      key={exItem.id || exIdx}
                      className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 space-y-2"
                    >
                      <div className="text-sm font-bold text-slate-900 dark:text-white">
                        {exIdx + 1}. {exObj?.name || 'Exercício'}
                      </div>
                      <div className="space-y-1.5">
                        {exItem.sets.map((st, sIdx) => (
                          <div
                            key={st.id || sIdx}
                            className="flex items-center justify-between text-xs font-mono-num"
                          >
                            <span className="text-slate-500">
                              {st.type === 'warmup' ? 'Aquecimento' : `Série ${sIdx + 1}`}
                            </span>
                            {isEditingSession ? (
                              <div className="flex items-center gap-2">
                                <input
                                  type="number"
                                  step="0.5"
                                  value={st.weight}
                                  onChange={(e) => {
                                    const nextW = Number(e.target.value);
                                    const nextExs = selectedSession.exercises.map(
                                      (item, i) =>
                                        i === exIdx
                                          ? {
                                              ...item,
                                              sets: item.sets.map((s, si) =>
                                                si === sIdx ? { ...s, weight: nextW } : s
                                              ),
                                            }
                                          : item
                                    );
                                    setSelectedSession({
                                      ...selectedSession,
                                      exercises: nextExs,
                                    });
                                  }}
                                  className="w-20 px-2 py-1 rounded-lg bg-white dark:bg-[#13151B] border border-slate-300 dark:border-slate-700 text-center"
                                />
                                <span>{weightUnit} ×</span>
                                <input
                                  type="number"
                                  value={st.reps}
                                  onChange={(e) => {
                                    const nextR = Number(e.target.value);
                                    const nextExs = selectedSession.exercises.map(
                                      (item, i) =>
                                        i === exIdx
                                          ? {
                                              ...item,
                                              sets: item.sets.map((s, si) =>
                                                si === sIdx ? { ...s, reps: nextR } : s
                                              ),
                                            }
                                          : item
                                    );
                                    setSelectedSession({
                                      ...selectedSession,
                                      exercises: nextExs,
                                    });
                                  }}
                                  className="w-16 px-2 py-1 rounded-lg bg-white dark:bg-[#13151B] border border-slate-300 dark:border-slate-700 text-center"
                                />
                                <span>reps</span>
                              </div>
                            ) : (
                              <span className="font-bold text-slate-900 dark:text-white">
                                {st.weight} {weightUnit} × {st.reps} reps
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {selectedSession.notes && (
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 text-xs text-slate-600 dark:text-slate-300">
                <strong>Observações:</strong> {selectedSession.notes}
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                {!selectedSession.isRestLog && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        onRepeatSession(selectedSession);
                        setSelectedSession(null);
                      }}
                      className="min-h-[44px] px-4 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold flex items-center gap-1.5"
                    >
                      <Play className="w-3.5 h-3.5 fill-white" />
                      <span>Repetir este Treino</span>
                    </button>

                    {isEditingSession ? (
                      <button
                        type="button"
                        onClick={handleSaveEditedSession}
                        className="min-h-[44px] px-4 rounded-xl bg-emerald-600 text-white text-xs font-bold flex items-center gap-1.5"
                      >
                        <Check className="w-4 h-4" />
                        <span>Salvar Edição</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setIsEditingSession(true)}
                        className="min-h-[44px] px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold flex items-center gap-1.5"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-orange-500" />
                        <span>Editar Sessão</span>
                      </button>
                    )}
                  </>
                )}
              </div>

              <button
                type="button"
                onClick={() => {
                  onDeleteSessionFromHistory(selectedSession.id);
                  setSelectedSession(null);
                }}
                className="min-h-[44px] px-3.5 rounded-xl text-rose-500 hover:bg-rose-500/10 text-xs font-semibold flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>Excluir Registro</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL DETALHADO DO EXERCÍCIO (ESTILO HEVY)
      ====================================================================== */}
      {inspectExercise && (
        <ExerciseDetailModal
          exercise={inspectExercise}
          sessions={sessions}
          allExercises={allExercises}
          weightUnit={weightUnit}
          onClose={() => setInspectExercise(null)}
        />
      )}
    </div>
  );
};
