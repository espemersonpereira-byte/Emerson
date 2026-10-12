import React, { useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  Calendar,
  Check,
  ChevronRight,
  Clock,
  Copy,
  Dumbbell,
  Edit3,
  Flame,
  HeartHandshake,
  History,
  Info,
  Play,
  Plus,
  RotateCcw,
  Search,
  Sliders,
  Trash2,
  X,
} from 'lucide-react';
import {
  CompletedWorkoutSession,
  Exercise,
  Routine,
  RoutineExerciseItem,
  RoutineSetTemplate,
  WeightUnit,
} from '../types';
import { ExerciseAnimator } from './ExerciseAnimator';
import { ExerciseDetailModal } from './ExerciseDetailModal';
import { getLastSessionForExercise } from '../utils/workoutHelpers';

interface RoutinesViewProps {
  routines: Routine[];
  allExercises: Exercise[];
  sessions: CompletedWorkoutSession[];
  weightUnit: WeightUnit;
  onUpdateRoutines: (next: Routine[]) => void;
  onStartRoutine: (routine: Routine) => void;
  onStartFreeWorkout: () => void;
  onLogRestDay: (dayTitle: string, activityNote: string) => void;
  onRestoreDefaultRoutines: () => void;
}

const WEEK_DAYS = [
  { day: 1, short: 'Seg', full: 'Segunda-feira' },
  { day: 2, short: 'Ter', full: 'Terça-feira' },
  { day: 3, short: 'Qua', full: 'Quarta-feira' },
  { day: 4, short: 'Qui', full: 'Quinta-feira' },
  { day: 5, short: 'Sex', full: 'Sexta-feira' },
  { day: 6, short: 'Sáb', full: 'Sábado' },
  { day: 0, short: 'Dom', full: 'Domingo' },
];

export const RoutinesView: React.FC<RoutinesViewProps> = ({
  routines,
  allExercises,
  sessions,
  weightUnit,
  onUpdateRoutines,
  onStartRoutine,
  onStartFreeWorkout,
  onLogRestDay,
  onRestoreDefaultRoutines,
}) => {
  const [selectedRoutineId, setSelectedRoutineId] = useState<string>(
    routines[0]?.id || ''
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [editingRoutineMeta, setEditingRoutineMeta] = useState<Routine | null>(null);
  const [expandedExerciseItemId, setExpandedExerciseItemId] = useState<string | null>(null);

  // Add or Swap Exercise Picker Modal
  const [pickerState, setPickerState] = useState<{
    open: boolean;
    mode: 'add' | 'swap_abs' | 'swap_any';
    routineId: string;
    targetRoutineExerciseItemId?: string;
    filterMuscle?: string;
  }>({ open: false, mode: 'add', routineId: '' });
  const [pickerSearch, setPickerSearch] = useState('');

  // Copy exercise to another routine modal
  const [copyItemModal, setCopyItemModal] = useState<{
    item: RoutineExerciseItem;
    fromRoutineId: string;
  } | null>(null);

  // Delete confirmation modal
  const [confirmDeleteRoutineId, setConfirmDeleteRoutineId] = useState<string | null>(null);
  const [confirmRestoreDefaults, setConfirmRestoreDefaults] = useState(false);
  const [restNote, setRestNote] = useState('Recuperação muscular completa e mobilidade leve');
  const [restSavedToast, setRestSavedToast] = useState(false);
  const [inspectExerciseState, setInspectExerciseState] = useState<{
    exercise: Exercise;
    item?: RoutineExerciseItem;
  } | null>(null);

  const selectedRoutine =
    routines.find((r) => r.id === selectedRoutineId) || routines[0] || null;

  const updateSingleRoutine = (updated: Routine) => {
    onUpdateRoutines(routines.map((r) => (r.id === updated.id ? updated : r)));
  };

  const handleCreateNewRoutine = () => {
    const newRoutine: Routine = {
      id: `routine_custom_${Date.now()}`,
      name: 'NOVA ROTINA PERSONALIZADA',
      subtitle: 'Personalizada',
      description: 'Rotina criada sob medida com progressão de cargas.',
      daysOfWeek: [],
      estimatedMinutes: 50,
      exercises: [],
    };
    onUpdateRoutines([...routines, newRoutine]);
    setSelectedRoutineId(newRoutine.id);
    setEditingRoutineMeta(newRoutine);
  };

  const handleDuplicateRoutine = (routine: Routine) => {
    const dup: Routine = {
      ...routine,
      id: `routine_dup_${Date.now()}`,
      name: `${routine.name} (Cópia)`,
      isDefault: false,
      exercises: routine.exercises.map((ex, i) => ({
        ...ex,
        id: `re_dup_${Date.now()}_${i}`,
        sets: ex.sets.map((s, si) => ({
          ...s,
          id: `set_dup_${Date.now()}_${i}_${si}`,
        })),
      })),
    };
    onUpdateRoutines([...routines, dup]);
    setSelectedRoutineId(dup.id);
  };

  const handleDeleteRoutine = (id: string) => {
    const remaining = routines.filter((r) => r.id !== id);
    onUpdateRoutines(remaining);
    if (selectedRoutineId === id && remaining.length > 0) {
      setSelectedRoutineId(remaining[0].id);
    }
    setConfirmDeleteRoutineId(null);
  };

  const moveExercise = (routine: Routine, index: number, direction: -1 | 1) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= routine.exercises.length) return;
    const list = [...routine.exercises];
    const [moved] = list.splice(index, 1);
    list.splice(targetIndex, 0, moved);
    updateSingleRoutine({ ...routine, exercises: list });
  };

  const removeExerciseFromRoutine = (routine: Routine, itemId: string) => {
    updateSingleRoutine({
      ...routine,
      exercises: routine.exercises.filter((e) => e.id !== itemId),
    });
  };

  const addSetToRoutineExercise = (
    routine: Routine,
    item: RoutineExerciseItem,
    type: 'valid' | 'warmup'
  ) => {
    const exDef = allExercises.find((e) => e.id === item.exerciseId);
    const refSet = item.sets[item.sets.length - 1];
    const newSet: RoutineSetTemplate = {
      id: `rset_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      type,
      minReps: refSet?.minReps ?? exDef?.defaultMinReps ?? 8,
      maxReps: refSet?.maxReps ?? exDef?.defaultMaxReps ?? 12,
      targetWeight:
        type === 'warmup'
          ? Math.round((refSet?.targetWeight || exDef?.defaultWeight || 20) * 0.5)
          : refSet?.targetWeight ?? exDef?.defaultWeight ?? 20,
      restSeconds: item.restSeconds || 90,
      technique: 'Normal',
      rpeTarget: 8,
    };

    const nextSets =
      type === 'warmup'
        ? [
            ...item.sets.filter((s) => s.type === 'warmup'),
            newSet,
            ...item.sets.filter((s) => s.type === 'valid'),
          ]
        : [...item.sets, newSet];

    updateSingleRoutine({
      ...routine,
      exercises: routine.exercises.map((e) =>
        e.id === item.id ? { ...e, sets: nextSets } : e
      ),
    });
  };

  const updateRoutineSet = (
    routine: Routine,
    itemId: string,
    setId: string,
    partial: Partial<RoutineSetTemplate>
  ) => {
    updateSingleRoutine({
      ...routine,
      exercises: routine.exercises.map((e) =>
        e.id === itemId
          ? {
              ...e,
              sets: e.sets.map((s) => (s.id === setId ? { ...s, ...partial } : s)),
            }
          : e
      ),
    });
  };

  const removeRoutineSet = (routine: Routine, itemId: string, setId: string) => {
    updateSingleRoutine({
      ...routine,
      exercises: routine.exercises.map((e) => {
        if (e.id !== itemId) return e;
        if (e.sets.length <= 1) return e;
        return { ...e, sets: e.sets.filter((s) => s.id !== setId) };
      }),
    });
  };

  const filteredRoutines = routines.filter((r) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    if (r.name.toLowerCase().includes(q) || (r.subtitle || '').toLowerCase().includes(q)) {
      return true;
    }
    return r.exercises.some((item) => {
      const ex = allExercises.find((e) => e.id === item.exerciseId);
      return ex?.name.toLowerCase().includes(q);
    });
  });

  return (
    <div className="space-y-5">
      {/* Header & Top Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-white">
            Treinos e Rotinas
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Organize sua divisão semanal, edite séries válidas, aquecimento, cargas e técnicas
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onStartFreeWorkout}
            className="min-h-[44px] px-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#13151B] hover:border-orange-500 text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5"
          >
            <Dumbbell className="w-4 h-4 text-orange-500" />
            <span>Treino Livre</span>
          </button>

          <button
            type="button"
            onClick={handleCreateNewRoutine}
            className="min-h-[44px] px-4 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-orange-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Nova Rotina</span>
          </button>
        </div>
      </div>

      {/* Search & Restore Default */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Pesquisar rotinas ou exercícios cadastrados..."
            className="w-full min-h-[44px] pl-10 pr-4 rounded-2xl bg-white dark:bg-[#13151B] border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-orange-500"
          />
        </div>

        <button
          type="button"
          onClick={() => setConfirmRestoreDefaults(true)}
          className="min-h-[44px] px-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#13151B] text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-orange-500 flex items-center justify-center gap-1.5 shrink-0"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Restaurar Divisão Padrão</span>
        </button>
      </div>

      {/* Routines Selector Strip (All Unlimited Routines) */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        {filteredRoutines.map((r) => {
          const isSelected = selectedRoutine?.id === r.id;
          return (
            <button
              key={r.id}
              type="button"
              onClick={() => setSelectedRoutineId(r.id)}
              className={`min-h-[54px] px-4 py-2 rounded-2xl border text-left transition-all shrink-0 ${
                isSelected
                  ? 'border-orange-500 bg-orange-500 text-white shadow-md shadow-orange-500/20'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-[#13151B] text-slate-800 dark:text-slate-200 hover:border-orange-500/40'
              }`}
            >
              <div
                className={`text-[10px] font-bold uppercase tracking-wider ${
                  isSelected ? 'text-orange-100' : 'text-orange-500'
                }`}
              >
                {r.subtitle || 'Rotina'}
              </div>
              <div className="text-xs font-bold whitespace-nowrap">{r.name}</div>
            </button>
          );
        })}
      </div>

      {/* Active Selected Routine Detail Card */}
      {selectedRoutine && (
        <div className="rounded-3xl bg-white dark:bg-[#13151B] border border-slate-200 dark:border-slate-800 p-5 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800/80">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-orange-500">
                <Calendar className="w-3.5 h-3.5" />
                <span>{selectedRoutine.subtitle || 'Rotina Personalizada'}</span>
                {!selectedRoutine.isRestDay && (
                  <>
                    <span>·</span>
                    <span>{selectedRoutine.exercises.length} exercícios</span>
                    <span>·</span>
                    <span>~{selectedRoutine.estimatedMinutes} min</span>
                  </>
                )}
              </div>
              <h2 className="font-display text-3xl font-bold text-slate-900 dark:text-white mt-1">
                {selectedRoutine.name}
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-2xl">
                {selectedRoutine.description}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              {!selectedRoutine.isRestDay && selectedRoutine.exercises.length > 0 && (
                <button
                  type="button"
                  onClick={() => onStartRoutine(selectedRoutine)}
                  className="min-h-[48px] px-5 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold flex items-center gap-2 shadow-lg shadow-orange-500/25"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>INICIAR TREINO</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setEditingRoutineMeta(selectedRoutine)}
                className="min-h-[44px] px-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs font-semibold flex items-center gap-1.5 text-slate-700 dark:text-slate-300 hover:border-orange-500"
              >
                <Edit3 className="w-4 h-4 text-orange-500" />
                <span>Editar Rotina</span>
              </button>

              <button
                type="button"
                onClick={() => handleDuplicateRoutine(selectedRoutine)}
                className="min-h-[44px] px-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs font-semibold flex items-center gap-1.5 text-slate-700 dark:text-slate-300 hover:border-orange-500"
                title="Duplicar rotina"
              >
                <Copy className="w-4 h-4 text-orange-500" />
                <span>Duplicar</span>
              </button>

              <button
                type="button"
                onClick={() => setConfirmDeleteRoutineId(selectedRoutine.id)}
                className="min-h-[44px] min-w-[44px] rounded-2xl border border-slate-200 dark:border-slate-800 text-rose-500 hover:bg-rose-500/10 flex items-center justify-center"
                title="Excluir rotina"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* REST DAY VIEW (THURSDAY OR SUNDAY) */}
          {selectedRoutine.isRestDay && selectedRoutine.exercises.length === 0 ? (
            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800 space-y-4">
              <div className="flex items-start gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center shrink-0">
                  <HeartHandshake className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Dia de Recuperação e Supercompensação
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                    O descanso faz parte da evolução muscular. Os dias de recuperação preservam sua sequência de disciplina semanal sem punição. Você pode registrar seu descanso, alongamento ou iniciar um treino livre abaixo.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <input
                  type="text"
                  value={restNote}
                  onChange={(e) => setRestNote(e.target.value)}
                  placeholder="Ex: Alongamento 15 min, caminhada leve ou descanso total"
                  className="sm:col-span-2 min-h-[44px] px-3.5 rounded-xl bg-white dark:bg-[#13151B] border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white"
                />
                <button
                  type="button"
                  onClick={() => {
                    onLogRestDay(
                      selectedRoutine.subtitle || selectedRoutine.name,
                      restNote
                    );
                    setRestSavedToast(true);
                    setTimeout(() => setRestSavedToast(false), 2500);
                  }}
                  className="min-h-[44px] px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>
                    {restSavedToast ? 'Descanso Registrado!' : 'Registrar Recuperação'}
                  </span>
                </button>
              </div>

              <div className="pt-2 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={onStartFreeWorkout}
                  className="min-h-[40px] px-3.5 rounded-xl bg-slate-200/70 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  Iniciar Treino Livre mesmo assim
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setPickerState({
                      open: true,
                      mode: 'add',
                      routineId: selectedRoutine.id,
                    })
                  }
                  className="min-h-[40px] px-3.5 rounded-xl bg-slate-200/70 dark:bg-slate-800 text-xs font-semibold text-orange-500"
                >
                  + Adicionar exercícios a este dia
                </button>
              </div>
            </div>
          ) : (
            /* EXERCISES LIST IN ROUTINE */
            <div className="space-y-3">
              {selectedRoutine.exercises.map((item, idx) => {
                const exDef =
                  allExercises.find((e) => e.id === item.exerciseId) || allExercises[0];
                const validSets = item.sets.filter((s) => s.type === 'valid');
                const warmupSets = item.sets.filter((s) => s.type === 'warmup');
                const lastPerf = getLastSessionForExercise(
                  exDef.id,
                  sessions,
                  allExercises
                );
                const isExpanded = expandedExerciseItemId === item.id;

                return (
                  <div
                    key={item.id}
                    className="rounded-2xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800 p-4 space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div
                        onClick={() =>
                          setInspectExerciseState({ exercise: exDef, item })
                        }
                        className="flex items-center gap-3.5 min-w-0 cursor-pointer group"
                      >
                        <ExerciseAnimator
                          exercise={exDef}
                          compact
                          className="w-20 h-16 shrink-0 rounded-xl border border-slate-200 dark:border-slate-800"
                        />
                        <div className="min-w-0">
                          {item.isSelectableSlot && (
                            <div className="text-[11px] font-bold text-orange-500 mb-0.5">
                              {item.slotLabel || 'Exercício abdominal selecionável'}
                            </div>
                          )}
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono-num text-xs font-bold text-orange-500">
                              {idx + 1}.
                            </span>
                            <h4 className="text-base font-bold text-slate-900 dark:text-white truncate group-hover:text-orange-500 transition-colors">
                              {exDef.name}
                            </h4>
                            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-orange-500 shrink-0" />
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            {exDef.primaryMuscle}
                            {exDef.secondaryMuscles.length > 0
                              ? ` (+${exDef.secondaryMuscles.slice(0, 2).join(', ')})`
                              : ''}{' '}
                            · {exDef.equipment} ·{' '}
                            <strong className="text-slate-700 dark:text-slate-200">
                              {validSets.length} séries × {validSets[0]?.minReps || exDef.defaultMinReps}–{validSets[0]?.maxReps || exDef.defaultMaxReps} reps
                            </strong>
                            {warmupSets.length > 0 && (
                              <span className="text-amber-500">
                                {' '}
                                + {warmupSets.length} aquecimento
                              </span>
                            )}
                          </p>
                          <div className="flex flex-wrap items-center gap-2 mt-1">
                            <span className="inline-flex items-center gap-1 text-[11px] font-mono-num text-slate-500 dark:text-slate-400">
                              <Clock className="w-3 h-3 text-orange-500" />
                              Descanso: {item.restSeconds}s
                            </span>
                            {lastPerf && (
                              <span className="text-[11px] font-mono-num text-orange-500 flex items-center gap-1">
                                <History className="w-3 h-3" />
                                <span>
                                  Último ({lastPerf.formattedDate}):{' '}
                                  {lastPerf.validSets
                                    .map((s, si) => `S${si + 1}: ${s.weight}${weightUnit}×${s.reps}`)
                                    .join(' · ')}
                                </span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Controls: Details, Swap Abs, Configure Sets, Move Up/Down, Copy, Delete */}
                      <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() =>
                            setInspectExerciseState({ exercise: exDef, item })
                          }
                          className="min-h-[38px] px-2.5 rounded-xl bg-white dark:bg-[#13151B] border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:border-orange-500 hover:text-orange-500 flex items-center gap-1 transition-colors"
                          title="Ver execução, músculos e gráfico de evolução"
                        >
                          <Info className="w-3.5 h-3.5 text-orange-500" />
                          <span>Detalhes</span>
                        </button>

                        {item.isSelectableSlot && (
                          <button
                            type="button"
                            onClick={() =>
                              setPickerState({
                                open: true,
                                mode: 'swap_abs',
                                routineId: selectedRoutine.id,
                                targetRoutineExerciseItemId: item.id,
                                filterMuscle: 'Abdômen',
                              })
                            }
                            className="min-h-[38px] px-3 rounded-xl bg-orange-500/15 hover:bg-orange-500/25 text-orange-500 text-xs font-bold transition-colors"
                          >
                            Escolher Abdominal
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() =>
                            setExpandedExerciseItemId(isExpanded ? null : item.id)
                          }
                          className={`min-h-[38px] px-3 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                            isExpanded
                              ? 'border-orange-500 bg-orange-500 text-white'
                              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-[#13151B] text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          <Sliders className="w-3.5 h-3.5" />
                          <span>Editar Séries ({validSets.length})</span>
                        </button>

                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => moveExercise(selectedRoutine, idx, -1)}
                          className="min-h-[38px] min-w-[38px] rounded-xl bg-white dark:bg-[#13151B] border border-slate-200 dark:border-slate-800 disabled:opacity-35 flex items-center justify-center"
                          title="Mover para cima"
                        >
                          <ArrowUp className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          disabled={idx === selectedRoutine.exercises.length - 1}
                          onClick={() => moveExercise(selectedRoutine, idx, 1)}
                          className="min-h-[38px] min-w-[38px] rounded-xl bg-white dark:bg-[#13151B] border border-slate-200 dark:border-slate-800 disabled:opacity-35 flex items-center justify-center"
                          title="Mover para baixo"
                        >
                          <ArrowDown className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            setCopyItemModal({
                              item,
                              fromRoutineId: selectedRoutine.id,
                            })
                          }
                          className="min-h-[38px] min-w-[38px] rounded-xl bg-white dark:bg-[#13151B] border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-500 hover:text-orange-500"
                          title="Copiar para outra rotina"
                        >
                          <Copy className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            removeExerciseFromRoutine(selectedRoutine, item.id)
                          }
                          className="min-h-[38px] min-w-[38px] rounded-xl bg-white dark:bg-[#13151B] border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-400 hover:text-rose-500"
                          title="Remover exercício da rotina"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Expanded Set Configuration Panel (Section 6) */}
                    {isExpanded && (
                      <div className="pt-3 border-t border-slate-200/70 dark:border-slate-800 space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                              Descanso entre séries (seg)
                            </label>
                            <input
                              type="number"
                              step={15}
                              min={15}
                              value={item.restSeconds}
                              onChange={(e) => {
                                const val = Math.max(15, Number(e.target.value));
                                updateSingleRoutine({
                                  ...selectedRoutine,
                                  exercises: selectedRoutine.exercises.map((ex) =>
                                    ex.id === item.id ? { ...ex, restSeconds: val } : ex
                                  ),
                                });
                              }}
                              className="w-full min-h-[38px] px-3 rounded-xl bg-white dark:bg-[#13151B] border border-slate-200 dark:border-slate-800 text-xs font-mono-num"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                              Técnica de execução
                            </label>
                            <select
                              value={item.technique || 'Cadência controlada'}
                              onChange={(e) => {
                                updateSingleRoutine({
                                  ...selectedRoutine,
                                  exercises: selectedRoutine.exercises.map((ex) =>
                                    ex.id === item.id
                                      ? { ...ex, technique: e.target.value }
                                      : ex
                                  ),
                                });
                              }}
                              className="w-full min-h-[38px] px-3 rounded-xl bg-white dark:bg-[#13151B] border border-slate-200 dark:border-slate-800 text-xs"
                            >
                              <option value="Cadência controlada">Cadência controlada</option>
                              <option value="Progressão de carga">Progressão de carga</option>
                              <option value="Pausa no pico de contração">
                                Pausa no pico de contração
                              </option>
                              <option value="Drop-set na última série">
                                Drop-set na última série
                              </option>
                              <option value="Rest-Pause">Rest-Pause</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                              Meta de Esforço (RPE 6–10)
                            </label>
                            <input
                              type="number"
                              min={5}
                              max={10}
                              step="0.5"
                              value={item.rpeTarget || 8}
                              onChange={(e) => {
                                updateSingleRoutine({
                                  ...selectedRoutine,
                                  exercises: selectedRoutine.exercises.map((ex) =>
                                    ex.id === item.id
                                      ? { ...ex, rpeTarget: Number(e.target.value) }
                                      : ex
                                  ),
                                });
                              }}
                              className="w-full min-h-[38px] px-3 rounded-xl bg-white dark:bg-[#13151B] border border-slate-200 dark:border-slate-800 text-xs font-mono-num"
                            />
                          </div>
                        </div>

                        {/* Individual Sets Table */}
                        <div className="space-y-2">
                          {(() => {
                            let validIdx = 0;
                            return item.sets.map((s) => {
                              const badge =
                                s.type === 'warmup' ? 'Aquec. A' : `Válida ${++validIdx}`;
                              return (
                                <div
                                  key={s.id}
                                  className={`grid grid-cols-12 gap-2 items-center p-2 rounded-xl border ${
                                    s.type === 'warmup'
                                      ? 'bg-amber-500/5 border-amber-500/25'
                                      : 'bg-white dark:bg-[#13151B] border-slate-200/70 dark:border-slate-800'
                                  }`}
                                >
                                  <div className="col-span-3">
                                    <span
                                      className={`text-xs font-bold ${
                                        s.type === 'warmup'
                                          ? 'text-amber-500'
                                          : 'text-slate-800 dark:text-slate-200'
                                      }`}
                                    >
                                      {badge}
                                    </span>
                                  </div>

                                  <div className="col-span-3">
                                    <label className="block text-[10px] text-slate-400">
                                      Carga ({weightUnit})
                                    </label>
                                    <input
                                      type="number"
                                      step="0.5"
                                      min={0}
                                      value={s.targetWeight}
                                      onChange={(e) =>
                                        updateRoutineSet(selectedRoutine, item.id, s.id, {
                                          targetWeight: Math.max(0, Number(e.target.value)),
                                        })
                                      }
                                      className="w-full min-h-[34px] px-2 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-mono-num font-bold"
                                    />
                                  </div>

                                  <div className="col-span-2">
                                    <label className="block text-[10px] text-slate-400">
                                      Mín Reps
                                    </label>
                                    <input
                                      type="number"
                                      min={1}
                                      value={s.minReps}
                                      onChange={(e) =>
                                        updateRoutineSet(selectedRoutine, item.id, s.id, {
                                          minReps: Math.max(1, Number(e.target.value)),
                                        })
                                      }
                                      className="w-full min-h-[34px] px-2 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-mono-num"
                                    />
                                  </div>

                                  <div className="col-span-2">
                                    <label className="block text-[10px] text-slate-400">
                                      Máx Reps
                                    </label>
                                    <input
                                      type="number"
                                      min={1}
                                      value={s.maxReps}
                                      onChange={(e) =>
                                        updateRoutineSet(selectedRoutine, item.id, s.id, {
                                          maxReps: Math.max(1, Number(e.target.value)),
                                        })
                                      }
                                      className="w-full min-h-[34px] px-2 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-mono-num"
                                    />
                                  </div>

                                  <div className="col-span-2 flex justify-end">
                                    {item.sets.length > 1 && (
                                      <button
                                        type="button"
                                        onClick={() =>
                                          removeRoutineSet(selectedRoutine, item.id, s.id)
                                        }
                                        className="min-h-[34px] min-w-[34px] rounded-lg text-slate-400 hover:text-rose-500 flex items-center justify-center"
                                        title="Remover série"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    )}
                                  </div>
                                </div>
                              );
                            });
                          })()}
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              addSetToRoutineExercise(selectedRoutine, item, 'valid')
                            }
                            className="min-h-[38px] px-3.5 rounded-xl bg-orange-500/15 text-orange-500 text-xs font-bold flex items-center gap-1"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>+ Série Válida</span>
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              addSetToRoutineExercise(selectedRoutine, item, 'warmup')
                            }
                            className="min-h-[38px] px-3.5 rounded-xl bg-amber-500/15 text-amber-500 text-xs font-bold flex items-center gap-1"
                          >
                            <Flame className="w-3.5 h-3.5" />
                            <span>+ Série de Aquecimento (Não conta no volume)</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Add Exercise to Routine Button */}
              <button
                type="button"
                onClick={() =>
                  setPickerState({
                    open: true,
                    mode: 'add',
                    routineId: selectedRoutine.id,
                  })
                }
                className="w-full min-h-[50px] rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-orange-500/60 text-slate-600 dark:text-slate-300 hover:text-orange-500 text-sm font-bold flex items-center justify-center gap-2 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Adicionar Exercício da Biblioteca</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* =====================================================================
          MODAL: ESCOLHER / ADICIONAR EXERCÍCIO (INCLUINDO SLOTS DE ABDÔMEN DE SEXTA)
      ====================================================================== */}
      {pickerState.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="w-full max-w-xl rounded-3xl bg-white dark:bg-[#13151B] border border-slate-200 dark:border-slate-800 p-5 space-y-4 shadow-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
                {pickerState.mode === 'swap_abs'
                  ? 'Selecionar Exercício Abdominal'
                  : 'Adicionar Exercício à Rotina'}
              </h3>
              <button
                type="button"
                onClick={() => setPickerState({ ...pickerState, open: false })}
                className="min-h-[44px] min-w-[44px] rounded-xl flex items-center justify-center text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <input
              type="text"
              value={pickerSearch}
              onChange={(e) => setPickerSearch(e.target.value)}
              placeholder="Buscar exercício pelo nome ou grupo muscular..."
              className="w-full min-h-[44px] px-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm"
            />

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {allExercises
                .filter((e) => !e.isArchived)
                .filter((e) => {
                  if (
                    pickerState.mode === 'swap_abs' &&
                    !pickerSearch.trim() &&
                    e.primaryMuscle !== 'Abdômen'
                  ) {
                    return false;
                  }
                  if (!pickerSearch.trim()) return true;
                  const q = pickerSearch.toLowerCase();
                  return (
                    e.name.toLowerCase().includes(q) ||
                    e.primaryMuscle.toLowerCase().includes(q)
                  );
                })
                .map((ex) => (
                  <button
                    key={ex.id}
                    type="button"
                    onClick={() => {
                      const targetRoutine = routines.find(
                        (r) => r.id === pickerState.routineId
                      );
                      if (!targetRoutine) return;

                      if (
                        pickerState.mode === 'swap_abs' &&
                        pickerState.targetRoutineExerciseItemId
                      ) {
                        const nextExercises = targetRoutine.exercises.map((item) =>
                          item.id === pickerState.targetRoutineExerciseItemId
                            ? {
                                ...item,
                                exerciseId: ex.id,
                                sets: item.sets.map((s) => ({
                                  ...s,
                                  minReps: ex.defaultMinReps,
                                  maxReps: ex.defaultMaxReps,
                                  targetWeight: ex.defaultWeight,
                                })),
                              }
                            : item
                        );
                        updateSingleRoutine({
                          ...targetRoutine,
                          exercises: nextExercises,
                        });
                      } else {
                        const newItem: RoutineExerciseItem = {
                          id: `re_${ex.id}_${Date.now()}`,
                          exerciseId: ex.id,
                          restSeconds: ex.defaultRestSeconds,
                          notes: '',
                          technique: 'Cadência controlada',
                          rpeTarget: 8,
                          sets: [1, 2].map((n) => ({
                            id: `set_${ex.id}_${Date.now()}_${n}`,
                            type: 'valid',
                            minReps: ex.defaultMinReps,
                            maxReps: ex.defaultMaxReps,
                            targetWeight: ex.defaultWeight,
                            restSeconds: ex.defaultRestSeconds,
                          })),
                        };
                        updateSingleRoutine({
                          ...targetRoutine,
                          isRestDay: false,
                          exercises: [...targetRoutine.exercises, newItem],
                        });
                      }

                      setPickerState({ ...pickerState, open: false });
                    }}
                    className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 hover:border-orange-500 border border-slate-200/70 dark:border-slate-800 flex items-center justify-between text-left transition-colors"
                  >
                    <div>
                      <div className="text-sm font-bold text-slate-900 dark:text-white">
                        {ex.name}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        {ex.primaryMuscle} · {ex.equipment} · 2 séries sugeridas
                      </div>
                    </div>
                    <Plus className="w-5 h-5 text-orange-500 shrink-0" />
                  </button>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL: EDITAR NOME, DESCRIÇÃO E DIAS DA ROTINA
      ====================================================================== */}
      {editingRoutineMeta && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-[#13151B] border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-2xl">
            <h3 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
              Editar Rotina
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">
                  Nome da Rotina
                </label>
                <input
                  type="text"
                  value={editingRoutineMeta.name}
                  onChange={(e) =>
                    setEditingRoutineMeta({ ...editingRoutineMeta, name: e.target.value })
                  }
                  className="w-full min-h-[44px] px-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">
                  Identificação do dia / subtítulo
                </label>
                <input
                  type="text"
                  value={editingRoutineMeta.subtitle || ''}
                  onChange={(e) =>
                    setEditingRoutineMeta({
                      ...editingRoutineMeta,
                      subtitle: e.target.value,
                    })
                  }
                  placeholder="Ex: Segunda-feira ou Treino A"
                  className="w-full min-h-[44px] px-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">
                  Descrição
                </label>
                <textarea
                  rows={2}
                  value={editingRoutineMeta.description}
                  onChange={(e) =>
                    setEditingRoutineMeta({
                      ...editingRoutineMeta,
                      description: e.target.value,
                    })
                  }
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">
                  Dias da semana vinculados
                </label>
                <div className="grid grid-cols-7 gap-1.5">
                  {WEEK_DAYS.map((wd) => {
                    const active = editingRoutineMeta.daysOfWeek.includes(wd.day);
                    return (
                      <button
                        key={wd.day}
                        type="button"
                        onClick={() => {
                          const nextDays = active
                            ? editingRoutineMeta.daysOfWeek.filter((d) => d !== wd.day)
                            : [...editingRoutineMeta.daysOfWeek, wd.day];
                          setEditingRoutineMeta({
                            ...editingRoutineMeta,
                            daysOfWeek: nextDays,
                          });
                        }}
                        className={`min-h-[40px] rounded-xl text-xs font-bold ${
                          active
                            ? 'bg-orange-500 text-white'
                            : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {wd.short}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingRoutineMeta(null)}
                className="min-h-[44px] px-4 rounded-xl text-xs font-semibold text-slate-500"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  updateSingleRoutine(editingRoutineMeta);
                  setEditingRoutineMeta(null);
                }}
                className="min-h-[44px] px-5 rounded-xl bg-orange-500 text-white text-xs font-bold"
              >
                Salvar Alterações
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL: COPIAR EXERCÍCIO PARA OUTRA ROTINA
      ====================================================================== */}
      {copyItemModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-[#13151B] border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-2xl">
            <h3 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
              Copiar Exercício para Outra Rotina
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Escolha a rotina de destino para copiar este exercício com suas séries e configurações:
            </p>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {routines
                .filter((r) => r.id !== copyItemModal.fromRoutineId)
                .map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => {
                      const clonedItem: RoutineExerciseItem = {
                        ...copyItemModal.item,
                        id: `re_copy_${Date.now()}`,
                        sets: copyItemModal.item.sets.map((s, idx) => ({
                          ...s,
                          id: `set_copy_${Date.now()}_${idx}`,
                        })),
                      };
                      updateSingleRoutine({
                        ...r,
                        isRestDay: false,
                        exercises: [...r.exercises, clonedItem],
                      });
                      setCopyItemModal(null);
                    }}
                    className="w-full p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 hover:border-orange-500 border border-slate-200 dark:border-slate-800 text-left text-xs font-bold text-slate-900 dark:text-white flex items-center justify-between"
                  >
                    <span>
                      {r.subtitle ? `${r.subtitle} — ${r.name}` : r.name}
                    </span>
                    <Plus className="w-4 h-4 text-orange-500" />
                  </button>
                ))}
            </div>
            <button
              type="button"
              onClick={() => setCopyItemModal(null)}
              className="w-full min-h-[44px] rounded-xl bg-slate-100 dark:bg-slate-900 text-xs font-semibold"
            >
              Fechar
            </button>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL: CONFIRMAÇÃO DE EXCLUSÃO OU RESTAURAÇÃO PADRÃO
      ====================================================================== */}
      {confirmDeleteRoutineId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-[#13151B] border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <h3 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
              Excluir Rotina?
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Esta ação removerá a rotina da sua lista atual. O histórico de treinos já realizados permanecerá intacto.
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setConfirmDeleteRoutineId(null)}
                className="min-h-[44px] rounded-xl bg-slate-100 dark:bg-slate-900 text-xs font-semibold"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => handleDeleteRoutine(confirmDeleteRoutineId)}
                className="min-h-[44px] rounded-xl bg-rose-600 text-white text-xs font-bold"
              >
                Confirmar Exclusão
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmRestoreDefaults && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-[#13151B] border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <h3 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
              Restaurar Rotinas Padrão?
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              As rotinas originais de Segunda a Domingo serão restauradas com duas séries válidas por exercício. Seu histórico de sessões não será apagado.
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setConfirmRestoreDefaults(false)}
                className="min-h-[44px] rounded-xl bg-slate-100 dark:bg-slate-900 text-xs font-semibold"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  onRestoreDefaultRoutines();
                  setConfirmRestoreDefaults(false);
                }}
                className="min-h-[44px] rounded-xl bg-orange-500 text-white text-xs font-bold"
              >
                Restaurar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL DETALHADO DO EXERCÍCIO (ESTILO HEVY)
      ====================================================================== */}
      {inspectExerciseState && (
        <ExerciseDetailModal
          exercise={inspectExerciseState.exercise}
          sessions={sessions}
          allExercises={allExercises}
          weightUnit={weightUnit}
          targetSets={inspectExerciseState.item?.sets}
          onClose={() => setInspectExerciseState(null)}
          actionButton={
            selectedRoutine && !selectedRoutine.isRestDay
              ? {
                  label: `Iniciar ${selectedRoutine.name}`,
                  onClick: () => {
                    setInspectExerciseState(null);
                    onStartRoutine(selectedRoutine);
                  },
                }
              : undefined
          }
        />
      )}
    </div>
  );
};
