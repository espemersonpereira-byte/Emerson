import React, { useState } from 'react';
import {
  ArrowRight,
  Calendar,
  Check,
  ChevronRight,
  Dumbbell,
  Flame,
  HeartHandshake,
  History,
  Play,
  TrendingUp,
  User,
  Zap,
} from 'lucide-react';
import {
  ActiveWorkoutSession,
  BodyMeasurementEntry,
  CompletedWorkoutSession,
  Exercise,
  Routine,
  UserProfile,
} from '../types';
import { ExerciseAnimator } from './ExerciseAnimator';
import { ExerciseDetailModal } from './ExerciseDetailModal';
import {
  formatDateBR,
  formatDurationSeconds,
  getLastSessionForExercise,
} from '../utils/workoutHelpers';

interface TodayDashboardViewProps {
  profile: UserProfile;
  routines: Routine[];
  allExercises: Exercise[];
  sessions: CompletedWorkoutSession[];
  measurements: BodyMeasurementEntry[];
  activeWorkout: ActiveWorkoutSession | null;
  onStartRoutine: (routine: Routine, forceGymMode?: boolean) => void;
  onStartFreeWorkout: () => void;
  onResumeActiveWorkout: () => void;
  onNavigateTab: (tab: 'today' | 'routines' | 'exercises' | 'evolution' | 'profile') => void;
  onLogRestDay: (dayTitle: string, note: string) => void;
  onOpenAvatarLightbox: () => void;
}

const WEEK_DAYS_ORDER = [
  { day: 1, letter: 'S', short: 'Seg', full: 'Segunda-feira' },
  { day: 2, letter: 'T', short: 'Ter', full: 'Terça-feira' },
  { day: 3, letter: 'Q', short: 'Qua', full: 'Quarta-feira' },
  { day: 4, letter: 'Q', short: 'Qui', full: 'Quinta-feira' },
  { day: 5, letter: 'S', short: 'Sex', full: 'Sexta-feira' },
  { day: 6, letter: 'S', short: 'Sáb', full: 'Sábado' },
  { day: 0, letter: 'D', short: 'Dom', full: 'Domingo' },
];

export const TodayDashboardView: React.FC<TodayDashboardViewProps> = ({
  profile,
  routines,
  allExercises,
  sessions,
  measurements,
  activeWorkout,
  onStartRoutine,
  onStartFreeWorkout,
  onResumeActiveWorkout,
  onNavigateTab,
  onLogRestDay,
  onOpenAvatarLightbox,
}) => {
  const now = new Date();
  const todayDayOfWeek = now.getDay(); // 0..6
  const [selectedDayOfWeek, setSelectedDayOfWeek] = useState<number>(todayDayOfWeek);
  const [restLoggedFeedback, setRestLoggedFeedback] = useState(false);
  const [inspectExercise, setInspectExercise] = useState<{
    exercise: Exercise;
    setsCount?: number;
    minReps?: number;
    maxReps?: number;
    restSeconds?: number;
  } | null>(null);

  const unit = profile.weightUnit;
  const hour = now.getHours();
  const greetingPrefix =
    hour >= 5 && hour < 12
      ? 'Bom dia'
      : hour >= 12 && hour < 18
      ? 'Boa tarde'
      : 'Boa noite';

  const formattedToday = now.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  // Planned routine for selected day
  const plannedRoutine =
    routines.find((r) => r.daysOfWeek.includes(selectedDayOfWeek)) || null;

  // Last completed workout session (excluding pure rest notes)
  const workoutSessions = sessions.filter((s) => !s.isRestLog);
  const lastWorkout = workoutSessions[0] || null;

  // Weekly & Monthly completed workouts
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 3600 * 1000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 3600 * 1000);
  const sessionsThisWeek = workoutSessions.filter(
    (s) => new Date(`${s.date}T12:00:00`) >= sevenDaysAgo
  );
  const sessionsThisMonth = workoutSessions.filter(
    (s) => new Date(`${s.date}T12:00:00`) >= thirtyDaysAgo
  );

  // Total training time across sessions
  const totalSecondsAll = workoutSessions.reduce(
    (acc, s) => acc + (s.durationSeconds || 0),
    0
  );
  const totalHours = Math.floor(totalSecondsAll / 3600);
  const totalMinutesRem = Math.max(1, Math.round((totalSecondsAll % 3600) / 60));
  const totalTimeFormatted =
    totalHours > 0 ? `${totalHours}h ${totalMinutesRem}m` : `${totalMinutesRem}m`;

  // Rest-friendly streak calculation
  const trainedDatesSet = new Set(sessions.map((s) => s.date));
  const disciplineStreak = Math.max(
    sessionsThisWeek.length,
    trainedDatesSet.size
  );

  // Trained weekdays in current 7-day window
  const trainedWeekdaysSet = new Set(
    sessionsThisWeek.map((s) => new Date(`${s.date}T12:00:00`).getDay())
  );

  // Latest body weight delta
  const weightEntries = measurements.filter((m) => m.weightKg && m.weightKg > 0);
  const latestWeight =
    weightEntries[0]?.weightKg || profile.currentWeightKg || 0;
  const previousWeight =
    weightEntries[1]?.weightKg || latestWeight;
  const weightDelta = Number((latestWeight - previousWeight).toFixed(1));

  return (
    <div className="space-y-5">
      {/* Greeting & Profile Header (Hevy Top Home Header) */}
      <div className="rounded-3xl bg-white dark:bg-[#13151B] border border-slate-200 dark:border-slate-800 p-5 flex items-center justify-between gap-4">
        <div className="min-w-0">
          <div className="text-xs font-semibold text-orange-500">Início</div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white truncate mt-0.5">
            {greetingPrefix}, {profile.name || 'Atleta'}!
          </h1>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500 dark:text-slate-400 mt-1 capitalize">
            <span>{formattedToday}</span>
            <span>·</span>
            <span>{profile.experienceLevel}</span>
            <span>·</span>
            <span>Meta: {profile.targetDaysPerWeek}x/sem</span>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenAvatarLightbox}
          className="relative w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 flex items-center justify-center overflow-hidden shrink-0 hover:border-orange-500 transition-all group"
          title="Toque para expandir ou trocar foto de perfil"
        >
          {profile.avatarUrl ? (
            <img
              src={profile.avatarUrl}
              alt={profile.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
            />
          ) : (
            <User className="w-6 h-6 text-orange-500" />
          )}
        </button>
      </div>

      {/* Active Workout Recovery Banner if session is in progress */}
      {activeWorkout && (
        <div className="rounded-3xl bg-orange-500 text-white p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl shadow-orange-500/25">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-orange-100">
              Sessão em andamento salva automaticamente
            </div>
            <h2 className="font-display text-2xl font-bold mt-0.5">
              {activeWorkout.routineName}
            </h2>
            <p className="text-xs text-orange-100 mt-0.5">
              Exercício {activeWorkout.currentExerciseIndex + 1} de{' '}
              {activeWorkout.exercises.length}
            </p>
          </div>
          <button
            type="button"
            onClick={onResumeActiveWorkout}
            className="min-h-[48px] px-5 rounded-2xl bg-slate-950 hover:bg-slate-900 text-white text-sm font-bold flex items-center justify-center gap-2 shrink-0"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>RETOMAR TREINO</span>
          </button>
        </div>
      )}

      {/* Main Layout Grid (Desktop 12-col, Mobile stacked) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left/Primary Column: Treino do Dia Card */}
        <div className="lg:col-span-7 rounded-3xl bg-white dark:bg-[#13151B] border border-slate-200 dark:border-slate-800 p-5 sm:p-6 space-y-5">
          {plannedRoutine && !plannedRoutine.isRestDay && plannedRoutine.exercises.length > 0 ? (
            <>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    Treino do dia · {plannedRoutine.subtitle || 'Programado'}
                  </div>
                  <h2 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mt-0.5">
                    {plannedRoutine.name}
                  </h2>
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-1">
                    <span>{plannedRoutine.exercises.length} exercícios</span>
                    <span>·</span>
                    <span>~{plannedRoutine.estimatedMinutes} min</span>
                    <span>·</span>
                    <span>
                      {plannedRoutine.exercises.reduce(
                        (acc, e) => acc + e.sets.filter((s) => s.type === 'valid').length,
                        0
                      )}{' '}
                      séries
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onNavigateTab('routines')}
                  className="min-h-[40px] px-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:border-orange-500 flex items-center gap-1 shrink-0"
                  title="Personalizar Rotina"
                >
                  <span>Editar</span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>
              </div>

              {/* Primary CTA Buttons: INICIAR TREINO & Modo Academia */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                <button
                  type="button"
                  onClick={() => onStartRoutine(plannedRoutine, false)}
                  className="sm:col-span-8 min-h-[54px] rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-display text-xl font-bold tracking-wide flex items-center justify-center gap-2.5 shadow-lg shadow-orange-500/25 transition-colors"
                >
                  <Play className="w-5 h-5 fill-white" />
                  <span>INICIAR TREINO</span>
                </button>

                <button
                  type="button"
                  onClick={() => onStartRoutine(plannedRoutine, true)}
                  className="sm:col-span-4 min-h-[54px] rounded-2xl border border-orange-500/40 bg-orange-500/10 hover:bg-orange-500/20 text-orange-500 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                  title="Abrir diretamente no Modo Academia com números grandes"
                >
                  <Zap className="w-4 h-4" />
                  <span>Modo Academia</span>
                </button>
              </div>

              {/* Exercises Preview List with Last Load Suggestion & Tap to Inspect */}
              <div className="space-y-2.5 pt-1">
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
                  <span>Exercícios programados (toque para ver execução e histórico)</span>
                  <span className="font-mono-num">Última carga</span>
                </div>

                {plannedRoutine.exercises.map((item, idx) => {
                  const exDef =
                    allExercises.find((e) => e.id === item.exerciseId) || allExercises[0];
                  const validSets = item.sets.filter((s) => s.type === 'valid');
                  const lastPerf = getLastSessionForExercise(
                    exDef.id,
                    sessions,
                    allExercises
                  );

                  return (
                    <div
                      key={item.id}
                      onClick={() =>
                        setInspectExercise({
                          exercise: exDef,
                          setsCount: validSets.length,
                          minReps: validSets[0]?.minReps,
                          maxReps: validSets[0]?.maxReps,
                          restSeconds: item.restSeconds,
                        })
                      }
                      className="group p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200/70 dark:border-slate-800 hover:border-orange-500/50 flex items-center justify-between gap-3 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <ExerciseAnimator
                          exercise={exDef}
                          compact
                          className="w-14 h-14 rounded-xl shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="text-sm font-bold text-slate-900 dark:text-white truncate group-hover:text-orange-500 transition-colors">
                            {idx + 1}. {exDef.name}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">
                            {validSets.length} séries ·{' '}
                            {exDef.metricMode === 'reps_weight'
                              ? `${validSets[0]?.minReps || 8}–${
                                  validSets[0]?.maxReps || 12
                                } rep`
                              : `${validSets[0]?.maxReps || 20} ${
                                  exDef.metricMode === 'duration_seconds' ? 'seg' : 'min'
                                }`}{' '}
                            · {item.restSeconds || exDef.defaultRestSeconds}s
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {lastPerf ? (
                          <div className="text-right">
                            <div className="text-xs font-mono-num text-orange-500 font-bold">
                              {lastPerf.maxWeightKg} {unit}
                            </div>
                            <div className="text-[10px] text-slate-400">anterior</div>
                          </div>
                        ) : (
                          <div className="text-xs font-mono-num text-slate-400">
                            {validSets[0]?.targetWeight
                              ? `${validSets[0].targetWeight} ${unit}`
                              : 'Livre'}
                          </div>
                        )}
                        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-orange-500 transition-colors" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            /* REST DAY OR UNSCHEDULED DAY VIEW */
            <div className="space-y-4 py-2">
              <div className="flex items-start gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center shrink-0">
                  <HeartHandshake className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-500">
                    {plannedRoutine?.subtitle || 'Dia de Descanso e Recuperação'}
                  </span>
                  <h2 className="font-display text-3xl font-bold text-slate-900 dark:text-white mt-0.5">
                    {plannedRoutine?.name || 'Recuperação Muscular Programada'}
                  </h2>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                    Hoje é seu dia de descanso planejado. Sua sequência de treinos é preservada sem punição. Aproveite para recuperar ou inicie um treino livre caso deseje treinar hoje.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    onLogRestDay(
                      plannedRoutine?.subtitle || 'Descanso Programado',
                      'Recuperação muscular e alongamento regenerativo'
                    );
                    setRestLoggedFeedback(true);
                    setTimeout(() => setRestLoggedFeedback(false), 2500);
                  }}
                  className="min-h-[48px] px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>
                    {restLoggedFeedback
                      ? 'Descanso Registrado no Histórico!'
                      : 'Registrar Dia de Recuperação'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={onStartFreeWorkout}
                  className="min-h-[48px] px-4 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold flex items-center justify-center gap-2"
                >
                  <Dumbbell className="w-4 h-4" />
                  <span>INICIAR TREINO LIVRE</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right/Secondary Column: Último Treino + Sua Semana (Hevy Style) + Evolução */}
        <div className="lg:col-span-5 space-y-4">
          {/* Card: Último Treino (Exact Hevy Home Layout) */}
          <div
            onClick={() => onNavigateTab('evolution')}
            className="group rounded-3xl bg-white dark:bg-[#13151B] border border-slate-200 dark:border-slate-800 hover:border-orange-500/50 p-5 space-y-2 cursor-pointer transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Último treino
              </span>
              <span className="text-xs font-mono-num text-orange-500 font-semibold">
                {lastWorkout ? formatDateBR(lastWorkout.date) : ''}
              </span>
            </div>

            {lastWorkout ? (
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white truncate group-hover:text-orange-500 transition-colors">
                    {lastWorkout.routineName}
                  </h3>
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs font-mono-num text-slate-500 dark:text-slate-400 mt-0.5">
                    <span>
                      {
                        lastWorkout.exercises.filter(
                          (e) =>
                            !e.skipped &&
                            e.sets.some((s) => s.type === 'valid' && s.completed)
                        ).length
                      }
                      /{lastWorkout.exercises.length} exercícios
                    </span>
                    <span>·</span>
                    <span>{Math.max(1, Math.round(lastWorkout.durationSeconds / 60))} min</span>
                    <span>·</span>
                    <span>{lastWorkout.totalValidSets} séries</span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-orange-500 shrink-0" />
              </div>
            ) : (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Nenhum treino concluído ainda. Inicie seu treino hoje!
              </p>
            )}
          </div>

          {/* Card: Sua Semana (Exact Hevy 7-Day Bubbles + 3 Metric Boxes) */}
          <div className="rounded-3xl bg-white dark:bg-[#13151B] border border-slate-200 dark:border-slate-800 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Sua semana
              </h3>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-orange-500">
                <Flame className="w-4 h-4" />
                <span>
                  Sequência: {disciplineStreak} {disciplineStreak === 1 ? 'dia' : 'dias'}
                </span>
              </div>
            </div>

            {/* 7-Day Circular Selector Row (S T Q Q S S D) */}
            <div className="grid grid-cols-7 gap-1.5 text-center">
              {WEEK_DAYS_ORDER.map((wd) => {
                const isSelected = selectedDayOfWeek === wd.day;
                const isToday = todayDayOfWeek === wd.day;
                const wasTrained = trainedWeekdaysSet.has(wd.day);
                const dayRoutine = routines.find((r) => r.daysOfWeek.includes(wd.day));
                const isRest = dayRoutine?.isRestDay;

                return (
                  <button
                    key={wd.day}
                    type="button"
                    onClick={() => setSelectedDayOfWeek(wd.day)}
                    className="flex flex-col items-center gap-1.5 py-1 group focus:outline-none"
                    title={`${wd.full}: ${dayRoutine?.name || 'Livre'}`}
                  >
                    <span
                      className={`text-[11px] font-bold ${
                        isSelected || isToday
                          ? 'text-orange-500'
                          : 'text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      {wd.letter}
                    </span>
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-mono-num font-bold transition-all ${
                        isSelected
                          ? 'bg-orange-500 text-white ring-4 ring-orange-500/20'
                          : wasTrained
                          ? 'bg-orange-500/15 border-2 border-orange-500 text-orange-500'
                          : isToday
                          ? 'border-2 border-orange-500 text-slate-900 dark:text-white'
                          : isRest
                          ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-500'
                          : 'bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400'
                      }`}
                    >
                      {wasTrained ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                      )}
                    </div>
                    <span className="text-[9px] text-slate-400 truncate max-w-full">
                      {isToday ? 'Hoje' : wd.short}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* 3 Hevy Summary Stat Boxes (Treinos esta semana | Treinos no mês | Tempo total) */}
            <div className="grid grid-cols-3 gap-2.5 pt-1">
              <div className="rounded-2xl bg-slate-50 dark:bg-[#16181F] border border-slate-200/70 dark:border-slate-800 p-3 text-center">
                <div className="text-xl font-mono-num font-bold text-slate-900 dark:text-white">
                  {sessionsThisWeek.length}
                </div>
                <div className="text-[11px] font-semibold text-orange-500 mt-0.5">
                  Treinos
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">
                  esta semana
                </div>
              </div>

              <div className="rounded-2xl bg-slate-50 dark:bg-[#16181F] border border-slate-200/70 dark:border-slate-800 p-3 text-center">
                <div className="text-xl font-mono-num font-bold text-slate-900 dark:text-white">
                  {sessionsThisMonth.length}
                </div>
                <div className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 mt-0.5">
                  Treinos
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">
                  no mês
                </div>
              </div>

              <div className="rounded-2xl bg-slate-50 dark:bg-[#16181F] border border-slate-200/70 dark:border-slate-800 p-3 text-center">
                <div className="text-xl font-mono-num font-bold text-slate-900 dark:text-white">
                  {totalTimeFormatted}
                </div>
                <div className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 mt-0.5">
                  Tempo total
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">
                  acumulado
                </div>
              </div>
            </div>
          </div>

          {/* Body Weight & Load Evolution Shortcut */}
          <div className="rounded-3xl bg-white dark:bg-[#13151B] border border-slate-200 dark:border-slate-800 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <TrendingUp className="w-4 h-4 text-orange-500" />
                <span>Evolução Corporal e Cargas</span>
              </div>
              <button
                type="button"
                onClick={() => onNavigateTab('profile')}
                className="text-xs font-semibold text-orange-500 hover:underline"
              >
                Atualizar Peso
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#16181F] border border-slate-200/70 dark:border-slate-800">
                <div className="text-[11px] text-slate-500">Peso Corporal Atual</div>
                <div className="text-lg font-mono-num font-bold text-slate-900 dark:text-white mt-0.5">
                  {latestWeight} {unit}
                </div>
                {weightDelta !== 0 && (
                  <div className="text-[11px] font-mono-num text-orange-500">
                    {weightDelta > 0 ? `+${weightDelta}` : weightDelta} {unit}
                  </div>
                )}
              </div>

              <div
                onClick={() => onNavigateTab('evolution')}
                className="p-3 rounded-2xl bg-slate-50 dark:bg-[#16181F] border border-slate-200/70 dark:border-slate-800 cursor-pointer hover:border-orange-500/50 transition-colors"
              >
                <div className="text-[11px] text-slate-500">Histórico Salvo</div>
                <div className="text-lg font-mono-num font-bold text-slate-900 dark:text-white mt-0.5">
                  {workoutSessions.length} {workoutSessions.length === 1 ? 'sessão' : 'sessões'}
                </div>
                <div className="text-[11px] text-orange-500 font-semibold flex items-center gap-0.5">
                  <span>Ver evolução</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Exercise Detail & Evolution Modal when tapping an exercise on Today's Routine */}
      <ExerciseDetailModal
        exercise={inspectExercise?.exercise || null}
        allExercises={allExercises}
        sessions={sessions}
        routines={routines}
        weightUnit={unit}
        onClose={() => setInspectExercise(null)}
        programmedSetsCount={inspectExercise?.setsCount}
        programmedMinReps={inspectExercise?.minReps}
        programmedMaxReps={inspectExercise?.maxReps}
        programmedRestSeconds={inspectExercise?.restSeconds}
      />
    </div>
  );
};
